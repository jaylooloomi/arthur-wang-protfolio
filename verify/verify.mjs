// Playwright 視覺驗證腳本（穩健版）
// 用法：node verify/verify.mjs '[{"name":"phase2","atMs":6000}]'
// 環境變數：
//   VERIFY_URL       預設 http://localhost:5173
//   VERIFY_HEADLESS  '1' = headless+SwiftShader；其他 = headed（真實 GPU，較可靠）
//
// 每個 shot 可帶：name, atMs(從載入起算的毫秒), scroll(0~1, 捲動 drei ScrollControls)
// 會擷取 console / pageerror / canvas 尺寸 / WebGL context 狀態，並分析截圖亮度。

import { chromium } from 'playwright'
import { PNG } from 'pngjs'
import fs from 'fs'
import path from 'path'

const URL = process.env.VERIFY_URL || 'http://localhost:5173'
const HEADLESS = process.env.VERIFY_HEADLESS === '1'
const OUTDIR = 'verify-shots'
fs.mkdirSync(OUTDIR, { recursive: true })

const shots = JSON.parse(process.argv[2] || '[{"name":"shot","atMs":6000}]')
shots.sort((a, b) => (a.atMs ?? 0) - (b.atMs ?? 0))

const launchArgs = HEADLESS
  ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
  : ['--ignore-gpu-blocklist', '--enable-gpu']

const allConsole = []
const pageErrors = []
const results = []
let canvasInfo = null

const browser = await chromium.launch({ headless: HEADLESS, args: launchArgs })

try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  })
  page.on('console', (m) => allConsole.push({ type: m.type(), text: m.text() }))
  page.on('pageerror', (e) => pageErrors.push(String(e)))

  const start = Date.now()
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 }).catch((e) => pageErrors.push('goto: ' + e))
  await page.waitForSelector('canvas', { timeout: 30000 }).catch((e) => pageErrors.push('no canvas: ' + e))

  const setScroll = (frac) =>
    page.evaluate((f) => {
      const scrollers = [...document.querySelectorAll('*')].filter((n) => {
        const o = getComputedStyle(n).overflowY
        return (o === 'auto' || o === 'scroll') && n.scrollHeight > n.clientHeight + 4
      })
      const sc = scrollers[0]
      if (sc) sc.scrollTop = (sc.scrollHeight - sc.clientHeight) * f
      return !!sc
    }, frac)

  const readCanvas = () =>
    page.evaluate(() => {
      const c = document.querySelector('canvas')
      if (!c) return { exists: false }
      const gl = c.getContext('webgl2') || c.getContext('webgl')
      return {
        exists: true,
        cssW: c.clientWidth,
        cssH: c.clientHeight,
        bufW: c.width,
        bufH: c.height,
        contextLost: gl ? gl.isContextLost() : 'no-gl-handle',
      }
    })

  for (const s of shots) {
    const elapsed = Date.now() - start
    const wait = Math.max(0, (s.atMs ?? 0) - elapsed)
    if (wait > 0) await page.waitForTimeout(wait)
    if (s.scroll != null) {
      await setScroll(s.scroll)
      await page.waitForTimeout(1200)
    }

    canvasInfo = await readCanvas().catch((e) => ({ error: String(e) }))

    const file = path.join(OUTDIR, s.name + '.png')
    let shotErr = null
    await page
      .screenshot({ path: file, animations: 'allow', timeout: 15000 })
      .catch((e) => (shotErr = String(e)))

    let analysis = { shotErr }
    if (!shotErr && fs.existsSync(file)) {
      const png = PNG.sync.read(fs.readFileSync(file))
      let nonBlack = 0
      let lumSum = 0
      const total = png.width * png.height
      for (let i = 0; i < png.data.length; i += 4) {
        const lum = 0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2]
        lumSum += lum
        if (lum > 12) nonBlack++
      }
      analysis = {
        file,
        nonBlackPct: +((100 * nonBlack) / total).toFixed(2),
        avgLum: +(lumSum / total).toFixed(2),
      }
    }
    results.push({ name: s.name, canvasInfo, ...analysis })
  }
} catch (e) {
  pageErrors.push('fatal: ' + String(e))
} finally {
  await browser.close().catch(() => {})
}

console.log(
  JSON.stringify(
    {
      url: URL,
      headless: HEADLESS,
      pageErrors,
      consoleErrors: allConsole.filter((m) => m.type === 'error' || m.type === 'warning'),
      consoleSample: allConsole.slice(0, 12),
      results,
    },
    null,
    2,
  ),
)
