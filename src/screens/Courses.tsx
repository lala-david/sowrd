import { useNav } from '../store'
import { usePilgrim, progressFor } from '../state/pilgrim'
import { COURSES, progressOf } from '../data/journey'
import { fmtDistance } from '../lib/format'
import { ProgressBar, SectionLabel } from '../components/ui'
import TabBar from '../components/TabBar'
import { IconReached, IconArrow } from '../components/icons'

const BAND_LABEL: Record<string, string> = {
  '1K': '1 KM', '3K': '3 KM', '5K': '5 KM', '10K': '10 KM', HALF: '하프', FULL: '풀', ULTRA: '울트라',
}

export default function Courses() {
  const go = useNav((s) => s.go)
  const pilgrim = usePilgrim()
  const { activeCourseId, units, setActiveCourse } = pilgrim

  const choose = (id: string) => {
    setActiveCourse(id)
    go('home')
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <header className="px-7" style={{ paddingTop: 'max(3rem, env(safe-area-inset-top))' }}>
        <SectionLabel>순례길</SectionLabel>
        <h1 className="mt-2 font-serif text-[30px] font-bold leading-tight">거리마다 다른 여정</h1>
        <p className="mt-2 max-w-[32ch] text-[13.5px] leading-relaxed text-muted">1 km의 첫 부르심부터 땅 끝까지의 울트라까지. 오늘 걸을 길을 고르세요.</p>
      </header>

      <div className="mt-6 flex flex-col gap-3 px-5">
        {COURSES.map((c) => {
          const cp = progressFor(pilgrim, c.id)
          const prog = progressOf(c, cp.cumulativeKm)
          const active = c.id === activeCourseId
          const pct = Math.round((prog.reached / prog.total) * 100)
          return (
            <button
              key={c.id}
              onClick={() => choose(c.id)}
              className={`relative overflow-hidden rounded-2xl border px-5 py-4 text-left transition active:scale-[0.99] ${active ? 'border-clay/50 bg-sand-raised shadow-[0_14px_30px_-22px_rgba(156,69,34,.55)]' : 'border-line bg-sand-raised/40'}`}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 font-display text-[11px] tracking-[0.08em] ${active ? 'bg-clay text-sand-raised' : 'bg-sand-sunk text-ink-soft'}`} style={{ fontFeatureSettings: "'lnum' 1" }}>{BAND_LABEL[c.band]}</span>
                    {prog.done && <span className="text-olive-deep"><IconReached size={15} /></span>}
                    {active && <span className="text-[11px] tracking-[0.12em] text-clay-deep">걷는 중</span>}
                  </div>
                  <h2 className="mt-2 font-serif text-[20px] font-bold leading-tight">{c.name}</h2>
                  <p className="mt-0.5 text-[12.5px] text-muted">{c.arcLabel}</p>
                </div>
                <div className="shrink-0 pl-3 text-right">
                  <span className="font-display text-[24px] font-medium leading-none text-ink" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>{fmtDistance(c.distanceKm, units, c.distanceKm % 1 === 0 ? 0 : 1)}</span>
                  <span className="ml-0.5 font-display text-[11px] text-muted">{units}</span>
                </div>
              </div>

              <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-soft">{c.blurb}</p>

              <div className="mt-3.5 flex items-center gap-3">
                <ProgressBar pct={pct} fill={active ? 'bg-clay' : 'bg-line-strong'} />
                <span className="shrink-0 font-display text-[11px] text-muted" style={{ fontFeatureSettings: "'lnum' 1" }}>{prog.reached}/{prog.total}</span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="px-6 py-6">
        <button onClick={() => go('home')} className="flex items-center gap-2 text-[13px] text-muted transition active:scale-95">
          <IconArrow size={16} className="rotate-180" /> 여정으로
        </button>
      </div>

      <TabBar active="courses" />
    </div>
  )
}
