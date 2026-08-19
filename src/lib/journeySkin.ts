/* ── 여정별 지도 스킨 ──────────────────────────────────────────────────────
 *
 * 다섯 갈래 길이 전부 같은 라피스 야경이었다. 색만 다른 같은 화면을 다섯 번 보는 셈이라
 * "길을 고른다"는 행위에 감각적 보상이 없었다 — 아브라함의 사막과 바울의 지중해가
 * 눈으로는 구별되지 않았다.
 *
 * 각 길에 **그 땅의 밤**을 준다. 배경은 그 지역의 색이고, 결(texture)은 그 지형이다.
 * 금 여정선은 다섯 길 모두 같게 유지한다 — 그것이 이 앱의 시그니처("The Illuminated Path")이고,
 * 배경이 달라도 "내가 걸어온 길"은 언제나 같은 금색이어야 자기 진행으로 읽힌다.
 *
 * 근거는 지리와 본문에서 가져온다. 예쁜 무늬를 고른 것이 아니다:
 *   · 아브라함 — 창 15:5 "하늘을 우러러 뭇별을 셀 수 있나 보라". 우르의 밤하늘.
 *   · 출애굽  — 시내산의 능선과 밤의 불기둥.
 *   · 예수    — 갈릴리 호수의 물결.
 *   · 바울    — 지중해 항해. 같은 물결이되 더 깊고 찬 바다.
 *   · 베드로  — 예루살렘에서 로마까지, 성벽과 성문의 도시.
 */

export type SkinTexture = 'stars' | 'ridges' | 'waves' | 'deep-waves' | 'walls'

export interface JourneySkin {
  /** 패널 배경 — 위에서 아래로 */
  from: string
  to: string
  /** 배경 결 */
  texture: SkinTexture
  /** 결의 색 */
  textureInk: string
  /** 안개(봉인 구역)의 색 — 배경보다 더 어두운 쪽이어야 '가려짐'으로 읽힌다 */
  fog: string
  /** 이 땅의 이름표·나침반 글자색 */
  label: string
}

/* 배경은 전부 어둡게 유지한다. 밝은 패널을 섞으면 홈에서 카드 하나만 튀어 위계가 무너지고,
 * 무엇보다 금 여정선이 안 보인다(검증: 창백한 지도로 바꿨더니 명도 폭이 22→9로 떨어졌다). */
export const JOURNEY_SKINS: Record<string, JourneySkin> = {
  jesus: {
    from: '#1d2557',
    to: '#141a3f',
    texture: 'waves',
    textureInk: '#4d63c4',
    fog: '#05060f',
    label: 'rgba(253,246,230,.62)',
  },
  abraham: {
    // 우르의 밤 — 자두빛 하늘에 별
    from: '#3a1c3d',
    to: '#1c1026',
    texture: 'stars',
    textureInk: '#e0a6cf',
    fog: '#0a0410',
    label: 'rgba(255,240,248,.62)',
  },
  exodus: {
    // 시내산의 능선과 불기둥의 잔광
    from: '#221a4a',
    to: '#100c26',
    texture: 'ridges',
    textureInk: '#6d7ad8',
    fog: '#05040f',
    label: 'rgba(246,244,255,.62)',
  },
  paul: {
    // 지중해의 밤바다
    from: '#0b3b3d',
    to: '#062125',
    texture: 'deep-waves',
    textureInk: '#3fbcab',
    fog: '#020c0e',
    label: 'rgba(235,253,250,.66)',
  },
  peter: {
    /* 성벽의 도시 — 올리브빛 밤.
       처음 값(#26301c → #141a0e)은 너무 어두워 성벽이 배경에 먹혔고, 다섯 장 중 이 한 장만
       탁해 보였다. 한 단 올리고 위쪽에 도시의 불빛 기운을 남긴다. */
    from: '#37432a',
    to: '#1b2313',
    texture: 'walls',
    textureInk: '#c3dd8e',
    fog: '#080c04',
    label: 'rgba(247,252,235,.7)',
  },
}

export const skinOf = (journeyId: string): JourneySkin => JOURNEY_SKINS[journeyId] ?? JOURNEY_SKINS.jesus
