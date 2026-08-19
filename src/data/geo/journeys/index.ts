/* ── 다중 성경 여정 통합 모델 ─────────────────────────────────────────────
 * 아브라함·출애굽·바울·베드로: 실좌표·실측 km·에피소드·성구(개역한글)·묵상·기도·
 * "달리는 느낌"·등급(tier)·PCK 신학주. (예수님 사역은 journey.ts가 별도 구동)
 * 사용자의 실제 누적 러닝 거리를 여정 폴리라인 누적 km에 매핑 → 자리 도달. (말씀은 도달 여부와 무관하게 항상 열람 가능 — 거리가 성경을 여는 열쇠가 되면 공로주의가 된다) */
import abraham from './abraham.json'
import exodus from './exodus.json'
import paul from './paul.json'
import peter from './peter.json'
import type { Mood } from '../../journey'
import { moodOfEpisode } from './moods'
import { JESUS_JOURNEY } from './jesus'

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
  /* 톤. JSON에는 없고 moods.ts가 얹는다 — 좌표 리서치와 신학·편집 판단은 다른 종류의 데이터다.
   * 이 값이 'lament'면 축하·인장 애니메이션이 꺼진다(CONTENT-UX §수난 = 게임 완전 OFF). */
  mood: Mood
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
/* 여정마다 씬을 겹치지 않게 배정한다 — 같은 씬을 쓰면 선택 화면에서 카드가 중복으로 보이고,
 * 색만으로는 구별되지 않는다(색약·썸네일에서 붕괴한다는 검증 결과). */
/* 다섯 갈래에 다섯 색.
 * 예전엔 아브라함과 베드로가 같은 sun-deep이었고 나머지도 전부 흙빛 계열이라, 목록에서
 * 카드가 서로 구별되지 않았다(색약에서는 더 붕괴한다). 색상환에서 충분히 떨어진 다섯 개로
 * 가른다 — 주홍 / 사막 금 / 라피스 / 바다 청록 / 올리브 그린. 전부 sand 위 AA를 통과한다. */
export const JOURNEY_CHROME: Record<string, JourneyChrome> = {
  jesus: { scene: 'sea', accent: 'var(--color-clay-deep)', hero: 'galilee-water' }, // 갈릴리 — 주홍
  abraham: { scene: 'desert', accent: 'var(--color-plum)', hero: 'dawn-road' }, // 우르→가나안 — 밤과 언약의 자두
  exodus: { scene: 'mountain', accent: 'var(--color-lapis)', hero: 'pilgrim-trail' }, // 홍해·시내산 — 라피스
  paul: { scene: 'road', accent: 'var(--color-sea)', hero: 'dawn-road' }, // 지중해 항해 — 바다 청록
  peter: { scene: 'city', accent: 'var(--color-olive-deep)', hero: 'jerusalem-dusk' }, // 예루살렘→로마 — 올리브
}

/* ── 실제 거리 ↔ 여정 거리 ────────────────────────────────────────────────
 * 바울의 길은 실측 9,980km다. 사람이 그걸 실제로 달릴 수는 없다.
 * 그래서 두 개의 거리를 나눠 쓴다:
 *   · 실제 km — 내가 오늘 정말로 달린 거리(기록·페이스는 전부 이 값)
 *   · 여정 km — 그 걸음이 성경 여정 위에서 나아간 거리(= 실제 km × 배율)
 * 배율은 "한 여정을 대략 300km쯤 달리면 완주"가 되도록 잡았다. 주 3회 3km면 약 6개월,
 * 주 5회 5km면 약 3개월이다. 지도 축척과 같은 개념이라 거리를 속이는 것이 아니다 —
 * 화면에는 언제나 두 숫자를 함께 보여준다. */
export const JOURNEY_SCALE: Record<string, number> = {
  abraham: 12, // 3,490km → 실제 약 291km
  exodus: 4, //  1,060km → 실제 약 265km
  /* 예수: 891km(사역 지리 안 33자리의 실측 합) → 실제 약 297km.
     문서의 3,020km는 상징 좌표인 로마('땅 끝')까지 포함한 값이라 축척 10배로 잡혀 있었는데,
     지도의 자리에서 로마를 뺀 뒤에는 그 배율이면 89km 만에 완주가 된다. 3배가 맞는 값이다. */
  jesus: 3,
  paul: 30, //   9,980km → 실제 약 333km
  peter: 12, //  3,673km → 실제 약 306km
}

export const scaleOf = (journeyId: string): number => JOURNEY_SCALE[journeyId] ?? 1

/** 실제로 달린 거리 → 그 여정 위에서 나아간 거리 */
export const toJourneyKm = (journeyId: string, realKm: number): number => realKm * scaleOf(journeyId)

/** 여정 거리 → 실제로 달려야 하는 거리(“여기까지 몇 km 남았나”를 사람 말로 옮길 때) */
export const toRealKm = (journeyId: string, journeyKm: number): number => journeyKm / scaleOf(journeyId)

/* JSON에 톤을 얹어 Journey를 완성한다.
 * 얹지 않으면 ep.mood가 undefined라, 이삭의 결박과 모세의 죽음에도 축하 인장이 찍힌다. */
function withMoods(raw: unknown): Journey {
  const j = raw as Journey
  return { ...j, episodes: j.episodes.map((e) => ({ ...e, mood: moodOfEpisode(j.id, e.id) })) }
}

/* 예수 여정을 **맨 앞에** 둔다.
 * DECISIONS.md가 출시 범위를 "예수 단일 여정"으로 정했는데도 목록에 예수가 아예 없어서
 * 홈은 베드로를, Setup은 갈릴리 코스를 말하고 있었다. jesus.ts가 좌표(jesus-journey.json)와
 * 서사(journey.ts STATIONS)를 조인해 Journey를 만든다. mood를 이미 들고 오므로 withMoods를 안 탄다. */
export const JOURNEYS: Journey[] = [
  JESUS_JOURNEY,
  withMoods(abraham),
  withMoods(exodus),
  withMoods(paul),
  withMoods(peter),
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
