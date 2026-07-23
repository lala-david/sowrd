import { useEffect, useState } from 'react'
import { useNav } from '../store'
import { journeyById, journeyProgress, toJourneyKm, toRealKm } from '../data/geo/journeys'
import { journeyKmOf } from '../state/pilgrim'
import RouteMap from '../components/RouteMap'
import { analyzeRun, readingOf } from '../lib/runAnalysis'
import { usePilgrim } from '../state/pilgrim'
import { useRun } from '../state/run'
import { courseById, STATIONS, progressOf } from '../data/journey'
import { featuredVerse, SCRIPTURE_ATTRIBUTION } from '../data/scripture'
import { fmtDistance, fmtPace, unitLabel } from '../lib/format'
import { toneOf } from '../lib/mood'
import { SummaryTriple, SplitBars, SectionLabel } from '../components/ui'
import { arcIcon, IconShare, IconReached, IconCairn, IconSeal } from '../components/icons'
import { heroArt, sceneArt, episodeArt } from '../assets/art'
import { sceneForEpisode } from '../lib/scene'

export default function Reveal() {
  const go = useNav((s) => s.go)
  const openEpisode = useNav((s) => s.openEpisode)
  const units = usePilgrim((s) => s.units)
  const run = useRun()
  const { courseId, startKm, distanceKm, elapsedSec, splits, reachedThisRun, prayerFor } = run
  // 여정 쪽 결과 — 이게 없어서 여정을 달려도 리빌엔 예수 코스 문구만 떴다
  const { journeyId, reachedEpisodes, trace } = run
  const miles = run.reachedMilestones
  /* 신호가 나빴는가 — 기준은 개인 기록 후보 조건과 같아야 한다(pilgrim.commitRun).
     다르면 "기록에 안 넣었다"고 말해 놓고 넣거나, 넣어 놓고 말을 안 하게 된다. */
  const { signalAccM, signalRate } = run
  const wasSim = run.simKm / Math.max(1e-9, run.gpsKm + run.simKm) > 0.05
  const poorSignal = !wasSim && ((signalAccM ?? 0) > 15 || (signalRate ?? 1) < 0.5)
  const journey = journeyById(journeyId)
  const journeyPlaces = (reachedEpisodes ?? [])
    .map((id) => journey?.episodes.find((e) => e.id === id)?.place)
    .filter(Boolean) as string[]
  const course = courseById(courseId)!

  const [shown, setShown] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setShown(true), 80)
    return () => window.clearTimeout(id)
  }, [])

  /* 이 화면의 주인공은 **여정**이다.
   * 예전엔 히어로가 heroArt(course.hero), 제목이 예수 코스 자리라, 베드로의 길을 달려도
   * 리빌 전체가 "갈릴리 호숫가"였고 여정 도달은 아래 12px 칩 신세였다.
   * 이번 런에서 여정 자리에 닿았으면 그것이 히어로다. 못 닿았으면 예수 코스 자리를 쓰고,
   * 그것도 없으면 여정의 남은 거리를 말한다. */
  const epId = (reachedEpisodes ?? [])[(reachedEpisodes ?? []).length - 1]
  const episode = epId ? journey?.episodes.find((e) => e.id === epId) : undefined
  const primaryId = reachedThisRun[reachedThisRun.length - 1]
  const station = primaryId ? STATIONS[primaryId] : undefined
  const tone = toneOf(station?.mood ?? 'everyday')
  const celebrate = tone.celebrate
  const v = station ? featuredVerse(station) : undefined

  /* 여정 쪽 남은 거리 — 화면에 쓰는 것은 여정km가 아니라 **내가 실제로 달릴 km**다.
   * 바울은 축척 30배라 "다음까지 210km"는 실제로 7km인데, 여정km를 그대로 보여주면
   * 도달 불가능해 보인다. */
  const jKm = toJourneyKm(journeyId, journeyKmOf(usePilgrim.getState(), journeyId))
  const jProg = journey ? journeyProgress(journey, jKm) : undefined
  const jNext = jProg?.next
  const jToNextRealKm = jProg ? toRealKm(journeyId, jProg.toNextKm) : 0

  const cumulative = startKm + distanceKm
  const prog = progressOf(course, cumulative)
  const ordinal = prog.reached // 지금까지 닿은 총 자리 수
  const avgPace = distanceKm > 0 ? elapsedSec / distanceKm : 0
  const analysis = analyzeRun(splits, distanceKm, elapsedSec)

  const leave = () => {
    useRun.getState().reset()
    go('home')
  }

  const [shared, setShared] = useState(false)
  const share = async () => {
    // 프라이버시: GPS 경로·좌표·기도내용은 절대 포함하지 않는다. 자리·성구·거리만.
    const line = station && v ? `“${v.text}” — ${v.refLatin}` : ''
    const text = station
      ? `THE WAY · ${station.place}에 닿았습니다 (${fmtDistance(distanceKm, units)}${units})\n${line}`
      : `THE WAY · 오늘 ${fmtDistance(distanceKm, units)}${units}를 걸었습니다`
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'THE WAY', text })
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        setShared(true)
        window.setTimeout(() => setShared(false), 1800)
      }
    } catch {
      /* 사용자 취소 — 무시 */
    }
  }

  const StArc = station ? arcIcon(station.mood === 'lament' ? 'passion' : station.arc) : IconReached

  return (
    <div className="relative flex flex-1 flex-col overflow-y-auto bg-sand text-ink">
      {/* 장면 — 자리 아트(얼굴 없는 실루엣) + 리빌 페이드 */}
      <div className="relative h-[42%] min-h-[280px] w-full overflow-hidden">
        <img
          src={(episode && episodeArt(journeyId, episode.id)) ?? (episode ? sceneArt(sceneForEpisode(episode)) : heroArt(course.hero))}
          alt=""
          /* alt=""로 둔다 — 두 요소 뒤 h1이 같은 지명을 말하므로 장식이다(예전엔 두 번 읽혔다) */
          className="h-full w-full object-cover transition-all duration-[1400ms] ease-out"
          style={{ transform: shown ? 'scale(1)' : 'scale(1.08)', opacity: shown ? 1 : 0.2, filter: celebrate ? 'none' : 'saturate(0.72)' }}
        />
        <div className="pointer-events-none absolute inset-0" style={{ background: celebrate ? `radial-gradient(60% 50% at 50% 40%, ${tone.glow}, transparent)` : 'none' }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28" style={{ background: 'linear-gradient(to top, var(--color-sand), transparent)' }} />
      </div>

      <div className="relative z-10 flex flex-1 flex-col px-8 pt-4" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
        {episode ? (
          <>
            {/* 여정 자리 — 이 런의 주인공 */}
            <div className="flex items-center gap-2" style={{ color: 'var(--color-lapis)' }}>
              <IconSeal size={17} />
              <p className="font-display text-[12px] uppercase tracking-[0.22em]">
                {journey?.name} · {jProg ? `${jProg.reachedCount}번째 자리` : '자리'} · 닿았습니다
              </p>
            </div>
            <h1 className="mt-2.5 font-serif text-[36px] font-bold leading-[1.1]">{episode.place}</h1>
            <p className="mt-1 font-serif text-[15px] text-ink-soft">{episode.placeLatin} · {episode.region}</p>

            <p className="mt-6 max-w-[28ch] font-serif text-[17px] leading-[1.72] text-ink">{episode.event}</p>
            <button
              onClick={() => openEpisode(journeyId, episode.id)}
              className="mt-3 flex items-center gap-1.5 self-start font-display text-[12px] uppercase tracking-[0.2em] text-clay-deep"
            >
              {episode.passageRef.replace(/\s*\(.*\)$/, '')} · 본문 읽기
            </button>

            <p className="mt-6 max-w-[32ch] text-[14px] leading-relaxed text-ink-soft">{episode.reflection}</p>
            <p className="mt-3 text-[12.5px] text-muted">기도 · {episode.prayer}</p>
          </>
        ) : station ? (
          <>
            <div className="flex items-center gap-2" style={{ color: tone.accent }}>
              <StArc size={17} />
              <p className="font-display text-[12px] uppercase tracking-[0.22em]">{celebrate ? `${ordinal}번째 자리 · 닿았습니다` : '이 자리를 지나며'}</p>
            </div>
            <h1 className="mt-2.5 font-serif text-[36px] font-bold leading-[1.1]">{station.place}</h1>
            <p className="mt-1 font-serif text-[16px] text-ink-soft">{station.title}</p>

            {v && (
              <>
                <p className="mt-6 max-w-[26ch] font-serif text-[18px] leading-[1.72] text-ink">
                  <span className="versal" style={{ color: tone.accent }}>{v.text.slice(0, 1)}</span>{v.text.slice(1)}
                </p>
                <p className="mt-2.5 font-display text-[12px] uppercase tracking-[0.22em]" style={{ color: 'var(--color-clay-deep)' }}>{v.refLatin}</p>
              </>
            )}

            <p className="mt-6 max-w-[32ch] text-[14px] leading-relaxed text-ink-soft">{station.reflection}</p>
            <p className="mt-3 text-[12.5px] text-muted">기도 · {station.prayer}</p>
          </>
        ) : (
          <>
            <SectionLabel>오늘의 길</SectionLabel>
            <h1 className="mt-2.5 font-serif text-[32px] font-bold leading-[1.1]">여기까지 따라왔습니다</h1>
            {/* 남은 거리는 **여정** 기준으로 말한다.
                예전엔 예수 코스의 prog.toNextKm을 썼는데, 기본 코스(갈릴리 5km)는 2회차에
                완주돼서 3회차부터 영원히 "다음 자리까지 0.0km 남았습니다"가 떴다 — 앱이
                고장 난 것처럼 보이는 문장이었다. 여정은 300km짜리라 고갈되지 않는다. */}
            {jNext ? (
              <p className="mt-4 max-w-[30ch] text-[14px] leading-relaxed text-ink-soft">
                다음은 <span className="text-ink">{jNext.place}</span>. 앞으로{' '}
                <span className="font-display text-clay-deep" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                  {fmtDistance(jToNextRealKm, units)}{units}
                </span>{' '}
                남았습니다. 길은 언제나 여기 있어요.
              </p>
            ) : (
              <p className="mt-4 max-w-[30ch] text-[14px] leading-relaxed text-ink-soft">오늘도 길 위에 있었습니다. 길은 언제나 여기 있어요.</p>
            )}
          </>
        )}

        {prayerFor && (
          <p className="mt-5 rounded-xl bg-sand-raised/60 px-4 py-3 text-[13px] text-ink-soft">오늘 <span className="text-rubric">{prayerFor}</span>를 품고 {fmtDistance(distanceKm, units)}{units}를 걸었습니다.</p>
        )}

        {/* 런 요약 — 항상 보여준다.
            예전엔 celebrate(=mood가 wilderness·lament가 아닐 때)일 때만 렌더해서,
            겟세마네 같은 자리에 닿은 날에는 사용자가 자기 거리·시간·페이스·지도를 통째로 볼 수 없었다.
            축하 연출을 끄는 것과 기록을 감추는 것은 다른 일이다 — celebrate는 히어로 글로우만 제어한다. */}
        <div className="mt-7 rounded-2xl border border-line bg-sand-raised/40 p-5">
            <SummaryTriple distance={fmtDistance(distanceKm, units)} unit={unitLabel(units)} durationSec={elapsedSec} paceSec={avgPace} units={units} />
            {/* 측정 신뢰도 — 이 앱의 원칙("못 잰 것은 못 잰다고 한다")을 유일하게 안 지키던 자리.
                신호가 좋을 때는 아무 말도 하지 않는다. 상시 배지는 소음이고, 문제일 때만 말해야 신호가 된다. */}
            {poorSignal && (
              <p className="mt-3 flex items-start gap-2 rounded-lg bg-sand-sunk/60 px-3 py-2.5 text-[11.5px] leading-relaxed text-muted">
                <IconCairn size={13} className="mt-[1px] shrink-0" />
                <span>
                  오늘은 위치 신호가 약했어요{signalAccM ? ` (오차 약 ${Math.round(signalAccM)}m)` : ''}. 거리와 페이스에 오차가 있을 수 있어
                  개인 기록에는 넣지 않았습니다.
                </span>
              </p>
            )}
            {/* 달린 경로 — 페이스 색으로 칠한 지도. 설정에서 경로 기록을 켠 경우에만 */}
            {trace.length > 1 && (
              <div className="mt-5 border-t border-line pt-4">
                <p className="mb-3 text-[11px] tracking-[0.1em] text-muted">오늘 달린 길</p>
                <RouteMap points={trace} avgPaceSecPerKm={avgPace} />
              </div>
            )}

            {/* 예전엔 이 블록 전체가 splits.length > 1 조건이라, 1km를 못 채운 러닝은
                한 문장도 못 받았다("1km를 채우기 전에 멈췄습니다"는 렌더 불가능한 죽은 코드였다). */}
            <div className="mt-5 border-t border-line pt-4">
              {splits.length > 1 && (
                <>
                  <p className="mb-3 text-[11px] tracking-[0.1em] text-muted">1km마다 걸린 시간</p>
                  <SplitBars splits={splits} units={units} avgPaceSecPerKm={avgPace} />
                </>
              )}
                {/* 오늘의 러닝을 한 문장으로 — 칭찬도 질책도 아닌 관찰 */}
                <p className={`${splits.length > 1 ? 'mt-4' : ''} text-[13px] leading-relaxed text-ink-soft`}>{readingOf(analysis)}</p>
                {/* 통계는 표본이 충분할 때만 말한다.
                    예전엔 "페이스 이야기를 하기엔 짧습니다"라고 말한 직후 페이스 통계를 세 개 보여줬다. */}
                {analysis.splitConfident && (
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-muted">
                    {analysis.fastestKm && <span>가장 빠른 구간 {analysis.fastestKm}km · {fmtPace(Math.min(...splits), units)}</span>}
                    {analysis.spreadSec > 0 && <span>가장 빠른·느린 구간 차 {analysis.spreadSec}초</span>}
                    {analysis.slowSegments > 0 && <span>느린 구간 {analysis.slowSegments}개</span>}
                  </div>
                )}
              </div>
            {(reachedThisRun.length > 0 || journeyPlaces.length > 0 || miles.length > 0) && (
              <div className="mt-5 border-t border-line pt-4">
                <div className="flex flex-wrap gap-2">
                  {journeyPlaces.map((place) => (
                    <span key={place} className="flex items-center gap-1.5 rounded-full bg-sand-sunk px-3 py-1.5 text-[12px] text-ink-soft">
                      <IconReached size={14} className="text-olive-deep" />{place}
                    </span>
                  ))}
                  {reachedThisRun.map((id) => (
                    <span key={id} className="flex items-center gap-1.5 rounded-full bg-sand-sunk px-3 py-1.5 text-[12px] text-ink-soft">
                      <IconReached size={14} className="text-olive-deep" />{STATIONS[id].place}
                    </span>
                  ))}
                </div>
                {/* 자리에 못 닿은 날에도 오늘 지나온 것은 남는다.
                    실측으로 3km×주2 기준 러닝의 78.8~91.3%가 자리에 못 닿았고(아브라함은 최장
                    47회 연속), 그 날들엔 화면에 아무것도 남지 않았다. 이정표는 말씀이 아니라
                    "어디를 지나고 있는가"라는 위치 정보라, 본문을 잠그지 않으면서 그 침묵을 메운다. */}
                {miles.length > 0 && (
                  <div className={`${journeyPlaces.length || reachedThisRun.length ? 'mt-3' : ''} flex items-start gap-2 rounded-xl bg-sand-sunk/60 px-3.5 py-3`}>
                    <IconCairn size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--color-lapis)' }} />
                    <p className="text-[12.5px] leading-relaxed text-ink-soft">
                      {miles[miles.length - 1].region}을 지나 <span className="text-ink">{miles[miles.length - 1].to}</span> 쪽으로{' '}
                      <span className="font-display text-ink" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>{miles.length}</span>개의 이정표를 지났습니다.
                    </p>
                  </div>
                )}
              </div>
            )}
        </div>

        {/* 수난·광야 자리에서는 숫자를 지우는 대신 톤만 낮춘다 */}
        {!celebrate && (
          <p className="mt-4 text-[13px] leading-relaxed text-muted">오늘은 세지 않아도 됩니다. 다만 이 길을 함께 걸었습니다.</p>
        )}

        <div className="flex-1 min-h-6" />

        <p className="mb-3 mt-6 text-[10.5px] tracking-[0.04em] text-muted">{SCRIPTURE_ATTRIBUTION}</p>
        <div className="flex gap-3">
          <button onClick={share} className="relative flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-line-strong text-ink-soft transition active:scale-95" aria-label="공유">
            <IconShare size={20} />
            {shared && <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] text-sand">복사됨</span>}
          </button>
          <button onClick={leave} className="flex-1 rounded-2xl bg-clay-deep py-4 text-center font-serif text-[17px] text-sand-raised shadow-[0_1px_2px_rgba(192,90,48,.25),0_16px_36px_-18px_rgba(156,69,34,.55)] transition active:scale-[0.99]">
            계속 걷기
          </button>
        </div>
      </div>
    </div>
  )
}
