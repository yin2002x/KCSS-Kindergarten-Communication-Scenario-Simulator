# 幼兒園溝通情境模擬器 (Kindergarten Communication Scenario Simulator)

一款專為幼教老師、教保員與師資培訓設計的高擬真對話演練平台。透過 Google Gemini 官方最新 `@google/genai` 模型，沉浸式模擬家長、幼兒、主管與搭班同事的溝通情境，並具備即時高情商提示與四維度量化專業評估。

![專案預覽](https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 核心特色與功能

1. **五大狀態流程切換 (SPA)**：
   - **Login（學員登入）**：支援學員編號、園所資訊、快速一鍵切換預設角色（資深教師、新進教保員、實習幼師）。
   - **Lobby（情境大廳）**：收錄親師溝通、師幼互動、行政高壓、協同教學 4 大經典實戰情境，支援分類篩選與關鍵字搜尋。
   - **AI 隨機實戰盲測**：點擊隨機盲測按鈕，由 Gemini 動態生成富有幼教現場挑戰的全新考題！
   - **Chat（Line 仿生聊天室）**：模擬通訊軟體交談介面、對象情緒狀態、即時輸入中動畫，並支援「💡 AI 智能提示」一鍵帶入高情商建議句型。
   - **Result（評估儀表板）**：提供總分 (0-100)、評級等第 (S/A/B/C)、四向度雷達進度條（語氣、同理心、清晰度、幼兒最佳利益）、優勢亮點、盲點風險分析與特優幼師示範回覆。
   - **Analysis（演練歷程）**：完整記錄每位學員的歷史演練紀錄，支援 JSON 歷程匯出與匯入，方便教學評鑑與個人檔案留存。

2. **內建溝通心法錦囊**：
   - 包含「我訊息 (I-Message)」、「反映傾聽 (Reflective Listening)」、「非暴力溝通四步驟 (NVC)」與「幼兒情緒標籤化 (Name it to tame it)」。

3. **安全全端架構（保護金鑰）**：
   - 採用 Express + Vite 後端代理架構，Gemini API Key 妥善隔離於伺服端，不會曝露於前端原始碼。
   - 支援本地儲存（LocalStorage），免去繁複的外部雲端資料庫註冊門檻，Clone 後開箱即用！

---

## 🛠️ 技術堆疊

- **前端**：React 19 + TypeScript + Tailwind CSS
- **Icon**：Lucide React
- **後端**：Node.js + Express (Full-stack 模式)
- **AI 模型**：Google Gemini 3.8 Flash (`@google/genai`)
- **建構工具**：Vite

---

## 🚀 本地開發與 GitHub 應用步驟

### 1. 複製專案
```bash
git clone https://github.com/YOUR_USERNAME/kindergarten-simulator.git
cd kindergarten-simulator
```

### 2. 安裝依賴
```bash
npm install
```

### 3. 設定環境變數
在專案根目錄新增 `.env` 檔案（可參考 `.env.example`）：
```env
GEMINI_API_KEY="你的_GEMINI_API_金鑰"
PORT=3000
```
> 前往 [Google AI Studio](https://aistudio.google.com/) 即可免費申請 Gemini API Key。

### 4. 啟動開發伺服器
```bash
npm run dev
```
瀏覽器開啟 `http://localhost:3000` 即可開始演練！

### 5. 建置生產版本
```bash
npm run build
npm start
```
