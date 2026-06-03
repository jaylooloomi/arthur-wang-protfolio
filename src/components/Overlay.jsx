/**
 * 固定頂部列 HUD（滾動時恆在）：左側品牌字，右側聯絡按鈕。
 * 整層 pointer-events-none，只有按鈕可點，確保滾輪事件穿透給 3D。
 */
export default function Overlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 select-none">
      <header className="flex items-center justify-between p-5 md:px-10 md:py-6">
        <div className="leading-tight">
          <div className="font-display text-sm font-bold tracking-wide text-amber-200 md:text-base">
            王鼎傑 <span className="text-amber-100/50">Arthur Wang</span>
          </div>
          <div className="text-[10px] tracking-[0.25em] text-amber-100/45 md:text-xs">
            技術總監 · 紅絲科技
          </div>
        </div>

        <a
          href="mailto:jaylooloomi@gmail.com"
          className="pointer-events-auto rounded-full border border-amber-300/40 bg-black/30 px-4 py-2 text-xs font-semibold text-amber-100 backdrop-blur transition-colors hover:bg-amber-300/15 md:text-sm"
        >
          聯絡我 ✦
        </a>
      </header>
    </div>
  )
}
