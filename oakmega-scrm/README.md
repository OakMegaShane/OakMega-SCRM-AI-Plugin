# oakmega-scrm

操作 OakMega SCRM 後台的 Claude Code plugin。內附 CLI，安裝 plugin 就等於裝好 CLI。

## 安裝

把這個 plugin 安裝進 Claude Code 後即可使用。skill 會引導 Claude 透過內附的 CLI 操作後台：

```
node "${CLAUDE_PLUGIN_ROOT}/bin/oakmega-scrm.js" <command>
```

## 登入

```
oakmega-scrm login
```

會在本機啟動一個只綁 `127.0.0.1` 的網頁表單並自動開啟瀏覽器。在表單裡貼上你的 API key 送出即可。

- API key 儲存在 `~/.config/oakmega-scrm/config.json`，檔案權限為 `600`，格式為 `{ "API_KEY": "..." }`。
- key **只透過本機網頁表單輸入**，永遠不會經過對話，也不會被印出全文（最多只印前 10 碼）。

## 指令

| 指令 | 說明 |
| --- | --- |
| `oakmega-scrm auth status` | 檢查登入狀態（已登入 exit 0；未登入 exit 1）。 |
| `oakmega-scrm login` | 開啟本機網頁表單，貼上 API key 完成設定。 |
| `oakmega-scrm whoami` | 示意操作：印出 API_KEY 前 10 碼。 |
| `oakmega-scrm --help` | 顯示說明。 |

## 設計說明

- CLI 為單一檔案、零外部相依，只用 Node 內建模組。
- 設定永遠存在 `~/.config/oakmega-scrm/`，**不會**寫在 `${CLAUDE_PLUGIN_ROOT}` 底下（該目錄在 plugin 更新時會被覆蓋）。
