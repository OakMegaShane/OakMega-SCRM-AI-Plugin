# 安裝 OakMega SCRM plugin

> 你**不需要懂程式**。依你使用的 Claude Code 版本，選下面其中一種。

---

## A. 桌面 / 網頁版 Claude Code（多數人用這個）

1. 開啟 Claude Code，右上角進入 **Customize**（自訂）。
2. 左側 **Personal plugins** 旁邊按 **＋** → **Create plugin** → **Add marketplace**。
3. 在 **URL** 欄位貼上：

   ```
   <你的GitHub帳號>/OakMega-SCRM-AI-Plugin
   ```

   按 **Sync**。
4. 清單會出現 **oakmega-scrm**，按 **Install**。
5. 依提示重新啟動 Claude Code。

> 注意：這個欄位只接受 GitHub `帳號/repo` 或 git 網址，**不能填本機資料夾路徑**。

---

## B. 終端機版 Claude Code（CLI）

在 Claude Code 輸入框貼上這兩行（一次一行）：

```
/plugin marketplace add <你的GitHub帳號>/OakMega-SCRM-AI-Plugin
```

```
/plugin install oakmega-scrm@oakmega
```

> 或只輸入 `/plugin`，從選單裡找到 **oakmega-scrm** 點 Install。安裝後依提示重新啟動。

---

## 裝好之後怎麼用

在 Claude Code 輸入框打 **`/oakmega-scrm`** 就進入操作情境：

- `/oakmega-scrm`
  → 確認你登入了沒；還沒登入會自動引導你登入。
- `/oakmega-scrm login`
  → 會自動跳出瀏覽器視窗，**在那個視窗貼上你的 API key** 按儲存即可。

> 不想記指令也行：直接講「幫我登入 **OakMega SCRM**」這類明確提到 OakMega SCRM 的話，
> Claude 一樣會接手。用 `/oakmega-scrm` 只是更直接。

## 重要安全須知

- **絕對不要把 API key 直接打在對話框裡。** 你的 key 只會在「登入」跳出的瀏覽器表單裡輸入，
  存在你自己電腦的 `~/.config/oakmega-scrm/config.json`，不會經過對話、也不會外傳。
- Claude 最多只會顯示你 key 的前 10 碼，用來確認設定成功。

## 更新 plugin

- 桌面版：在 Personal plugins 裡對 marketplace 按 re-sync / update。
- CLI 版：

  ```
  /plugin marketplace update oakmega
  ```

  再重新啟動 Claude Code。
