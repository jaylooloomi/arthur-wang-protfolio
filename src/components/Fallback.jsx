/**
 * 無 WebGL 支援時的標準 HTML/CSS 降級版面。
 */
export default function Fallback() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-[#04060a] px-8 text-center text-cyan-100">
      <h1 className="text-4xl font-bold tracking-tight">NEXUS · 3D Portfolio</h1>
      <p className="max-w-md text-cyan-200/70">
        你的瀏覽器不支援 WebGL，無法顯示 3D 沉浸式體驗。
        請改用支援 WebGL 的現代瀏覽器（Chrome、Edge、Firefox 或 Safari）。
      </p>
      <ul className="space-y-1 text-left text-sm text-cyan-200/60">
        <li>• 3D Logo 粒子爆破</li>
        <li>• 滾動式 3D 隧道作品展示</li>
        <li>• Sci-Fi 核心 + DNA 粒子流</li>
      </ul>
    </div>
  )
}
