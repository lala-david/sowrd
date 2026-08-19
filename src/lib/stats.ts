import type { PilgrimState } from '../state/pilgrim'
import { JOURNEYS } from '../data/geo/journeys'
import { dayKey } from './format'

/* ── 기록의 집계 ────────────────────────────────────────────────────────────
 *
 * 원천은 lifetime.days(날별 km·초·횟수). 없거나 비어 있으면(시연 데이터·옛 기록) runs[]에서 만든다.
 * 기간은 셋 — 주(월~일 7칸), 월(그 달의 날짜 칸), 년(12달). 각 기간에 대해
 * 거리·시간·횟수·달린 날·평균 페이스·받은 인장을 센다. 비교는 "지난 기간 대비"뿐이다 —
 * 순위도 친구도 없다(DECISIONS: 리더보드 금지). */

export type Period = 'week' | 'month' | 'year'

export interface DayAgg {
  km: number
  sec: number
  runs: number
}

export interface Bucket {
  key: string
  /** 축 라벨 */
  label: string
  km: number
  sec: number
  runs: number
  /** 오늘을 포함하는 칸인가 */
  now: boolean
  /** 아직 오지 않은 칸인가(이번 주의 내일 이후) */
  future: boolean
}

export interface PeriodSummary {
  period: Period
  /** 기간 제목 — "8월 19일 ~ 25일" / "2026년 8월" / "2026년" */
  title: string
  buckets: Bucket[]
  km: number
  sec: number
  runs: number
  activeDays: number
  /** 초/km. 거리가 없으면 0 */
  paceSecPerKm: number
  /** 이 기간에 받은 인장 */
  seals: number
  /** 지난 기간의 km */
  prevKm: number
  /** 기간 시작·끝 (ms) */
  from: number
  to: number
}

const DAY = 86400000

export function daysOf(s: PilgrimState): Record<string, DayAgg> {
  const d = s.lifetime?.days
  if (d && Object.keys(d).length) return d
  // 폴백 — runs[]에서 날별로 모은다
  const out: Record<string, DayAgg> = {}
  for (const r of s.runs ?? []) {
    const k = dayKey(r.endedAt)
    const p = out[k] ?? { km: 0, sec: 0, runs: 0 }
    out[k] = { km: p.km + r.distanceKm, sec: p.sec + r.durationSec, runs: p.runs + 1 }
  }
  return out
}

const startOfDay = (ts: number) => {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
export const mondayOf = (ts: number) => {
  const d = new Date(startOfDay(ts))
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d.getTime()
}
const firstOfMonth = (ts: number) => {
  const d = new Date(startOfDay(ts))
  d.setDate(1)
  return d.getTime()
}
const firstOfYear = (ts: number) => {
  const d = new Date(startOfDay(ts))
  d.setMonth(0, 1)
  return d.getTime()
}

/** 기간을 n칸 앞(-)/뒤(+)로 옮긴 기준 시각 */
export function shiftPeriod(period: Period, anchor: number, n: number): number {
  const d = new Date(anchor)
  if (period === 'week') d.setDate(d.getDate() + n * 7)
  else if (period === 'month') d.setMonth(d.getMonth() + n)
  else d.setFullYear(d.getFullYear() + n)
  return d.getTime()
}

function rangeOf(period: Period, anchor: number): { from: number; to: number } {
  if (period === 'week') {
    const from = mondayOf(anchor)
    return { from, to: from + 7 * DAY }
  }
  if (period === 'month') {
    const from = firstOfMonth(anchor)
    const d = new Date(from)
    d.setMonth(d.getMonth() + 1)
    return { from, to: d.getTime() }
  }
  const from = firstOfYear(anchor)
  const d = new Date(from)
  d.setFullYear(d.getFullYear() + 1)
  return { from, to: d.getTime() }
}

const KOR_WD = ['월', '화', '수', '목', '금', '토', '일']

function sumRange(days: Record<string, DayAgg>, from: number, to: number): DayAgg & { activeDays: number } {
  let km = 0
  let sec = 0
  let runs = 0
  let activeDays = 0
  for (let t = from; t < to; t += DAY) {
    const a = days[dayKey(t)]
    if (!a) continue
    km += a.km
    sec += a.sec
    runs += a.runs
    if (a.km > 0) activeDays++
  }
  return { km, sec, runs, activeDays }
}

export function summarize(s: PilgrimState, period: Period, anchor = Date.now()): PeriodSummary {
  const days = daysOf(s)
  const { from, to } = rangeOf(period, anchor)
  const todayStart = startOfDay(Date.now())
  const buckets: Bucket[] = []

  if (period === 'week') {
    for (let i = 0; i < 7; i++) {
      const t = from + i * DAY
      const a = days[dayKey(t)] ?? { km: 0, sec: 0, runs: 0 }
      buckets.push({ key: dayKey(t), label: KOR_WD[i], ...a, now: t === todayStart, future: t > todayStart })
    }
  } else if (period === 'month') {
    const n = Math.round((to - from) / DAY)
    for (let i = 0; i < n; i++) {
      const t = from + i * DAY
      const a = days[dayKey(t)] ?? { km: 0, sec: 0, runs: 0 }
      const dd = new Date(t).getDate()
      buckets.push({ key: dayKey(t), label: dd === 1 || dd % 5 === 0 ? String(dd) : '', ...a, now: t === todayStart, future: t > todayStart })
    }
  } else {
    for (let m = 0; m < 12; m++) {
      const d0 = new Date(from)
      d0.setMonth(m)
      const d1 = new Date(from)
      d1.setMonth(m + 1)
      const a = sumRange(days, d0.getTime(), d1.getTime())
      buckets.push({
        key: `${d0.getFullYear()}-${String(m + 1).padStart(2, '0')}`,
        label: `${m + 1}월`,
        km: a.km,
        sec: a.sec,
        runs: a.runs,
        now: todayStart >= d0.getTime() && todayStart < d1.getTime(),
        future: d0.getTime() > todayStart,
      })
    }
  }

  const tot = sumRange(days, from, to)
  const prev = rangeOf(period, shiftPeriod(period, anchor, -1))
  const prevTot = sumRange(days, prev.from, prev.to)

  // 이 기간에 받은 인장
  let seals = 0
  const at = s.lifetime?.episodeReachedAt ?? {}
  for (const j of JOURNEYS) {
    for (const ep of j.episodes) {
      const t = at[j.id]?.[ep.id]
      if (t && t >= from && t < to) seals++
    }
  }

  const f = new Date(from)
  const l = new Date(to - 1)
  const title =
    period === 'week'
      ? `${f.getMonth() + 1}월 ${f.getDate()}일 – ${l.getMonth() === f.getMonth() ? '' : `${l.getMonth() + 1}월 `}${l.getDate()}일`
      : period === 'month'
        ? `${f.getFullYear()}년 ${f.getMonth() + 1}월`
        : `${f.getFullYear()}년`

  return {
    period,
    title,
    buckets,
    km: tot.km,
    sec: tot.sec,
    runs: tot.runs,
    activeDays: tot.activeDays,
    paceSecPerKm: tot.km > 0.05 ? tot.sec / tot.km : 0,
    seals,
    prevKm: prevTot.km,
    from,
    to,
  }
}

/** 가장 오래된 기록의 시각 — 이전 기간으로 얼마나 갈 수 있는지 */
export function earliestRecord(s: PilgrimState): number | undefined {
  const keys = Object.keys(daysOf(s)).sort()
  if (!keys.length) return undefined
  const [y, m, d] = keys[0].split('-').map(Number)
  return new Date(y, m - 1, d).getTime()
}
