// 無依賴的靜態檔案伺服器，serve dist/（給 tunnel 對外預覽用）。
// 純靜態、不檢查 Host header，避免 tunnel 網域被擋。
import http from 'http'
import fs from 'fs'
import path from 'path'

const root = path.resolve('dist')
const port = Number(process.env.PORT) || 8787

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.bin': 'application/octet-stream',
  '.hdr': 'image/vnd.radiance',
  '.wasm': 'application/wasm',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

http
  .createServer((req, res) => {
    try {
      const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname)
      let file = path.join(root, urlPath)
      if (!file.startsWith(root)) {
        res.writeHead(403)
        return res.end('forbidden')
      }
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
        file = path.join(file, 'index.html')
      }
      if (!fs.existsSync(file)) file = path.join(root, 'index.html') // SPA fallback
      const ext = path.extname(file).toLowerCase()
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      })
      fs.createReadStream(file).pipe(res)
    } catch (e) {
      res.writeHead(500)
      res.end(String(e))
    }
  })
  .listen(port, () => console.log('static server on http://localhost:' + port))
