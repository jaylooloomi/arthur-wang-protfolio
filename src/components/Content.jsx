/**
 * 隨 3D 一起滾動的 HTML 宣傳內容（放在 drei <Scroll html> 內）。
 * 共 6 個 h-screen 段落，對應 ScrollControls pages={6}。
 * 根層 pointer-events-none 讓滾輪事件穿透給 ScrollControls；
 * 只有連結/按鈕設 pointer-events-auto 才可點擊。
 */

const SERVICES_NEW = [
  {
    icon: '🚀',
    title: 'AI 落地服務',
    desc: '協助企業導入 AI：需求盤點、PoC、模型訓練到正式上線一條龍。CAD 特徵辨識、阿里雲模型訓練實戰經驗。',
  },
  {
    icon: '✨',
    title: '網頁特效 / WebGL 3D',
    desc: '沉浸式 3D 互動網站、粒子與著色器特效、滾動敘事——就像你正在看的這一頁。',
  },
  {
    icon: '🎬',
    title: '影片自動化',
    desc: '批次生成、自動剪輯與素材流水線，把重複的影音產製變成一鍵流程。',
  },
  {
    icon: '📜',
    title: '智能合約 & 合約管理系統',
    desc: '智能合約開發與合約全生命週期管理系統，數位簽核、版本控管、流程自動化。',
  },
]

const SERVICES_ENG = [
  { title: '系統架構 & 整合', desc: '分散式雲服務、微服務、訊息佇列、API 介面規劃與多系統串接。' },
  { title: '智慧製造 & 自動化', desc: 'FMS 彈性製造系統、排程引擎、產線自動化與機台通訊協定。' },
  { title: 'Legacy 系統現代化', desc: '.NET Framework → .NET Core / .NET 8 遷移、DLL 模組化拆解、效能重構。' },
  { title: 'CAD/CAM 二次開發', desc: 'NX、Solid Edge、SolidWorks 二次開發；電極設計輔助、自動化製程。' },
]

const STACK = [
  ['後端', 'C# · .NET Core (9Y) · WCF · WebAPI · EntityFramework'],
  ['前端', 'Angular · Flutter · TypeScript · WebGL / Three.js'],
  ['雲端 / DevOps', 'Docker Swarm · K8s · CI/CD · Prometheus · Grafana · ELK · Redis'],
  ['資料庫', 'MSSQL · MariaDB · MongoDB · Redis'],
  ['AI / 數據', 'Python · TensorFlow · 阿里雲模型訓練'],
  ['工程製圖', 'NX (5Y) · SolidWorks · Solid Edge'],
]

const TIMELINE = [
  { period: '現任', org: '紅絲科技', role: '技術總監', note: 'AI 落地、網頁特效、影片自動化、智能合約等整合服務' },
  { period: '2023 – 2026', org: '瀚智達科技', role: '技術經理', note: 'FMS 系統、智能報價、製程排程引擎、3D 轉檔系統' },
  { period: '2021 – 2023', org: '瑞嘉軟體', role: '資深後端工程師', note: '搜尋引擎、雲端串流、Legacy → .NET Core 遷移、CI/CD' },
  { period: '2020 – 2021', org: '薩契科技', role: 'CAX 主管', note: '報價/採購/倉儲系統、3D 列印分析、CAD/CAM 開發' },
  { period: '2016 – 2019', org: '上博科技', role: '資深工程師', note: '智慧製造系統、排程引擎、EDM 電極設計輔助軟體' },
]

function Section({ children, align = 'center', className = '' }) {
  const justify =
    align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center'
  return (
    <section className={`flex h-screen w-screen items-center ${justify} px-6 md:px-16 ${className}`}>
      {children}
    </section>
  )
}

export default function Content() {
  return (
    <div className="pointer-events-none w-screen text-[#f6efe6]">
      {/* 0 — HERO */}
      <Section align="center">
        <div className="max-w-3xl text-center">
          <p className="mb-4 text-xs tracking-[0.5em] text-amber-300/80 md:text-sm">
            TECHNICAL DIRECTOR · 紅絲科技
          </p>
          <h1 className="font-display text-5xl font-bold leading-[1.05] md:text-8xl">
            <span className="bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,170,60,0.35)]">
              王鼎傑
            </span>
            <span className="mt-2 block text-2xl font-medium text-amber-100/70 md:text-3xl">
              Arthur Wang
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-amber-50/75 md:text-lg">
            機械精密製造 × 軟體雲端架構 ——
            <br />
            專注把 <span className="text-cyan-300">AI 與創意技術</span>{' '}
            真正落地到企業流程。
          </p>
          <p className="mt-10 animate-pulse text-xs tracking-[0.4em] text-amber-200/50">
            SCROLL ▼
          </p>
        </div>
      </Section>

      {/* 1 — 關於 / 數字 */}
      <Section align="left">
        <div className="glass pointer-events-auto max-w-lg p-8 md:p-10">
          <h2 className="font-display text-3xl font-bold text-amber-200 md:text-4xl">關於我</h2>
          <p className="mt-4 text-sm leading-relaxed text-amber-50/80 md:text-base">
            台大機械碩士出身，8–9 年橫跨智慧製造與軟體架構的實戰經驗。擅長把複雜的商務規則與精密製造邏輯，
            轉化為穩定、易於橫向擴充的系統；近年專注於 AI 落地、創意網頁技術與流程自動化。
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              ['9+ 年', 'C# / .NET 後端'],
              ['80%', '單元測試覆蓋率'],
              ['4+', '上市櫃製造客戶'],
              ['台大', '機械工程碩士'],
            ].map(([k, v]) => (
              <div key={v} className="rounded-xl border border-amber-400/20 bg-black/20 p-4">
                <div className="font-display text-2xl font-bold text-amber-300 md:text-3xl">{k}</div>
                <div className="mt-1 text-xs text-amber-50/60">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 2 — 主打服務 */}
      <Section align="right">
        <div className="max-w-2xl">
          <h2 className="mb-6 text-right font-display text-3xl font-bold text-amber-200 md:text-4xl">
            我能提供的服務
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {SERVICES_NEW.map((s) => (
              <div
                key={s.title}
                className="glass pointer-events-auto p-5 transition-transform hover:scale-[1.02]"
              >
                <div className="text-3xl">{s.icon}</div>
                <h3 className="mt-3 font-display text-lg font-semibold text-amber-100">{s.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-amber-50/70">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 3 — 工程服務 + 技術棧 */}
      <Section align="left">
        <div className="max-w-2xl">
          <h2 className="mb-6 font-display text-3xl font-bold text-cyan-200 md:text-4xl">
            工程與系統能力
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SERVICES_ENG.map((s) => (
              <div
                key={s.title}
                className="rounded-xl border border-cyan-400/20 bg-black/30 p-4 backdrop-blur"
              >
                <h3 className="font-semibold text-cyan-100">{s.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-cyan-50/65">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 4 — 技術棧 + 經歷 */}
      <Section align="right">
        <div className="glass pointer-events-auto max-w-xl p-8">
          <h2 className="font-display text-2xl font-bold text-amber-200 md:text-3xl">技術棧</h2>
          <div className="mt-4 space-y-2">
            {STACK.map(([k, v]) => (
              <div key={k} className="flex flex-col border-b border-amber-400/10 pb-2 sm:flex-row">
                <div className="w-32 shrink-0 text-xs font-semibold text-amber-300">{k}</div>
                <div className="text-xs text-amber-50/70">{v}</div>
              </div>
            ))}
          </div>
          <h2 className="mt-8 font-display text-2xl font-bold text-amber-200 md:text-3xl">經歷</h2>
          <ol className="mt-4 space-y-3">
            {TIMELINE.map((t) => (
              <li key={t.org} className="flex gap-3">
                <span className="w-24 shrink-0 text-[11px] text-cyan-300">{t.period}</span>
                <div>
                  <div className="text-sm font-semibold text-amber-100">
                    {t.org} · <span className="text-amber-200/80">{t.role}</span>
                  </div>
                  <div className="text-[11px] text-amber-50/55">{t.note}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* 5 — 聯絡 CTA */}
      <Section align="center">
        <div className="max-w-xl text-center">
          <h2 className="font-display text-4xl font-bold leading-tight md:text-6xl">
            <span className="bg-gradient-to-r from-amber-200 to-cyan-300 bg-clip-text text-transparent">
              一起把你的想法落地
            </span>
          </h2>
          <p className="mt-5 text-sm text-amber-50/70 md:text-base">
            AI 導入、3D 網頁、影片自動化、智能合約、系統整合 —— 歡迎聊聊你的專案。
          </p>
          <div className="pointer-events-auto mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="mailto:jaylooloomi@gmail.com"
              className="rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-8 py-3 font-semibold text-black shadow-[0_0_30px_rgba(255,170,60,0.4)] transition-transform hover:scale-105"
            >
              ✉ jaylooloomi@gmail.com
            </a>
            <a
              href="/Arthur_Wang_Resume_2026.pdf"
              target="_blank"
              rel="noopener"
              className="rounded-full border border-cyan-300/50 px-8 py-3 font-semibold text-cyan-200 transition-colors hover:bg-cyan-300/10"
            >
              ↓ 下載完整履歷 PDF
            </a>
          </div>
          <p className="mt-10 text-[11px] tracking-widest text-amber-50/40">
            王鼎傑 ARTHUR WANG · 紅絲科技 技術總監
          </p>
        </div>
      </Section>
    </div>
  )
}
