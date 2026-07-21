import { useEffect, useRef } from 'react'
import { Play, Heart, ChevronRight, Compass, LayoutGrid, Flame } from 'lucide-react'

const TOTAL = 12
const CURRENT = 8

/* THE WAY signature — The Illuminated Line: continuous lapis path + gold milestone nodes */
function IlluminatedLine() {
  const doneRef = useRef<SVGPathElement>(null)
  useEffect(() => {
    const el = doneRef.current
    if (!el) return
    const len = el.getTotalLength()
    el.style.strokeDasharray = String(len)
    el.style.strokeDashoffset = String(len)
    el.getBoundingClientRect()
    el.style.transition = 'stroke-dashoffset 1100ms cubic-bezier(0.22,1,0.36,1)'
    requestAnimationFrame(() => (el.style.strokeDashoffset = '0'))
  }, [])

  const W = 340
  const H = 66
  const pad = 8
  const pts = Array.from({ length: TOTAL }, (_, i) => {
    const x = pad + ((W - 2 * pad) * i) / (TOTAL - 1)
    const y = H / 2 + Math.sin(i * 0.8 + 0.5) * 13
    return [x, y] as const
  })
  const d = (arr: readonly (readonly [number, number])[]) =>
    arr.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
      <path d={d(pts)} fill="none" stroke="#2e3f8f" strokeOpacity={0.2} strokeWidth={1.4} />
      <path ref={doneRef} d={d(pts.slice(0, CURRENT))} fill="none" stroke="#2e3f8f" strokeOpacity={0.9} strokeWidth={2} strokeLinecap="round" />
      {pts.map((p, i) => {
        if (i === CURRENT - 1)
          return (
            <g key={i}>
              <circle cx={p[0]} cy={p[1]} r={10} fill="none" stroke="#a67f27" strokeWidth={1.1} style={{ transformOrigin: `${p[0]}px ${p[1]}px`, animation: 'glow 4.5s ease-in-out infinite' }} />
              <circle cx={p[0]} cy={p[1]} r={5} fill="#c39a3e" />
              <circle cx={p[0]} cy={p[1]} r={5} fill="#a67f27" fillOpacity={0.85} />
            </g>
          )
        if (i < CURRENT - 1) return <circle key={i} cx={p[0]} cy={p[1]} r={3.1} fill="#a67f27" />
        return <circle key={i} cx={p[0]} cy={p[1]} r={2.6} fill="none" stroke="#2e3f8f" strokeOpacity={0.35} strokeWidth={1.2} />
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
    <nav className="relative z-10 mt-6 flex items-stretch border-t border-line px-8 pt-3" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
      {tabs.map(({ icon: Icon, label, active }) => (
        <button key={label} className={`flex flex-1 flex-col items-center gap-1.5 py-1 transition active:scale-95 ${active ? 'text-ink' : 'text-muted'}`} aria-label={label}>
          <Icon size={20} strokeWidth={active ? 2 : 1.6} />
          <span className={`text-[10px] ${active ? 'text-gold-deep' : ''}`}>{label}</span>
        </button>
      ))}
    </nav>
  )
}

export default function App() {
  return (
    <div className="flex min-h-full justify-center bg-paper text-ink">
      <div className="relative flex min-h-full w-full max-w-[440px] flex-col overflow-hidden">
        <header className="relative z-10 flex items-baseline justify-between px-7" style={{ paddingTop: 'max(3.5rem, env(safe-area-inset-top))' }}>
          <span className="font-display text-[17px] font-medium tracking-[0.34em] text-gold-deep">THE&nbsp;WAY</span>
          <span className="text-[11px] text-muted">여정 3년째 · 오늘</span>
        </header>

        {/* HERO — one focal point */}
        <section className="relative z-10 px-7 pt-11">
          <div className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-lapis" />
            <p className="text-[12px] tracking-[0.14em] text-gold-deep">여덟 번째 자리</p>
          </div>
          <h1 className="mt-3 font-serif text-[46px] font-bold leading-[1.05] tracking-[-0.01em]">갈릴리 호숫가</h1>
          <p className="mt-2.5 font-serif text-[17px] text-ink-soft">물 위를 걷다</p>

          <div className="mt-10">
            <IlluminatedLine />
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-display text-[13px] uppercase tracking-[0.26em] text-muted">Station</span>
              <span className="font-display leading-none" style={{ fontFeatureSettings: "'onum' 1" }}>
                <span className="text-[42px] font-medium text-lapis">08</span>
                <span className="text-[22px] text-muted"> / 12</span>
              </span>
            </div>
          </div>

          <p className="mt-11 max-w-[30ch] font-serif text-[16.5px] leading-[1.75] text-ink-soft">
            <span className="versal">빛</span>이 어둠에 비치되, 어둠이 깨닫지 못하더라.
          </p>
          <p className="mt-3 font-display text-[12px] uppercase tracking-[0.22em] text-gold-deep">John&nbsp;1:5</p>
        </section>

        <div className="flex-1" />

        {/* PRIMARY ACTION */}
        <div className="relative z-10 px-7">
          <button className="flex w-full items-center justify-between rounded-2xl bg-ink py-4 pl-7 pr-4 text-paper-raised shadow-[0_1px_2px_rgba(60,45,25,.14),0_18px_38px_-20px_rgba(60,45,25,.5)] transition active:scale-[0.99]">
            <span className="font-serif text-[18px]">달리기 시작</span>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-ink">
              <Play size={18} className="translate-x-[1px] fill-ink" />
            </span>
          </button>
        </div>

        {/* SECONDARY — quiet */}
        <div className="relative z-10 mt-5 px-7">
          <div className="flex gap-6 text-[13.5px]">
            {['여정', '기도', '자유', '묵상'].map((m, i) => (
              <button key={m} className={i === 0 ? 'border-b-[1.5px] border-lapis pb-2 font-medium text-ink' : 'pb-2 text-muted transition active:scale-95'}>
                {m}
              </button>
            ))}
          </div>
          <button className="mt-4 flex w-full items-center gap-3 border-t border-line py-4 text-left transition active:scale-[0.99]">
            <span className="text-rubric">
              <Heart size={17} />
            </span>
            <span className="flex-1 text-[14px] text-ink-soft">오늘 품고 달릴 사람</span>
            <ChevronRight size={16} className="text-muted" />
          </button>
        </div>

        <TabBar />
      </div>
    </div>
  )
}
