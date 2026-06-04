# PRECISION ENGINE — 沉浸式體驗設計（框架 + 動畫劇本）

**狀態**：設計稿（原創）｜分支 `feature/video-sequence`
**定位**：王鼎傑個人品牌的旗艦級 WebGL 體驗——把「機械精密製造 × 軟體/AI」的雙重身分，
做成一場「**raw matter → 被工程化 → 長成活的系統**」的捲動敘事。
**設計原則**：技術框架對齊頂尖創意站的通用手法；**美術與動畫劇本 100% 原創**（非複製任何特定作品）。

---

## 1. 美術方向（Aesthetic POV）
**一句話**：液態鉻金屬的精密感 ＋ 生物發光的有機湧現 ＋ 一點「點火」的暖色火花。

- **主題色板**（CSS variables）：
  - 底：`--void: #050709`（近黑帶藍）、`--obsidian: #0a0f14`
  - 金屬：`--chrome: #c8d2dc` / `--titanium: #8a97a3`（液態鉻反光）
  - 主光：`--jade: #36e0c0`（生物發光青玉，主角）
  - 點火：`--ember: #ff7a3c`（暖橘火花，**全站唯一暖色**，只在關鍵時刻出現）
  - 規則：**深色主導 + 青玉為主光 + 火花做戲劇性點綴**（不是均勻配色）
- **字體**（避開 Inter/Space Grotesk）：
  - Display：**Syne**（幾何、有個性，做大標）
  - HUD / 數據標籤：**JetBrains Mono**（技術感、等寬）
  - 內文：**Sora** 或系統 grotesque（精簡）
- **質感**：grain 顆粒覆層、掃描線/刻度 HUD、液態鉻反光（envMap）、體積光暈（Bloom）、自訂游標（精密準星）。

## 2. 框架 / 技術架構（對齊通用手法）
```
RenderManager（場景合成器，管理 act 切換與相機）
├─ ScrollControls（捲動 → 進度 0..1，驅動整個劇本）
├─ FXComposer：Bloom + 色差(ChromaticAberration) + Noise/Grain
├─ FBO/GPGPU 粒子（已有 GpgpuParticles）
├─ 流體合成幕（已有 FluidDye）
├─ 程序幾何/粒子（CurlFlowField / Jellyfish / SciFiCore）
└─ HUD 層（HTML overlay，JetBrains Mono，act 標題/刻度/進度）
效能：InstancedMesh、dispose、預留 KTX2 貼圖管線、行動裝置降載。
```
> 對照 analysis.md：等同 AT 的 `RenderManager` + `FXSceneCompositor` + `FBORendererWebGL` + `ScrollRenderManager` + `GLUIStage` + `HydraBloom` 概念，用 R3F 原創實作。

## 3. 動畫劇本（Storyboard，捲動驅動，5 幕）
| 進度 | 幕 | 畫面 | 動態設計 | HUD |
|------|----|------|---------|-----|
| 0–8% | **00 IGNITION** | 全黑 → 一點 **ember 火花**亮起 → 炸成青玉粒子星雲 | 進場：火花脈動 0.6s → 爆破 staggered；相機微推近 | 中央浮現 `王鼎傑 / PRECISION ENGINE`，四角刻度框繪入 |
| 8–32% | **01 DISPERSION** | 火花能量散成 **GPGPU 光絲流場** | 捲動 → 相機沿流場漂移、粒子拖尾 | 左下 `01 / SYSTEMS` + 即時刻度數字 |
| 32–56% | **02 EMERGENCE** | 流場中**湧現有機結構**（生物發光水母/體） | 結構從粒子凝聚（uProgress 反向）；鐘體脈動 | `02 / EMERGENCE` |
| 56–80% | **03 FLUX** | 一切熔成**液態流體**（鉻/青玉/火花三色墨染） | 滑鼠攪動 + 自動湧流；色差加強 | `03 / FLUX` |
| 80–100% | **04 CORE** | 收斂成**精密核心 + 雙螺旋**（引擎本體） | 核心旋轉、DNA 環繞；ember 回歸點亮核心 | `04 / READY`＋CTA：聯絡 / 服務 |
| 轉場 | — | 各幕之間**不硬切** | 黑幕/光暈 crossfade + 相機運鏡 + HUD morph | 進度條持續 |

**節奏**：總長約對應 6 頁捲動；每幕進場有一個「主事件」（火花、散開、湧現、熔解、點火）。

## 4. 互動 / 動態細節
- 進場一次性「點火」orchestrated reveal（最關鍵的 delight 時刻）
- 捲動映射相機 + 各幕 uniform（uProgress / 色彩 / 密度）
- 滑鼠：流體攪動、粒子排開、HUD 準星跟隨
- 自訂游標（細十字準星）、grain 覆層、HUD 刻度微動畫

## 5. 與現有資產的接法
沿用分支上已驗證的原創元件：`CurlFlowField`(星雲) / `GpgpuParticles`(光絲) / `Jellyfish`(湧現) / `FluidDye`(熔流) / `SciFiCore`(核心)，
用新的 **RenderManager + 劇本控制器 + HUD + 點火轉場** 串成一條設計過的敘事線（新入口 `engine.html`，不動主站與既有 montage）。

## 6. 一句話差異點（Differentiation）
別人是「炫技 montage」；這支是**有敘事的「點火 → 湧現 → 成形」工程史詩**，且只用**一抹暖色火花**貫穿——那就是會被記住的記憶點。
