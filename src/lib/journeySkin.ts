/* ── 여정별 지도 스킨 ──────────────────────────────────────────────────────
 *
 * 지도는 **밝은 양피지**다. 밤이 아니다.
 *
 * 한 번 남색 야경으로 갔다가 되돌렸다. 이유는 둘:
 *   1) 어두웠다. 홈의 3분의 1을 차지하는 판이 검푸르면 화면 전체가 무거워진다.
 *   2) 이 제품의 시그니처가 아니다. DESIGN-DETAILS의 "The Illuminated Path"는
 *      **양피지 위의 라피스 선과 금 이정표**이고, 07-27에 재작업한 랜딩이 이미 그 모습이다.
 *      바탕을 어둡게 하면 라피스 선이 배경에 먹혀 시그니처가 사라진다.
 *
 * 대비는 **바탕이 아니라 잉크**에서 만든다:
 *   · 걸어온 길  — 라피스 실선. 종이 위에서 가장 진한 선
 *   · 아직 갈 길  — 같은 라피스, 옅은 점선
 *   · 닿은 자리  — 금 인장(어두운 테두리를 둘러 종이 위에서 뜨게)
 *   · 다음 자리  — 봉인. 짙은 라피스 면 + 금 링. 화면에서 가장 밝은 한 점
 *   · 그 너머    — 안개. 검정이 아니라 **따뜻한 그늘**로 덮는다
 *
 * 다섯 장은 **색이 서로 다르다.** 같은 크림색 다섯 장이면 넘겨 볼 이유가 없다.
 * 물색·초록·새벽빛·연보라·모래빛 — 전부 밝은 쪽에서 고른다.
 *   예수     갈릴리 호수 — 물색 종이에 청록 물결
 *   아브라함 우르의 새벽 — 연보라 종이에 별(창 15:5 "뭇별을 셀 수 있나 보라")
 *   출애굽   시내산의 아침 — 살구빛 종이에 라피스 능선
 *   바울     지중해 — 더 깊은 물색에 청록 물결
 *   베드로   성벽의 도시 — 연둣빛 종이에 올리브 성벽
 */

export type SkinTexture = 'stars' | 'ridges' | 'waves' | 'deep-waves' | 'walls'

export interface JourneySkin {
  /** 종이 — 위에서 아래로 */
  from: string
  to: string
  /** 이 장에 그려진 지형 */
  texture: SkinTexture
  /** 지형을 그린 잉크 */
  textureInk: string
  /** 아직 열리지 않은 구역을 덮는 그늘. 검정이 아니라 그 종이의 어두운 쪽 */
  fog: string
  /** 자리 이름 글자색 — 종이 위에 얹는 잉크 */
  label: string
}

export const JOURNEY_SKINS: Record<string, JourneySkin> = {
  jesus: {
    from: '#fbf0d8',
    to: '#efdcb8',
    texture: 'waves',
    textureInk: '#b08a4e',
    fog: '#8a6a3c',
    label: '#4a3826',
  },
  abraham: {
    from: '#fdf1de',
    to: '#f2ddba',
    texture: 'stars',
    textureInk: '#b5854f',
    fog: '#8a6238',
    label: '#4a3524',
  },
  exodus: {
    from: '#fbeedb',
    to: '#eed6b2',
    texture: 'ridges',
    textureInk: '#a97f4c',
    fog: '#8a6238',
    label: '#46331f',
  },
  paul: {
    from: '#f9f0dd',
    to: '#ecdcbb',
    texture: 'deep-waves',
    textureInk: '#a8834e',
    fog: '#87673a',
    label: '#453425',
  },
  peter: {
    from: '#f8f1d6',
    to: '#e9dfb2',
    texture: 'walls',
    textureInk: '#9d8a45',
    fog: '#7c6a33',
    label: '#413a1f',
  },
}

export const skinOf = (journeyId: string): JourneySkin => JOURNEY_SKINS[journeyId] ?? JOURNEY_SKINS.jesus

/* 지도의 잉크 — **고정값**이다. CSS 변수를 쓰면 안 된다.
 *
 * 종이(위 스킨)는 테마를 따라가지 않는데 잉크만 토큰을 쓰면 다크 테마에서 값이 뒤집힌다.
 * 실제로 그랬다: 다크에서 --color-lapis-deep이 밝은 하늘색(#8e9ee6)이 되어,
 * 밝은 종이 위 봉인 마커가 연한 파랑 + 금 링이 되면서 대비 1.41:1로 사라졌다.
 * 종이가 고정이면 잉크도 고정이어야 한다. */
export const MAP_INK = {
  /** 걸어온 길 · 아직 갈 길 — 라피스 */
  path: '#2b3ea8',
  /** 닿은 자리 인장 */
  seal: '#dfa022',
  /** 인장 테두리 — 금이 종이 위에서 뜨려면 어두운 선이 필요하다 */
  sealRing: '#523310',
  /** 봉인된 다음 자리의 면 */
  sealedFill: '#1e2a6b',
  /** 내 토큰 */
  token: '#ff6a30',
  /** 지금 자리의 등불 번짐 */
  lamp: '#f0a81f',
  /** 길바닥 — 말을 올릴 수 있을 만큼 폭이 있는 흙길 */
  roadBed: '#fff6e2',
  /** 길 가장자리·발자국 */
  roadEdge: '#a98a56',
} as const
