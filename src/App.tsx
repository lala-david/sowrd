import { Play, Compass, LayoutGrid, Flame, Heart, ChevronRight } from 'lucide-react'

const TOTAL = 12
const CURRENT = 8

function JourneyLine() {
  const W = 300
  const H = 56
  const pad = 12
  const pts = Array.from({ length: TOTAL }, (_, i) => {
    const x = pad + ((W - 2 * pad) * i) / (TOTAL - 1)
    const y = H / 2 + Math.sin(i * 0.85 + 0.4) * 11
    return [x, y] as const
  })
  const d = (arr: readonly (readonly [number, number])[]) =>
    arr.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <path d={d(pts)} fill="none" stroke="#ece7da" strokeOpacity={0.24} strokeWidth={1.6} />
      <path d={d(pts.slice(0, CURRENT))} fill="none" stroke="#ece7da" strokeWidth={2.2} strokeLinecap="round" />
      {pts.map((p, i) => {
        if (i === CURRENT - 1)
          return (
            <g key={i}>
              <circle cx={p[0]} cy={p[1]} r={9} fill="none" stroke="#f0b24a" strokeOpacity={0.5} strokeWidth={1.4} />
              <circle cx={p[0]} cy={p[1]} r={5} fill="#f0b24a" />
            </g>
          )
        if (i < CURRENT - 1) return <circle key={i} cx={p[0]} cy={p[1]} r={2.8} fill="#ece7da" />
        return <circle key={i} cx={p[0]} cy={p[1]} r={2.4} fill="none" stroke="#ece7da" strokeOpacity={0.4} strokeWidth={1.3} />
      })}
    </svg>
  )
}

function TabBar() {
  const tabs = [
    { icon: Compass, label: '여정', active: true },
    { icon: LayoutGrid, label: '수집', active: false },
    { icon: Flame, label: '쉼터', active: false },
  ]
  return (
    <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
      <nav className="flex items-center gap-1 rounded-[28px] border border-line bg-surface/80 p-1.5 backdrop-blur-md">
        {tabs.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={`flex flex-1 flex-col items-center gap-1 rounded-[22px] py-2.5 transition ${
              active ? 'bg-lamp/12 text-lamp-soft' : 'text-muted-2'
            }`}
          >
            <Icon size={21} strokeWidth={active ? 2.4 : 2} />
            <span className="text-[10px] tracking-wide">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <div className="flex min-h-full justify-center bg-ground text-ink">
      <div className="relative flex min-h-full w-full max-w-[430px] flex-col overflow-hidden">
        {/* ambient lamp glow */}
        <div
          className="pointer-events-none absolute -top-28 right-[-12%] h-[420px] w-[420px]"
          style={{ background: 'radial-gradient(circle, rgba(240,178,74,.16), transparent 60%)' }}
        />
        <div
          className="pointer-events-none absolute top-40 left-[-18%] h-[360px] w-[360px]"
          style={{ background: 'radial-gradient(circle, rgba(233,138,107,.08), transparent 60%)' }}
        />

        <main className="relative flex-1 overflow-y-auto px-6 pt-14 pb-28">
          {/* header */}
          <div className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-lamp shadow-[0_0_10px_2px_rgba(240,178,74,.7)]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-lamp">The Way</span>
          </div>
          <h1 className="mt-5 font-serif text-[30px] leading-tight text-ink">
            다시 오셨네요.
            <br />
            <span className="text-parchment">오늘도 함께 걸어요.</span>
          </h1>

          {/* today card */}
          <section className="mt-8 rounded-3xl border border-line bg-surface/70 p-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.18em] text-muted">오늘의 여정</span>
              <span className="text-[11px] text-muted-2">8 / 12 자리</span>
            </div>
            <h2 className="mt-3 font-serif text-2xl text-ink">갈릴리 호숫가</h2>
            <p className="mt-0.5 text-sm text-lamp-soft">여덟 번째 자리 · 물 위를 걷다</p>

            <div className="mt-6">
              <JourneyLine />
            </div>

            <p className="mt-6 border-t border-line pt-4 font-serif text-[15px] italic leading-relaxed text-parchment">
              “빛이 어둠에 비치되, 어둠이 깨닫지 못하더라.”
              <span className="mt-1 block font-sans text-[10px] not-italic uppercase tracking-[0.16em] text-muted-2">
                요한복음 1:5
              </span>
            </p>
          </section>

          {/* start button */}
          <button className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-b from-lamp-soft to-lamp py-4 font-semibold text-ground shadow-[0_16px_40px_-16px_rgba(240,178,74,.7)] active:scale-[0.99]">
            <Play size={18} className="fill-ground" />
            달리기 시작
          </button>

          {/* modes */}
          <div className="mt-4 flex flex-wrap gap-2">
            {['Gospel Journey', 'Prayer Run', 'Free Run', 'Reflection Walk'].map((m, i) => (
              <span
                key={m}
                className={`rounded-full border px-3.5 py-1.5 text-xs ${
                  i === 0 ? 'border-lamp/40 bg-lamp/8 text-lamp-soft' : 'border-line text-muted'
                }`}
              >
                {m}
              </span>
            ))}
          </div>

          {/* 품은 사람 */}
          <button className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-line bg-surface/40 px-4 py-3.5 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-coral/20 text-coral">
              <Heart size={18} />
            </span>
            <span className="flex-1">
              <span className="block text-sm text-ink">오늘 품고 달릴 사람</span>
              <span className="block text-xs text-muted">한 사람을 마음에 두고 달려요</span>
            </span>
            <ChevronRight size={18} className="text-muted-2" />
          </button>
        </main>

        <TabBar />
      </div>
    </div>
  )
}
