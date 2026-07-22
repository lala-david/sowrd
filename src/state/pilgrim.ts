import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PassageSlug, Mood } from '../data/journey'
import { COURSES, courseById, STATIONS } from '../data/journey'
import { type Units, dayKey, daysBetween } from '../lib/format'

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
  reached: PassageSlug[] // 이 런에서 새로 닿은 자리
  prayerFor?: string
  mood: Mood
}

interface PilgrimState {
  activeCourseId: string
  units: Units
  progress: Record<string, CourseProgress>
  collectedVerses: PassageSlug[]
  runs: RunRecord[]
  prayerSubject?: string
  streakDays: number
  lastRunDay?: string
  admin: boolean // 관리자 모드 — 모든 자리/코스 해금 오버레이(실데이터 미변경)
  // actions
  setActiveCourse: (id: string) => void
  setUnits: (u: Units) => void
  setPrayerSubject: (v?: string) => void
  setAdmin: (v: boolean) => void
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

const seed = (): Pick<PilgrimState, 'activeCourseId' | 'units' | 'progress' | 'collectedVerses' | 'runs' | 'prayerSubject' | 'streakDays' | 'lastRunDay'> => ({
  activeCourseId: 'galilee',
  units: 'km',
  progress: {
    galilee: { cumulativeKm: 3.0, reached: ['sower', 'feeding', 'walk-water'], playCount: 3 },
  },
  collectedVerses: ['sower', 'feeding', 'walk-water'],
  runs: seedRuns,
  prayerSubject: 'J.S',
  streakDays: 3,
  lastRunDay: dayKey(now - 2 * 86400000),
})

export const usePilgrim = create<PilgrimState>()(
  persist(
    (set, get) => ({
      ...seed(),
      admin: false,

      setActiveCourse: (id) => set({ activeCourseId: id }),
      setUnits: (units) => set({ units }),
      setPrayerSubject: (prayerSubject) => set({ prayerSubject }),
      setAdmin: (admin) => set({ admin }),

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

        // streak: 오늘 첫 러닝이면 갱신
        const today = dayKey(r.endedAt)
        let streakDays = s.streakDays
        if (s.lastRunDay !== today) {
          const gap = s.lastRunDay ? daysBetween(s.lastRunDay, today) : 1
          streakDays = gap === 1 ? s.streakDays + 1 : 1
        }

        set({
          progress: { ...s.progress, [r.courseId]: nextProgress },
          collectedVerses,
          runs: [r, ...s.runs].slice(0, 100),
          streakDays,
          lastRunDay: today,
        })
      },

      resetAll: () => set({ ...seed(), progress: {}, collectedVerses: [], runs: [], streakDays: 0, lastRunDay: undefined, prayerSubject: undefined }),
    }),
    { name: 'theway-pilgrim-v1' },
  ),
)

/* ── 파생 셀렉터(순수 함수) ─────────────────────────────────────────────── */
export const progressFor = (s: PilgrimState, courseId: string): CourseProgress =>
  s.progress[courseId] ?? emptyProgress()

/** 지금까지 실제로 닿은 자리 집합 */
export const reachedStations = (s: PilgrimState): Set<PassageSlug> =>
  new Set(Object.values(s.progress).flatMap((p) => p.reached))

/** 자리 해금 여부 — 관리자 모드면 전부 열림 */
export const isUnlocked = (s: PilgrimState, id: PassageSlug): boolean =>
  s.admin || reachedStations(s).has(id)

export function pilgrimTotals(s: PilgrimState) {
  const totalKm = Object.values(s.progress).reduce((a, p) => a + p.cumulativeKm, 0)
  const totalStations = new Set(Object.values(s.progress).flatMap((p) => p.reached)).size
  const totalRuns = s.runs.length
  const coursesCompleted = Object.values(s.progress).filter((p) => p.completedAt).length
  // 개인 기록
  let fastest1kSec = Infinity
  let longestRunKm = 0
  for (const r of s.runs) {
    for (const sp of r.splits) if (sp > 0) fastest1kSec = Math.min(fastest1kSec, sp)
    longestRunKm = Math.max(longestRunKm, r.distanceKm)
  }
  return {
    totalKm,
    totalStations,
    totalRuns,
    coursesCompleted,
    fastest1kSec: isFinite(fastest1kSec) ? fastest1kSec : undefined,
    longestRunKm,
  }
}

/* 전체 여정(모든 코스 자리 유니크) 대비 도달 % — "여정 진도" 티어 */
export function overallJourneyPct(s: PilgrimState): number {
  const all = new Set(COURSES.flatMap((c) => c.stations.map((st) => st.id)))
  const reached = new Set(Object.values(s.progress).flatMap((p) => p.reached))
  let hit = 0
  reached.forEach((id) => all.has(id) && hit++)
  return all.size ? Math.round((hit / all.size) * 100) : 0
}

/* 여정 단계(NRC 티어 대응) — 도달한 자리의 arc로 현재 단계를 정한다 */
const TIERS: { label: string; arcs: string[] }[] = [
  { label: '길 위에 서다', arcs: ['call'] },
  { label: '가르침을 따라', arcs: ['teach', 'parable'] },
  { label: '기적을 지나', arcs: ['miracle'] },
  { label: '예루살렘의 길', arcs: ['passion'] },
  { label: '부활의 증인', arcs: ['rise', 'send'] },
]
export function journeyTier(s: PilgrimState): string {
  const reached = new Set(Object.values(s.progress).flatMap((p) => p.reached))
  let tier = TIERS[0].label
  for (const t of TIERS) {
    if ([...reached].some((id) => t.arcs.includes(STATIONS[id]?.arc))) tier = t.label
  }
  return tier
}
