# 🍃 水果森友會

接水果、逛小鎮、躲雨吃水果。這是 Goji Land 裡的獨立遊戲，用 Vue 3 + Vite 做成。

## 開發

```bash
cd apps/fruit-crossing
npm install
npm run dev
```

瀏覽器開 `http://localhost:5174`。手機請用同一區網 IP，例如 `http://192.168.x.x:5174`。

## 給平台靜態伺服器

樂園地圖連到建置後的檔案：

```bash
npm run build
```

入口：`apps/fruit-crossing/dist/index.html`

從 Goji Land 根目錄跑 `python3 -m http.server` 後，點地圖上的「水果森友會」即可。
