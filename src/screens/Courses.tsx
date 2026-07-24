import { useNav } from '../store'
import { usePilgrim, progressFor } from '../state/pilgrim'
import { COURSES, progressOf } from '../data/journey'
import { fmtDistance } from '../lib/format'
import { ProgressBar, SectionLabel } from '../components/ui'
import TabBar from '../components/TabBar'
import { IconReached, IconArrow, IconCompass } from '../components/icons'
import trailData from '../data/geo/pilgrim-trails.json'

const BAND_LABEL: Record<string, string> = {
  '1K': '1 KM', '3K': '3 KM', '5K': '5 KM', '10K': '10 KM', HALF: '하프', FULL: '풀', ULTRA: '울트라',
}

/* 실제로 존재하는 순례길 — 성경 인물의 여정(=여정 탭)과는 다른 층이다.
 * 이건 "오늘 뛸 코스"가 아니라 "실제로 가서 걸을 수 있는 길"이라 정보로 먼저 싣는다.
 * 실 GPS 연동(RESUME 7) 이후 주행 모드로 승격한다 — 그전까지는 그렇다고 화면에 밝힌다. */
interface Trail {
  id: string
  name: string
  nameLatin: string
  country: string
  totalKm: number
  description: string
  waypoints: { lat: number; lng: number; name: string }[]
}
const TRAILS = (trailData as { trails: Trail[] }).trails

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
        <SectionLabel>코스</SectionLabel>
        <h1 className="mt-2 font-serif text-[30px] font-bold leading-tight">오늘 달릴 길</h1>
        <p className="mt-2 max-w-[32ch] text-[13.5px] leading-relaxed text-muted">1 km의 첫 부르심부터 땅 끝까지의 울트라까지. 오늘 달릴 거리를 고르세요.</p>
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
                    <span className={`rounded-md px-2 py-0.5 font-display text-[11px] tracking-[0.08em] ${active ? 'bg-clay-deep text-sand-raised' : 'bg-sand-sunk text-ink-soft'}`} style={{ fontFeatureSettings: "'lnum' 1" }}>{BAND_LABEL[c.band]}</span>
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
                <ProgressBar pct={pct} fill={active ? 'bg-clay-deep' : 'bg-line-strong'} />
                <span className="shrink-0 font-display text-[11px] text-muted" style={{ fontFeatureSettings: "'lnum' 1" }}>{prog.reached}/{prog.total}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* 실제 순례길 — 세상에 실재하는 길. 지금은 정보로 싣고, 실 GPS 연동 후 주행 모드로 연다. */}
      <section className="mt-10 px-5">
        <div className="flex items-center gap-2 px-2 text-muted">
          <IconCompass size={16} />
          <SectionLabel>실제 순례길</SectionLabel>
        </div>
        <p className="mt-2 px-2 text-[12.5px] leading-relaxed text-muted">
          세상에 실재하는 길입니다. 언젠가 직접 가서 걷기 위해, 먼저 알아 둡니다.
        </p>

        <div className="mt-4 flex flex-col gap-3">
          {TRAILS.map((t) => (
            <div key={t.id} className="rounded-2xl border border-line bg-sand-raised/30 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-serif text-[17px] font-bold leading-tight text-ink">{t.name}</h3>
                  <p className="mt-0.5 font-display text-[10.5px] uppercase tracking-[0.14em] text-muted">{t.nameLatin}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="font-display text-[20px] font-medium leading-none text-ink-soft" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                    {t.totalKm.toLocaleString()}
                  </span>
                  <span className="ml-0.5 font-display text-[10.5px] text-muted">km</span>
                </div>
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">{t.description}</p>
              <div className="mt-2.5 flex items-center gap-2.5 text-[11px] text-muted">
                <span>{t.country}</span>
                <span className="h-2.5 w-px bg-line-strong" />
                <span>{t.waypoints.length}개 지점</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 px-2 text-[11px] leading-relaxed text-muted">
          실제 GPS 주행 연동은 아직입니다. 지금은 길의 정보만 제공합니다.
        </p>
      </section>

      <div className="px-6 py-6">
        <button onClick={() => go('home')} className="tap flex items-center gap-2 text-[13px] text-muted transition active:scale-95">
          <IconArrow size={16} className="rotate-180" /> 오늘로
        </button>
      </div>

      {/* 여정 탭에서 진입하는 하위 화면 — 자기 탭이 없으므로 여정 탭을 켠다 */}
      <TabBar active="journeys" />
    </div>
  )
}
