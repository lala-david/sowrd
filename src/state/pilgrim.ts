import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { PassageSlug, Mood } from '../data/journey'
import { COURSES, courseById } from '../data/journey'
import { journeyById, toJourneyKm } from '../data/geo/journeys'
import { type Units, dayKey } from '../lib/format'
import { validateAlias, type Intercession } from '../data/prayer'
import type { TracePoint } from '../lib/geo'

/* ── 영속 도메인 상태 (localStorage) ─────────────────────────────────────
 * 개인 GPS 원본은 서버로 나가지 않는다(문서: 로컬 우선). 여기 저장되는 것도 로컬뿐. */

export interface CourseProgress {
  cumulativeKm: number
  reached: PassageSlug[] // 열린 자리 id
  completedAt?: number
  playCount: number
}

export interface RunRecord {
  id: string
  courseId: string
  courseName: string
  startedAt: number
  endedAt: number
  distanceKm: number
  durationSec: number
  avgPaceSecPerKm: number
  splits: number[] // km 경계별 초
  reached: PassageSlug[] // 이 런에서 새로 닿은 자리(예수 코스)
  /* 성경 여정 쪽 결과. 이 세 필드가 없어서 여정을 달려도 기록에 아무것도 남지 않았고,
   * 리빌이 보여줄 것이 없어 예수 코스 문구가 대신 떴다. */
  journeyId?: string
  reachedEpisodes?: string[] // 이 런에서 새로 닿은 여정 자리 id
  waypointsPassed?: number // 지나온 중간 표식 수
  /** 이 런에서 지나온 이정표 수 */
  milestones?: number
  /** 마지막 이정표의 위치 서술(말씀이 아니라 지리 정보) */
  lastMilestone?: { from: string; to: string; region: string }
  prayerFor?: string
  mood: Mood
  /* 달린 경로. 설정에서 '경로 기록'을 켠 런에만 있다.
   * 저장 전 obfuscateEnds()로 시작·끝 200m를 잘라낸다 — 집·직장이 좌표로 남지 않게. */
  trace?: TracePoint[]
  /* 시뮬레이션으로 만든 런인지. 없으면 구분이 안 돼서 데모 런이 개인 최고기록에 올라갔다. */
  source?: 'gps' | 'sim'
  /** 이 런의 GPS 정확도 중앙값(m). 클수록 신호가 나빴다 */
  signalAccM?: number
  /** 받은 표본 중 거리로 반영된 비율(0~1) */
  signalRate?: number
}

/* 생애 누적 — runs[]는 100건에서 잘리므로 여기서 따로 센다.
 *
 * 왜 나눴나: 예전엔 개인 최고기록을 runs[]를 훑어 구했는데, 101번째 런을 마치는 순간
 * 가장 오래된 런이 배열에서 밀려나면서 그 안에 있던 최고 기록도 같이 사라졌다.
 * 즉 열심히 달릴수록 자기 최고기록이 후퇴했다. 총 러닝 수도 100에서 영구히 멈췄다.
 * 누적값은 단조 증가라야 하므로 별도로 들고 간다. */
export interface Lifetime {
  runs: number
  km: number
  sec: number
  fastest1kSec?: number
  longestRunKm: number
  /* 여정별 지나온 이정표 총계. 예전엔 RunRecord.waypointsPassed가 저장은 되는데
   * 어디에서도 합산되지 않아, 리빌에 회색 12px로 한 번 떴다가 영영 사라졌다. */
  milestones: Record<string, number>
  /** 자리에 닿은 시각(여정별·자리별). 자기 역사가 되어야 할 것이 on/off 불리언이었다 */
  episodeReachedAt: Record<string, Record<string, number>>
  /** 달린 날(YYYY-MM-DD). 주간 지표·스트릭의 원천이며 날짜당 1개 */
  runDays: string[]
  /* 주(월요일 dayKey)별 거리·횟수.
   * 예전엔 주간 차트가 runs[](100건 상한)를 훑었다. 8주 × 12.5회 = 100건이 정확히 임계선이라
   * 주당 13회를 넘으면 가장 오래된 주부터 무너지고 8주 합계가 500km에서 영구히 멈췄다 —
   * lifetime을 만든 이유("열심히 달릴수록 기록이 후퇴한다")를 주간 차트가 그대로 반복했다. */
  weeks: Record<string, { km: number; runs: number }>
}

const emptyLifetime = (): Lifetime => ({ runs: 0, km: 0, sec: 0, longestRunKm: 0, runDays: [], weeks: {}, milestones: {}, episodeReachedAt: {} })

/** 경로(trace)를 들고 있을 최근 런 수. 나머지 런은 숫자 기록만 남는다 */
const TRACE_KEEP = 20

interface PilgrimState {
  activeCourseId: string
  /* 지금 걷고 있는 성경 여정. 여정을 고르는 행위가 상태를 바꿔야 선택에 의미가 생긴다. */
  activeJourneyId: string
  /* 여정별 누적 거리. 주행거리계 하나를 네 여정이 공유하면 3km 달렸을 때 아브라함·출애굽·
   * 바울·베드로가 동시에 전진해서 "고른다"는 말이 무의미해진다. */
  journeyKm: Record<string, number>
  /* 품고 달리는 사람들. 응답·성취·누적 필드는 의도적으로 없다(data/prayer.ts 참고). */
  intercessions: Intercession[]
  units: Units
  progress: Record<string, CourseProgress>
  collectedVerses: PassageSlug[]
  /** 닿은 여정 자리 — "journeyId:episodeId" 형태 */
  collectedEpisodes: string[]
  runs: RunRecord[]
  /** 100건 상한과 무관하게 단조 증가하는 누적치 */
  lifetime: Lifetime
  lastRunDay?: string
  admin: boolean // 관리자 모드 — 모든 자리/코스 해금 오버레이(실데이터 미변경)
  /* 호흡 기도(예수기도) — 반드시 기본 꺼짐.
   * 발걸음에 맞춰 자동 무한 반복되면 마 6:7("중언부번하지 말라")과 개혁주의가 경계하는
   * 관상기도 기계화에 걸린다. 사용자가 스스로 켤 때만 돈다. */
  breathPrayer: boolean
  /* 홈을 간단히 볼지 — **모드가 아니라 이 화면의 표시 설정**이다.
   * 예전의 simpleMode는 홈만 갈아끼우는 게 아니라 탭바에서 여정 탭까지 감췄고,
   * 에피소드는 여정 안에만 있으므로 에피소드로 들어갈 길이 통째로 막혔다.
   * 게다가 켜는 곳이 없어서 한 번 펼치면 되돌아올 수도 없었다(기록 초기화로도 안 됨).
   * 지금은 홈의 부가 블록(오늘의 말씀·길 바꾸기·품은 사람)만 접는다. 기능은 하나도 안 사라진다. */
  homeCompact: boolean
  /* 경로 기록 — 기본 꺼짐. 켜면 실좌표로 지도를 그린다(상대 좌표로는 어디를 달렸는지 알 수 없다).
   * 대신 기록으로 남길 때 obfuscateEnds()로 시작·끝 200m를 잘라 집이 드러나지 않게 하고,
   * compactTrace()로 400점 이하로 줄인다. 좌표가 기기 밖으로 나가는 코드는 없다. */
  traceRoute: boolean
  /* 글자 크기. 이 앱의 폰트는 전부 px 하드코딩이라 브라우저 글꼴 설정도 iOS Dynamic Type도
   * 듣지 않는다 — 노안 사용자에게 글자를 키울 수단이 앱 안에도 밖에도 없었다. */
  textScale: 'normal' | 'large' | 'xlarge'
  /* 테마. 다크 토큰("밤의 순례길 · 등불")은 처음부터 다 정의돼 있었는데,
   * 실제로 켜지는 곳이 러닝 화면 한 군데뿐이었다(Run.tsx의 data-theme="dark").
   * 새벽 5시에 앱을 열어도 크림색이었다는 뜻이다. 'system'이 기본 — OS 설정을 따른다. */
  theme: 'system' | 'light' | 'dark'
  /* 첫 실행 안내를 봤는가.
   * 예전엔 처음 켠 사람이 보는 화면이 "오늘의 말씀 + 0.0km + 달리기 시작"뿐이라,
   * 이게 GPS로 달린 거리를 재는 앱이라는 사실을 알려주는 문장이 한 줄도 없었다. */
  seenIntro: boolean
  // actions
  setActiveCourse: (id: string) => void
  setUnits: (u: Units) => void
  setAdmin: (v: boolean) => void
  setBreathPrayer: (v: boolean) => void
  setHomeCompact: (v: boolean) => void
  loadDemo: () => void
  setTraceRoute: (v: boolean) => void
  setTextScale: (v: 'normal' | 'large' | 'xlarge') => void
  setTheme: (v: 'system' | 'light' | 'dark') => void
  setSeenIntro: (v: boolean) => void
  setActiveJourney: (id: string) => void
  addIntercession: (alias: string, note?: string) => void
  removeIntercession: (id: string) => void
  commitRun: (r: RunRecord) => void
  resetAll: () => void
}

const emptyProgress = (): CourseProgress => ({ cumulativeKm: 0, reached: [], playCount: 0 })

/* 데모용 시드 — "물 위를 걷다"까지 온 순례자(문서의 현재 위치와 일치).
 * 최초 설치 1회만 심긴다(persist된 뒤엔 사용자 데이터가 우선). */
const now = Date.now()
const seedRuns: RunRecord[] = [
  {
    id: 'seed-3', courseId: 'galilee', courseName: '갈릴리의 기적',
    startedAt: now - 2 * 86400000, endedAt: now - 2 * 86400000 + 1520_000,
    distanceKm: 3.0, durationSec: 1520, avgPaceSecPerKm: 507,
    splits: [498, 512, 510], reached: ['walk-water'], prayerFor: 'J.S', mood: 'wonder',
  },
  {
    id: 'seed-2', courseId: 'galilee', courseName: '갈릴리의 기적',
    startedAt: now - 4 * 86400000, endedAt: now - 4 * 86400000 + 1180_000,
    distanceKm: 2.0, durationSec: 1180, avgPaceSecPerKm: 590,
    splits: [601, 579], reached: ['feeding'], mood: 'wonder',
  },
  {
    id: 'seed-1', courseId: 'galilee', courseName: '갈릴리의 기적',
    startedAt: now - 5 * 86400000, endedAt: now - 5 * 86400000 + 640_000,
    distanceKm: 1.0, durationSec: 640, avgPaceSecPerKm: 640,
    splits: [640], reached: ['sower'], mood: 'everyday',
  },
]

type SeedShape = Pick<
  PilgrimState,
  'activeCourseId' | 'units' | 'progress' | 'collectedVerses' | 'collectedEpisodes' | 'runs' | 'lifetime' | 'lastRunDay'
>

/* 처음 켠 사람은 자기 기록에서 시작한다.
 * 예전에는 데모 시드가 기본값이라 설치 직후 연속 3일·자리 3곳·기도대상 J.S가 이미 있었다.
 * 자기가 한 적 없는 기록을 보면 앱을 못 믿거나 이미 끝난 걸로 오해한다. 게다가 시드의
 * lastRunDay가 이틀 전이라 첫 러닝을 마치면 스트릭이 3 → 1로 떨어지는 버그까지 있었다. */
const seed = (): SeedShape => ({
  activeCourseId: 'galilee',
  units: 'km',
  progress: {},
  collectedVerses: [],
  collectedEpisodes: [],
  runs: [],
  lifetime: emptyLifetime(),
  lastRunDay: undefined,
})

/** 시연용 데모 데이터 — 기본값이 아니라 설정에서 사용자가 직접 넣는다. */
const demo = (): SeedShape => ({
  activeCourseId: 'galilee',
  units: 'km',
  progress: {
    galilee: { cumulativeKm: 3.0, reached: ['sower', 'feeding', 'walk-water'], playCount: 3 },
  },
  collectedVerses: ['sower', 'feeding', 'walk-water'],
  collectedEpisodes: [],
  runs: seedRuns,
  lifetime: {
    runs: seedRuns.length,
    km: seedRuns.reduce((a, r) => a + r.distanceKm, 0),
    sec: seedRuns.reduce((a, r) => a + r.durationSec, 0),
    fastest1kSec: Math.min(...seedRuns.flatMap((r) => r.splits)),
    longestRunKm: Math.max(...seedRuns.map((r) => r.distanceKm)),
    runDays: Array.from(new Set(seedRuns.map((r) => dayKey(r.endedAt)))),
    milestones: {},
    episodeReachedAt: {},
    weeks: seedRuns.reduce((acc, r) => {
      const k = mondayKey(r.endedAt)
      acc[k] = { km: (acc[k]?.km ?? 0) + r.distanceKm, runs: (acc[k]?.runs ?? 0) + 1 }
      return acc
    }, {} as Record<string, { km: number; runs: number }>),
  },
  lastRunDay: dayKey(now), // 오늘로 둔다 — 이틀 전이면 첫 러닝에 스트릭이 줄어든다
})


/* 저장 데이터 버전 올리기. 던질 수 있는 코드는 전부 여기 안에 두고, 호출부가 감싼다. */
function migrateInner(s: Partial<PilgrimState>, from: number): Partial<PilgrimState> {
        if (from < 2) s = { ...s, journeyKm: s.journeyKm ?? {}, intercessions: s.intercessions ?? [] }
        /* v3: 생애 누적을 분리. 기존 사용자는 남아 있는 runs[]에서 되살린다.
         * 100건에서 잘려 나간 런은 복구할 수 없다 — 그것이 애초에 이 필드를 만든 이유다.
         * 되살릴 수 있는 것까지는 되살리고, 이후로는 다시 줄지 않는다. */
        if (from < 3) {
          const runs = Array.isArray(s.runs) ? s.runs : []
          /* 개인 최고기록은 승계하지 않는다.
           * 직전 릴리스에는 GPS가 없었고 26배속 시뮬레이터만 있었다. 그 기록에서 최고기록을
           * 뽑으면 모든 기존 사용자가 업데이트 직후 "개인 최고 1km 1'50"" 같은,
           * 영원히 깨지지 않는 가짜 기록을 갖게 된다 — lifetime을 만든 이유와 정반대다.
           * source가 'gps'로 확인된 기록만 후보로 삼는다(구버전 기록엔 source가 없다). */
          const real = runs.filter((r) => r.source === 'gps')
          const splits = real.flatMap((r) => r.splits ?? []).filter((x) => x > 0)
          s = {
            ...s,
            lifetime: {
              runs: runs.length,
              km: runs.reduce((a, r) => a + (r.distanceKm || 0), 0),
              sec: runs.reduce((a, r) => a + (r.durationSec || 0), 0),
              fastest1kSec: splits.length ? Math.min(...splits) : undefined,
              longestRunKm: real.length ? Math.max(...real.map((r) => r.distanceKm || 0)) : 0,
              runDays: Array.from(new Set(runs.map((r) => dayKey(r.endedAt)))).sort(),
              milestones: {},
              episodeReachedAt: {},
              weeks: runs.reduce((acc, r) => {
                const k = mondayKey(r.endedAt)
                acc[k] = { km: (acc[k]?.km ?? 0) + (r.distanceKm || 0), runs: (acc[k]?.runs ?? 0) + 1 }
                return acc
              }, {} as Record<string, { km: number; runs: number }>),
            },
          }
        }
  /* v4: simpleMode를 없애고 homeCompact로 대체.
   * simpleMode는 탭바에서 여정 탭을 감춰 에피소드 진입로를 막았다 — 켜져 있던 사용자는
   * 그 상태로 갇혀 있었으므로 무조건 펼친 상태(false)로 올린다. */
  if (from < 4) {
    s = { ...s, collectedEpisodes: s.collectedEpisodes ?? [] }
    const noSimple = s as Partial<PilgrimState> & { simpleMode?: boolean }
    delete noSimple.simpleMode
    s = { ...noSimple, homeCompact: false }
  }
  /* v5: 단일 prayerSubject를 intercessions 리스트로 흡수한다.
   * 예전엔 한 사람만 품을 수 있었고 validateAlias를 우회했다. 이제 여러 명을 등록하고
   * 러닝마다 한 명을 고른다. 기존 prayerSubject는 리스트의 첫 항목으로 옮긴다. */
  if (from < 5) {
    const list = [...(s.intercessions ?? [])]
    const legacy = (s as Partial<PilgrimState> & { prayerSubject?: string }).prayerSubject
    if (legacy && validateAlias(legacy).ok && !list.some((i) => i.alias === legacy)) {
      list.unshift({ id: 'ic-legacy', alias: legacy, createdAt: Date.now() })
    }
    s = { ...s, intercessions: list }
  }
  return s
}

export const usePilgrim = create<PilgrimState>()(
  persist(
    (set, get) => ({
      ...seed(),
      /* 신규 설치 기본값은 꺼짐.
       * admin이 켜져 있으면 위치 권한을 거부했을 때 시뮬레이터가 거리를 지어내 여정을
       * 전진시키고 자리를 연다(Run.tsx의 simAllowed). 그건 그 사람이 걸은 길이 아니다.
       * 이미 켜 둔 기기의 저장값은 그대로 유지된다 — 이 값은 최초 1회만 쓰인다. */
      admin: false,
      breathPrayer: false,
      homeCompact: false,
      traceRoute: false,
      textScale: 'normal',
      theme: 'system',
      seenIntro: false,
      /* 기본 여정 = 예수님의 사역 길.
       * DECISIONS.md의 출시 범위가 "예수 단일 여정"인데도 기본값이 'peter'였다 —
       * 예수 여정이 JOURNEYS 목록에 아예 없어서 고를 수가 없었기 때문이다(geo/journeys/jesus.ts 참고).
       * 이제는 홈과 Setup이 같은 길을 말한다. 첫 보상도 가깝다(첫 구간 10.7km ÷ 축척 3 = 실제 3.6km). */
      activeJourneyId: 'jesus',
      journeyKm: {},
      intercessions: [],

      setActiveCourse: (id) => set({ activeCourseId: id }),
      setUnits: (units) => set({ units }),
      setAdmin: (admin) => set({ admin }),
      setActiveJourney: (activeJourneyId) => set({ activeJourneyId }),
      addIntercession: (alias, note) => {
        const v = validateAlias(alias)
        if (!v.ok) return
        const clean = alias.trim()
        set((s) => {
          // 같은 별칭이 이미 있으면 더하지 않는다(중복 카드 방지)
          if (s.intercessions.some((i) => i.alias === clean)) return s
          return {
            intercessions: [
              { id: 'ic-' + Date.now().toString(36), alias: clean, note: note?.trim() || undefined, createdAt: Date.now() },
              ...s.intercessions,
            ].slice(0, 30),
          }
        })
      },
      removeIntercession: (id) =>
        set((s) => ({ intercessions: s.intercessions.filter((i) => i.id !== id) })),
      setBreathPrayer: (breathPrayer) => set({ breathPrayer }),
      setHomeCompact: (homeCompact) => set({ homeCompact }),
      loadDemo: () => set({ ...demo() }),
      setTraceRoute: (traceRoute) => set({ traceRoute }),
      setTextScale: (textScale) => set({ textScale }),
      setTheme: (theme) => set({ theme }),
      setSeenIntro: (seenIntro) => set({ seenIntro }),

      commitRun: (r) => {
        const s = get()
        const course = courseById(r.courseId)
        const prev = s.progress[r.courseId] ?? emptyProgress()
        const cumulativeKm = prev.cumulativeKm + r.distanceKm
        const reached = Array.from(new Set([...prev.reached, ...r.reached]))
        const completed = course && cumulativeKm >= course.distanceKm
        const nextProgress: CourseProgress = {
          cumulativeKm,
          reached,
          playCount: prev.playCount + 1,
          completedAt: completed ? (prev.completedAt ?? r.endedAt) : prev.completedAt,
        }
        const collectedVerses = Array.from(new Set([...s.collectedVerses, ...r.reached]))

        // 오늘 첫 러닝인지 — lastRunDay는 "오늘 이미 달렸나" 판정에만 남긴다.
        // 스트릭(streakDays)은 지웠다: 화면은 "이번 주 N일"만 쓰고, 스트릭은 월·수·금
        // 러너를 매주 0으로 되돌려 가장 흔한 패턴을 실패로 채점하던 죽은 지표였다.
        const today = dayKey(r.endedAt)

        /* 거리는 '그 런이 실제로 달린 여정'에 쌓는다.
         * s.activeJourneyId를 보면, 러닝 중에 사용자가 다른 여정을 눌러본 순간
         * 방금 달린 거리가 엉뚱한 여정으로 들어간다(조용한 오배분). */
        const ranJourney = r.journeyId ?? s.activeJourneyId
        const journeyKm = {
          ...s.journeyKm,
          [ranJourney]: (s.journeyKm[ranJourney] ?? 0) + r.distanceKm,
        }

        /* 여정 자리도 수집에 담는다.
         * 예전엔 예수 코스의 r.reached만 받아서, 바울의 28자리를 전부 밟아도 수집 탭이 0이었다.
         * 68개 여정 자리가 영원히 수집 불가였다는 뜻이다. */
        const collectedEpisodes = Array.from(
          new Set([...(s.collectedEpisodes ?? []), ...(r.reachedEpisodes ?? []).map((id) => `${ranJourney}:${id}`)]),
        )

        /* 누적치는 runs[] 상한과 무관하게 여기서 따로 센다.
         * 시뮬레이션 런은 개인 최고기록에 넣지 않는다 — 26배속으로 만든 3'00"/km가
         * 평생 안 깨지는 '내 기록'으로 앉아 있으면 실제 기록이 영원히 무의미해진다.
         * 거리·시간·달린 날은 넣는다(사용자가 실제로 앱을 쓴 날이므로). */
        /* 개인 최고기록 후보 조건.
         * 시뮬이 아니어야 하고, **신호도 좋아야 한다**. 최고기록은 단조 최소값이라
         * 한 번 오염되면 영원히 남는다 — 신호가 나쁜 날의 잘못 측정된 1km가 개인 기록에
         * 앉으면 그 사람은 다시는 자기 기록을 깨지 못한다. 거리·시간·달린 날은 그대로 넣는다. */
        const goodSignal = (r.signalAccM ?? 0) <= 15 && (r.signalRate ?? 1) >= 0.5
        const real = r.source !== 'sim' && goodSignal
        const lt = s.lifetime ?? emptyLifetime()
        const runSplitBest = real && r.splits.length ? Math.min(...r.splits.filter((x) => x > 0)) : Infinity
        const lifetime: Lifetime = {
          runs: lt.runs + 1,
          km: lt.km + r.distanceKm,
          sec: lt.sec + r.durationSec,
          fastest1kSec: isFinite(runSplitBest)
            ? Math.min(lt.fastest1kSec ?? Infinity, runSplitBest)
            : lt.fastest1kSec,
          longestRunKm: real ? Math.max(lt.longestRunKm, r.distanceKm) : lt.longestRunKm,
          // 날짜당 1개. 최근 400일만 들고 간다(주간 차트가 보는 범위의 열 배)
          runDays: (lt.runDays.includes(today) ? lt.runDays : [...lt.runDays, today]).slice(-400),
          milestones: { ...(lt.milestones ?? {}), [ranJourney]: (lt.milestones?.[ranJourney] ?? 0) + (r.milestones ?? 0) },
          episodeReachedAt: (() => {
            const cur = { ...(lt.episodeReachedAt ?? {}) }
            if (r.reachedEpisodes?.length) {
              cur[ranJourney] = { ...(cur[ranJourney] ?? {}) }
              for (const id of r.reachedEpisodes) if (!cur[ranJourney][id]) cur[ranJourney][id] = r.endedAt
            }
            return cur
          })(),
          weeks: (() => {
            const k = mondayKey(r.endedAt)
            const prev = (lt.weeks ?? {})[k] ?? { km: 0, runs: 0 }
            const next = { ...(lt.weeks ?? {}), [k]: { km: prev.km + r.distanceKm, runs: prev.runs + 1 } }
            // 최근 104주만 유지
            const keys = Object.keys(next).sort()
            for (const old of keys.slice(0, Math.max(0, keys.length - 104))) delete next[old]
            return next
          })(),
        }

        set({
          journeyKm,
          progress: { ...s.progress, [r.courseId]: nextProgress },
          collectedVerses,
          collectedEpisodes,
          /* 기록은 100건, 그중 경로는 최근 20건만 들고 간다.
           * 경로가 붙은 런은 압축 후에도 15KB쯤이라 100건이면 1.5MB다. localStorage는
           * 오리진 전체가 약 5MB고, 넘으면 zustand persist의 setItem이 QuotaExceededError로
           * 실패해 진행도·수집·기도까지 전부 저장이 안 된다. 지도는 최근 것을 보고,
           * 오래된 런은 거리·시간·스플릿으로 남는다(그쪽이 훨씬 오래 쓸모 있다). */
          runs: [r, ...s.runs].slice(0, 100).map((x, i) => (i < TRACE_KEEP ? x : x.trace ? { ...x, trace: undefined } : x)),
          lifetime,
          lastRunDay: today,
        })
      },

      resetAll: () => set({ ...seed(), admin: false, homeCompact: false, breathPrayer: false, traceRoute: false, activeJourneyId: 'jesus', progress: {}, collectedVerses: [], collectedEpisodes: [], runs: [], lifetime: emptyLifetime(), journeyKm: {}, intercessions: [], lastRunDay: undefined }),
    }),
    {
      name: 'theway-pilgrim-v1',
      /* 저장할 것만 저장한다.
       * partialize가 없으면 모든 set()이 액션 함수를 포함한 상태 전체를 직렬화한다.
       * 실측 2.22M자 / JSON.stringify 21.9ms(데스크톱 Node) — 모바일이면 5~10배라
       * 설정 스위치 하나를 토글할 때마다 메인스레드가 100~200ms 멈춘다.
       * (액션은 어차피 JSON에 안 실리지만, 큰 배열들을 매번 훑는 비용은 그대로다.) */
      partialize: (s) => ({
        activeCourseId: s.activeCourseId,
        activeJourneyId: s.activeJourneyId,
        journeyKm: s.journeyKm,
        intercessions: s.intercessions,
        units: s.units,
        progress: s.progress,
        collectedVerses: s.collectedVerses,
        collectedEpisodes: s.collectedEpisodes,
        runs: s.runs,
        lifetime: s.lifetime,
        lastRunDay: s.lastRunDay,
        admin: s.admin,
        breathPrayer: s.breathPrayer,
        homeCompact: s.homeCompact,
        traceRoute: s.traceRoute,
        textScale: s.textScale,
        theme: s.theme,
        seenIntro: s.seenIntro,
      }) as PilgrimState,
      /* 용량 초과에 대한 방어층.
       * localStorage가 꽉 차면 setItem이 QuotaExceededError를 던지고, 기본 구현은 그대로
       * 터진다 — 그러면 그 시점부터 진행도·수집·기도가 하나도 저장되지 않는데 화면은
       * 정상으로 보인다(메모리 상태는 멀쩡하므로). 사용자는 앱을 껐다 켠 뒤에야 잃은 걸 안다.
       * 여기서는 경로(trace)를 먼저 버리고 다시 시도한다. 지도는 다시 그릴 수 있지만
       * 지금까지 걸어온 길은 다시 걸을 수 없다. */
      storage: createJSONStorage(() => ({
        getItem: (k) => localStorage.getItem(k),
        removeItem: (k) => localStorage.removeItem(k),
        setItem: (k, v) => {
          try {
            localStorage.setItem(k, v)
          } catch {
            try {
              const parsed = JSON.parse(v)
              if (parsed?.state?.runs) {
                parsed.state.runs = parsed.state.runs.map((r: RunRecord) => ({ ...r, trace: undefined }))
              }
              localStorage.setItem(k, JSON.stringify(parsed))
            } catch {
              /* 경로를 다 버려도 안 들어가면 여기서 멈춘다. 던지지 않는다 —
               * 던져 봐야 러닝 중 화면이 죽을 뿐이고, 메모리의 기록은 살아 있다. */
            }
          }
        },
      })),
      /* 버전을 둔다. 기본 merge는 한 겹 얕은 병합이라 새 최상위 키는 초기값을 물려받지만,
         CourseProgress·RunRecord처럼 중첩 구조에 필드가 늘면 기존 사용자가 undefined를 받는다.
         지금은 무해할 때 자리를 만들어 둔다. */
      version: 5,
      migrate: (state, from) => {
        try {
          return migrateInner(state as Partial<PilgrimState>, from)
        } catch {
          /* migrate가 던지면 zustand는 .catch로 삼키고 set(stateFromStorage)를 건너뛴다.
           * 스토어는 기본값으로 남고, **다음 set() 하나가 localStorage를 기본값으로 덮어써서**
           * 진행도·수집·기도가 영구 소실된다. 실패해도 원본은 그대로 통과시킨다. */
          return { ...(state as Partial<PilgrimState>), lifetime: emptyLifetime() }
        }
      },

    },
  ),
)

/* ── 파생 셀렉터(순수 함수) ─────────────────────────────────────────────── */

/** 그 여정에서 걸은 거리. 관리자 모드는 호출부에서 전체 해금으로 처리한다. */
export const journeyKmOf = (s: PilgrimState, journeyId: string): number => s.journeyKm[journeyId] ?? 0
export const progressFor = (s: PilgrimState, courseId: string): CourseProgress =>
  s.progress[courseId] ?? emptyProgress()

/** 지금까지 실제로 닿은 자리 집합 */
export const reachedStations = (s: PilgrimState): Set<PassageSlug> =>
  new Set(Object.values(s.progress).flatMap((p) => p.reached))

/** 자리 도달 여부 — 관리자 모드면 전부 도달 처리. 성경 본문 열람은 이 값과 무관하다. */
export const isUnlocked = (s: PilgrimState, id: PassageSlug): boolean =>
  s.admin || reachedStations(s).has(id)

export function pilgrimTotals(s: PilgrimState) {
  const totalStations = new Set(Object.values(s.progress).flatMap((p) => p.reached)).size
  const coursesCompleted = Object.values(s.progress).filter((p) => p.completedAt).length
  /* 총 거리·총 러닝 수·개인 기록은 전부 lifetime에서 읽는다.
   * 예전엔 총 거리를 progress[].cumulativeKm 합으로 구했는데, 그건 예수 코스 진행도라
   * lifetime.km(실제 달린 모든 거리의 단조 합)와 어긋날 수 있었다(BI 지적의 "두 진실").
   * lifetime.km이 진실이다 — 모든 런의 distanceKm를 상한 없이 더한다. */
  const lt = s.lifetime ?? emptyLifetime()
  return {
    totalKm: lt.km,
    totalStations,
    totalRuns: lt.runs,
    coursesCompleted,
    fastest1kSec: lt.fastest1kSec,
    longestRunKm: lt.longestRunKm,
  }
}

/* 최근 N주 주간 거리 — 월요일 시작.
 * 스트릭을 대신할 지표다. 스트릭은 "매일"을 전제해서 월·수·금으로 꾸준히 달리는 사람을
 * 매주 0으로 되돌린다(가장 흔한 러닝 패턴을 실패로 채점한다). 주 단위는 그 사람을 정확히 센다. */
/** 그 시각이 속한 주의 월요일 00:00 */
function mondayOf(ts: number): Date {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  // getDay(): 일=0 … 토=6. 월요일까지 되돌린다(일요일은 6일 전 월요일이 주의 시작)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}
const mondayKey = (ts: number) => dayKey(mondayOf(ts).getTime())

export interface WeekBucket {
  /** 그 주 월요일의 dayKey */
  weekStart: string
  km: number
  runs: number
}

export function weeklyKm(s: PilgrimState, weeks = 8): WeekBucket[] {
  const store = s.lifetime?.weeks ?? {}
  const thisMonday = mondayOf(Date.now())
  const buckets: WeekBucket[] = []
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(thisMonday)
    d.setDate(d.getDate() - i * 7)
    const key = dayKey(d.getTime())
    const hit = store[key]
    buckets.push({ weekStart: key, km: hit?.km ?? 0, runs: hit?.runs ?? 0 })
  }
  return buckets
}

/** 이번 주에 달린 날 수 — 스트릭보다 정직한 "꾸준함" 지표 */
export function daysThisWeek(s: PilgrimState): number {
  const lt = s.lifetime ?? emptyLifetime()
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  const monday = dayKey(d.getTime())
  return lt.runDays.filter((x) => x >= monday).length
}

/* 전체 여정(모든 코스 자리 유니크) 대비 도달 % — "여정 진도" 티어 */
export function overallJourneyPct(s: PilgrimState): number {
  const all = new Set(COURSES.flatMap((c) => c.stations.map((st) => st.id)))
  const reached = new Set(Object.values(s.progress).flatMap((p) => p.reached))
  let hit = 0
  reached.forEach((id) => all.has(id) && hit++)
  return all.size ? Math.round((hit / all.size) * 100) : 0
}

/* 지금 걷는 여정의 단계.
 *
 * 예전엔 예수 코스 자리의 arc로 단계를 정했다. 그래서 기본 설정(galilee, 5km)에서는
 * 첫 러닝 한 번에 3단계 "기적을 지나"로 점프한 뒤 **1,000km를 달려도 영원히 3단계**였다.
 * 4·5단계에 필요한 passion·rise·send arc가 21km·42km·50km 코스에만 있었기 때문이다.
 * 즉 단계가 "얼마나 달렸는가"가 아니라 "어느 코스를 골랐는가"로 정해졌다.
 *
 * 지금은 그 여정 JSON의 tiers를 쓴다 — 실제 주행거리가 단계를 올린다.
 * tiers는 여정마다 이름·구간이 다르므로 "부르심과 고백" 같은 그 길 고유의 이름이 나온다. */
export function activeTier(s: PilgrimState): { name: string; index: number; total: number; pct: number } | undefined {
  const j = journeyById(s.activeJourneyId)
  if (!j || !j.tiers.length) return undefined
  const km = toJourneyKm(j.id, journeyKmOf(s, j.id))
  const at = (key: string) => j.episodes.findIndex((e) => e.id === key || e.place === key)
  const kmOf = (i: number) => (i >= 0 && i < j.episodes.length ? j.episodes[i].cumulativeKm : 0)

  let idx = 0
  for (let i = 0; i < j.tiers.length; i++) {
    if (km >= kmOf(at(j.tiers[i].fromEpisode))) idx = i
  }
  const t = j.tiers[idx]
  const from = kmOf(at(t.fromEpisode))
  const to = kmOf(at(t.toEpisode))
  const span = Math.max(0.0001, to - from)
  return {
    name: t.name,
    index: idx + 1,
    total: j.tiers.length,
    pct: Math.min(100, Math.max(0, Math.round(((km - from) / span) * 100))),
  }
}
