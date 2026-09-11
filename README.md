# Kotoba Base

**日文單字庫**

> 個人日文單字庫與學習工具。可以搜尋日文單字或中文意思，查看例句、搭配詞、相關詞與 JLPT 難度，也可以使用 Gemini 產生新單字資料。

![logo-2.png](public/logo-2.png)

## 功能

- 預設顯示瀏覽器中儲存的單字庫
- 支援日文單字與中文意思搜尋
- 單字庫查無結果時，使用 Gemini API 翻譯與整理單字資料
- 顯示日文讀音、詞性、JLPT 難度、例句、搭配詞與相關詞
- 支援日語語音輸入與日文語音輸出
- 支援隨機產生不重複的 N1～N5 單字
- 可將翻譯結果儲存或從單字庫移除
- 提供單字測驗，包含四選一、答題統計與前後題切換
- 提供「深入探討」聊天視窗，可針對目前單字與 Gemini 持續對話
- 聊天訊息支援基本 Markdown，包括粗體、斜體、清單、表格與水平線
- 支援淺色與深色主題

## 技術

- React
- TypeScript
- Vite
- Lucide React
- Gemini API
- 瀏覽器 `localStorage`

## 開始使用

需求：Node.js 18 或以上版本。

```bash
npm install
npm run dev
```

啟動後開啟終端機顯示的本機網址，通常是 `http://localhost:5173/`。

## 建置

執行 production build：

```bash
npm run build
```

預覽 production build：

```bash
npm run preview
```

## Gemini API Key 設定

1. 開啟網站右上角的「設定」。
2. 前往 [Google AI Studio](https://aistudio.google.com/apikey) 建立或取得 API Key。
3. 將 API Key 貼到設定視窗中。
4. 選擇 Gemini 模型並儲存設定。

API Key、選擇的模型、主題與單字資料會儲存在目前瀏覽器的 `localStorage` 中。此版本沒有後端，因此資料不會自動同步到其他瀏覽器或裝置。

## 資料儲存

Kotoba Base 目前使用瀏覽器 `localStorage` 儲存單字庫與設定，適合個人使用與快速開始。若未來需要帳號登入、跨裝置同步、多人共享或集中管理資料，再考慮加入後端資料庫。

## 專案結構

```text
src/
	App.tsx       主要頁面、單字庫、Gemini、測驗與聊天功能
	styles.css    網站樣式與響應式版面
	main.tsx      React 啟動入口
public/         可公開存取的靜態資源
```

## 注意事項

- Gemini 功能需要有效的 API Key 與網路連線。
- API Key 會直接從瀏覽器呼叫 Gemini API，請不要在共用電腦上保存個人 API Key。
- 語音輸入功能需要瀏覽器支援 Web Speech API，建議使用最新版 Chrome。
- `.env`、`node_modules` 與 production build 產物已列入 `.gitignore`。

## 授權

請參閱 [LICENSE](LICENSE)。

本網站由 Copilot Agent 協助開發，如果有遇到問題或需要改進的地方，歡迎提出 Issue 或 Pull Request！

---

<div align="center">
<sub>Last updated: 2026/09/10</sub>  

<sub>Copyright © 2026 Andy Chiang</sub>
</div>