---
description: 操作 OakMega SCRM 後台（登入設定、查詢/管理客戶與對話）。輸入後即進入 OakMega SCRM 操作情境。
argument-hint: [要做的事，例如：login｜狀態｜查客戶 王小明；留空＝看登入狀態]
---

使用者透過 `/oakmega-scrm` 明確表示「現在要操作 **OakMega SCRM** 後台」。

請依照 **oakmega-scrm** skill 的指示執行 —— CLI 呼叫方式、登入 bootstrap、以及
「永遠不要請使用者把 API key 貼進對話」等安全規則，全都寫在該 skill 裡，以它為準。

本次需求：$ARGUMENTS
（留空代表先確認登入狀態。）

> 若 skill 未自動載入，請直接讀取並遵循
> `${CLAUDE_PLUGIN_ROOT}/skills/oakmega-scrm/SKILL.md` 後再執行。
