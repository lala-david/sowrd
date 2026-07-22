/* 성경 접근 — 실제 검증 데이터(passages.json, data/bible/korean_krv.json에서 추출).
 * 개역한글 인격권 준수: ①원문 수정 금지(동일성유지권) ②출처표기(성명표시권). */
import passages from './passages.json'
import { STATIONS, type PassageSlug, type Station } from './journey'

export const SCRIPTURE_ATTRIBUTION = '성경전서 개역한글판 · ⓒ 대한성서공회'

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

/* THE LAMP(러닝 화면) 고정 구절 — 시119:105는 passages에 없으므로 상수로. */
export const LAMP_VERSE = {
  kr: '주의 말씀은 내 발에 등이요 내 길에 빛이니이다',
  ref: '시편 119:105',
  refLatin: 'Psalm 119:105',
}
