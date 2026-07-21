import { Play, Heart, ChevronRight } from 'lucide-react'
import { useNav } from '../store'
import IlluminatedLine from '../components/IlluminatedLine'
import TabBar from '../components/TabBar'

export default function Home() {
  const go = useNav((s) => s.go)
  return (
    <>
      <header className="relative z-10 flex items-baseline justify-between px-7" style={{ paddingTop: 'max(3.5rem, env(safe-area-inset-top))' }}>
        <span className="font-display text-[17px] font-medium tracking-[0.34em] text-gold-deep">THE&nbsp;WAY</span>
        <span className="font-display text-[12px] uppercase tracking-[0.18em] text-muted" style={{ fontFeatureSettings: "'onum' 1" }}>Tue · 21</span>
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
        <button onClick={() => go('run')} className="flex w-full items-center justify-between rounded-2xl bg-lapis py-4 pl-7 pr-4 text-paper-raised shadow-[0_1px_2px_rgba(38,53,115,.2),0_18px_40px_-18px_rgba(38,53,115,.55)] transition active:scale-[0.99]">
          <span className="font-serif text-[18px]">달리기 시작</span>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-bright text-ink shadow-[0_0_16px_rgba(214,175,91,.5)]">
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

      <TabBar active="home" />
    </>
  )
}
