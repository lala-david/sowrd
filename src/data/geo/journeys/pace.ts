import type { Journey, JourneyEpisode } from './index'

/* ── 걸음 고르기(pacing) ──────────────────────────────────────────────────────
 *
 * 실측 거리를 그대로 진행에 쓰면 여정이 **망가진다**. 실측(여정km ÷ 축척 = 내가 달릴 km):
 *   예수     중앙값 0.59km · 최대 41.8km — 두 번째 자리까지 37.7km, 수난주간 13자리가 2.7km 안
 *   아브라함 첫 구간 141.7km — 새 사용자가 아브라함을 고르면 142km를 달려야 두 번째 자리
 *   베드로   최대 95.8km · 최소 0.17km
 * 주 3회 3km 러너에게 41km는 **4.6주 동안 인장 0**이고, 0.1km 구간 열셋은 한 번의 러닝에 전부
 * 지나가 버린다. 이탈은 거의 전부 이런 사막 구간에서 난다(게임 경제 검토).
 *
 * 그래서 진행에 쓰는 거리는 실측이 아니라 **걸음을 고른 거리**다:
 *   · 구간의 실제 km를 [2, 12]로 자른다 — 한 주에 한 자리쯤, 길어도 2주
 *   · 첫 구간은 3km를 넘지 않는다 — **첫 러닝에서 첫 인장**이 찍혀야 한다
 *   · 축척(JOURNEY_SCALE)은 그대로 곱한다. 실측은 버리지 않는다 — measured*로 남겨
 *     자리 시트에 "실측 41km"로 적는다. 지도의 축척처럼, 거리를 속이는 것이 아니라 단위를
 *     바꾸는 것이다. 결과(내가 달릴 거리): 예수 145 · 아브라함 62 · 출애굽 122 · 바울 207 · 베드로 92km.
 *
 * 여정 선택이 이미 난이도 선택이다(짧은 길·긴 길). 따로 "모드"를 두지 않는다 — "가볍게"로
 * 받은 인장과 "깊이"로 받은 인장이 다른가라는 질문이 신학 금지선에 바로 닿기 때문이다. */

export const PACE_MIN_REAL_KM = 2
export const PACE_MAX_REAL_KM = 12
export const PACE_FIRST_REAL_KM = 3

const round = (n: number) => Math.round(n * 100) / 100

export function paceJourney(j: Journey, scale: number): Journey {
  let cum = 0
  const episodes: JourneyEpisode[] = j.episodes.map((e, i) => {
    if (i === 0) {
      return { ...e, measuredSegmentKm: e.segmentKm, measuredCumulativeKm: e.cumulativeKm, segmentKm: 0, cumulativeKm: 0 }
    }
    const prev = j.episodes[i - 1]
    const measuredSeg = e.segmentKm || Math.max(0, e.cumulativeKm - prev.cumulativeKm)
    const real = measuredSeg / scale
    const hi = i === 1 ? PACE_FIRST_REAL_KM : PACE_MAX_REAL_KM
    const pacedReal = Math.min(hi, Math.max(PACE_MIN_REAL_KM, real))
    const seg = round(pacedReal * scale)
    cum = round(cum + seg)
    return { ...e, measuredSegmentKm: e.segmentKm, measuredCumulativeKm: e.cumulativeKm, segmentKm: seg, cumulativeKm: cum }
  })
  /* 장(tier)의 km도 걸음을 고른 값으로 — 지도 아래 "이 장에 내가 달릴 거리"가 실측과 어긋나면 안 된다 */
  const at = (k: string) => episodes.findIndex((e) => e.id === k || e.place === k)
  const tiers = j.tiers.map((t) => {
    const from = at(t.fromEpisode)
    const to = at(t.toEpisode)
    if (from < 0 || to < 0) return t
    const start = from > 0 ? episodes[from - 1].cumulativeKm : 0
    return { ...t, km: round(episodes[to].cumulativeKm - start) }
  })
  return { ...j, episodes, tiers, totalKm: cum, measuredTotalKm: j.totalKm }
}

/* ── 이정표 ────────────────────────────────────────────────────────────────
 * 두 자리 사이의 지리적 지점. 말씀이 아니라 위치 정보다 — 성경 본문 접근과 무관하고
 * 공로 프레이밍("달린 만큼 은혜")을 만들지 않는다. 좌표는 두 자리 사이 대권을 따라 보간한
 * 실제 지점이다. 걸음을 고른 뒤의 누적 km에 맞춰 **런타임에** 만든다 — 예전엔 실측 기준으로
 * 구워 둔 파일(6,500줄)이 있었는데, 진행 거리가 바뀌면 어긋나므로 한 군데서 같이 계산한다.
 *   · 구간이 실제 2.5km를 넘을 때만, 실제 1.5km 간격으로 — 3km 러닝이면 반드시 하나는 지난다 */
export const MILE_REAL_KM = 1.5
export const MIN_SEG_REAL_KM = 2.5

export interface Milestone {
  id: string
  /** 여정 좌표계 누적 km */
  cumulativeKm: number
  lat: number
  lng: number
  from: string
  to: string
  region: string
  /** 육로인지 바닷길인지 — 바울의 항해 구간은 걸어서 간 곳이 아니다 */
  leg: 'land' | 'sea'
  step: number
  of: number
}

const rad = (d: number) => (d * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI

/** 대권 보간 — 두 좌표 사이를 f(0~1) 비율로 */
export function slerp(aLat: number, aLng: number, bLat: number, bLng: number, f: number): [number, number] {
  const p1 = rad(aLat)
  const l1 = rad(aLng)
  const p2 = rad(bLat)
  const l2 = rad(bLng)
  const D = 2 * Math.asin(Math.sqrt(Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin((l2 - l1) / 2) ** 2))
  if (D === 0) return [aLat, aLng]
  const A = Math.sin((1 - f) * D) / Math.sin(D)
  const B = Math.sin(f * D) / Math.sin(D)
  const x = A * Math.cos(p1) * Math.cos(l1) + B * Math.cos(p2) * Math.cos(l2)
  const y = A * Math.cos(p1) * Math.sin(l1) + B * Math.cos(p2) * Math.sin(l2)
  const z = A * Math.sin(p1) + B * Math.sin(p2)
  return [+deg(Math.atan2(z, Math.hypot(x, y))).toFixed(4), +deg(Math.atan2(y, x)).toFixed(4)]
}

export function buildMilestones(j: Journey, scale: number): Milestone[] {
  const list: Milestone[] = []
  const eps = j.episodes
  for (let i = 1; i < eps.length; i++) {
    const a = eps[i - 1]
    const b = eps[i]
    const segJourneyKm = b.cumulativeKm - a.cumulativeKm
    const segRealKm = segJourneyKm / scale
    if (segRealKm <= MIN_SEG_REAL_KM) continue
    const n = Math.max(1, Math.round(segRealKm / MILE_REAL_KM) - 1) // 양 끝은 자리이므로 내부만
    for (let k = 1; k <= n; k++) {
      const f = k / (n + 1)
      const [lat, lng] = slerp(a.lat, a.lng, b.lat, b.lng, f)
      list.push({
        id: `${j.id}-m${String(list.length + 1).padStart(3, '0')}`,
        cumulativeKm: +(a.cumulativeKm + segJourneyKm * f).toFixed(1),
        lat,
        lng,
        from: a.place,
        to: b.place,
        region: a.region,
        leg: b.leg ?? 'land',
        step: k,
        of: n,
      })
    }
  }
  return list
}
