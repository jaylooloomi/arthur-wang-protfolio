/**
 * Tailwind HUD 文字覆層（不攔截滑鼠事件，3D 互動照常）。
 */
export default function Overlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex select-none flex-col justify-between p-6 md:p-10">
      <header className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-cyan-200/70 md:text-xs">
        <span>NEXUS // 3D</span>
        <span>Creative Technologist</span>
      </header>

      <div className="mb-10 text-center">
        <h1 className="bg-gradient-to-b from-white to-cyan-300/50 bg-clip-text text-5xl font-bold tracking-tight text-transparent drop-shadow-[0_0_25px_rgba(0,255,204,0.35)] md:text-7xl">
          IMMERSIVE / 3D
        </h1>
        <p className="mt-3 text-sm tracking-[0.4em] text-cyan-200/60">
          SCROLL TO ENTER ▼
        </p>
      </div>
    </div>
  )
}
