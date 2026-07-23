/* 이정표(milestone) 생성 — 자리와 자리 사이의 침묵을 메운다.
 *
 * 왜 필요한가(실측): 3km × 주2회로 1년을 달리면 자리에 닿는 러닝이
 *   아브라함 8.7% · 베드로 11.5% · 출애굽 14.4% · 바울 21.2% 뿐이다.
 *   아브라함은 최장 47회(24주) 연속으로 아무 일도 일어나지 않는다.
 *
 * 무엇인가: 이정표는 **말씀이 아니라 지리**다. 두 자리 사이 어디쯤을 지나고 있는지
 *   알려주는 위치 정보이므로, 성경 본문을 잠그지 않고 공로 프레이밍도 만들지 않는다.
 *   말씀은 지금처럼 자리에서만, 그리고 언제든 열람 가능하다.
 *
 * 규칙: 구간이 실제 5km를 넘으면 실제 2.5km 간격으로 등분해 놓는다.
 *   좌표는 두 자리 사이 대권(great circle)을 따라 보간한다 — 실제 지도 위의 점이다.
 */
import fs from 'node:fs'
import path from 'node:path'

const DIR = 'src/data/geo/journeys'
const SCALE = { abraham: 12, exodus: 4, jesus: 10, paul: 30, peter: 12 }
const MILE_REAL_KM = 2.5   // 이정표 간격(실제 달릴 km)
const MIN_SEG_REAL_KM = 5  // 이보다 짧은 구간은 나누지 않는다

const rad = (d) => (d * Math.PI) / 180
const deg = (r) => (r * 180) / Math.PI

/** 대권 보간 — 두 좌표 사이를 f(0~1) 비율로 */
function slerp(aLat, aLng, bLat, bLng, f) {
  const φ1 = rad(aLat), λ1 = rad(aLng), φ2 = rad(bLat), λ2 = rad(bLng)
  const Δ = 2 * Math.asin(Math.sqrt(
    Math.sin((φ2 - φ1) / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2))
  if (Δ === 0) return [aLat, aLng]
  const A = Math.sin((1 - f) * Δ) / Math.sin(Δ)
  const B = Math.sin(f * Δ) / Math.sin(Δ)
  const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2)
  const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2)
  const z = A * Math.sin(φ1) + B * Math.sin(φ2)
  return [+deg(Math.atan2(z, Math.hypot(x, y))).toFixed(4), +deg(Math.atan2(y, x)).toFixed(4)]
}

/* 육로/바닷길 판정 — 바울의 항해 구간은 걸어서 간 곳이 아니다.
 * region 문자열과 지명에 바다·항해 단서가 있으면 sea로 본다. */
const seaHint = /바다|해상|항해|지중해|에게|배로|섬|구브로|밀레도|사모|로도|시돈에서/
const legOf = (from, to) =>
  seaHint.test(`${from.region ?? ''} ${to.region ?? ''} ${to.place}`) ? 'sea' : 'land'

const out = {}
let total = 0
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.json'))) {
  const j = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8'))
  const scale = SCALE[j.id]
  if (!scale) { console.warn('축척 없음:', j.id); continue }
  const list = []
  for (let i = 1; i < j.episodes.length; i++) {
    const a = j.episodes[i - 1], b = j.episodes[i]
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
        lat, lng,
        from: a.place, to: b.place,
        region: a.region ?? j.name,
        leg: legOf(a, b),
        step: k, of: n,
      })
    }
  }
  out[j.id] = list
  total += list.length
  console.log(`${j.id.padEnd(8)} 이정표 ${String(list.length).padStart(3)}개 · 자리 ${j.episodes.length}개`)
}

const body = `/* 자동 생성 — scripts/gen-milestones.mjs. 직접 고치지 마세요.
 *
 * 이정표는 두 자리 사이의 지리적 지점이다. 말씀이 아니라 위치 정보이므로
 * 성경 본문 접근과 무관하고, 공로 프레이밍("달린 만큼 은혜")을 만들지 않는다.
 * 좌표는 두 자리 사이 대권을 따라 보간한 실제 지점이다.
 * 간격: 실제 달릴 거리 ${MILE_REAL_KM}km마다 하나(구간이 실제 ${MIN_SEG_REAL_KM}km를 넘을 때만). */
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

export const MILESTONES: Record<string, Milestone[]> = ${JSON.stringify(out, null, 2)}

/** 그 여정의 이정표 중 [fromKm, toKm) 구간에 있는 것들 */
export function milestonesBetween(journeyId: string, fromKm: number, toKm: number): Milestone[] {
  return (MILESTONES[journeyId] ?? []).filter((m) => m.cumulativeKm > fromKm && m.cumulativeKm <= toKm)
}

/** 그 여정에서 지금까지 지나온 이정표 수 */
export function milestonesPassed(journeyId: string, journeyKm: number): number {
  return (MILESTONES[journeyId] ?? []).filter((m) => m.cumulativeKm <= journeyKm).length
}
`
fs.writeFileSync(path.join(DIR, 'milestones.ts'), body)
console.log(`\n총 ${total}개 → ${DIR}/milestones.ts`)
