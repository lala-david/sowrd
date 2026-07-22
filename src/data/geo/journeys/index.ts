/* ── 다중 성경 여정 통합 모델 ─────────────────────────────────────────────
 * 아브라함·출애굽·바울·베드로: 실좌표·실측 km·에피소드·성구(개역개정)·묵상·기도·
 * "달리는 느낌"·등급(tier)·PCK 신학주. (예수님 사역은 journey.ts가 별도 구동)
 * 사용자의 실제 누적 러닝 거리를 여정 폴리라인 누적 km에 매핑 → 자리 해금. */
import abraham from './abraham.json'
import exodus from './exodus.json'
import paul from './paul.json'
import peter from './peter.json'

export interface JourneyEpisode {
  id: string
  order: number
  place: string
  placeLatin: string
  region: string
  lat: number
  lng: number
  cumulativeKm: number
  segmentKm: number
  event: string
  passageRef: string
  verseKrShort: string
  reflection: string
  prayer: string
  feel: string
  leg?: 'land' | 'sea'
  confidence?: string // biblical | tradition | symbolic
}

export interface JourneyTier {
  id: string
  name: string
  fromEpisode: string
  toEpisode: string
  km: number
  note: string
}

export interface Journey {
  id: string
  name: string
  nameLatin: string
  who: string
  era: string
  totalKm: number
  theologyNote: string
  tiers: JourneyTier[]
  episodes: JourneyEpisode[]
  sources: string[]
}

/* 여정별 씬/색 — 게임 지도에서 지역감(강·산·바다·광야·도시)과 톤 */
export type SceneKey = 'river' | 'mountain' | 'sea' | 'fields' | 'city' | 'dawn' | 'road' | 'desert'
export interface JourneyChrome {
  scene: SceneKey
  accent: string // CSS var
  hero: string // assets/art 키 (임시 재사용, recraft 생성분으로 교체 예정)
}
export const JOURNEY_CHROME: Record<string, JourneyChrome> = {
  abraham: { scene: 'desert', accent: 'var(--color-sun-deep)', hero: 'dawn-road' },
  exodus: { scene: 'desert', accent: 'var(--color-clay-deep)', hero: 'pilgrim-trail' },
  jesus: { scene: 'sea', accent: 'var(--color-clay)', hero: 'galilee-water' },
  paul: { scene: 'sea', accent: 'var(--color-olive-deep)', hero: 'dawn-road' },
  peter: { scene: 'city', accent: 'var(--color-sun-deep)', hero: 'jerusalem-dusk' },
}

export const JOURNEYS: Journey[] = [
  abraham as unknown as Journey,
  exodus as unknown as Journey,
  paul as unknown as Journey,
  peter as unknown as Journey,
]

export const journeyById = (id: string): Journey | undefined => JOURNEYS.find((j) => j.id === id)

/** 여정 안에서 누적 거리(km)로부터 진행 상태 */
export function journeyProgress(journey: Journey, km: number) {
  const eps = journey.episodes
  const reached = eps.filter((e) => km >= e.cumulativeKm)
  const reachedCount = reached.length
  const current = reachedCount > 0 ? eps[reachedCount - 1] : undefined
  const next = eps[reachedCount] // 아직 도달 못한 첫 에피소드
  const prevAt = current ? current.cumulativeKm : 0
  const nextAt = next ? next.cumulativeKm : journey.totalKm
  const seg = Math.max(0.0001, nextAt - prevAt)
  return {
    reachedCount,
    total: eps.length,
    current,
    next,
    toNextKm: Math.max(0, nextAt - km),
    segProgress: Math.min(1, Math.max(0, (km - prevAt) / seg)),
    pct: Math.min(100, Math.round((km / journey.totalKm) * 100)),
    done: reachedCount >= eps.length || km >= journey.totalKm,
  }
}

/** 에피소드가 속한 등급(tier) — fromEpisode~toEpisode place 라벨 기준 */
export function tierOfEpisode(journey: Journey, ep: JourneyEpisode): JourneyTier | undefined {
  const idx = journey.episodes.findIndex((e) => e.id === ep.id)
  for (const t of journey.tiers) {
    const from = journey.episodes.findIndex((e) => e.place === t.fromEpisode || e.id === t.fromEpisode)
    const to = journey.episodes.findIndex((e) => e.place === t.toEpisode || e.id === t.toEpisode)
    if (from !== -1 && to !== -1 && idx >= from && idx <= to) return t
  }
  return undefined
}
