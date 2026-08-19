/* ── 패널마다 공기가 어디서 움직이는가 ───────────────────────────────────────
 *
 * 보드의 분위기 연출(배·갈매기·별·모래 안개·연기·빛 조각)은 **그 그림의 그 자리**에만 놓는다.
 * 무작위로 뿌리면 갈매기가 사막 한가운데서 나오고 배가 언덕 위를 지난다(실제로 그랬다).
 * 그래서 패널 그림을 하나하나 보고, 물이 어디인지 하늘이 어디인지를 여기 적어 둔다.
 *
 * 좌표는 **원본 그림(9:16)의 비율**이다 — [x0, y0, x1, y1], 0~1.
 * 패널이 9:16이 아닌 높이로 깔릴 때(object-fit: cover) 어느 부분이 보이는지는
 * lib/board.ts의 imageRectToPanel()이 환산한다. 그림을 다시 생성하면 이 표도 다시 본다. */

export type Frac = [number, number, number, number]

export interface PanelAmbient {
  /** 물 — 배가 떠다니고 물빛이 반짝인다 */
  water?: Frac[]
  /** 물 위 배의 수(없으면 물이 있어도 배는 없다 — 작은 강엔 배를 띄우지 않는다) */
  boats?: number
  /** 배의 종류 — 어선(갈릴리) · 돛배(지중해) */
  boatKind?: 'fishing' | 'sail'
  /** 새 — 어디든 날 수 있되, 이 패널에서만 난다 */
  birds?: 'doves' | 'gulls' | 'none'
  /** 밤하늘·어둠 — 별이 깜박인다 */
  stars?: Frac[]
  /** 모래 안개가 지나가는 곳 */
  haze?: Frac[]
  /** 연기 기둥(시내산) — 점 [x, y] */
  smoke?: [number, number][]
  /** 모닥불·등불 빛이 맥동하는 점 */
  fire?: [number, number][]
  /** 빛 조각(새벽·동산) — 없으면 은은하게 조금만 */
  motes?: 'many' | 'few' | 'none'
  /** 번개 — 폭풍 바다(바울의 항해) */
  lightning?: Frac
  /** 수난 — 구름 그림자 말고는 아무것도 움직이지 않는다 */
  solemn?: boolean
}

export const PANEL_AMBIENT: Record<string, PanelAmbient> = {
  /* 예수님의 사역 길 */
  'jesus-0': { water: [[0.55, 0.62, 1, 0.95]], boats: 1, boatKind: 'fishing', birds: 'doves', motes: 'few' },
  'jesus-1': { water: [[0.1, 0.72, 1, 1]], boats: 1, boatKind: 'fishing', birds: 'doves', motes: 'few' },
  'jesus-2': { water: [[0.02, 0.12, 0.92, 0.5], [0.7, 0.5, 1, 0.85]], boats: 3, boatKind: 'fishing', birds: 'gulls', motes: 'few' },
  'jesus-3': { birds: 'doves', motes: 'few' },
  'jesus-4': { solemn: true, motes: 'none', birds: 'none' },
  'jesus-5': { water: [[0.55, 0, 1, 0.25]], birds: 'doves', motes: 'many' },
  'jesus-6': { water: [[0, 0.72, 0.55, 1]], boats: 1, boatKind: 'fishing', birds: 'doves', motes: 'few' },

  /* 아브라함의 여정 */
  'abraham-0': { stars: [[0, 0, 0.32, 1], [0.72, 0, 1, 1]], fire: [[0.52, 0.34], [0.2, 0.52], [0.78, 0.7]], birds: 'none', motes: 'none' },
  'abraham-1': { stars: [[0, 0, 1, 0.22], [0, 0.7, 0.4, 1]], fire: [[0.62, 0.58], [0.86, 0.66]], birds: 'none', motes: 'few' },
  'abraham-2': { stars: [[0, 0, 1, 0.18], [0, 0.18, 0.1, 0.8]], water: [[0, 0.86, 0.6, 1]], birds: 'doves', motes: 'few' },

  /* 출애굽 여정 */
  'exodus-0': { water: [[0.8, 0.2, 1, 1]], boats: 0, haze: [[0.3, 0.3, 0.8, 1]], birds: 'gulls', motes: 'few' },
  'exodus-1': { water: [[0.02, 0.46, 0.33, 0.64]], smoke: [[0.86, 0.05]], haze: [[0.3, 0.3, 0.9, 0.9]], birds: 'none', motes: 'few' },
  'exodus-2': { haze: [[0.2, 0.3, 1, 1]], birds: 'none', motes: 'few' },
  'exodus-3': { water: [[0, 0.08, 1, 0.3]], boats: 1, boatKind: 'sail', haze: [[0.1, 0.4, 0.9, 0.6]], birds: 'gulls', motes: 'few' },

  /* 바울의 전도 여정 */
  'paul-0': { water: [[0.05, 0.3, 0.55, 0.52], [0.05, 0.55, 0.5, 0.75]], boats: 2, boatKind: 'sail', birds: 'gulls', motes: 'few' },
  'paul-1': { water: [[0.15, 0.2, 0.6, 0.6], [0.1, 0.65, 0.5, 0.9]], boats: 2, boatKind: 'sail', birds: 'gulls', motes: 'few' },
  'paul-2': { water: [[0.02, 0.1, 0.4, 0.6], [0.3, 0.8, 0.9, 0.98]], boats: 2, boatKind: 'sail', birds: 'gulls', motes: 'few' },
  'paul-3': { water: [[0.4, 0.08, 0.98, 0.48], [0.5, 0.5, 0.98, 0.7]], boats: 1, boatKind: 'sail', birds: 'gulls', lightning: [0.35, 0.05, 1, 0.5], motes: 'none' },

  /* 베드로의 길 */
  'peter-0': { water: [[0.05, 0.78, 0.6, 0.95]], boats: 1, boatKind: 'fishing', birds: 'doves', motes: 'few' },
  'peter-1': { birds: 'doves', motes: 'few' },
  'peter-2': { water: [[0.6, 0, 1, 0.28]], birds: 'doves', motes: 'few' },
  'peter-3': { haze: [[0, 0.3, 1, 0.8]], birds: 'doves', motes: 'few' },
  'peter-4': { water: [[0.3, 0.25, 0.75, 0.6]], boats: 1, boatKind: 'sail', birds: 'gulls', motes: 'few' },
}

export const panelAmbient = (journeyId: string, tierIndex: number): PanelAmbient =>
  PANEL_AMBIENT[`${journeyId}-${tierIndex}`] ?? { birds: 'doves', motes: 'few' }

/* 길 위를 지나가는 것들 — 여정마다 하나. 길(베지어)을 그대로 따라 움직인다.
 *   아브라함  낙타 행렬        출애굽  구름 기둥(앞서 간다)
 *   예수      양 떼            바울    (배는 물에만 — 길 위엔 갈매기 그림자 대신 아무것도)
 *   베드로    양 한 마리 */
export type WalkerKind = 'camels' | 'cloud' | 'sheep' | 'none'
export const JOURNEY_WALKER: Record<string, WalkerKind> = {
  abraham: 'camels',
  exodus: 'cloud',
  jesus: 'sheep',
  paul: 'none',
  peter: 'sheep',
}
