import { useEffect, useRef } from 'react'
import { Play, Heart, ChevronRight, Compass, LayoutGrid, Flame } from 'lucide-react'

const TOTAL = 12
const CURRENT = 8

function JourneyLine() {
  const doneRef = useRef<SVGPathElement>(null)
  useEffect(() => {
    const el = doneRef.current
    if (!el) return
    const len = el.getTotalLength()
    el.style.strokeDasharray = String(len)
    el.style.strokeDashoffset = String(len)
    el.getBoundingClientRect()
    el.style.animation = 'draw 1000ms cubic-bezier(0.22,1,0.36,1) forwards'
  }, [])

  const W = 340
  const H = 60
  const pad = 6
  const pts = Array.from({ length: TOTAL }, (_, i) => {
    const x = pad + ((W - 2 * pad) * i) / (TOTAL - 1)
    const y = H / 2 + Math.sin(i * 0.8 + 0.5) * 12
    return [x, y] as const
  })
  const path = (arr: readonly (readonly [number, number])[]) =>
    arr.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
      <path d={path(pts)} fill="none" stroke="#1b1d24" strokeOpacity={0.16} strokeWidth={1.4} />
      <path ref={doneRef} d={path(pts.slice(0, CURRENT))} fill="none" stroke="#1b1d24" strokeOpacity={0.85} strokeWidth={1.8} strokeLinecap="round" />
      {pts.map((p, i) => {
        if (i === CURRENT - 1)
          return (
            <g key={i}>
              <circle cx={p[0]} cy={p[1]} r={9} fill="none" stroke="#bd8320" strokeWidth={1.2} style={{ transformOrigin: `${p[0]}px ${p[1]}px`, animation: 'glow 4s ease-in-out infinite' }} />
              <circle cx={p[0]} cy={p[1]} r={4.5} fill="#bd8320" />
            </g>
          )
        if (i < CURRENT - 1) return <circle key={i} cx={p[0]} cy={p[1]} r={2.6} fill="#1b1d24" />
        return <circle key={i} cx={p[0]} cy={p[1]} r={2.4} fill="none" stroke="#1b1d24" strokeOpacity={0.3} strokeWidth={1.2} />
      })}
    </svg>
  )
}

function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[62%] overflow-hidden">
      <div className="absolute -top-16 right-[-14%] h-[300px] w-[300px]" style={{ background: 'radial-gradient(circle, rgba(210,154,55,.14), transparent 62%)' }} />
      <svg viewBox="0 0 430 360" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" style={{ opacity: 0.06 }}>
        <path d="M0,300 C90,250 150,300 220,262 C300,220 360,262 430,232 L430,360 L0,360 Z" fill="#1b1d24" />
        <path d="M0,330 C120,300 220,332 320,300 C370,284 400,300 430,292 L430,360 L0,360 Z" fill="#1b1d24" />
      </svg>
    </div>
  )
}

function TabBar() {
  const tabs = [
    { icon: Compass, label: '여정', active: true },
    { icon: LayoutGrid, label: '수집', active: false },
    { icon: Flame, label: '쉼터', active: false },
  ]
  return (
    <nav className="relative z-10 mt-6 flex items-stretch border-t border-line px-8 pb-6 pt-3">
      {tabs.map(({ icon: Icon, label, active }) => (
        <button key={label} className={`flex flex-1 flex-col items-center gap-1.5 ${active ? 'text-ink' : 'text-muted'}`}>
          <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
          <span className={`text-[10px] tracking-wide ${active ? 'text-gold' : ''}`}>{label}</span>
        </button>
      ))}
    </nav>
  )
}

export default function App() {
  return (
    <div className="flex min-h-full justify-center bg-paper text-ink">
      <div className="relative flex min-h-full w-full max-w-[430px] flex-col overflow-hidden">
        <HeroBackdrop />

        <header className="relative z-10 flex items-center justify-between px-7 pt-14">
          <div className="flex items-center gap-2.5">
            <span className="h-1 w-1 rounded-full bg-gold" />
            <span className="font-display text-[15px] font-semibold tracking-[0.42em] text-gold">THE&nbsp;WAY</span>
          </div>
          <span className="text-[11px] tracking-wide text-muted">오늘 · 여정 3년째</span>
        </header>

        {/* HERO — single focal point */}
        <section className="relative z-10 px-7 pt-11">
          <p className="font-display text-[13px] uppercase tracking-[0.34em] text-gold">여덟 번째 자리</p>
          <h1 className="mt-3 font-serif text-[46px] font-bold leading-[1.06] tracking-[-0.01em]">갈릴리 호숫가</h1>
          <p className="mt-2.5 font-serif text-[17px] italic text-ink-2">물 위를 걷다</p>

          <div className="mt-10">
            <JourneyLine />
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-display text-[13px] uppercase tracking-[0.24em] text-muted">Station</span>
              <span className="font-display leading-none">
                <span className="text-[40px] font-semibold text-ink">08</span>
                <span className="text-[22px] text-muted"> / 12</span>
              </span>
            </div>
          </div>

          <p className="mt-11 max-w-[28ch] font-serif text-[16.5px] leading-relaxed text-ink-2">
            “빛이 어둠에 비치되,
            <br />
            어둠이 깨닫지 못하더라.”
          </p>
          <p className="mt-2 font-display text-[12px] uppercase tracking-[0.24em] text-gold">John 1:5</p>
        </section>

        <div className="flex-1" />

        {/* PRIMARY ACTION */}
        <div className="relative z-10 px-7">
          <button className="flex w-full items-center justify-between rounded-[20px] bg-ink py-4 pl-7 pr-4 text-paper shadow-[0_22px_44px_-22px_rgba(27,29,36,.55)] transition active:scale-[0.99]">
            <span className="font-serif text-[18px]">달리기 시작</span>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-ink">
              <Play size={18} className="fill-ink translate-x-[1px]" />
            </span>
          </button>
        </div>

        {/* SECONDARY — quiet, tight */}
        <div className="relative z-10 mt-5 px-7">
          <div className="flex gap-6 text-[13.5px]">
            {['여정', '기도', '자유', '묵상'].map((m, i) => (
              <button key={m} className={i === 0 ? 'border-b-[1.5px] border-gold pb-2 font-medium text-ink' : 'pb-2 text-muted'}>
                {m}
              </button>
            ))}
          </div>
          <button className="mt-4 flex w-full items-center gap-3 border-t border-line py-4 text-left">
            <span className="text-coral">
              <Heart size={17} />
            </span>
            <span className="flex-1 text-[14px] text-ink-2">오늘 품고 달릴 사람</span>
            <ChevronRight size={16} className="text-muted" />
          </button>
        </div>

        <TabBar />
      </div>
    </div>
  )
}
