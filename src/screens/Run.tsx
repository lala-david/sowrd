import { Square } from 'lucide-react'
import { useNav } from '../store'

/* 러닝 중 — "촛불 아래 밤의 필사본" (dark). §7.6-8 GPS 러닝 · 구간 안내 */
export default function Run() {
  const go = useNav((s) => s.go)
  return (
    <div
      data-theme="dark"
      className="relative flex flex-1 flex-col bg-paper text-ink"
      style={{ paddingTop: 'max(3.5rem, env(safe-area-inset-top))', paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
    >
      <div className="pointer-events-none absolute left-1/2 top-[24%] h-[400px] w-[400px] -translate-x-1/2" style={{ background: 'radial-gradient(circle, rgba(214,175,91,.15), transparent 62%)' }} />

      {/* station + running indicator */}
      <div className="relative z-10 flex items-center justify-between px-7">
        <div>
          <p className="text-[11px] tracking-[0.14em] text-gold-deep">여덟 번째 자리</p>
          <p className="mt-0.5 font-serif text-[17px] text-ink">갈릴리 호숫가</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" style={{ animation: 'glow 2s ease-in-out infinite' }} />
          달리는 중
        </div>
      </div>

      {/* HERO — distance is the lamp */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-7">
        <p className="font-serif text-[16px] text-ink-soft">물 위를 걷다</p>
        <div className="mt-3 flex items-baseline font-display text-gold" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          <span className="text-[126px] font-medium leading-none" style={{ textShadow: '0 0 44px rgba(214,175,91,.4)' }}>2.4</span>
          <span className="ml-3 text-[34px] text-gold-soft">KM</span>
        </div>
        <p className="mt-5 font-display text-[17px] tracking-[0.08em] text-muted" style={{ fontFeatureSettings: "'tnum' 1" }}>15:20 · 6:22 /KM</p>

        {/* next-station cue (§7.7) */}
        <div className="mt-14 w-full max-w-[300px]">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-muted">다음 자리까지</span>
            <span className="font-display text-lapis" style={{ fontFeatureSettings: "'tnum' 1" }}>0.6 km</span>
          </div>
          <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-lapis" style={{ width: '72%' }} />
          </div>
        </div>
      </div>

      {/* STOP → reveal */}
      <div className="relative z-10 flex flex-col items-center px-7">
        <button onClick={() => go('reveal')} className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-2 border-gold text-gold transition active:scale-95" aria-label="멈추기">
          <Square size={22} className="fill-gold" />
        </button>
        <p className="mt-3 text-[12px] text-muted">멈추면 오늘의 자리가 열립니다</p>
      </div>
    </div>
  )
}
