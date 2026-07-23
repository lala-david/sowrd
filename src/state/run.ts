import { create } from 'zustand'
import type { PassageSlug } from '../data/journey'
import { courseById, STATIONS } from '../data/journey'
import { paceSecPerKm } from '../lib/format'
import { usePilgrim, progressFor, journeyKmOf, type RunRecord } from './pilgrim'
import { journeyById, toJourneyKm } from '../data/geo/journeys'
import { milestonesBetween, type Milestone } from '../data/geo/journeys/milestones'
import { obfuscateEnds, compactTrace, type TracePoint } from '../lib/geo'

/* ── 러닝 세션(트랜지언트, 미영속) ───────────────────────────────────────
 * 프로토타입: 실제 GPS 대신 시뮬레이션으로 거리를 누적한다.
 * tick(dt, paceSecPerKm)이 유일한 거리 소스 — 실 GPS 연동 시 이 지점만 교체.
 * cumulative = 코스 시작 누적거리 + 이번 세션 거리 → 자리 통과 판정. */

/** 중간 표식 간격 — **실제로 달린** km 기준.
 * 여정 km로 재면 축척 때문에 같은 3km 러닝이 출애굽에서 2개, 바울에서 18개가 되어
 * 표식이 여정마다 다른 뜻이 된다(7.5배 편차). 실제 1km마다 하나면 어디서나 같은 뜻이다. */
export const WAYPOINT_REAL_KM = 1

export type RunStatus = 'idle' | 'running' | 'paused' | 'finished'
export type RunMode = 'free' | 'goalDistance' | 'goalTime' | 'guided'

export const RUN_MODES: { id: RunMode; label: string; hint: string }[] = [
  { id: 'guided', label: '순례 구간', hint: '다음 자리를 향해' },
  { id: 'free', label: '자유 러닝', hint: '거리만 담아' },
  { id: 'goalDistance', label: '목표 거리', hint: '정한 만큼' },
  { id: 'goalTime', label: '목표 시간', hint: '정한 동안' },
]

interface RunState {
  status: RunStatus
  mode: RunMode
  courseId: string
  startKm: number // 코스 시작 시점의 누적거리
  distanceKm: number // 이번 세션 거리
  /* 경과 시간 — **벽시계**로 잰다.
   * 예전엔 tick()에 들어온 GPS 표본 간격의 합이었다. 그런데 geo.ts의 게이트가 잡음으로 판정한
   * 표본은 tick을 부르지 않으므로, 그 시간이 통째로 사라졌다. 실측: 도심 accuracy 15m에서
   * 10분/km로 30분을 달리면 표본 1801개 중 125개(6.9%)만 채택되고 경과시간이 915초로 기록된다
   * (885초 소실). 거리 오차와 시간 오차가 같은 방향으로 겹쳐서 표시 페이스가 러너와 무관하게
   * '게이트 페이스'로 포화했다 — 빌딩 사이를 걷는 사람에게 5'07"/km가 떴다.
   * 시계와 거리계는 분리되어야 한다. */
  elapsedSec: number
  _startedAtMs: number
  _pausedMs: number
  _pauseStartMs?: number
  goalKm?: number
  goalSec?: number
  prayerFor?: string
  /* 성경 여정(아브라함·출애굽·바울·베드로) — 예수 코스와 별개의 좌표계다.
   * 이 필드들이 없어서 여정을 골라 달려도 도달 판정이 아예 일어나지 않았다. */
  journeyId: string
  /** 이 런을 시작할 때 그 여정에서 이미 달려 둔 **실제** km */
  journeyStartRealKm: number
  reachedEpisodes: string[]
  lastEpisodePlace?: string
  /** 이번 런에서 지나온 중간 표식 수(실제 1km마다 하나) */
  passedWaypoints: number
  /* 이번 런에서 지나온 이정표. 예전의 passedWaypoints는 이름도 위치도 없는 정수 하나였고
   * 어디에도 누적되지 않아, 78~91%에 달하는 '자리에 못 닿은 러닝'을 메우지 못했다.
   * 이정표는 실제 좌표와 이름(어디에서 어디로 가는 길의 몇 번째)을 가진 사건이다. */
  reachedMilestones: Milestone[]
  lastMilestone?: Milestone
  /** 이번 런의 경로 모양. 설정을 켠 경우에만 쌓인다. */
  trace: TracePoint[]
  /* GPS로 잰 거리와 시뮬로 만든 거리를 따로 센다.
   * 예전엔 "GPS 표본을 한 번이라도 봤는가" 불리언이었는데, 출발점에서 한 번 잡히고
   * 이후 신호를 잃으면(지하도·터널) 나머지 전부가 시뮬인 런이 'gps'로 기록됐다.
   * 비율로 판정해야 그 경로가 막힌다. */
  gpsKm: number
  simKm: number
  /* 이번 런의 신호 품질. 정확도 중앙값(m)과 표본 채택률.
   * 이 앱은 "못 잰 것은 못 잰다고 한다"를 원칙으로 선언해 놓고 그것만 안 지키고 있었다 —
   * 오차가 조건에 따라 크게 달라지는데 사용자에게 아무 단서도 주지 않았다. */
  signalAccM?: number
  signalRate?: number
  /* 최근 구간의 페이스(초/km). 화면의 "현재 페이스"는 이 값이어야 한다 —
   * 전체 평균을 현재라고 부르면, 초반에 빠르게 뛴 사람이 걷기 시작해도 숫자가 안 떨어진다. */
  recentPaceSecPerKm: number
  /** 최근 페이스 계산용 이동 창(최근 구간들의 거리·시간) */
  _recent: { km: number; sec: number }[]
  reachedThisRun: PassageSlug[]
  lastReached?: PassageSlug // 방금 통과한 자리(플래시용)
  flashAt: number // 플래시 타임스탬프
  splits: number[] // km 경계별 누적초 → 구간초
  _lastKmMark: number
  _splitStartSec: number
  // actions
  configure: (opts: { mode: RunMode; courseId: string; journeyId?: string; goalKm?: number; goalSec?: number; prayerFor?: string }) => void
  start: () => void
  tick: (dtSec: number, curPaceSecPerKm: number) => void
  tickClock: () => void
  addTracePoint: (p: TracePoint) => void
  addGpsKm: (km: number) => void
  setSignal: (accM: number, rate: number) => void
  addSimKm: (km: number) => void
  pause: () => void
  resume: () => void
  clearFlash: () => void
  finish: () => RunRecord | undefined
  reset: () => void
}

export const useRun = create<RunState>((set, get) => ({
  status: 'idle',
  mode: 'guided',
  courseId: 'galilee',
  startKm: 0,
  distanceKm: 0,
  elapsedSec: 0,
  _startedAtMs: 0,
  _pausedMs: 0,
  journeyId: 'peter',
  journeyStartRealKm: 0,
  reachedEpisodes: [],
  passedWaypoints: 0,
  reachedMilestones: [],
  trace: [],
  gpsKm: 0,
  simKm: 0,
  recentPaceSecPerKm: 0,
  _recent: [],
  reachedThisRun: [],
  flashAt: 0,
  splits: [],
  _lastKmMark: 0,
  _splitStartSec: 0,

  configure: ({ mode, courseId, journeyId, goalKm, goalSec, prayerFor }) => {
    const p = usePilgrim.getState()
    const startKm = progressFor(p, courseId).cumulativeKm
    const jid = journeyId ?? p.activeJourneyId
    set({
      status: 'idle', mode, courseId, goalKm, goalSec, prayerFor,
      journeyId: jid, journeyStartRealKm: journeyKmOf(p, jid), reachedEpisodes: [],
      lastEpisodePlace: undefined, passedWaypoints: 0, reachedMilestones: [], lastMilestone: undefined,
      trace: [], gpsKm: 0, simKm: 0, signalAccM: undefined, signalRate: undefined,
      recentPaceSecPerKm: 0, _recent: [],
      startKm, distanceKm: 0, elapsedSec: 0, _startedAtMs: 0, _pausedMs: 0, _pauseStartMs: undefined,
      reachedThisRun: [], lastReached: undefined,
      flashAt: 0, splits: [], _lastKmMark: 0, _splitStartSec: 0,
    })
  },

  start: () => set({ status: 'running', _startedAtMs: Date.now(), _pausedMs: 0, _pauseStartMs: undefined }),

  /* 벽시계 한 틱. Run 화면이 1초마다 부른다. GPS가 한 표본도 안 들어와도 시간은 흐른다. */
  tickClock: () => {
    const st = get()
    if (st.status !== 'running' || !st._startedAtMs) return
    const elapsedSec = (Date.now() - st._startedAtMs - st._pausedMs) / 1000
    if (elapsedSec > st.elapsedSec) set({ elapsedSec })
  },

  addTracePoint: (p: TracePoint) => set((s) => ({ trace: [...s.trace, p] })),

  addGpsKm: (km: number) => set((s) => ({ gpsKm: s.gpsKm + km })),
  setSignal: (accM: number, rate: number) => set({ signalAccM: accM, signalRate: rate }),
  addSimKm: (km: number) => set((s) => ({ simKm: s.simKm + km })),

  tick: (dtSec, curPaceSecPerKm) => {
    const st = get()
    if (st.status !== 'running') return
    const dKm = curPaceSecPerKm > 0 ? dtSec / curPaceSecPerKm : 0
    const distanceKm = st.distanceKm + dKm
    /* 시간은 여기서 만들지 않는다 — tickClock()이 벽시계로 갱신한 값을 읽기만 한다.
     * dtSec은 이 표본이 덮는 구간의 길이라 페이스 창 계산에만 쓴다. */
    const elapsedSec = st.elapsedSec

    /* 현재 페이스 — 최근 200m(또는 최근 45초) 창으로만 잰다.
     * 전체 평균을 "현재"라고 부르면 초반에 빠르게 뛴 사람은 걷기 시작해도 숫자가 안 떨어진다. */
    const WINDOW_KM = 0.2
    const WINDOW_SEC = 45
    const _recent = [...st._recent, { km: dKm, sec: dtSec }]
    let wKm = 0
    let wSec = 0
    let cut = _recent.length
    for (let i = _recent.length - 1; i >= 0; i--) {
      wKm += _recent[i].km
      wSec += _recent[i].sec
      cut = i
      if (wKm >= WINDOW_KM || wSec >= WINDOW_SEC) break
    }
    const recentWindow = _recent.slice(cut)
    const recentPaceSecPerKm = wKm > 0 ? wSec / wKm : st.recentPaceSecPerKm

    // km 경계 스플릿 기록
    let { _lastKmMark, _splitStartSec, splits } = st
    if (Math.floor(distanceKm) > _lastKmMark) {
      _lastKmMark = Math.floor(distanceKm)
      splits = [...splits, Math.round(elapsedSec - _splitStartSec)]
      _splitStartSec = elapsedSec
    }

    // 자리 통과 판정
    const course = courseById(st.courseId)
    const cumulative = st.startKm + distanceKm
    const already = new Set([...progressFor(usePilgrim.getState(), st.courseId).reached, ...st.reachedThisRun])
    let reachedThisRun = st.reachedThisRun
    let lastReached = st.lastReached
    let flashAt = st.flashAt
    if (course) {
      for (const cs of course.stations) {
        if (cumulative >= cs.at && !already.has(cs.id)) {
          reachedThisRun = [...reachedThisRun, cs.id]
          lastReached = cs.id
          flashAt = elapsedSec
          already.add(cs.id)
          /* 진동은 여기서 울리지 않는다. 스토어가 기기 API를 직접 만지면
           * (a) haptics.ts의 prefers-reduced-motion 가드를 우회하고
           * (b) Run 화면의 arrival 패턴과 겹쳐 서로를 끊는다(vibrate는 진행 중 패턴을 취소한다).
           * 도달 진동은 flashAt을 보고 Run.tsx가 울린다. */
        }
      }
    }

    /* 성경 여정 자리 통과 판정.
     * 이 블록이 없어서 여정을 골라 달려도 도달이 영영 일어나지 않았다(예수 코스만 봤다).
     * 여정 거리는 코스 누적과 다른 좌표계라 journeyStartRealKm 기준으로 따로 잰다. */
    const journey = journeyById(st.journeyId)
    // 실제 달린 거리를 그 여정의 축척으로 환산한다(바울 1km = 여정 30km)
    const journeyKm = toJourneyKm(st.journeyId, st.journeyStartRealKm + distanceKm)
    const startJKm = toJourneyKm(st.journeyId, st.journeyStartRealKm)
    let reachedEpisodes = st.reachedEpisodes
    let lastEpisodePlace = st.lastEpisodePlace
    let passedWaypoints = st.passedWaypoints
    let reachedMilestones = st.reachedMilestones
    let lastMilestone = st.lastMilestone
    if (journey) {
      /* 이정표 통과 — 자리보다 낮은 톤의 사건이다.
       * flashAt을 자리와 공유하되, 화면에서는 위계를 다르게 그린다(자리=금, 이정표=라피스). */
      const fresh = milestonesBetween(st.journeyId, startJKm, journeyKm)
      if (fresh.length > reachedMilestones.length) {
        reachedMilestones = fresh
        const latest = fresh[fresh.length - 1]
        if (latest && latest.id !== lastMilestone?.id) {
          lastMilestone = latest
          flashAt = elapsedSec
        }
      }
      for (const ep of journey.episodes) {
        /* 출발지도 도달로 친다.
         * 모든 여정의 첫 자리는 cumulativeKm이 0이고, 그 여정을 처음 달리면 startJKm도 0이다.
         * `startJKm < ep.cumulativeKm`만 보면 0 < 0 이 거짓이라 **네 여정 전부 첫 자리가
         * 영원히 발화하지 않았다** — 어느 길을 골라도 첫 러닝의 여정 보상이 정확히 0개였다.
         * 이제 어느 여정이든 첫 걸음에 "가버나움에서 길이 시작됩니다"가 뜬다. */
        const isStart = ep.cumulativeKm === 0 && startJKm === 0
        if (journeyKm >= ep.cumulativeKm && (startJKm < ep.cumulativeKm || isStart) && !reachedEpisodes.includes(ep.id)) {
          reachedEpisodes = [...reachedEpisodes, ep.id]
          lastEpisodePlace = ep.place
          flashAt = elapsedSec
        }
      }
      /* 자리 사이가 수십~수백 km라 첫 런에 아무 일도 일어나지 않는다.
       * 실제 1km마다 표식을 지나게 해 전진이 손에 잡히게 한다(말씀은 자리에서만 열린다). */
      passedWaypoints =
        Math.floor((st.journeyStartRealKm + distanceKm) / WAYPOINT_REAL_KM) -
        Math.floor(st.journeyStartRealKm / WAYPOINT_REAL_KM)
    }

    set({
      distanceKm, splits, _lastKmMark, _splitStartSec,
      reachedThisRun, lastReached, flashAt,
      reachedEpisodes, lastEpisodePlace, passedWaypoints, reachedMilestones, lastMilestone,
      recentPaceSecPerKm, _recent: recentWindow,
    })
  },

  pause: () => set({ status: 'paused', _pauseStartMs: Date.now() }),
  resume: () =>
    set((s) => ({
      status: 'running',
      _pausedMs: s._pausedMs + (s._pauseStartMs ? Date.now() - s._pauseStartMs : 0),
      _pauseStartMs: undefined,
    })),
  clearFlash: () => set({ flashAt: 0 }),

  finish: () => {
    const st = get()
    /* 두 번 커밋되지 않게 막는다.
     * 예전 가드는 `distanceKm <= 0` 하나뿐이라, 멈춤 버튼을 연타하거나(모바일 더블탭)
     * 리빌에서 뒤로 돌아왔다가 다시 멈추면 같은 런이 두 번 들어갔다 — 거리·시간·여정 진도가
     * 전부 2배가 되고, id가 `'run-' + Date.now()`라 같은 ms 안이면 React key까지 겹쳤다. */
    if (st.status === 'finished') return undefined
    if (st.distanceKm <= 0) {
      set({ status: 'finished' })
      return undefined
    }
    const course = courseById(st.courseId)
    const endedAt = Date.now()
    const avg = paceSecPerKm(st.distanceKm, st.elapsedSec)
    const primaryMood = st.lastReached ? STATIONS[st.lastReached].mood : 'everyday'
    const record: RunRecord = {
      id: 'run-' + endedAt,
      courseId: st.courseId,
      courseName: course?.name ?? '순례',
      startedAt: endedAt - st.elapsedSec * 1000,
      endedAt,
      distanceKm: st.distanceKm,
      durationSec: Math.round(st.elapsedSec),
      avgPaceSecPerKm: avg,
      /* 완결된 1km 구간만 담는다. 예전엔 1km 미만일 때 전체 시간을 통째로 한 스플릿으로
       * 넣었고, 그 값이 개인 최고기록으로 올라갔다(0.6km를 240초에 → 4'00"/km로 기록,
       * 실제는 6'40"/km. 40% 위조). 없으면 없는 것이 맞다. */
      splits: st.splits,
      reached: st.reachedThisRun,
      journeyId: st.journeyId,
      reachedEpisodes: st.reachedEpisodes,
      waypointsPassed: st.passedWaypoints,
      milestones: st.reachedMilestones.length,
      lastMilestone: st.lastMilestone ? { from: st.lastMilestone.from, to: st.lastMilestone.to, region: st.lastMilestone.region } : undefined,
      prayerFor: st.prayerFor,
      mood: primaryMood,
      /* 경로를 기록에 남긴다 — 이게 없어서 리빌을 벗어나면 지도가 영영 사라졌다.
       * 저장 전에 시작·끝 200m를 잘라낸다. 러닝은 대개 집 앞에서 시작해 집 앞에서 끝나므로,
       * 원본을 그대로 두면 저장된 모든 기록의 양 끝이 같은 점 = 집 주소가 된다.
       * (obfuscateEnds는 만들어 두고 아무도 부르지 않던 함수였다.) */
      trace: st.trace.length > 1 ? compactTrace(obfuscateEnds(st.trace, 200), avg) : undefined,
      /* 5%만 지어낸 거리여도 'gps'라고 부르지 않는다. 개인 최고기록이 걸린 판정이라
       * 애매하면 sim 쪽으로 기운다 — 없는 기록이 있는 기록보다 낫다. */
      source: st.simKm / Math.max(1e-9, st.gpsKm + st.simKm) > 0.05 ? 'sim' : 'gps',
      signalAccM: st.signalAccM,
      signalRate: st.signalRate,
    }
    usePilgrim.getState().commitRun(record)
    set({ status: 'finished' })
    return record
  },

  reset: () => set({
    // 여정 쪽 상태도 함께 지운다 — 안 지우면 다음 런에 지난 경로·표식이 남는다(검증 FAIL 2건)
    trace: [], gpsKm: 0, simKm: 0, signalAccM: undefined, signalRate: undefined, passedWaypoints: 0, reachedEpisodes: [], lastEpisodePlace: undefined,
    reachedMilestones: [], lastMilestone: undefined,
    recentPaceSecPerKm: 0, _recent: [],
    status: 'idle', distanceKm: 0, elapsedSec: 0, reachedThisRun: [], lastReached: undefined,
    flashAt: 0, splits: [], _lastKmMark: 0, _splitStartSec: 0,
  }),
}))
