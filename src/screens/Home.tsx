import { useNav } from '../store'
import { usePilgrim, progressFor, overallJourneyPct, journeyTier } from '../state/pilgrim'
import { useRun } from '../state/run'
import { courseById, progressOf, STATIONS } from '../data/journey'
import { featuredVerse } from '../data/scripture'
import { fmtDistance } from '../lib/format'
import { toneOf } from '../lib/mood'
import IlluminatedLine from '../components/IlluminatedLine'
import TabBar from '../components/TabBar'
import { IconEmber, IconHeld, IconChevron, IconStep, IconReached } from '../components/icons'
import { heroArt } from '../assets/art'

export default function Home() {
  const go = useNav((s) => s.go)
  const openDetail = useNav((s) => s.openDetail)
  const configure = useRun((s) => s.configure)
  const { activeCourseId, units, streakDays, prayerSubject } = usePilgrim()
  const pilgrim = usePilgrim()
  const course = courseById(activeCourseId)!
  const cp = progressFor(pilgrim, activeCourseId)
  const prog = progressOf(course, cp.cumulativeKm)

  // 현재 초점: 방금 닿은 마지막 자리(성구) + 향하는 다음 자리(목적지)
  const lastReachedId = cp.reached[cp.reached.length - 1]
  const focusStation = prog.nextStation ?? (lastReachedId ? STATIONS[lastReachedId] : STATIONS[course.stations[0].id])
  const verseStation = lastReachedId ? STATIONS[lastReachedId] : focusStation
  const v = featuredVerse(verseStation)
  const tone = toneOf(focusStation.mood)
  const tier = journeyTier(pilgrim)
  const overall = overallJourneyPct(pilgrim)

  const startRun = () => {
    configure({ mode: 'guided', courseId: activeCourseId })
    go('setup')
  }

  const ordinal = prog.done ? '완주' : `${prog.reached + 1}번째 자리`

  const today = new Date()
  const wd = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()]

  return (
    <>
      <header className="relative z-10 flex items-baseline justify-between px-7" style={{ paddingTop: 'max(3rem, env(safe-area-inset-top))' }}>
        <span className="font-display text-[17px] font-medium tracking-[0.34em] text-clay-deep">THE&nbsp;WAY</span>
        <div className="flex items-center gap-1.5 text-muted">
          <IconEmber size={15} />
          <span className="font-display text-[12px]" style={{ fontFeatureSettings: "'lnum' 1" }}>{streakDays}일</span>
          <span className="ml-2 font-display text-[12px] uppercase tracking-[0.14em]">{wd} · {today.getDate()}</span>
        </div>
      </header>

      {/* HERO — 향하는 다음 자리(목적지 각인) */}
      <section className="relative z-10 px-6 pt-6">
        <button onClick={() => go('courses')} className="relative block w-full overflow-hidden rounded-[26px] text-left shadow-[0_1px_2px_rgba(44,33,24,.06),0_26px_50px_-28px_rgba(156,69,34,.45)] ring-1 ring-line-strong/60 transition active:scale-[0.995]">
          <img src={heroArt(course.hero)} alt={focusStation.place} className="h-[248px] w-full object-cover" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36" style={{ background: 'linear-gradient(to top, rgba(28,20,12,.78), rgba(28,20,12,.1) 70%, transparent)' }} />
          <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-5">
            <span className="rounded-full bg-black/25 px-2.5 py-1 font-display text-[11px] tracking-[0.16em] text-sand-raised backdrop-blur-[2px]">{course.name}</span>
            <span className="rounded-full bg-black/25 px-2.5 py-1 text-[10.5px] tracking-[0.1em] text-sand-raised/90 backdrop-blur-[2px]">{tone.label}</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5">
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full" style={{ background: 'var(--color-sun-bright)' }} />
              <p className="text-[12px] tracking-[0.14em] text-sun-bright">{prog.done ? '완주한 길' : `다음 자리 · ${ordinal}`}</p>
            </div>
            <h1 className="mt-1.5 font-serif text-[33px] font-bold leading-[1.06] text-sand-raised">{focusStation.place}</h1>
            <p className="mt-1 font-serif text-[15px] text-sand-raised/85">{focusStation.title} — {focusStation.teaser}</p>
          </div>
        </button>
      </section>

      {/* THE LINE — 여정 진행 */}
      <section className="relative z-10 px-7 pt-8">
        <IlluminatedLine total={prog.total} current={Math.max(1, prog.reached)} />
        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex flex-col">
            <span className="font-display text-[12px] uppercase tracking-[0.26em] text-muted">자리</span>
            {!prog.done && (
              <span className="mt-1 text-[12px] text-ink-soft">다음까지 <span className="font-display text-clay" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>{fmtDistance(prog.toNextKm, units)}{units}</span></span>
            )}
          </div>
          <span className="font-display leading-none" style={{ fontFeatureSettings: "'lnum' 1" }}>
            <span className="text-[40px] font-medium text-clay">{String(prog.reached).padStart(2, '0')}</span>
            <span className="text-[22px] text-muted"> / {prog.total}</span>
          </span>
        </div>

        {/* 성구 — 실제 개역한글(마지막 닿은 자리). 탭하면 전문 */}
        <button onClick={() => openDetail(verseStation.id)} className="mt-8 block w-full text-left transition active:scale-[0.99]">
          <p className="max-w-[30ch] font-serif text-[16.5px] leading-[1.75] text-ink-soft">
            <span className="versal">{v.text.slice(0, 1)}</span>{v.text.slice(1)}
          </p>
          <p className="mt-3 font-display text-[12px] uppercase tracking-[0.22em] text-clay-deep">{v.refLatin} · 전문 보기</p>
        </button>
      </section>

      <div className="flex-1 min-h-6" />

      {/* PRIMARY — 순례 시작 */}
      <div className="relative z-10 px-6 pt-6">
        <button onClick={startRun} className="flex w-full items-center justify-between rounded-2xl bg-clay py-4 pl-7 pr-4 text-sand-raised shadow-[0_1px_2px_rgba(192,90,48,.25),0_18px_40px_-18px_rgba(156,69,34,.6)] transition active:scale-[0.99]">
          <span className="font-serif text-[18px]">순례 시작</span>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sun-bright text-ink shadow-[0_0_16px_rgba(240,195,104,.5)]">
            <IconStep size={20} strokeWidth={1.7} />
          </span>
        </button>
      </div>

      {/* 보조 — 여정 진도 + 품은 사람 */}
      <div className="relative z-10 mt-4 px-6">
        <div className="flex items-center gap-3 border-t border-line py-3.5">
          <span className="text-olive-deep"><IconReached size={17} /></span>
          <span className="flex-1 text-[13.5px] text-ink-soft">{tier}</span>
          <span className="font-display text-[13px] text-muted" style={{ fontFeatureSettings: "'lnum' 1" }}>여정 {overall}%</span>
        </div>
        <button onClick={() => go('profile')} className="flex w-full items-center gap-3 border-t border-line py-3.5 text-left transition active:scale-[0.99]">
          <span className="text-rubric"><IconHeld size={18} /></span>
          <span className="flex-1 text-[13.5px] text-ink-soft">{prayerSubject ? `오늘 품고 달릴 사람 · ${prayerSubject}` : '오늘 품고 달릴 사람'}</span>
          <IconChevron size={15} className="text-muted" />
        </button>
      </div>

      <TabBar active="home" />
    </>
  )
}
