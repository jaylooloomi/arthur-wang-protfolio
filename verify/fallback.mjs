// 驗證 WebGL 降級：注入 init script 讓 getContext('webgl'/'webgl2') 回傳 null，
// 模擬不支援 WebGL 的瀏覽器，確認顯示 Fallback HTML 版面而非崩潰。
import { chromium } from 'playwright'
import fs from 'fs'

const URL = process.env.VERIFY_URL || 'http://localhost:5173'
fs.mkdirSync('verify-shots', { recursive: true })

const browser = await chromium.launch({ headless: false, args: ['--enable-gpu'] })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

await page.addInitScript(() => {
  const orig = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null
    return orig.call(this, type, ...rest)
  }
})

const errors = []
page.on('pageerror', (e) => errors.push(String(e)))

await page.goto(URL, { waitUntil: 'load', timeout: 60000 })
await page.waitForTimeout(2000)

const text = await page.evaluate(() => document.body.innerText)
const hasFallback = /WebGL/i.test(text) && /瀏覽器/.test(text)
await page.screenshot({ path: 'verify-shots/fallback.png' })
await browser.close()

console.log(JSON.stringify({ hasFallbackText: hasFallback, pageErrors: errors, bodyTextSample: text.slice(0, 200) }, null, 2))
