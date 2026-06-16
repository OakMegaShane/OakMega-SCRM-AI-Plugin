# OakMega SCRM — Claude Code Plugin

讓你在 Claude Code 裡用自然語言操作 OakMega SCRM 後台。內附 CLI，安裝 plugin 就等於裝好 CLI；API key 只在本機輸入、永不經過對話。

- 安裝步驟請見 **[INSTALL.md](INSTALL.md)**（桌面 app 與終端機 CLI 兩種）。
- License：專有，保留所有權利，見 [LICENSE](LICENSE)。

## 這個 plugin 做什麼

裝好後，在 Claude Code 輸入框打 **`/oakmega-scrm`** 就進入 OakMega SCRM 操作情境，例如：

- `/oakmega-scrm` → 確認登入狀態（沒登入會引導你登入）。
- `/oakmega-scrm login` → 開啟瀏覽器表單讓你貼上 API key。
- `/oakmega-scrm 查客戶 王小明` → 把需求帶進操作（後端功能陸續擴充中）。

> 也支援自然語言：明確提到「OakMega SCRM」時 Claude 也會接手，例如
> 「幫我登入 **OakMega SCRM**」。但用 `/oakmega-scrm` 最直接、不必每次都打出全名。

> 後端操作仍在擴充中，目前提供登入設定與 `whoami` 驗證指令。

## 安全設計

- API key **只透過 `login` 開啟的本機網頁表單輸入**，存在你自己電腦的
  `~/.config/oakmega-scrm/config.json`（權限 `600`，格式 `{ "API_KEY": "..." }`）。
- key 永遠不會經過對話，也不會被印出全文 —— 最多只顯示前 10 碼。
- 設定永遠存在 `~/.config/oakmega-scrm/`，**不會**寫在 plugin 目錄底下
  （該目錄在 plugin 更新時會被覆蓋）。

## 觸發界線

本 plugin 的 skill 只在需求明確指向 **OakMega SCRM** 時才會啟動；
單純的「登入」「查客戶」等一般需求不會觸發它，不干擾你在 Claude Code 的其他工作。

## 指令一覽（CLI）

| 指令 | 說明 |
| --- | --- |
| `oakmega-scrm auth status` | 檢查登入狀態（已登入 exit 0；未登入 exit 1）。 |
| `oakmega-scrm login` | 開啟本機網頁表單，貼上 API key 完成設定。 |
| `oakmega-scrm whoami` | 印出 API_KEY 前 10 碼，驗證設定成功。 |
| `oakmega-scrm --help` | 顯示說明。 |

## 技術說明

- CLI 為單一檔案、零外部相依，只用 Node 內建模組。
- 透過 `${CLAUDE_PLUGIN_ROOT}/bin/oakmega-scrm.js` 引用，安裝 plugin 即裝好 CLI。
