# NEXUS · WebGL 3D Particle & Scroll-Driven Portfolio

高端、沉浸式的 3D 滾動驅動作品集網站。以 Three.js + React Three Fiber 打造，
包含粒子爆破、滾動 3D 隧道、液態扭曲卡片、Sci-Fi 核心與雙螺旋 DNA 粒子流，
全程霓虹 Bloom 輝光。

![Phase 5 核心 + DNA](verify-shots/p5-100.png)

## 技術棧

Vite · React 19 · Three.js (r184) · @react-three/fiber v9 · @react-three/drei v10 ·
@react-three/postprocessing v3 · GSAP · Tailwind CSS v4

## 開發

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 產出 dist/
npm run preview  # 預覽 production 版本
```

## 視覺驗證（Playwright）

```bash
node verify/verify.mjs '[{"name":"shot","atMs":7000,"scroll":0.5}]'  # 指定時間/滾動位置截圖
node verify/fallback.mjs                                              # 驗證無 WebGL 降級
```
截圖輸出於 `verify-shots/`。

## 場景結構（沿滾動推進）

| 滾動 | 場景 | 檔案 |
|------|------|------|
| 開場 | Logo 粒子爆破（DamagedHelmet 頂點 + GLSL noise） | `src/scenes/LogoExplosion.jsx` |
| 中段 | 3D 隧道 + 機械模型 + 液態扭曲卡 | `src/scenes/ScrollTunnel.jsx` |
| 結尾 | Sci-Fi 核心 + 雙螺旋 DNA（InstancedMesh） | `src/scenes/SciFiCore.jsx` |

相機飛行軌道與 Bloom 後處理於 `src/Experience.jsx`；
WebGL 偵測與降級於 `src/App.jsx` / `src/components/Fallback.jsx`。

## 素材授權

3D 模型來源與授權見 [CREDITS.md](CREDITS.md)。部分為 CC BY，商用請依規定標註。

## 設計文件

完整規劃見 [docs/specs/2026-06-04-3d-particle-portfolio-design.md](docs/specs/2026-06-04-3d-particle-portfolio-design.md)。
