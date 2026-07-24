import { useEffect, useMemo, useRef, useState } from 'react'
import { useNav } from '../store'
import { usePilgrim } from '../state/pilgrim'
import { useRun } from '../state/run'
import { courseById, progressOf, STATIONS } from '../data/journey'
import { fmtDistance, fmtDuration, fmtPace, unitLabel, paceSecPerKm } from '../lib/format'
import { toneOf } from '../lib/mood'
import { LAMP_VERSE } from '../data/scripture'
import { journeyById, journeyProgress, toJourneyKm, toRealKm } from '../data/geo/journeys'
import { haptic } from '../lib/haptics'
import { watchDistance, geoSupported, type GeoStatus } from '../lib/geo'
import { IconCairn, IconLocked, IconHeld, IconPause, IconPlay } from '../components/icons'

/* THE LAMP — "밤의 순례길 · 등불"(dark). 시119:105 "주의 말씀은 내 발에 등이요…"
 * 거리가 곧 앞으로 나아가는 등불. 자리에 닿으면 멈춰서 그 자리의 말씀을 함께 읽는다.
 * 거리는 실제 GPS로 잰다. 아래 시뮬레이터는 GPS를 못 쓸 때의 폴백이자 시연용이다. */

/* 시뮬레이션 배속.
 *
 * 26이었다. 그 값이 무슨 일을 했는지 실측하면: 위치 권한을 거부한 채 30분을 가만히 있으면
 * **141.8km를 달린 것으로, 경과시간 13시간으로** 기록되고, 베드로의 길(실제 306km) 완주가
 * 65분 걸렸다. 여정·수집·주간 차트·누적 거리가 전부 그 숫자로 채워졌다.
 * "실제로 달린 거리가 길을 전진시킨다"는 이 앱의 유일한 약속이 거기서 무너진다.
 *
 * 1이면 시뮬도 실시간이라 30분에 5km쯤이다 — 틀린 값이지만 거짓말은 아니다.
 * 그리고 시연이 필요한 사람(개발 빌드·관리자 모드)에게만 시뮬 자체를 허용한다. */
const SIM_SPEED = 1
const BASE_PACE = 335 // 초/km (약 5'35")

export default function Run() {
  const go = useNav((s) => s.go)
  const units = usePilgrim((s) => s.units)
  const breathPrayer = usePilgrim((s) => s.breathPrayer)
  const setBreathPrayer = usePilgrim((s) => s.setBreathPrayer)
  const traceRoute = usePilgrim((s) => s.traceRoute)
  const admin = usePilgrim((s) => s.admin)
  const run = useRun()
  const { status, courseId, startKm, distanceKm, elapsedSec, flashAt, lastReached } = run
  const { journeyId, journeyStartRealKm, lastEpisodePlace } = run
  const { mode, goalKm, goalSec, prayerFor } = run
  const course = courseById(courseId)!

  /* 스크린리더 안내 문자열.
   * elapsedSec을 그대로 넣으면 매초 값이 바뀌어 live region이 초당 한 번 낭독된다 —
   * 달리는 30분 내내 말이 끊기지 않는다. 정수 km가 바뀔 때만 갱신되게 묶는다
   * (그 시점의 경과시간이 캡처되므로 "3킬로미터 지점, 17분 12초 경과"가 된다). */
  const kmMark = Math.floor(distanceKm)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const kmAnnounce = useMemo(
    () => (kmMark > 0 ? `${kmMark}킬로미터 지점, ${fmtDuration(elapsedSec)} 경과` : ''),
    [kmMark],
  )

  const [locked, setLocked] = useState(false)
  const [breathIn, setBreathIn] = useState(true)
  const tRef = useRef<number | null>(null)

  // 시작
  useEffect(() => {
    if (status === 'idle') run.start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* 거리 소스 — 실제 GPS가 우선, 못 쓰면 시뮬레이션.
   * tick()이 거리를 받는 유일한 입구라서, 여기만 갈아끼우면 자리 도달·표식·기록·축척이
   * 전부 그대로 동작한다. */
  const [geo, setGeo] = useState<GeoStatus>('idle')
  /* 'prompting'을 GPS로 치면 안 된다.
   * OS 권한 팝업을 사용자가 그냥 두거나 브라우저가 프롬프트를 미루면 상태가 'prompting'에
   * 머무는데, 그 동안 GPS 표본은 하나도 안 오고 시뮬 폴백도 막힌다 — 화면이 0.00 KM · 0'00"에서
   * 영원히 멈춘 채 "위치 신호를 찾는 중이에요"만 띄운다(재현 확인). 실제로 표본이 들어오는
   * 'tracking'만 GPS로 친다. */
  const usingGps = geo === 'tracking'

  useEffect(() => {
    if (status !== 'running') return
    if (!geoSupported()) {
      setGeo('unavailable')
      return
    }
    return watchDistance(
      ({ deltaKm, paceSecPerKm, point, accMedian, acceptRate }) => {
        if (accMedian !== undefined && acceptRate !== undefined) {
          useRun.getState().setSignal(accMedian, acceptRate)
        }
        // GPS로 잰 거리를 따로 누적한다 — 기록의 gps/sim 판정에 쓴다
        useRun.getState().addGpsKm(deltaKm)
        // tick은 (경과초, 페이스)를 받아 거리를 되계산한다 → 실측 거리를 그대로 넣기 위해 역산
        const pace = paceSecPerKm ?? BASE_PACE
        useRun.getState().tick(deltaKm * pace, pace)
        // 표본 1개 구간 페이스는 잡음이 존 폭의 10배라 지도가 페이스가 아니라 잡음을 그린다.
        // 이동창 페이스로 대체한다.
        if (point) {
          const r = useRun.getState().recentPaceSecPerKm
          useRun.getState().addTracePoint({ ...point, pace: r || point.pace })
        }
      },
      setGeo,
      traceRoute,
    )
  }, [status, traceRoute])

  /* GPS를 못 쓸 때의 시뮬레이션.
   * 개발 빌드이거나 관리자 모드일 때만 돈다 — 일반 사용자에게 위치 권한 거부는
   * "거리를 지어낸다"가 아니라 "거리를 못 잰다"여야 한다. 지어낸 거리가 여정을
   * 전진시키고 말씀 자리를 열면, 그건 그 사람이 걸은 길이 아니다. */
  const simAllowed = import.meta.env.DEV || admin
  useEffect(() => {
    if (status !== 'running' || usingGps || !simAllowed) return
    const id = window.setInterval(() => {
      const t = (tRef.current = (tRef.current ?? 0) + 0.12)
      const jitter = Math.sin(t * 0.4) * 22 + Math.sin(t * 1.3) * 10
      const pace = BASE_PACE + jitter
      useRun.getState().tick(0.12 * SIM_SPEED, pace)
      useRun.getState().addSimKm((0.12 * SIM_SPEED) / pace)
    }, 120)
    return () => window.clearInterval(id)
  }, [status, usingGps, simAllowed])

  /* 벽시계 — GPS가 한 표본도 안 들어와도 시간은 흐른다.
   * 이게 없으면 경과시간이 '채택된 GPS 표본 간격의 합'이 되어, 도심에서 느리게 달리는 사람은
   * 30분을 달려도 915초로 기록된다(실측 채택률 6.9%). */
  useEffect(() => {
    if (status !== 'running') return
    const id = window.setInterval(() => useRun.getState().tickClock(), 500)
    return () => window.clearInterval(id)
  }, [status])

  /* 화면 꺼짐 방지.
   * 없으면 30초 뒤 화면이 잠기고, 잠긴 뒤에는 브라우저가 setInterval을 초당 1회로 스로틀한다
   * (실측: 42초 동안 시뮬 경과가 예상의 1/9). 벽시계는 Date.now() 기반이라 시간은 안 틀리지만,
   * 러너가 화면을 볼 때마다 잠금해제를 해야 하는 것 자체가 러닝 앱으로서 실격이다. */
  useEffect(() => {
    if (status !== 'running') return
    let sentinel: { release?: () => void } | undefined
    let alive = true
    const req = async () => {
      try {
        sentinel = await (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<{ release?: () => void }> } })
          .wakeLock?.request('screen')
      } catch { /* 미지원·거부 — 조용히 넘어간다 */ }
    }
    req()
    // 탭이 백그라운드로 갔다 오면 락이 풀린다 — 돌아올 때 다시 잡는다
    const onVis = () => { if (alive && document.visibilityState === 'visible') req() }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      alive = false
      document.removeEventListener('visibilitychange', onVis)
      sentinel?.release?.()
    }
  }, [status])

  /* 뒤로가기로 러닝이 통째로 날아가는 것을 막는다.
   * 안드로이드 PWA에서 뒤로가기는 화면 왼쪽 가장자리 스와이프다 — 손에 쥔 폰의 가장자리를
   * 스칠 확률이 높은데, 그 순간 Run이 언마운트되고 #run으로 돌아갈 UI 경로가 앱에 없어서
   * 40분간 달린 거리·페이스·지나온 자리가 전부 사라졌다. 경고도 없었다. */
  useEffect(() => {
    if (status !== 'running' && status !== 'paused') return
    history.pushState(null, '', location.hash) // 뒤로가기 한 번을 흡수할 더미 엔트리
    const onPop = () => {
      if (window.confirm('달리는 중입니다. 지금 나가면 오늘 기록이 사라져요. 나갈까요?')) {
        useRun.getState().reset()
        go('home')
      } else {
        history.pushState(null, '', location.hash) // 다시 흡수
      }
    }
    const onUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('popstate', onPop)
    window.addEventListener('beforeunload', onUnload)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('beforeunload', onUnload)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  /* 호흡 기도 사이클 — 사용자가 켰을 때만 돈다.
   * 자동 무한 반복은 기도를 기술로 만든다(마 6:7). 기본 꺼짐이 신학적 요구사항이다. */
  useEffect(() => {
    if (!breathPrayer) return
    const id = window.setInterval(() => setBreathIn((b) => !b), 4500)
    return () => window.clearInterval(id)
  }, [breathPrayer])

  /* 햅틱 — 러닝 중엔 화면을 못 보므로 진동이 인터페이스다(BUILD-SPECS C).
   * 자리 도달이 시그니처 패턴. */
  useEffect(() => {
    if (flashAt > 0) haptic('arrival')
  }, [flashAt])

  /* km 경계 스플릿 — 이번 런의 주행거리 기준(run.ts가 splits를 기록하는 기준과 같아야 한다).
   * 누적거리로 재면 시작하자마자 한 번 울린다(시드 진행도가 이미 3km이므로). */
  const lastSplitRef = useRef(0)
  useEffect(() => {
    const km = Math.floor(distanceKm)
    if (km > lastSplitRef.current) {
      lastSplitRef.current = km
      haptic('split')
    }
  }, [distanceKm])

  /* 통과 플래시(2.6s) — 자리와 이정표는 위계가 다르다.
   * 자리(place): 금색, "닿았습니다 · 멈추면 함께 읽습니다"
   * 이정표(mile): 라피스, "…를 지납니다 · {to}까지 n/m" — 말씀이 아니라 위치 정보다. */
  const [flash, setFlash] = useState<{ kind: 'place' | 'mile'; text: string; sub?: string } | null>(null)
  const lastFlashRef = useRef(0)
  useEffect(() => {
    if (flashAt <= 0 || flashAt === lastFlashRef.current) return
    lastFlashRef.current = flashAt
    /* 어느 사건이 방금 일어났는지는 '최근에 갱신된 쪽'으로 판정한다.
     * 예전엔 lastEpisodePlace를 무조건 먼저 봤는데, 그 값은 한 번 채워지면 지워지지 않아서
     * 이후 예수 코스 자리에 닿아도 오래된 여정 지명이 토스트에 떴다. */
    const place = lastEpisodePlace ?? (lastReached ? STATIONS[lastReached]?.place : undefined)
    const mile = run.lastMilestone
    const mileIsNewer = mile && (!place || mile.cumulativeKm >= (jProg?.current?.cumulativeKm ?? 0))
    if (mileIsNewer && mile) {
      setFlash({
        kind: 'mile',
        text: `${mile.region}을 지납니다`,
        sub: `${mile.to}까지 ${mile.of - mile.step + 1}개 남음`,
      })
    } else if (place) {
      setFlash({ kind: 'place', text: `${place}에 닿았습니다`, sub: '멈추면 함께 읽습니다' })
    }
    const id = window.setTimeout(() => setFlash(null), 2600)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flashAt])

  const cumulative = startKm + distanceKm
  const prog = progressOf(course, cumulative)

  /* 지금 달리는 여정 — 이 블록이 없어서 바울을 골라도 러닝 화면엔 예수 코스만 떴다.
   * 달리는 사람에게 필요한 건 "얼마나 더 달려야 하나" 하나뿐이라 실제 km로 보여준다.
   * (여정 축척은 여기서 설명하지 않는다 — 게이지가 차오르는 것으로 충분하다.) */
  const journey = journeyById(journeyId)
  const jProg = journey
    ? journeyProgress(journey, toJourneyKm(journeyId, journeyStartRealKm + distanceKm))
    : undefined
  const jNextRealKm = journey && jProg ? toRealKm(journeyId, jProg.toNextKm) : 0
  /* 현재 페이스는 최근 창 기준(run.ts). 전체 평균은 따로 보여준다.
   * 표시는 5초 단위로 반올림한다 — GPS 현재 페이스의 실제 불확실성이 ±20~35초라,
   * 초 단위까지 찍으면 측정 정밀도보다 한 자릿수 높은 정밀함을 가장하게 된다.
   * (전체 평균은 러닝이 끝날수록 안정되므로 반올림하지 않는다.) */
  const curPaceRaw = run.recentPaceSecPerKm || paceSecPerKm(distanceKm, elapsedSec)
  const curPace = curPaceRaw > 0 ? Math.round(curPaceRaw / 5) * 5 : 0
  const avgPace = paceSecPerKm(distanceKm, elapsedSec)
  const tone = prog.nextStation ? toneOf(prog.nextStation.mood) : toneOf('everyday')

  const stop = () => {
    useRun.getState().finish()
    go('reveal')
  }

  const mileCount = run.reachedMilestones.length

  return (
    <div
      data-theme="dark"
      className="relative flex flex-1 flex-col bg-sand text-ink"
      style={{ paddingTop: 'max(3rem, env(safe-area-inset-top))', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="pointer-events-none absolute left-1/2 top-[22%] h-[440px] w-[440px] -translate-x-1/2" style={{ background: `radial-gradient(circle, ${tone.glow}, transparent 62%)` }} />

      {/* 자리 통과 플래시 — 상단 골드 라인 + 토스트. "열림"이 아니라 "함께 읽음"이다: 거리는 말씀의 열쇠가 아니다 */}
      {/* role="status" — 앱에서 가장 중요한 사건인데 시각+진동 전용이었고 2.6초 뒤 사라졌다 */}
      <div role="status" aria-live="polite" className={`pointer-events-none absolute inset-x-0 top-0 z-30 transition-opacity duration-500 ${flash ? 'opacity-100' : 'opacity-0'}`}>
        <div
          className="h-[2px] w-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${flash?.kind === 'mile' ? 'var(--color-lapis)' : 'var(--color-sun-bright)'}, transparent)`,
          }}
        />
        {flash && (
          <div
            className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full bg-[#201C15]/85 px-4 py-1.5 text-[12.5px]"
            style={{ color: flash.kind === 'mile' ? 'var(--color-lapis-bright, #9db4f0)' : 'var(--color-sun-bright)' }}
          >
            {flash.kind === 'mile' ? <IconCairn size={14} /> : null}
            <span>{flash.text}{flash.sub ? ` · ${flash.sub}` : ''}</span>
          </div>
        )}
      </div>

      {/* 상단: 자리 + 러닝 표시 */}
      <div className="relative z-10 flex items-center justify-between px-7">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] tracking-[0.14em] text-sun-deep">{journey?.name ?? course.name}</p>
          <p className="mt-0.5 font-serif text-[16px] text-ink">
            {jProg?.next ? `${jProg.next.place}로` : prog.nextStation ? `${prog.nextStation.place}로` : '완주를 향해'}
          </p>
        </div>
        {/* 상태 배지만 헤더에 둔다. 긴 안내문을 좁은 우측 열에 넣었더니 keep-all 때문에
            어절 단위로만 끊겨 3~4줄 계단이 되고 좌측 지명과 서로 밀어냈다. */}
        <div className="flex shrink-0 items-center gap-2 text-[12px] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-sun" style={{ animation: status === 'running' ? 'glow 2s ease-in-out infinite' : 'none' }} />
          {status === 'paused' ? '멈춤' : '달리는 중'}
        </div>
      </div>

      {/* 거리가 무엇으로 재어지는지 숨기지 않는다 — 이 앱의 유일한 약속이 '실제 달린 거리'다.
          정상일 때는 침묵한다(상시 노출은 소음이고, 문제일 때만 말해야 신호가 된다). */}
      {status === 'running' && geo !== 'tracking' && (
        <p className="relative z-10 mt-2 px-7 text-[12px] leading-relaxed text-muted">
          {geo === 'prompting' && '위치 신호를 찾는 중이에요'}
          {geo === 'denied' && '위치 권한이 꺼져 있어요 · 거리는 어림으로 잽니다'}
          {geo === 'unavailable' && '이 기기는 위치를 못 재요 · 거리는 어림으로 잽니다'}
          {geo === 'lost' && '위치 신호가 약해요 · 잠깐 어림으로 잇습니다'}
          {geo === 'idle' && '연습 모드 · 실제 거리가 아닙니다'}
        </p>
      )}

      {/* 중보 — 누구를 위해 달리는지. 이름은 이니셜만, 기도 제목은 화면에 띄우지 않는다.
          거리와 응답을 연결짓는 표시는 두지 않는다(기도는 하나님을 움직이는 기술이 아니다). */}
      {prayerFor && (
        <div className="relative z-10 mt-3 flex items-center justify-center gap-2 px-7 text-sun-deep">
          <IconHeld size={14} />
          <p className="text-[12px] tracking-[0.04em]">{prayerFor}님을 품고 달립니다</p>
        </div>
      )}

      {/* HERO — 거리는 등불 */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-7">
        {/* 스크린리더용 — 화면의 숫자는 초마다 바뀌지만 소리로는 아무것도 나가지 않았다.
            시각장애 러너가 주 화면에서 받는 피드백이 0이었다. 매초 읽으면 소음이 되므로
            1km 단위로만 알린다(거리 문자열이 바뀔 때가 아니라 정수 km가 바뀔 때). */}
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {kmAnnounce}
        </p>
        <div className="flex items-baseline font-display text-sun" aria-hidden="true" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          <span
            className="font-medium leading-none"
            style={{
              // 10km부터 112px는 360px 화면을 넘는다(측정 +39.1px). 자릿수에 맞춰 줄인다.
              fontSize: distanceKm >= 100 ? 76 : distanceKm >= 10 ? 92 : 112,
              textShadow: '0 0 48px rgba(236,192,105,.42)',
            }}
          >
            {fmtDistance(distanceKm, units)}
          </span>
          <span className="ml-3 text-[30px] text-sun-deep">{unitLabel(units)}</span>
        </div>

        {/* 위성 지표 — 시간 · 현재 페이스 · 평균(NRC 위계) */}
        <div className="mt-6 flex items-center gap-6 font-display text-muted" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          <Metric big={fmtDuration(elapsedSec)} small="시간" />
          <span className="h-8 w-px bg-line-strong" />
          <Metric big={fmtPace(curPace, units)} small="지금 속도" />
          <span className="h-8 w-px bg-line-strong" />
          <Metric big={fmtPace(avgPace, units)} small="1km 평균" />
        </div>

        {/* 등불 구절 시119:105 */}
        <p className="mt-8 max-w-[24ch] text-center font-serif text-[13.5px] leading-[1.7] text-ink-soft/90">{LAMP_VERSE.kr}</p>

        {/* 목표 게이지 — 목표 거리/시간을 골랐으면 그 진행을 보여준다.
            예전엔 Setup에서 목표를 정해도 Run이 goalKm/goalSec을 안 읽어서 아무 일도 없었다.
            달성해도 멈추지는 않는다 — 더 달리고 싶으면 계속 달릴 수 있어야 한다. */}
        {(mode === 'goalDistance' && goalKm) || (mode === 'goalTime' && goalSec) ? (
          (() => {
            const isDist = mode === 'goalDistance'
            const cur = isDist ? distanceKm : elapsedSec
            const goal = isDist ? goalKm! : goalSec!
            const pct = Math.min(100, (cur / goal) * 100)
            const done = cur >= goal
            return (
              <div className="mt-9 w-full max-w-[300px]">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-muted">{done ? '목표 달성 · 계속 달려도 좋아요' : '오늘의 목표'}</span>
                  <span className="font-display text-sun" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                    {isDist
                      ? `${fmtDistance(distanceKm, units)} / ${goalKm} ${unitLabel(units).toLowerCase()}`
                      : `${fmtDuration(Math.round(elapsedSec))} / ${fmtDuration(goalSec!)}`}
                  </span>
                </div>
                <div className="mt-2 h-[4px] w-full overflow-hidden rounded-full bg-line-strong">
                  <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${pct}%`, background: done ? 'var(--color-sun-bright)' : 'var(--color-sun)' }} />
                </div>
              </div>
            )
          })()
        ) : null}

        {/* 다음 자리 게이지 */}
        <div className="mt-9 w-full max-w-[300px]">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-muted">{jProg?.next ?? prog.nextStation ? '다음 자리까지' : '완주까지'}</span>
            <span className="font-display text-sun" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
              {fmtDistance(jProg ? jNextRealKm : prog.toNextKm, units)} {unitLabel(units).toLowerCase()}
            </span>
          </div>
          <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-line-strong">
            <div
              className="h-full rounded-full bg-sun transition-[width] duration-300"
              style={{ width: `${(jProg?.segProgress ?? prog.segProgress) * 100}%` }}
            />
          </div>
          {/* 표식 — 자리 사이가 멀어도 매 km 무언가를 지난다 */}
          {mileCount > 0 && (
            /* "표식 3"은 3이 무엇인지 알 수 없는 숫자였다. 이정표는 어디를 지나고 있는지를 말한다. */
            <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11.5px] text-muted">
              <IconCairn size={13} />
              지나온 이정표 {mileCount}
            </p>
          )}
        </div>

        {/* 호흡 기도 — 기본 꺼짐. 켜야 돈다(자동 반복은 기도를 기술로 만든다) */}
        <div className="mt-8 flex h-9 flex-col items-center justify-center">
          {breathPrayer ? (
            <button onClick={() => setBreathPrayer(false)} className="flex flex-col items-center">
              <p className="text-[12.5px] tracking-[0.06em] text-muted transition-opacity duration-700">
                {breathIn ? '들숨 · 주 예수 그리스도여' : '날숨 · 저를 불쌍히 여기소서'}
              </p>
              <span className="mt-1 text-[10px] text-muted">눌러서 끄기 · 반복 자체에 효력이 있지 않습니다</span>
            </button>
          ) : (
            <button onClick={() => setBreathPrayer(true)} className="rounded-full border border-line-strong px-3.5 py-1.5 text-[11.5px] text-muted transition active:scale-95">
              호흡 기도 켜기
            </button>
          )}
        </div>
      </div>

      {/* 컨트롤: 잠금 · 멈춤 · (일시정지) */}
      {/* 캡션을 컨트롤 행에서 뺐다.
          캡션이 flex-basis:auto라 max-content(약 219px)를 요구했고, 총 요구폭 379px > 304px이라
          flex가 세 자식을 비례 축소해 48px 버튼이 **42.9px로 눌렸다**(실측). 하필 러닝 중에
          화면을 안 보고 누르는 버튼이다. shrink-0으로 고정하고 캡션은 아래 한 줄로 내린다. */}
      <div className="relative z-10 flex items-center justify-center gap-8 px-7">
        <button onClick={() => setLocked((v) => !v)} className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition active:scale-95 ${locked ? 'border-sun text-sun' : 'border-line-strong text-muted'}`} aria-label="화면 잠금">
          <IconLocked size={19} />
        </button>

        <button
          onClick={stop}
          disabled={locked}
          className={`flex h-[80px] w-[80px] shrink-0 items-center justify-center rounded-full border-2 border-sun text-sun transition active:scale-95 ${locked ? 'opacity-30' : ''}`}
          aria-label="멈추기"
        >
          <IconCairn size={30} />
        </button>

        <button
          onClick={() => {
            const paused = status === 'paused'
            haptic(paused ? 'resume' : 'pause')
            paused ? useRun.getState().resume() : useRun.getState().pause()
          }}
          disabled={locked}
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line-strong text-muted transition active:scale-95 ${locked ? 'opacity-30' : ''}`}
          aria-label={status === 'paused' ? '다시 시작' : '일시정지'}
        >
          {status === 'paused' ? <IconPlay size={19} /> : <IconPause size={19} />}
        </button>
      </div>
      <p className="relative z-10 mt-2.5 px-7 text-center text-[12px] text-muted">
        {locked ? '잠김 — 왼쪽 자물쇠로 해제' : '멈추면 이 자리의 말씀을 함께 읽습니다'}
      </p>
    </div>
  )
}

function Metric({ big, small }: { big: string; small: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[19px] text-ink-soft">{big}</span>
      <span className="mt-1 text-[10.5px] tracking-[0.08em]">{small}</span>
    </div>
  )
}
