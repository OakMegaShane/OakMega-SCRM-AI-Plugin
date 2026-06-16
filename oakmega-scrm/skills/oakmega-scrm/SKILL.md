---
name: oakmega-scrm
description: 操作「OakMega SCRM」後台專用。僅在使用者明確提到 OakMega SCRM（或已在處理 OakMega SCRM 的客戶、對話、資料）時使用：例如登入/設定 OakMega SCRM、查詢或管理其客戶與對話。透過內附 oakmega-scrm CLI 執行，API key 以本機網頁表單輸入。不要用於一般性的「登入」「查客戶」需求，也不要用於其他 CRM / 系統。
---

# OakMega SCRM

操作 OakMega SCRM 後台的 skill。**所有操作一律透過內附 CLI 執行**，呼叫方式：

```
node "${CLAUDE_PLUGIN_ROOT}/bin/oakmega-scrm.js" <command>
```

> **觸發界線（重要）**：只有當需求明確指向 **OakMega SCRM** 時才使用本 skill。
> 使用者單講「幫我登入」「查一下客戶」而沒有 OakMega SCRM 的上下文時，**不要**觸發，
> 以免干擾使用者其他工作。
>
> 多數情況下使用者會用 `/oakmega-scrm` 指令明確進入本流程；該指令是薄入口，細節以本 skill 為準。

## 已知雷：${CLAUDE_PLUGIN_ROOT} 展開

`${CLAUDE_PLUGIN_ROOT}` 在 JSON 設定裡一定會展開，但在 markdown / 實際執行時歷史上曾發生展開不了的狀況。若你發現指令裡出現了字面的 `${CLAUDE_PLUGIN_ROOT}`（沒被換成真實路徑），請改用環境變數寫法：

```
node "$CLAUDE_PLUGIN_ROOT/bin/oakmega-scrm.js" <command>
```

若仍無法解析，請先找出 plugin 實際安裝路徑（含 `bin/oakmega-scrm.js` 的目錄），再用絕對路徑執行。

## 核心安全規則

- **永遠不要請使用者把 API key 貼進對話。** key 只能透過 `login` 開啟的本機網頁表單輸入。
- CLI 會自己從 `~/.config/oakmega-scrm/config.json` 讀 key，你不需要、也不應該接觸 key 全文。CLI 最多只會印出前 10 碼。

## Auth bootstrap（任何操作前都先做）

1. 先檢查登入狀態：

   ```
   node "${CLAUDE_PLUGIN_ROOT}/bin/oakmega-scrm.js" auth status
   ```

   - exit code 0 → 已登入，直接進行後續操作。
   - exit code 非 0 → 尚未登入，進入下一步。

2. 觸發登入：

   ```
   node "${CLAUDE_PLUGIN_ROOT}/bin/oakmega-scrm.js" login
   ```

   這會啟動本機網頁表單並自動開啟瀏覽器。請明確告訴使用者：

   > 請在自動打開的瀏覽器視窗貼上你的 API key 完成設定（若沒自動開，請手動貼上終端機印出的網址）。

3. 使用者完成後，重跑 `auth status` 確認已登入，再繼續。

## 操作（示意）

目前後端操作仍在建置中，先用 `whoami` 驗證整條路是否打通。它會印出已儲存 key 的前 10 碼：

```
node "${CLAUDE_PLUGIN_ROOT}/bin/oakmega-scrm.js" whoami
```

輸出形如 `API_KEY 前 10 碼：xxxxxxxxxx` 即代表認證流程正常。之後真正的後端操作會以同樣方式新增為 CLI 子指令。
