/* 중보기도 — 신학 가드레일을 타입·상수 레벨에 먼저 박아 둔다.
 *
 * PCK 검증(D-3)의 요구:
 *  1. 거리↔응답 상관 금지. 응답/성취를 나타내는 필드를 아예 정의하지 않는다.
 *     "○○를 위해 42km 기도했습니다", 중보 누적 랭킹, 응답률 같은 것이 생길 여지를 없앤다.
 *  2. 효력 언어 금지. 기도를 결과를 산출하는 기술로 읽히게 하는 표현을 막는다.
 *  3. 대상자 보호. 실명 대신 이니셜·별칭만. 기도 제목은 로컬 전용이며 공유 경로에 태우지 않는다.
 *
 * 그래서 Intercession에는 answered/fulfilled/progress/streak 같은 필드가 없다.
 * 이것은 누락이 아니라 설계다 — 추가하지 말 것.
 */

export interface Intercession {
  id: string
  /** 이니셜·별칭만. 실명은 받지 않는다(공유 시 타인의 신원이 나간다). */
  alias: string
  /** 기도 제목 — 로컬에만 저장하고 어떤 공유 산출물에도 넣지 않는다. */
  note?: string
  createdAt: number
}

/** 중보 화면 어디에나 붙는 고정 문구. GRACE_NOTE와 같은 역할을 기도 쪽에서 한다. */
export const PRAYER_NOTE =
  '중보는 하나님을 움직이는 힘이 아니라, 하나님이 이미 사랑하시는 사람을 함께 품는 일입니다. ' +
  '응답은 주님께 있습니다.'

/* 결과를 보장하는 프리셋은 두지 않는다("합격", "완치" 같은 것). 대신 품는 방식을 제안한다. */
export const PRAYER_PROMPTS = [
  '오늘 이 사람의 하루가 평안하기를',
  '지치지 않도록, 곁에 사람이 있기를',
  '아픈 자리에 하나님의 위로가 있기를',
  '결정 앞에서 지혜를 얻기를',
]

/* 기도를 기술·거래로 읽히게 하는 표현. 입력과 카피 양쪽에서 걸러 낸다. */
const EFFICACY_WORDS = ['응답받', '이루어지', '기도가 통', '뚫고', '쟁취', '합심의 능력', '반드시 이루']

export const hasEfficacyLanguage = (text: string): boolean =>
  EFFICACY_WORDS.some((w) => text.includes(w))

/* 별칭 규칙 — 한글 2자 이하 또는 이니셜 형태만 허용해 실명 입력을 구조적으로 막는다.
 * (예: "J.S", "은혜", "K", "민수" ✕ 세 글자 이상 한글 이름) */
const ALIAS_OK = /^(?:[A-Za-z](?:\.[A-Za-z])*\.?|[가-힣]{1,2}|[A-Za-z]{1,4})$/

export function validateAlias(raw: string): { ok: boolean; reason?: string } {
  const v = raw.trim()
  if (!v) return { ok: false, reason: '이름을 적어 주세요.' }
  if (v.length > 8) return { ok: false, reason: '이니셜이나 별칭으로 짧게 적어 주세요.' }
  if (!ALIAS_OK.test(v))
    return { ok: false, reason: '실명 대신 이니셜(J.S)이나 짧은 별칭으로 적어 주세요.' }
  return { ok: true }
}
