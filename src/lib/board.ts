import type { Journey, JourneyEpisode, JourneyTier } from '../data/geo/journeys'
import { journeyProgress, toRealKm } from '../data/geo/journeys'
import { stopStateAt, type StopState } from './quest'

/* ── 퀘스트 보드 레이아웃 ────────────────────────────────────────────────────
 *
 * 지도는 **세로로 내려가는 보드**다. 장(章) 하나가 패널 한 장이고, 패널을 위에서 아래로
 * 이어 붙이면 그 여정의 월드가 된다. 길은 모든 자리를 하나의 구불구불한 선으로 잇고,
 * 패널 경계를 넘어도 끊기지 않는다.
 *
 * 왜 실좌표 투영을 버렸나: 예수님의 사역 길은 자리 33개가 갈릴리·유대의 좁은 땅에서
 * 수십 번 겹쳐 지나간다. 실좌표로 그리면 어떤 축척에서도 선이 제 몸을 가로지르는 매듭이
 * 됐고, 장 단위로 잘라 그리면 장과 장이 서로 이어지지 않았다(사용자 지적: "서로 이어지지도
 * 않고, 줄로 이으니 더 이상해졌다"). 지리는 **패널 그림**이 말한다 — 장마다 그 땅을 그린
 * 월드맵 패널이 깔리고, 순서는 길이 말한다. 게임의 월드맵이 늘 그렇게 한다.
 *
 * 좌표계는 고정 폭 BOARD_W의 논리 px다. 화면 폭에 맞춰 컴포넌트가 통째로 scale한다
 * (선·글자·그림의 비율이 어느 폰에서든 같아야 한다). */

export const BOARD_W = 440
/** 자리 사이 세로 간격 */
const STEP = 104
/** 패널 위쪽 여백(장 리본이 앉는 자리) / 아래쪽 여백 */
const PAD_TOP = 118
const PAD_BOTTOM = 74
/** 패널 최소 높이 — 자리가 하나뿐인 장도 그 땅이 보여야 한다(우르의 밤이 띠 하나로 잘리면 안 된다) */
const MIN_PANEL_H = 420
/** 패널 그림의 비율(9:16) — cover로 깔 때 어디가 잘리는지 계산하는 데 쓴다 */
export const PANEL_IMG_RATIO = 16 / 9
/** 뱀길의 좌우 진폭 */
const AMP = 118
const CX = BOARD_W / 2

export interface BoardNode {
  ep: JourneyEpisode
  /** journey.episodes 안의 인덱스 */
  index: number
  state: StopState
  x: number
  y: number
  tierIndex: number
  /** 이 자리까지 내가 더 달려야 하는 실제 km(닿은 자리는 0) */
  realKmAway: number
}

export interface BoardPanel {
  tierIndex: number
  tier: JourneyTier
  y: number
  height: number
  nodes: BoardNode[]
  /** 이 장의 상태 — 다 걸었나 / 걷는 중 / 아직 봉인 */
  status: 'done' | 'now' | 'sealed'
}

export interface Board {
  panels: BoardPanel[]
  nodes: BoardNode[]
  height: number
  /** 지금 서 있는 자리 / 다음 자리 */
  current?: BoardNode
  next?: BoardNode
  /** 지금 구간 진행 0~1 */
  segProgress: number
  reachedCount: number
  total: number
}

/** 결정론적 흔들림 — 같은 자리는 언제나 같은 곳에 있어야 한다 */
const jitter = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x) - 0.5
}

/** 장의 경계 — tier.fromEpisode/toEpisode를 인덱스 구간으로 */
export function tierRanges(journey: Journey): { tier: JourneyTier; from: number; to: number }[] {
  const at = (k: string) => journey.episodes.findIndex((e) => e.id === k || e.place === k)
  const out: { tier: JourneyTier; from: number; to: number }[] = []
  journey.tiers.forEach((tier) => {
    const from = at(tier.fromEpisode)
    const to = at(tier.toEpisode)
    if (from >= 0 && to >= from) out.push({ tier, from, to })
  })
  // 어느 장에도 안 걸리는 자리가 있으면 마지막 장에 붙인다(장이 비면 보드에 구멍이 난다)
  if (out.length) {
    const last = out[out.length - 1]
    if (last.to < journey.episodes.length - 1) last.to = journey.episodes.length - 1
  } else {
    out.push({
      tier: { id: 'all', name: journey.name, fromEpisode: '', toEpisode: '', km: journey.totalKm, note: '' },
      from: 0,
      to: journey.episodes.length - 1,
    })
  }
  return out
}

export function buildBoard(journey: Journey, journeyKm: number): Board {
  const p = journeyProgress(journey, journeyKm)
  const ranges = tierRanges(journey)

  const panels: BoardPanel[] = []
  const nodes: BoardNode[] = []
  let y = 0
  let g = 0 // 전역 자리 순번 — 뱀길의 위상은 패널이 아니라 여정 전체로 이어진다

  ranges.forEach(({ tier, from, to }, tierIndex) => {
    const count = to - from + 1
    const contentH = (count - 1) * STEP
    const height = Math.max(MIN_PANEL_H, PAD_TOP + contentH + PAD_BOTTOM + 40)
    // 자리들을 패널 세로 가운데에 — 리본 자리만큼 살짝 아래로
    const startY = y + (height - contentH) / 2 + 22
    const panelNodes: BoardNode[] = []
    for (let i = 0; i < count; i++) {
      const index = from + i
      const ep = journey.episodes[index]
      /* 뱀길: 사인파 위상이 자리마다 조금씩 진행한다. 한 패널 안에서 두어 번 굽이친다.
         작은 흔들림을 더해 줄자로 그린 선이 아니라 사람이 걸은 길처럼 보이게 한다. */
      const phase = g * 0.78 + 0.9
      const x = CX + AMP * Math.sin(phase) + jitter(index, 3) * 22
      const ny = startY + i * STEP + jitter(index, 7) * 14
      const node: BoardNode = {
        ep,
        index,
        state: stopStateAt(index, p.reachedCount),
        x: Math.max(64, Math.min(BOARD_W - 64, x)),
        y: ny,
        tierIndex,
        realKmAway: index < p.reachedCount ? 0 : toRealKm(journey.id, Math.max(0, ep.cumulativeKm - journeyKm)),
      }
      panelNodes.push(node)
      nodes.push(node)
      g++
    }
    const firstState = panelNodes[0].state
    const lastIdx = panelNodes[panelNodes.length - 1].index
    const status: BoardPanel['status'] =
      lastIdx < p.reachedCount - 1 || (p.done && lastIdx <= p.reachedCount - 1)
        ? 'done'
        : firstState === 'sealed'
          ? 'sealed'
          : 'now'
    panels.push({ tierIndex, tier, y, height, nodes: panelNodes, status })
    y += height
  })

  const current = nodes.find((n) => n.state === 'current')
  const next = nodes.find((n) => n.state === 'next')
  return {
    panels,
    nodes,
    height: y,
    current,
    next,
    segProgress: p.segProgress,
    reachedCount: p.reachedCount,
    total: p.total,
  }
}

export type Pt = [number, number]

/** Catmull-Rom → 3차 베지어. 장력은 낮게 — 출렁이면 길이 아니라 리본이 된다. */
const TENSION = 0.3
function ctrl(p: Pt[], i: number) {
  const p0 = p[i - 1] ?? p[i]
  const p1 = p[i]
  const p2 = p[i + 1]
  const p3 = p[i + 2] ?? p2
  return {
    p1,
    p2,
    c1: [p1[0] + (p2[0] - p0[0]) * TENSION, p1[1] + (p2[1] - p0[1]) * TENSION] as Pt,
    c2: [p2[0] - (p3[0] - p1[0]) * TENSION, p2[1] - (p3[1] - p1[1]) * TENSION] as Pt,
  }
}

/* 길의 경유점.
 * 자리 사이가 멀면(패널 경계를 넘거나 자리가 하나뿐인 장) 두 점을 그냥 이으면 자를 댄 직선이
 * 된다 — 우르에서 하란까지 곧은 선 하나. 긴 구간에는 옆으로 비켜선 경유점을 끼워 길이 굽이치게
 * 한다. 경유점은 자리가 아니므로 길 위에 아무것도 놓이지 않는다. */
export function boardRoute(nodes: { x: number; y: number; index: number }[]): { route: Pt[]; nodeAt: number[] } {
  const route: Pt[] = []
  const nodeAt: number[] = []
  nodes.forEach((n, i) => {
    if (i > 0) {
      const prev = nodes[i - 1]
      const dy = n.y - prev.y
      if (dy > STEP * 1.7) {
        const bends = Math.min(3, Math.floor(dy / (STEP * 1.3)))
        for (let b = 1; b <= bends; b++) {
          const t = b / (bends + 1)
          const side = (b + i) % 2 === 0 ? 1 : -1
          const lerpX = prev.x + (n.x - prev.x) * t
          const x = Math.max(54, Math.min(BOARD_W - 54, lerpX + side * (70 + jitter(n.index * 7 + b, 5) * 40)))
          route.push([x, prev.y + dy * t])
        }
      }
    }
    nodeAt.push(route.length)
    route.push([n.x, n.y])
  })
  return { route, nodeAt }
}

export function boardPath(pts: Pt[]): string {
  if (pts.length === 0) return ''
  if (pts.length === 1) return `M${pts[0][0]},${pts[0][1]}`
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const { p2, c1, c2 } = ctrl(pts, i)
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  return d
}

/** 자리와 자리 사이의 곡선(경유점 포함) — 순례자 말을 길 위 정확한 점에 세우려고 구간 길이를 하나씩 잰다.
 *  전체 길과 **같은 접선**을 써야 구간을 이어 붙인 것이 전체 길과 일치한다. */
export function boardSegments(route: Pt[], nodeAt: number[]): string[] {
  const out: string[] = []
  for (let n = 0; n < nodeAt.length - 1; n++) {
    const a = nodeAt[n]
    const b = nodeAt[n + 1]
    let d = `M${route[a][0].toFixed(1)},${route[a][1].toFixed(1)}`
    for (let i = a; i < b; i++) {
      const { p2, c1, c2 } = ctrl(route, i)
      d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
    }
    out.push(d)
  }
  return out
}

/** 로마 숫자 — 장 리본에 새긴다 */
export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

/* 그림 비율 좌표 → 패널 논리 좌표.
 * 패널 그림(9:16)은 object-fit: cover로 깔린다. 패널이 그림보다 납작하면 위아래가 잘리고,
 * 그림보다 길쭉하면 좌우가 잘린다. 그림 위의 "물은 여기"를 화면의 어디인지로 옮긴다. */
export function imageRectToPanel(rect: [number, number, number, number], panelH: number): { x: number; y: number; w: number; h: number } | null {
  const natH = BOARD_W * PANEL_IMG_RATIO
  let imgW = BOARD_W
  let imgH = natH
  let offX = 0
  let offY = 0
  if (panelH <= natH) {
    offY = -(natH - panelH) / 2
  } else {
    imgH = panelH
    imgW = panelH / PANEL_IMG_RATIO
    offX = -(imgW - BOARD_W) / 2
  }
  const x0 = offX + rect[0] * imgW
  const y0 = offY + rect[1] * imgH
  const x1 = offX + rect[2] * imgW
  const y1 = offY + rect[3] * imgH
  // 패널 밖은 잘라낸다
  const cx0 = Math.max(0, x0)
  const cy0 = Math.max(0, y0)
  const cx1 = Math.min(BOARD_W, x1)
  const cy1 = Math.min(panelH, y1)
  if (cx1 - cx0 < 24 || cy1 - cy0 < 24) return null
  return { x: cx0, y: cy0, w: cx1 - cx0, h: cy1 - cy0 }
}
