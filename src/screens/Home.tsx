import { useNav } from '../store'
import { usePilgrim, journeyKmOf, daysThisWeek, pilgrimTotals } from '../state/pilgrim'
import { useRun } from '../state/run'
import { STATIONS, type PassageSlug } from '../data/journey'
import { featuredVerse } from '../data/scripture'
import { fmtDistance } from '../lib/format'
import TabBar from '../components/TabBar'
import { IconHeld, IconChevron, IconStep, IconCairn, IconScroll } from '../components/icons'
import { sceneArt, crestArt, stationArt } from '../assets/art'
import {
  JOURNEYS,
  JOURNEY_CHROME,
  journeyById,
  journeyProgress,
  toJourneyKm,
  toRealKm,
} from '../data/geo/journeys'
import { MILESTONES, milestonesPassed } from '../data/geo/journeys/milestones'
import { sceneFocus } from '../lib/scene'

/* 홈 — 화면 하나, 질문 하나: **오늘 어디로 달릴까?**
 *
 * 예전엔 홈이 둘이었다(Home / SimpleHome). 심플 모드는 홈만 갈아끼우는 게 아니라
 * 탭바에서 여정 탭까지 감췄고, 에피소드는 여정 안에만 있으므로 **에피소드로 들어갈 길이
 * 통째로 막혔다**. 모드를 없앤다. 처음부터 전부 보이고, 간단히 보고 싶으면 그 자리에서 접는다.
 *
 * 그리고 예전 홈은 예수 코스(히어로·자리 00/5)와 성경 여정(스트립)이 한 화면에서 서로 다른
 * 진행도를 말했다. 220px 히어로 · 32px 지명 · 40px 숫자 · 여정 스트립이 각자 1순위를 다투고,
 * 정작 주 행동(순례 시작)은 그 전부 아래에 있었다(실측 y=490~566, 640px 기기에서 탭바에 걸림).
 *
 * 지금 위계는 하나다:
 *   ① 지금 걷는 여정 — 다음 자리까지 실제 몇 km인가 (달릴 이유)
 *   ② 달리기 시작 (행동)
 *   ③ 오늘의 말씀 (묵상)
 *   ④ 길 바꾸기 · 품은 사람 (전환)
 * 간단히 보기를 켜면 ③④가 접히고 ①②만 남는다 — 감추는 것은 화면이지 기능이 아니다.
 */

const ORDER = Object.keys(STATIONS) as PassageSlug[]
/* 아직 한 번도 안 달린 사람에게는 수난·광야 자리를 뽑지 않는다.
 * 날짜로만 고르다 보니 앱을 처음 켠 날 첫 화면이 겟세마네 체포 장면인 일이 실제로 있었다. */
const GENTLE = ORDER.filter((id) => !['lament', 'wilderness'].includes(STATIONS[id].mood))

function verseOfToday(firstDays: boolean) {
  const d = new Date()
  const dayIndex = Math.floor(
    (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 86400000,
  )
  const pool = firstDays ? GENTLE : ORDER
  const id = pool[dayIndex % pool.length]
  return { id, station: STATIONS[id], verse: featuredVerse(STATIONS[id]) }
}

export default function Home() {
  const go = useNav((s) => s.go)
  const openDetail = useNav((s) => s.openDetail)
  const openJourney = useNav((s) => s.openJourney)
  const configure = useRun((s) => s.configure)
  const pilgrim = usePilgrim()
  const { units, prayerSubject, activeJourneyId, activeCourseId, homeCompact, setHomeCompact } = pilgrim

  const totals = pilgrimTotals(pilgrim)
  const journey = journeyById(activeJourneyId) ?? JOURNEYS[0]
  const chrome = JOURNEY_CHROME[journey.id]
  const jKm = toJourneyKm(journey.id, journeyKmOf(pilgrim, journey.id))
  const prog = journeyProgress(journey, jKm)
  const nextRealKm = toRealKm(journey.id, prog.toNextKm)
  const mileNow = milestonesPassed(journey.id, jKm)
  const mileTotal = (MILESTONES[journey.id] ?? []).length

  const today = verseOfToday(totals.totalRuns === 0)
  const week = daysThisWeek(pilgrim)

  const startRun = () => {
    configure({ mode: 'guided', courseId: activeCourseId, journeyId: activeJourneyId })
    go('setup')
  }

  const d = new Date()
  const wd = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]

  return (
    <>
      <header
        className="relative z-10 flex items-baseline justify-between px-7"
        style={{ paddingTop: 'max(2.6rem, env(safe-area-inset-top))' }}
      >
        <span className="font-display text-[17px] font-medium tracking-[0.34em] text-clay-deep">THE&nbsp;WAY</span>
        {/* 연속일 대신 이번 주 달린 날 — 스트릭은 월·수·금 러너를 매주 0으로 되돌린다 */}
        <span className="font-display text-[12px] text-muted" style={{ fontFeatureSettings: "'lnum' 1" }}>
          이번 주 {week}일 · {wd}
        </span>
      </header>

      <main className="relative z-10 flex flex-1 flex-col">
        {/* ① 지금 걷는 여정 — 이 화면의 주인공.
            탭하면 그 여정의 자리 목록(에피소드)으로 들어간다. */}
        <section className="px-6 pt-5">
          <h1 className="sr-only">오늘의 길</h1>
          <button
            onClick={() => openJourney(journey.id)}
            className="block w-full overflow-hidden rounded-[26px] text-left shadow-[0_1px_2px_rgba(44,33,24,.06),0_22px_44px_-26px_rgba(156,69,34,.42)] ring-1 ring-line-strong/60 transition active:scale-[0.995]"
          >
            {/* 히어로를 220 → 160px로 줄였다. 220px는 CTA를 화면 밖으로 밀어냈고,
                그림은 이 화면의 주장이 아니라 배경이다. */}
            <img
              src={sceneArt(chrome.scene)}
              alt=""
              className="h-[160px] w-full object-cover"
              style={{ objectPosition: sceneFocus(chrome.scene, 'card') }}
              fetchPriority="high"
              decoding="async"
            />
            <div className="bg-sand-raised px-5 pb-4 pt-3.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-display text-[10.5px] uppercase tracking-[0.2em]" style={{ color: chrome.accent }}>
                  {journey.nameLatin}
                </span>
                <span
                  className="shrink-0 font-display text-[12px] text-muted"
                  style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
                >
                  자리 {prog.reachedCount}/{prog.total}
                </span>
              </div>
              <p className="mt-1 font-serif text-[22px] font-bold leading-tight text-ink">{journey.name}</p>

              <div className="mt-3 h-[4px] w-full overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{ width: `${prog.pct}%`, background: 'var(--color-lapis)' }}
                />
              </div>

              {/* 이 화면에서 가장 행동에 가까운 숫자 — 다음 자리까지 **내가 달릴** km.
                  여정km(바울 210km)를 그대로 보여주면 도달 불가능해 보인다(실제 7km). */}
              {prog.next ? (
                <p className="mt-2.5 text-[13px] leading-relaxed text-ink-soft">
                  다음 자리 <span className="text-ink">{prog.next.place}</span>까지{' '}
                  <span
                    className="font-display text-[15px] text-clay-deep"
                    style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
                  >
                    {fmtDistance(nextRealKm, units)}
                  </span>
                  {units}
                </p>
              ) : (
                <p className="mt-2.5 text-[13px] text-ink-soft">이 길을 끝까지 걸었습니다.</p>
              )}

              {mileTotal > 0 && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-muted">
                  <IconCairn size={12} style={{ color: 'var(--color-lapis)' }} />
                  지나온 이정표{' '}
                  <span className="font-display" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                    {mileNow}
                  </span>
                  / {mileTotal}
                </p>
              )}
            </div>
          </button>
        </section>

        {/* ② 달리기 시작 — 히어로 바로 아래. 엄지 범위이자 첫 화면 안. */}
        <div className="px-6 pt-4">
          <button
            onClick={startRun}
            className="flex w-full items-center justify-between rounded-2xl bg-clay-deep py-4 pl-7 pr-4 text-sand-raised shadow-[0_1px_2px_rgba(192,90,48,.25),0_18px_40px_-18px_rgba(156,69,34,.6)] transition active:scale-[0.99]"
          >
            <span className="font-serif text-[18px]">달리기 시작</span>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sun-bright text-ink shadow-[0_0_16px_rgba(240,195,104,.5)]">
              <IconStep size={20} strokeWidth={1.7} />
            </span>
          </button>
          <p className="mt-2 px-1 text-[11.5px] text-muted">달린 거리만큼 이 길이 앞으로 나아갑니다.</p>
        </div>

        {/* ③ 오늘의 말씀 — 달리지 않는 날에도 이 앱에 올 이유.
            성경 본문은 거리와 무관하게 항상 열린다(신학적 요구사항). */}
        {!homeCompact && (
          <section className="mt-7 px-6">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-[12px] uppercase tracking-[0.26em] text-muted">오늘의 말씀</h2>
              <span className="font-display text-[10.5px] uppercase tracking-[0.18em] text-clay-deep">
                {today.verse.refLatin}
              </span>
            </div>
            <button
              onClick={() => openDetail(today.id, 'home')}
              className="mt-3 flex w-full gap-4 text-left transition active:scale-[0.99]"
            >
              {stationArt(today.id) && (
                <span className="h-[76px] w-[62px] shrink-0 overflow-hidden rounded-xl ring-1 ring-line">
                  <img src={stationArt(today.id)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="line-clamp-3 block font-serif text-[15.5px] leading-[1.7] text-ink-soft">
                  {today.verse.text}
                </span>
                <span className="mt-1.5 flex items-center gap-1 text-[11.5px] text-muted">
                  <IconScroll size={12} /> {today.station.place} · 전문 보기
                </span>
              </span>
            </button>
          </section>
        )}

        {/* ④ 길 바꾸기 — 다섯 갈래를 항상 볼 수 있게. 지금 걷는 길은 테두리로 표시한다.
            예전엔 어느 길을 걷고 있는지가 스트립에 전혀 표시되지 않았다. */}
        {!homeCompact && (
          <section className="mt-8">
            <div className="flex items-baseline justify-between px-7">
              <h2 className="font-display text-[12px] uppercase tracking-[0.26em] text-muted">길 바꾸기</h2>
              <button
                onClick={() => go('journeys')}
                className="tap flex items-center gap-1 text-[12px] text-muted transition active:scale-95"
              >
                전체 <IconChevron size={13} />
              </button>
            </div>
            <div className="mt-3.5 flex gap-3 overflow-x-auto px-7 pb-1" style={{ scrollbarWidth: 'none' }}>
              {JOURNEYS.map((j) => {
                const p = journeyProgress(j, toJourneyKm(j.id, journeyKmOf(pilgrim, j.id)))
                const crest = crestArt(j.id)
                const on = j.id === activeJourneyId
                return (
                  <button
                    key={j.id}
                    onClick={() => openJourney(j.id)}
                    aria-current={on ? 'true' : undefined}
                    className="flex w-[76px] shrink-0 flex-col items-center gap-1.5 transition active:scale-95"
                  >
                    <span className="relative flex h-[54px] w-[54px] items-center justify-center">
                      <svg viewBox="0 0 54 54" className="absolute inset-0 -rotate-90" aria-hidden>
                        <circle cx="27" cy="27" r="25" fill="none" stroke="var(--color-line)" strokeWidth="2" />
                        <circle
                          cx="27" cy="27" r="25" fill="none" stroke="var(--color-lapis)" strokeWidth="2" strokeLinecap="round"
                          strokeDasharray={`${(p.pct / 100) * 157} 157`}
                        />
                      </svg>
                      {crest && (
                        <span
                          className="flex h-[42px] w-[42px] overflow-hidden rounded-full"
                          style={{ boxShadow: on ? '0 0 0 2px var(--color-clay)' : 'none' }}
                        >
                          <img src={crest} alt="" className="h-full w-full scale-[1.06] object-cover" loading="lazy" decoding="async" />
                        </span>
                      )}
                    </span>
                    <span className={`text-center text-[11px] leading-tight ${on ? 'text-clay-deep' : 'text-ink-soft'}`}>
                      {j.who}
                      {on && <span className="sr-only"> (지금 걷는 길)</span>}
                    </span>
                    <span className="font-display text-[10.5px] text-muted" style={{ fontFeatureSettings: "'lnum' 1" }}>
                      {p.reachedCount}/{p.total}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        <div className="min-h-5 flex-1" />

        {/* ⑤ 품은 사람 + 간단히 보기.
            "간단히"는 모드가 아니라 이 화면의 표시 설정이다 — 탭바와 기능은 그대로다. */}
        <div className="relative z-10 mt-4 px-6">
          {!homeCompact && (
            <button
              onClick={() => go('profile')}
              className="flex w-full items-center gap-3 border-t border-line py-3.5 text-left transition active:scale-[0.99]"
            >
              <span className="text-rubric">
                <IconHeld size={18} />
              </span>
              <span className="flex-1 text-[13.5px] text-ink-soft">
                {prayerSubject ? `오늘 품고 달릴 사람 · ${prayerSubject}` : '오늘 품고 달릴 사람'}
              </span>
              <IconChevron size={15} className="text-muted" />
            </button>
          )}
          <button
            onClick={() => setHomeCompact(!homeCompact)}
            aria-pressed={homeCompact}
            className="flex min-h-[44px] w-full items-center justify-center gap-1.5 border-t border-line text-[12px] text-muted transition active:scale-[0.99]"
          >
            {homeCompact ? '자세히 보기' : '간단히 보기'}
            <IconChevron size={12} className={homeCompact ? '-rotate-90' : 'rotate-90'} />
          </button>
        </div>
      </main>

      <TabBar active="home" />
    </>
  )
}
