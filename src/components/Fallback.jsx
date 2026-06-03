/**
 * 無 WebGL 支援時的標準 HTML/CSS 降級版面（純文字版宣傳頁）。
 */
export default function Fallback() {
  const services = [
    'AI 落地服務',
    '網頁特效 / WebGL 3D',
    '影片自動化',
    '智能合約 & 合約管理系統',
    '系統架構 & 整合',
    '智慧製造 & 自動化',
    'CAD/CAM 二次開發 · Legacy 現代化',
  ]
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 overflow-auto bg-[#04060a] px-8 py-12 text-center text-cyan-50">
      <div>
        <h1 className="font-display text-4xl font-bold text-cyan-200">王鼎傑 · Arthur Wang</h1>
        <p className="mt-2 text-sm tracking-[0.25em] text-cyan-100/60">技術總監 · 宏思科技</p>
      </div>
      <p className="max-w-md text-cyan-100/70">
        機械精密製造 × 軟體雲端架構，專注把 AI 與創意技術落地到企業流程。
      </p>
      <ul className="grid max-w-lg grid-cols-1 gap-2 text-left text-sm text-cyan-100/70 sm:grid-cols-2">
        {services.map((s) => (
          <li key={s}>• {s}</li>
        ))}
      </ul>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
        <a
          href="mailto:jaylooloomi@gmail.com"
          className="rounded-full bg-cyan-400 px-6 py-2 font-semibold text-black"
        >
          ✉ jaylooloomi@gmail.com
        </a>
        <a
          href="/Arthur_Wang_Resume_2026.pdf"
          target="_blank"
          rel="noopener"
          className="rounded-full border border-cyan-300/50 px-6 py-2 font-semibold text-cyan-200"
        >
          ↓ 下載完整履歷 PDF
        </a>
      </div>
    </div>
  )
}
