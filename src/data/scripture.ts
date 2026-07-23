/* 성경 접근 — 실제 검증 데이터(passages.json, data/bible/korean_krv.json에서 추출).
 * 개역한글 인격권 준수: ①원문 수정 금지(동일성유지권) ②출처표기(성명표시권). */
import passages from './passages.json'
import { STATIONS, type PassageSlug, type Station } from './journey'

/* 표기에서 발행처 주장을 뺀다.
 * 번들된 본문은 대한성서공회가 발행한 「성경전서 개역한글판」이 아니라 위키소스 계열
 * 퍼블릭 도메인 파생본이다(data/bible/README.md의 distribution_source 참고).
 * 발행처를 잘못 적는 것이 실제 위험이므로, 정식 판본을 확보하기 전까지는 중립 표기만 쓴다. */
export const SCRIPTURE_ATTRIBUTION = '개역한글 · 퍼블릭 도메인 판본'

export interface VerseLine {
  v: number
  text: string
}
export interface Passage {
  ref: string
  refLatin: string
  kr: VerseLine[]
  en: VerseLine[]
}

const PASSAGES = passages as Record<PassageSlug, Passage>

export const passageOf = (slug: PassageSlug): Passage => PASSAGES[slug]

/** 스테이션의 대표 한 절(개역한글 원문) */
export function featuredVerse(station: Station): { text: string; ref: string; refLatin: string } {
  const p = PASSAGES[station.passage]
  const line = p.kr.find((l) => l.v === station.verse) ?? p.kr[0]
  return { text: line.text, ref: p.ref, refLatin: p.refLatin }
}

export const featuredVerseById = (id: PassageSlug) => featuredVerse(STATIONS[id])

/* ── 다중 여정(아브라함·출애굽·바울·베드로) 본문 ────────────────────────────────
 * 에피소드에는 verseKrShort(의역 요약)만 있었고 판본명이 붙어 있어 사용자가 그것을
 * 성경 본문으로 오인했다. scripts/extract-journey-passages.mjs가 passageRef를 파싱해
 * 개역한글 원문을 그대로 뽑아 둔다. 요약은 요약대로, 본문은 본문대로 보여준다. */
export interface JourneyPassage {
  ref: string
  translation: string
  verses: { book: string; chapter: number; v: number; text: string }[]
}

/* 본문 473절은 92 KB(gz 25 KB)라 초기 번들의 17%를 차지했는데, 정작 읽는 화면은 하나뿐이다.
 * 정적 import를 걷어내고 그 화면에 들어갈 때만 받아온다. 한 번 받으면 캐시한다. */
let cache: Record<string, JourneyPassage> | null = null

export async function loadJourneyPassages(): Promise<Record<string, JourneyPassage>> {
  if (!cache) {
    const mod = await import('./journey-passages.json')
    cache = mod.default as unknown as Record<string, JourneyPassage>
  }
  return cache
}

/** 여정 에피소드의 성경 본문 전문. 해금 여부와 무관하게 항상 열람 가능해야 한다. */
export const journeyPassage = (journeyId: string, episodeId: string): JourneyPassage | undefined =>
  cache?.[`${journeyId}:${episodeId}`]

/* 은혜 고지 — 달린 거리가 말씀을 여는 열쇠로 읽히지 않게 하는 고정 문구.
 * PCK 검증: 게이팅 구조 자체가 공로주의를 함의하므로 구조와 문구를 함께 고친다. */
export const GRACE_NOTE =
  '달린 거리는 말씀을 여는 열쇠가 아니라, 이미 주신 은혜를 따라 걷는 순서일 뿐입니다. ' +
  '하나님의 사랑과 구원은 거리로 얻지도, 멈춤으로 잃지도 않습니다. (엡 2:8-9)'

/* THE LAMP(러닝 화면) 고정 구절 — 시119:105는 passages에 없으므로 상수로. */
export const LAMP_VERSE = {
  kr: '주의 말씀은 내 발에 등이요 내 길에 빛이니이다',
  ref: '시편 119:105',
  refLatin: 'Psalm 119:105',
}
