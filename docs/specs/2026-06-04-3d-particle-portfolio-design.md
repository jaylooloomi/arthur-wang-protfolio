# 3D Particle & Scroll-Driven Portfolio — 規劃文件 (Design Spec)

**日期**：2026-06-04
**狀態**：已核准，實作中
**作者**：Arthur + Claude

---

## 1. 目標 (Objective)

打造一個高端、沉浸式的 **3D 滾動驅動作品集網站**，包含：

- 開場：3D 網格 Logo 爆破成數千粒子
- 中段：相機沿 Z 軸前進的 3D 隧道，穿過漂浮的作品展示卡（液態扭曲）
- 終局：中央 Sci-Fi 核心機械 + 雙螺旋 DNA 粒子流
- 全程：霓虹輝光 (Bloom) 美術風格

純前端、單頁沉浸式體驗，無後端 / SEO 需求。

## 2. 技術棧 (Tech Stack)

| 類別 | 選用 | 理由 |
|------|------|------|
| 打包 / 框架 | **Vite + React** | 純前端、啟動快、設定少；不需 Next.js 的 SSR |
| 3D 引擎 | Three.js + `@react-three/fiber` (R3F) | React 宣告式管理 3D 場景 |
| 3D 輔助 | `@react-three/drei` | ScrollControls、useGLTF、Loader |
| 動畫 | `gsap` + ScrollTrigger | 滾動 → 3D 屬性映射（隧道用 drei useScroll，跨段時間軸用 gsap） |
| 後處理 | `@react-three/postprocessing` | `<Bloom>` 霓虹輝光 |
| 樣式 | Tailwind CSS | UI overlay、HUD 文字 |
| 驗證 | Playwright | 每個 Phase 完成後截圖 + console 檢查 |

## 3. 素材清單與授權 (Assets & Licensing)

存於 `public/models/`（已下載驗證，magic bytes = `glTF`）：

| 檔案 | 內容 | 來源 | 授權 |
|------|------|------|------|
| `DamagedHelmet.glb` | 戰損 Sci-Fi 頭盔 | Khronos glTF-Sample-Assets | CC-BY 4.0 (ctxr) |
| `CarConcept.glb` | 流線概念車 | Khronos glTF-Sample-Assets | 見 CREDITS |
| `RobotExpressive.glb` | 可動畫卡通機器人 | three.js examples | CC-BY (Don McCurdy / Tomás Laulhé) |
| `ToyCar.glb` | 機械玩具車 | Khronos glTF-Sample-Assets | CC0 |
| `ChronographWatch.glb` | 機械錶機芯 | Khronos glTF-Sample-Assets | 見 CREDITS |

> 部分為 CC-BY，需標註。專案根目錄維護 `CREDITS.md`。

## 4. 素材 → 場景對應 (Asset Mapping)

| 場景 | 主角模型 | 做法 |
|------|---------|------|
| Phase 2 開場 Logo 爆破 | `DamagedHelmet` 頂點 | 取網格頂點 → 粒子雲，shader 控組裝↔潰散 |
| Phase 3 滾動隧道漂浮卡 | `CarConcept` / `RobotExpressive` / `ToyCar` | 沿 -Z 軸擺放，依序穿過，套液態扭曲 |
| Phase 5 核心 + DNA | `ChronographWatch` + 數學雙螺旋粒子 | 機芯旋轉發光，外圍 InstancedMesh DNA 粒子環繞 |

## 5. 架構 (Architecture)

```
3D PRINT Website/
├─ public/models/              # 5 個 .glb（已下載）
├─ src/
│  ├─ main.jsx                 # React 進入點
│  ├─ App.jsx                  # 版面、WebGL 偵測、Fallback 切換
│  ├─ Experience.jsx           # <Canvas> + ScrollControls + EffectComposer 根
│  ├─ scenes/
│  │  ├─ LogoExplosion.jsx     # Phase 2 粒子爆破
│  │  ├─ ScrollTunnel.jsx      # Phase 3 隧道 + 漂浮卡
│  │  └─ SciFiCore.jsx         # Phase 5 核心 + DNA 螺旋
│  ├─ shaders/
│  │  ├─ particles.js          # 粒子 vertex/fragment GLSL（含 Simplex noise）
│  │  └─ distortion.js         # 卡片液態扭曲 GLSL
│  ├─ components/
│  │  ├─ ModelShowcase.jsx     # 通用模型展示（含旋轉/浮動）
│  │  ├─ Overlay.jsx           # Tailwind HUD 文字
│  │  └─ Fallback.jsx          # 無 WebGL 時的 HTML/CSS 降級
│  ├─ hooks/
│  │  └─ useModelPoints.js     # 抽取 glTF 網格頂點 → Float32Array
│  └─ index.css                # Tailwind + 全域樣式
├─ docs/specs/                 # 本文件
├─ CREDITS.md
├─ index.html
├─ vite.config.js
├─ tailwind.config.js
└─ package.json
```

## 6. 各 Phase 實作要點

### Phase 1 — 初始化 & Canvas 骨架
- 全螢幕 `<Canvas>`（`w-screen h-screen fixed`），`gl={{ antialias: true }}`、`ACESFilmicToneMapping`。
- `<EffectComposer>` + `<Bloom intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} />`。
- WebGL 偵測：不支援 → 渲染 `<Fallback>`。

### Phase 2 — Logo 粒子爆破
- `useGLTF` 載入 `DamagedHelmet`，`useModelPoints` 抽取頂點 → `<points>`。
- 自訂 `ShaderMaterial`：uniform `uProgress` (0→1)、`uTime`；Simplex noise 驅動粒子分散。
- Fragment 輸出 HDR 高亮綠 `vec3(0.0, 2.0, 1.0)` 觸發 Bloom。
- 進場時 gsap 將 `uProgress` 0→1。

### Phase 3 — 滾動隧道 + 漂浮卡
- `<ScrollControls pages={5} damping={0.2}>`，`useScroll` 取進度。
- `useFrame`：`scroll.offset` → `camera.position.z`（沿 -Z 前進）。
- 3 個 `ModelShowcase` 擺在 z = -10, -20, -30。
- 卡片材質套液態扭曲 shader：sine 波改 UV，綁定滑鼠 + `uTime`。

### Phase 4 — 霓虹後處理（與 Phase 1 共用 EffectComposer）
- 確保粒子與卡片 fragment 輸出高 HDR 值觸發 Bloom。

### Phase 5 — Sci-Fi 核心 + DNA 螺旋
- 載入 `ChronographWatch` 當核心，`useFrame` 內 `rotation.y += 0.005` 持續旋轉。
- 參數式雙螺旋：`x=sin(t)`, `y=t`, `z=cos(t)`，第二股相位 +π。
- 粒子數 > 5000 → 用 `InstancedMesh`。

## 7. 硬性約束 (Critical Constraints)

1. **記憶體**：unmount 時 dispose geometry/material；`useFrame` 內**不** new 物件（Vector3/Array 預先建立於外層）。
2. **效能**：>5000 元素一律 `InstancedMesh`，目標 60 FPS。
3. **降級**：無 WebGL → 標準 HTML/CSS 版面。

## 8. 驗證計畫 (Verification — Playwright)

每個 Phase 完成後：
1. 啟動 `vite` dev server。
2. Playwright 開啟頁面，等待 canvas 掛載。
3. **截圖**存檔，檢查非全黑（取樣像素 / 檔案大小）。
4. 擷取 `console` 訊息，確認無 error / WebGL warning。
5. Phase 3 額外：模擬滾動，截多張不同進度的圖。
6. 有問題 → 修 → 重驗；無問題 → 進下一個 Phase。

## 9. Git 流程

- `git init`，`.gitignore`（node_modules, dist）。
- 每個 Phase 完成各一個 commit。

## 10. 待辦 / 已知風險

- Headless WebGL 截圖可能因無 GPU 而黑屏 → 用 SwiftShader（`--use-gl=swiftshader` / chromium 預設軟體渲染）或改 headed 模式。
- glTF 模型頂點數差異大 → 粒子數動態取樣，避免過載。
- 大模型 (`CarConcept` 11MB) 載入時間 → 加 `<Suspense>` loader。
