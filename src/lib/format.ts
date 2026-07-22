/* 거리·페이스·시간 포맷터. 텔레메트리 숫자는 lining+tabular(등폭)로 표시(index.css 참조). */
export type Units = 'km' | 'mi'

export const KM_PER_MI = 1.609344

export const toDisplayDistance = (km: number, units: Units) => (units === 'mi' ? km / KM_PER_MI : km)
export const unitLabel = (units: Units) => (units === 'mi' ? 'MI' : 'KM')
export const paceUnitLabel = (units: Units) => (units === 'mi' ? '/MI' : '/KM')

/** 거리 → "3.47" (소수 둘째자리) */
export function fmtDistance(km: number, units: Units = 'km', digits = 2): string {
  return toDisplayDistance(km, units).toFixed(digits)
}

/** 경과초 → "15:20" 또는 "1:02:33" */
export function fmtDuration(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mm = String(m).padStart(h ? 2 : 1, '0')
  const ss = String(sec).padStart(2, '0')
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

/** 페이스(초/km) → "5'21\"" (선택 단위 반영) */
export function fmtPace(secPerKm: number, units: Units = 'km'): string {
  if (!isFinite(secPerKm) || secPerKm <= 0) return "0'00\""
  const perUnit = units === 'mi' ? secPerKm * KM_PER_MI : secPerKm
  const m = Math.floor(perUnit / 60)
  const s = Math.round(perUnit % 60)
  const adjM = s === 60 ? m + 1 : m
  const adjS = s === 60 ? 0 : s
  return `${adjM}'${String(adjS).padStart(2, '0')}"`
}

/** 초/km 계산 (거리 0 방지) */
export const paceSecPerKm = (distanceKm: number, durationSec: number) =>
  distanceKm > 0 ? durationSec / distanceKm : 0

/** yyyy-mm-dd (로컬) — 스트릭/하루경계 판정용 */
export function dayKey(ts: number): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 두 dayKey 사이의 일수 차 */
export function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00')
  const db = new Date(b + 'T00:00:00')
  return Math.round((db.getTime() - da.getTime()) / 86400000)
}
