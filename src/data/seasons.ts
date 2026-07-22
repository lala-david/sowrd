/* ── 시즌(파트) — 여정을 7막으로 ─────────────────────────────────────────
 * 37 자리를 arc별로 묶어 "게임 챕터"처럼 보여준다. 순서는 사역 연대기.
 * 각 시즌은 지도 위 한 지역(강·산·바다·들판·성·새벽·길)으로 표현된다. */
import { STATIONS, type PassageSlug, type Mood, type Station } from './journey'

export type SceneKey = 'river' | 'mountain' | 'sea' | 'fields' | 'city' | 'dawn' | 'road'

export interface Season {
  arc: Station['arc']
  roman: string
  name: string
  nameLatin: string
  tagline: string
  scene: SceneKey
  hero: string // 기존 Recraft 아트 키(assets/art)
  mood: Mood // 대표 톤(색)
  stations: PassageSlug[]
}

const ARC_ORDER: Station['arc'][] = ['call', 'teach', 'miracle', 'parable', 'passion', 'rise', 'send']

const META: Record<Station['arc'], Omit<Season, 'stations' | 'arc'>> = {
  call: { roman: 'I', name: '부르심', nameLatin: 'The Calling', tagline: '요단강 물에서 시작해 첫걸음을 떼다', scene: 'river', hero: 'pilgrim-trail', mood: 'wonder' },
  teach: { roman: 'II', name: '산 위의 말씀', nameLatin: 'The Sermon', tagline: '팔복에서 반석 위의 집까지, 산 위의 가르침', scene: 'mountain', hero: 'sermon-mount', mood: 'everyday' },
  miracle: { roman: 'III', name: '갈릴리의 기적', nameLatin: 'The Miracles', tagline: '호숫가에서 일어난 기적들을 지나다', scene: 'sea', hero: 'galilee-water', mood: 'wonder' },
  parable: { roman: 'IV', name: '천국 비유', nameLatin: 'The Parables', tagline: '들판의 이야기로 하늘 나라를 열다', scene: 'fields', hero: 'field-parable', mood: 'compassion' },
  passion: { roman: 'V', name: '예루살렘의 길', nameLatin: 'The Passion', tagline: '입성에서 십자가까지, 가장 무거운 한 주', scene: 'city', hero: 'jerusalem-dusk', mood: 'lament' },
  rise: { roman: 'VI', name: '부활', nameLatin: 'The Rising', tagline: '빈 무덤의 새벽, 죽음을 이긴 생명', scene: 'dawn', hero: 'dawn-road', mood: 'joy' },
  send: { roman: 'VII', name: '땅 끝까지', nameLatin: 'To the Ends', tagline: '파송 — 결승선 없는 사명의 길', scene: 'road', hero: 'dawn-road', mood: 'joy' },
}

export const SEASONS: Season[] = ARC_ORDER.map((arc) => ({
  arc,
  ...META[arc],
  stations: Object.values(STATIONS)
    .filter((s) => s.arc === arc)
    .map((s) => s.id),
}))

export const seasonByArc = (arc: string): Season | undefined => SEASONS.find((s) => s.arc === arc)
export const seasonOfStation = (id: PassageSlug): Season | undefined => seasonByArc(STATIONS[id].arc)
