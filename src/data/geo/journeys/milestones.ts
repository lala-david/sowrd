/* 이정표 — 두 자리 사이의 지리적 지점.
 *
 * 예전엔 scripts/gen-milestones.mjs가 실측 누적 km 기준으로 6,500줄을 구워 두었다.
 * 진행 거리가 "걸음을 고른" 값(pace.ts)으로 바뀌면서 그 파일은 전부 어긋나게 되었고,
 * 거리의 진실은 한 군데에만 있어야 하므로 이제 런타임에 같은 규칙으로 만든다. */
import { JOURNEYS, JOURNEY_SCALE } from './index'
import { buildMilestones, type Milestone } from './pace'

export type { Milestone } from './pace'

export const MILESTONES: Record<string, Milestone[]> = Object.fromEntries(
  JOURNEYS.map((j) => [j.id, buildMilestones(j, JOURNEY_SCALE[j.id] ?? 1)]),
)

/** 그 여정의 이정표 중 [fromKm, toKm) 구간에 있는 것들 */
export function milestonesBetween(journeyId: string, fromKm: number, toKm: number): Milestone[] {
  return (MILESTONES[journeyId] ?? []).filter((m) => m.cumulativeKm > fromKm && m.cumulativeKm <= toKm)
}

/** 그 여정에서 지금까지 지나온 이정표 수 */
export function milestonesPassed(journeyId: string, journeyKm: number): number {
  return (MILESTONES[journeyId] ?? []).filter((m) => m.cumulativeKm <= journeyKm).length
}
