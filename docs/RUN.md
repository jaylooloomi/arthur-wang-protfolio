# 本機啟動 / 對外預覽 操作手冊

三個頁面：
- `/` 主站個人宣傳頁
- `/experiences.html` Creative Experiences 四幕 montage
- `/engine.html` PRECISION ENGINE 五幕捲動敘事

---

## A. 本機開發（最常用）
```bash
npm install          # 第一次才需要
npm run dev          # → http://localhost:5173
```
- 開發頁：`http://localhost:5173/`、`/experiences.html`、`/engine.html`
- 改檔即時熱更新（HMR）。停止：終端機按 Ctrl+C。

## B. 產生正式版
```bash
npm run build        # → 產出 dist/（含三個 .html 入口）
npm run preview      # 用 vite 預覽 dist（→ http://localhost:4173）
```

## C. 本機靜態伺服器（給對外通道用）
```bash
$env:PORT="8787"; node serve-dist.mjs   # PowerShell
# 或 PORT=8787 node serve-dist.mjs       # bash
# → http://localhost:8787，serve 的是 dist/（先跑過 npm run build）
```
`serve-dist.mjs` 是無依賴靜態伺服器，不檢查 Host header，適合接 tunnel。

## D. 對外臨時公開（cloudflared 通道）
1. 取得 cloudflared（免帳號）：
   - 下載 `https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe`
2. 先跑 C（靜態伺服器在 8787），再開通道：
   ```bash
   cloudflared tunnel --url http://localhost:8787 --no-autoupdate
   ```
3. cloudflared 會印出一個**隨機**網址 `https://xxxx.trycloudflare.com`，那就是對外網址。
   - ⚠️ **每次啟動網址都不同**、無 uptime 保證、關掉就失效 → 只適合臨時預覽。
   - ⚠️ 關機/休眠或關掉 cloudflared 與靜態伺服器，網址即失效。

## E. 永久部署（建議用這個取代 D）
純前端，可直接接 Vercel / Netlify：
- 連這個 GitHub repo，build command `npm run build`、output 目錄 `dist`
- 可指定要部署的分支（例如 `feature/video-sequence`），不必合併 main
- 拿到永久網址 + HTTPS + CDN，不依賴本機開機

---

## 全部關閉
```powershell
Stop-Process -Name cloudflared -Force
# 找出佔用 5173 / 8787 的 PID 後關閉：
Get-NetTCPConnection -State Listen -LocalPort 5173,8787 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```
