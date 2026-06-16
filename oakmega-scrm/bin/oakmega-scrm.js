#!/usr/bin/env node
'use strict';

/*
 * oakmega-scrm CLI
 *
 * 設計重點：
 * - 單一檔案、零外部相依，只用 Node 內建模組。
 * - API key 存在 ~/.config/oakmega-scrm/config.json（不在 plugin 目錄底下，
 *   因為 ${CLAUDE_PLUGIN_ROOT} 會在 plugin 更新時被整個覆蓋）。
 * - key 永遠不印全文；只在必要時印前 10 碼。
 * - 「未設定」一律以非 0 exit code 結束，方便 SKILL.md / Claude 用 exit code 分支判斷。
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { URL } = require('url');
const { spawn } = require('child_process');

const CONFIG_DIR = path.join(os.homedir(), '.config', 'oakmega-scrm');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

// ---------- 設定檔讀寫 ----------

function readConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    const obj = JSON.parse(raw);
    return obj && typeof obj === 'object' ? obj : {};
  } catch (_err) {
    // 檔案不存在或解析失敗，一律視為「尚未設定」
    return {};
  }
}

function writeConfig(apiKey) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  const payload = JSON.stringify({ API_KEY: apiKey }, null, 2) + '\n';
  fs.writeFileSync(CONFIG_PATH, payload, { mode: 0o600 });
  // writeFileSync 的 mode 只在「建立新檔」時生效；若檔案已存在，明確再 chmod 一次。
  fs.chmodSync(CONFIG_PATH, 0o600);
}

function getApiKey() {
  const cfg = readConfig();
  const key = cfg.API_KEY;
  if (typeof key === 'string' && key.trim() !== '') return key;
  return null;
}

function preview(key, n = 10) {
  return key.slice(0, n);
}

// ---------- 子指令：auth status ----------

function cmdAuthStatus() {
  const key = getApiKey();
  if (key) {
    console.log(`已登入。API_KEY: ${preview(key)}…（設定檔：${CONFIG_PATH}）`);
    process.exit(0);
  }
  console.log('尚未登入，請執行：oakmega-scrm login');
  process.exit(1);
}

// ---------- 子指令：whoami（示意操作） ----------

function cmdWhoami() {
  const key = getApiKey();
  if (!key) {
    console.log('尚未登入，請先執行：oakmega-scrm login');
    process.exit(1);
  }
  console.log(`API_KEY 前 10 碼：${preview(key)}`);
  process.exit(0);
}

// ---------- 子指令：login（本機網頁表單） ----------

function openBrowser(targetUrl) {
  let cmd;
  let args;
  if (process.platform === 'darwin') {
    cmd = 'open';
    args = [targetUrl];
  } else if (process.platform === 'win32') {
    // start 需透過 cmd，且第一個引號參數會被當成視窗標題，故補一個空標題。
    cmd = 'cmd';
    args = ['/c', 'start', '', targetUrl];
  } else {
    cmd = 'xdg-open';
    args = [targetUrl];
  }
  try {
    const child = spawn(cmd, args, { stdio: 'ignore', detached: true });
    child.on('error', () => {/* 開不起來就算了，使用者可手動貼網址 */});
    child.unref();
  } catch (_err) {
    /* 同上，忽略 */
  }
}

function htmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formPage(nonce) {
  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>OakMega SCRM 設定</title>
<style>
  body { font-family: -apple-system, "Segoe UI", system-ui, sans-serif;
         background: #f5f6f8; margin: 0; display: flex; min-height: 100vh;
         align-items: center; justify-content: center; }
  .card { background: #fff; padding: 32px 36px; border-radius: 12px;
          box-shadow: 0 4px 24px rgba(0,0,0,.08); width: 360px; }
  h1 { font-size: 18px; margin: 0 0 4px; color: #1a1a1a; }
  p { font-size: 13px; color: #666; margin: 0 0 20px; line-height: 1.5; }
  label { font-size: 13px; color: #333; display: block; margin-bottom: 6px; }
  input[type=password] { width: 100%; box-sizing: border-box; padding: 10px 12px;
          font-size: 14px; border: 1px solid #d0d3d8; border-radius: 8px; }
  button { margin-top: 16px; width: 100%; padding: 11px; font-size: 14px;
          color: #fff; background: #2563eb; border: 0; border-radius: 8px;
          cursor: pointer; }
  button:hover { background: #1d4ed8; }
</style>
</head>
<body>
  <div class="card">
    <h1>OakMega SCRM 設定</h1>
    <p>請貼上你的 API key。送出後會儲存在本機，不會經過任何對話。</p>
    <form method="POST" action="/submit?nonce=${encodeURIComponent(nonce)}">
      <label for="key">API key</label>
      <input id="key" name="api_key" type="password" autocomplete="off"
             autofocus placeholder="貼上 API key">
      <input type="hidden" name="nonce" value="${htmlEscape(nonce)}">
      <button type="submit">儲存設定</button>
    </form>
  </div>
</body>
</html>`;
}

function successPage() {
  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<title>設定完成</title>
<style>
  body { font-family: -apple-system, "Segoe UI", system-ui, sans-serif;
         background: #f5f6f8; margin: 0; display: flex; min-height: 100vh;
         align-items: center; justify-content: center; }
  .card { background: #fff; padding: 32px 36px; border-radius: 12px;
          box-shadow: 0 4px 24px rgba(0,0,0,.08); width: 360px; text-align: center; }
  h1 { font-size: 18px; margin: 0 0 8px; color: #16a34a; }
  p { font-size: 13px; color: #666; margin: 0; line-height: 1.5; }
</style>
</head>
<body>
  <div class="card">
    <h1>✓ 設定完成</h1>
    <p>API key 已儲存，可以關掉這個分頁回到終端機了。</p>
  </div>
</body>
</html>`;
}

function parseUrlEncoded(body) {
  const params = new URLSearchParams(body);
  const out = {};
  for (const [k, v] of params.entries()) out[k] = v;
  return out;
}

function randomNonce() {
  // 用內建 crypto 取隨機值，避免本機其他網頁亂打我們的 server。
  return require('crypto').randomBytes(16).toString('hex');
}

function cmdLogin() {
  const nonce = randomNonce();
  let settled = false;

  const server = http.createServer((req, res) => {
    let reqUrl;
    try {
      reqUrl = new URL(req.url, 'http://127.0.0.1');
    } catch (_err) {
      res.writeHead(400).end('bad request');
      return;
    }

    // GET / → 表單頁
    if (req.method === 'GET' && reqUrl.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(formPage(nonce));
      return;
    }

    // POST /submit → 收 key
    if (req.method === 'POST' && reqUrl.pathname === '/submit') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
        if (body.length > 1e6) req.destroy(); // 防爆量
      });
      req.on('end', () => {
        const fields = parseUrlEncoded(body);
        // nonce 驗證（query 或隱藏欄位任一相符即可）
        const gotNonce = reqUrl.searchParams.get('nonce') || fields.nonce;
        if (gotNonce !== nonce) {
          res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('forbidden: nonce mismatch');
          return;
        }
        const key = (fields.api_key || '').trim();
        if (!key) {
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<p>API key 不可為空，請回上一頁重試。</p>');
          return;
        }
        try {
          writeConfig(key);
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('寫入設定檔失敗：' + err.message);
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(successPage());
        settled = true;
        console.log(`\n設定完成，已寫入：${CONFIG_PATH}`);
        // 讓回應送達瀏覽器後再關閉
        setTimeout(() => {
          server.close(() => process.exit(0));
        }, 300);
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('not found');
  });

  server.on('error', (err) => {
    console.error('啟動本機 server 失敗：' + err.message);
    process.exit(1);
  });

  // 綁 127.0.0.1 + 隨機 port（port=0 讓 OS 配一個可用 port）。
  server.listen(0, '127.0.0.1', () => {
    const port = server.address().port;
    const url = `http://127.0.0.1:${port}/?nonce=${nonce}`;
    console.log('OakMega SCRM 登入');
    console.log('請在打開的瀏覽器視窗貼上你的 API key 完成設定。');
    console.log('若瀏覽器沒有自動打開，請手動貼上以下網址：');
    console.log('  ' + url);
    openBrowser(url);
  });

  // 安全網：10 分鐘沒完成就放棄。
  setTimeout(() => {
    if (!settled) {
      console.error('\n逾時未完成設定，已結束。請重新執行：oakmega-scrm login');
      server.close(() => process.exit(1));
    }
  }, 10 * 60 * 1000).unref();
}

// ---------- usage ----------

function printUsage() {
  console.log(`oakmega-scrm — OakMega SCRM CLI

用法：
  oakmega-scrm auth status   檢查是否已登入（已登入 exit 0；未登入 exit 1）
  oakmega-scrm login         開啟本機網頁表單，貼上 API key 完成設定
  oakmega-scrm whoami        示意操作：印出 API_KEY 前 10 碼
  oakmega-scrm --help        顯示這份說明

設定檔位置：${CONFIG_PATH}
API key 僅儲存在本機，永遠不會經過對話。`);
}

// ---------- 進入點 ----------

function main() {
  const argv = process.argv.slice(2);
  const [a, b] = argv;

  if (!a || a === '--help' || a === '-h' || a === 'help') {
    printUsage();
    process.exit(0);
  }

  if (a === 'auth' && b === 'status') return cmdAuthStatus();
  if (a === 'auth') {
    console.log('未知的 auth 子指令。可用：oakmega-scrm auth status');
    process.exit(1);
  }
  if (a === 'login') return cmdLogin();
  if (a === 'whoami') return cmdWhoami();

  console.log(`未知指令：${a}`);
  printUsage();
  process.exit(1);
}

main();
