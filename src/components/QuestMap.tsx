import { useEffect, useId, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { QuestStop } from '../lib/quest'
import MapTexture from './MapTexture'
import MapNode, { ChapterMark } from './MapNode'
import { skinOf, MAP_INK } from '../lib/journeySkin'
import { terrainArt } from '../assets/art'

/* ── 살아있는 여정 지도 ─────────────────────────────────────────────────────
 *
 * 이 앱을 여는 이유는 하나다 — **"내가 그 길 어디쯤 와 있나."**
 * 그런데 홈에는 그게 없었다. 정적 씬 일러스트 한 장과 텍스트 카드가 있었고, 지도는
 * 러닝 중과 리빌에서만 나왔다. MASTERPLAN이 P0로 못박은 "홈이 살아있는 여정 지도"가
 * 정작 홈에 없었던 셈이다. 이 컴포넌트가 그 자리를 되찾는다.
 *
 * 지도는 **실좌표**로 그린다(에피소드의 lat/lng). 꾸며낸 곡선이 아니라 아브라함이 걸은
 * 실제 지리의 모양이라는 것이 이 제품의 유일한 해자다 — 모양을 지어내면 그게 사라진다.
 *
 * 게임의 뼈, 순례의 살(DECISIONS D3):
 *   · 닿은 자리 → 금 인장이 찍혀 있다
 *   · 지금 자리 → 등불이 켜져 있다
 *   · 다음 자리 → 봉인. 남은 거리가 숫자로 붙는다. 이 한 점이 화면에서 가장 밝다
 *   · 그 너머 → 라피스 안개. "아직 열리지 않았다"를 색의 면으로 말한다
 * 어휘는 전부 순례어다(자리·인장·봉인). 레벨·클리어·보스는 쓰지 않는다. */

export interface QuestMapProps {
  stops: QuestStop[]
  /** 지금 구간을 얼마나 걸어왔나 0~1 */
  segProgress: number
  /** 아직 한 자리도 못 닿았는가 — 내 토큰을 길 맨 앞에 세운다 */
  atStart: boolean
  units: string
  /** 어느 길인가 — 그 땅의 밤(배경·지형)이 달라진다 */
  journeyId: string
  /* 자리를 누를 수 있게 할지.
     **접힌 지도(홈)와 펼친 지도(전체)의 차이가 여기 있다.** 홈의 지도는 한 번 탭하면
     지도를 여는 하나의 버튼이다(작은 창에 버튼을 여섯 개 겹쳐 놓으면 오탭만 는다).
     펼친 지도에서는 자리 하나하나가 퀘스트 입구가 된다 — 누르면 그 자리의 상세로 간다. */
  onSelectStop?: (episodeId: string) => void
  /* ── 월드맵 모드 ──────────────────────────────────────────────────────
     여정 **전체**를 한 장에 펼칠 때 켠다. 장 하나를 볼 때와 그리는 규칙이 아예 다르다.

     전체를 장과 똑같이 그렸더니 못 봐줄 물건이 나왔다(직접 찍어 확인했다): 예수님의 사역 길
     자리 33개가 갈릴리·유대에 몰려 금 동전 한 덩어리가 되고, 주축으로 눕힌 점구름이
     납작해서 카드 위아래 3분의 2가 통째로 비었다.

     그래서 월드맵은 **지형의 지도**가 아니라 **구역의 지도**로 그린다. 게임의 월드맵이
     그렇다 — 월드맵에는 지역이 찍히고, 개별 칸은 그 지역에 들어가야 보인다:
       · 카드 높이를 점구름 비율에서 뽑는다(빈 공간이 안 생기고 길이 폭을 꽉 쓴다)
       · 자리는 전부 **작은 점**으로. 걸어온 곳은 금, 아직인 곳은 흐린 점
       · **장이 시작되는 자리에만** 번호 붙은 표식을 세운다(7개 — 셀 수 있다)
       · 표식을 누르면 그 장의 지도로 들어간다
     지금 서 있는 자리와 다음 자리는 월드맵에서도 크게 남는다 — 이 화면의 주인공이니까. */
  world?: boolean
  /** 장 표식 — { 장 번호(0-based), 그 장이 시작되는 stops 안의 위치 } */
  chapterMarks?: { tier: number; stopIndex: number }[]
  onSelectChapter?: (tierIndex: number) => void
  height?: number
  className?: string
}

const W = 340

/* 위경도를 화면 좌표로.
 *
 * 두 가지를 지킨다.
 *  1) 위도에 따라 좁아지는 경도 간격을 보정한다(안 하면 길 모양이 옆으로 뭉개진다).
 *  2) **종횡비를 절대 왜곡하지 않는다.** 늘여서 채우면 그건 실제 지리가 아니라 거짓 지도이고,
 *     이 제품이 다른 러닝 앱과 다른 유일한 근거가 사라진다.
 *
 * 대신 **회전**은 한다. 베드로의 길처럼 남북으로 긴 구간을 세로로 그대로 그리면 카드 양옆이
 * 통째로 비고 길은 가운데 6px 낙서가 된다. 점구름의 주축(PCA)을 가로로 눕히면 같은 모양 그대로
 * 카드를 꽉 채운다. 회전은 강체 변환이라 거리·각도·모양이 하나도 안 변한다 —
 * 종이 지도를 돌려 보는 것과 같다. 대신 나침반이 함께 돌아 북쪽을 정직하게 가리킨다. */
function project(stops: QuestStop[], H: number, pad: number, minSep: number) {
  const lats = stops.map((s) => s.ep.lat)
  const lngs = stops.map((s) => s.ep.lng)
  const midLat = (Math.min(...lats) + Math.max(...lats)) / 2
  const k = Math.cos((midLat * Math.PI) / 180)

  const raw = lngs.map((lng, i) => [lng * k, -lats[i]] as [number, number]) // 북쪽이 위로

  // 주축 각도 — 공분산 행렬의 주고유벡터
  const n = raw.length
  const mx = raw.reduce((a, p) => a + p[0], 0) / n
  const my = raw.reduce((a, p) => a + p[1], 0) / n
  let sxx = 0
  let syy = 0
  let sxy = 0
  for (const [x, y] of raw) {
    sxx += (x - mx) ** 2
    syy += (y - my) ** 2
    sxy += (x - mx) * (y - my)
  }
  const theta = 0.5 * Math.atan2(2 * sxy, sxx - syy)
  const cos = Math.cos(-theta)
  const sin = Math.sin(-theta)
  const rot = raw.map(([x, y]) => {
    const dx = x - mx
    const dy = y - my
    return [dx * cos - dy * sin, dx * sin + dy * cos] as [number, number]
  })

  const xs = rot.map((p) => p[0])
  const ys = rot.map((p) => p[1])
  const spanX = Math.max(...xs) - Math.min(...xs)
  const spanY = Math.max(...ys) - Math.min(...ys)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)

  const availW = W - pad * 2
  const availH = H - pad * 2
  const scale = Math.min(spanX > 1e-9 ? availW / spanX : Infinity, spanY > 1e-9 ? availH / spanY : Infinity)
  const s = Number.isFinite(scale) ? scale : 1

  const offX = pad + (availW - spanX * s) / 2
  const offY = pad + (availH - spanY * s) / 2

  const placed = xs.map((x, i) => [offX + (x - minX) * s, offY + (ys[i] - minY) * s] as [number, number])

  /* 같은 자리에 겹쳐 놓인 자리를 펼친다.
   *
   * 여정에는 같은 도시를 두 번 이상 지나는 자리가 있다(바울의 에베소 경유/2년 사역,
   * 베다니 두 번, 예루살렘 여러 번). 좌표가 거의 같으니 투영해도 한 점이 되고,
   * 메달리온을 아무리 줄여도 서로 위에 포개진다 — 실제로 금 동전 셋이 한 덩어리로 보였다.
   * 크기 조절로는 못 푸는 문제라 위치를 푼다.
   *
   * 겹친 자리를 그 지점의 **길 방향에 수직으로** 조금씩 밀어낸다. 순서대로 번갈아 밀므로
   * 지리는 거의 그대로이면서(수십 m 수준의 표시상 오차) 자리는 세어진다.
   * 지도가 아니라 **말판**이 되어야 하는 지점이다 — 칸은 셀 수 있어야 한다. */
  /* 임계값은 **아주 작게** 잡는다.
     처음엔 22로 두었는데, 예수님의 사역 길은 자리 33개가 갈릴리·유대 좁은 지역에 몰려 있어서
     거의 모든 쌍이 임계값에 걸렸다. 밀어내기가 연쇄되며 자리들이 가로로 일렬이 됐다 —
     겹침은 풀렸지만 지리가 거짓말이 됐고, 애벌레처럼 보였다.
     풀어야 할 것은 **사실상 같은 점**(같은 도시 재방문)뿐이다. 그 외의 근접은 실제 지리이므로
     건드리지 않는다 — 가까운 자리는 가깝게 보이는 것이 맞다.

     다만 임계값은 **보기 모드마다 다르다**. 월드맵은 자리가 3px짜리 점이라 7이면 충분하지만,
     장 지도의 자리는 손가락으로 누르는 지름 12~15의 메달리온이다. 7로 두었더니
     갈릴리의 자리 다섯이 금 동전 한 덩어리로 붙어 어느 것을 누르는지 알 수 없었다.
     눌러야 하는 것은 서로 떨어져 있어야 한다 — 자리 아홉 이하의 장에서는 안전한 거리다. */
  const MIN_SEP = minSep
  for (let i = 1; i < placed.length; i++) {
    for (let k = 0; k < i; k++) {
      const dx = placed[i][0] - placed[k][0]
      const dy = placed[i][1] - placed[k][1]
      const dist = Math.hypot(dx, dy)
      if (dist >= MIN_SEP) continue
      // 길 방향(이전 자리 → 이 자리)의 수직 방향으로 민다. 방향이 없으면 가로로.
      const prev = placed[i - 1]
      let vx = placed[i][0] - prev[0]
      let vy = placed[i][1] - prev[1]
      if (Math.hypot(vx, vy) < 0.01) {
        vx = 1
        vy = 0
      }
      const len = Math.hypot(vx, vy)
      const push = (MIN_SEP - dist) * 0.6 + 5
      const sign = i % 2 === 0 ? 1 : -1
      placed[i] = [placed[i][0] + (-vy / len) * push * sign, placed[i][1] + (vx / len) * push * sign]
    }
  }
  // 밀다가 카드 밖으로 나가지 않게 되돌린다
  for (const q of placed) {
    q[0] = Math.max(10, Math.min(W - 10, q[0]))
    q[1] = Math.max(12, Math.min(H - 12, q[1]))
  }

  return {
    pts: placed,
    /** 화면에서 북쪽이 향하는 각도(도). 나침반 바늘이 이만큼 돌아야 정직해진다. */
    northDeg: (-theta * 180) / Math.PI,
    /** 회전이 끝난 점구름의 가로·세로 폭. 월드맵은 이 비율로 카드 높이를 정한다. */
    spanX,
    spanY,
  }
}

/** 장력 — 너무 높이면 길이 출렁여서 지리가 거짓말이 된다. 아래 두 함수가 같은 값을 써야 한다. */
const TENSION = 0.2

/** 구간 하나의 베지어 제어점 */
function ctrl(p: [number, number][], i: number) {
  const p0 = p[i - 1] ?? p[i]
  const p1 = p[i]
  const p2 = p[i + 1]
  const p3 = p[i + 2] ?? p2
  return {
    p1,
    p2,
    c1: [p1[0] + (p2[0] - p0[0]) * TENSION, p1[1] + (p2[1] - p0[1]) * TENSION] as [number, number],
    c2: [p2[0] - (p3[0] - p1[0]) * TENSION, p2[1] - (p3[1] - p1[1]) * TENSION] as [number, number],
  }
}

/** 구간별 곡선 — 토큰을 길 위에 정확히 세우려고 하나씩 실제 길이를 잰다 */
function smoothSegments(p: [number, number][]): string[] {
  const out: string[] = []
  for (let i = 0; i < p.length - 1; i++) {
    const { p1, p2, c1, c2 } = ctrl(p, i)
    out.push(
      `M${p1[0].toFixed(1)},${p1[1].toFixed(1)} C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`,
    )
  }
  return out
}

/** Catmull-Rom → 3차 베지어. 꺾인 폴리라인이 아니라 사람이 걸은 길처럼 보이게. */
function smoothPath(p: [number, number][]): string {
  if (p.length === 0) return ''
  if (p.length === 1) return `M${p[0][0]},${p[0][1]}`
  let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`
  for (let i = 0; i < p.length - 1; i++) {
    const { p2, c1, c2 } = ctrl(p, i)
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  return d
}

export default function QuestMap({
  stops,
  segProgress,
  atStart,
  units,
  journeyId,
  onSelectStop,
  world = false,
  chapterMarks,
  onSelectChapter,
  height = 234,
  className = '',
}: QuestMapProps) {
  const uid = useId().replace(/:/g, '')
  const skin = skinOf(journeyId)
  const terrain = terrainArt(journeyId)
  const reduce = useReducedMotion()
  const roadRef = useRef<SVGPathElement>(null)
  const walkedRef = useRef<SVGPathElement>(null)
  const shadowRef = useRef<SVGPathElement>(null)
  const [me, setMe] = useState<[number, number] | null>(null)

  /* 월드맵의 카드 높이는 **점구름의 비율**에서 뽑는다.
     고정 높이로 두면 주축으로 눕힌 길이 가운데 가로 띠 하나가 되고 위아래가 통째로 빈다
     (실제로 그랬다 — 카드의 3분의 2가 빈 종이였다). 비율대로 낮추면 같은 지도가
     띠 모양 카드를 꽉 채운다. 종횡비는 여전히 손대지 않는다 — 카드가 데이터에 맞출 뿐이다. */
  const padBase = world ? 26 : 34
  const minSep = world ? 7 : 21
  const preSpan = stops.length ? project(stops, height, padBase, minSep) : undefined
  const H =
    world && preSpan && preSpan.spanX > 1e-9
      ? Math.round(
          Math.max(206, Math.min(height, padBase * 2 + (W - padBase * 2) * (preSpan.spanY / preSpan.spanX))),
        )
      : height
  /* 크기는 **자리 개수가 아니라 자리 사이의 실제 간격**에서 뽑는다.
   *
   * 개수로 정했더니(자리 10개 넘으면 0.62배) 바울의 길이 무너졌다: 28자리 전체로 지도를
   * 맞추는데 걸어온 8자리는 소아시아에 뭉쳐 있어서, 그 구간의 간격이 메달리온 지름보다
   * 좁아졌다 — 금 동전 여덟 개가 서로 위에 포개져 덩어리 하나로 보였다.
   * 같은 개수라도 여정마다 밀도가 다르므로 개수는 크기의 근거가 될 수 없다.
   *
   * 투영이 끝난 뒤 이웃한 자리 사이의 **중앙값 간격**을 재서, 그 간격 안에 메달리온이
   * 여유 있게 들어가도록 배율을 정한다. 어느 여정에서도 겹치지 않는다. */
  const pad = padBase
  const probe = stops.length ? project(stops, H, pad, minSep) : { pts: [], northDeg: 0 }
  const gaps = probe.pts
    .slice(1)
    .map((p, i) => Math.hypot(p[0] - probe.pts[i][0], p[1] - probe.pts[i][1]))
    .sort((a, b) => a - b)
  /* **중앙값이 아니라 좁은 쪽(하위 20%)에 맞춘다.**
     중앙값으로 했더니 바울의 길이 그대로 겹쳤다: 지중해 항해 구간의 큰 간격이 중앙값을
     끌어올려서, 소아시아에 뭉친 자리들의 실제 간격은 반영되지 않았기 때문이다.
     자리는 **가장 좁은 곳에서도** 안 겹쳐야 하므로 기준은 아래쪽 분위수여야 한다. */
  const tightGap = gaps.length ? gaps[Math.max(0, Math.floor(gaps.length * 0.2))] : 60
  const spread = gaps.length ? gaps[gaps.length - 1] : 60
  /* 배율 1일 때 다음 자리 메달리온의 지름이 30이다. 좁은 간격 안에 그 지름이 들어가게 둔다. */
  /* 자리가 적은 장에서는 하한을 올린다 — 가까운 한 쌍 때문에 전체가 작아지면
     자리 넷짜리 장이 좁쌀처럼 보인다(실제로 그랬다). */
  const minScale = stops.length <= 8 ? 0.58 : 0.3
  /* 월드맵에서는 간격에서 크기를 뽑지 않는다.
     간격에 맞추면 자리가 몰린 여정에서 표식이 좁쌀이 되는데, 월드맵에 서는 것은
     33개가 아니라 장 표식 7개 + 지금/다음 둘뿐이라 서로 겹칠 일이 없다.
     읽히는 크기로 고정하는 것이 맞다. */
  const nodeScale = world ? 0.66 : Math.max(minScale, Math.min(1, (tightGap * 0.9) / 30))
  const road = world ? 5 : Math.max(4, Math.min(12, tightGap * 0.34))
  const dense = world || nodeScale < 0.7
  const fogR = Math.max(18, Math.min(70, spread * 0.5))
  const projected = probe
  const pts = projected.pts
  const d = smoothPath(pts)

  /* 어느 자리에 표식이 서는가 — stops 안의 위치 → 장 번호(0-based) */
  const markAt = new Map<number, number>()
  if (world && chapterMarks) for (const m of chapterMarks) markAt.set(m.stopIndex, m.tier)

  /* 표식이 서는 자리를 **서로 밀어낸다**.
   *
   * 장이 시작되는 자리는 지리적으로 몰려 있다(예수님의 길은 예루살렘을 여러 번 지난다).
   * 그대로 세웠더니 방패 넷이 한 덩어리가 되고, 그 밑에 지금 서 있는 자리의 메달리온이
   * 통째로 묻혔다 — 직접 찍어 보고 알았다.
   *
   * 지도의 오래된 해법을 쓴다: **점은 제자리에 두고 표식만 비켜 세운 뒤 가는 선으로 잇는다.**
   * 지리는 점이 지키고(한 픽셀도 안 옮긴다), 읽히는 것은 표식이 맡는다.
   * 원래 자리로 당기는 힘을 함께 걸어 표식이 엉뚱한 데까지 흘러가지 않게 한다. */
  const markList = world
    ? pts
        .map((p, i) => ({ i, home: p }))
        .filter(({ i }) => markAt.has(i) || stops[i].state === 'current' || stops[i].state === 'next')
    : []
  const markPos: [number, number][] = markList.map(({ home }) => [home[0], home[1]])
  if (markList.length > 1) {
    /* 벌리는 힘은 세게, 제자리로 당기는 힘은 약하게.
       처음엔 반대로 잡았다가(36 / 0.06) 예루살렘처럼 자리가 몰린 곳에서 방패 둘이
       계속 붙어 있었다 — 당기는 힘이 벌린 만큼을 도로 끌어왔기 때문이다.
       표식이 가리키는 지점은 리더선이 책임지므로, 표식 자체는 멀리 나가도 된다. */
    const MIN = 46
    for (let iter = 0; iter < 260; iter++) {
      for (let a = 0; a < markPos.length; a++) {
        for (let b = a + 1; b < markPos.length; b++) {
          const dx = markPos[b][0] - markPos[a][0]
          const dy = markPos[b][1] - markPos[a][1]
          const dist = Math.hypot(dx, dy) || 0.001
          if (dist >= MIN) continue
          const push = ((MIN - dist) / dist) * 0.5
          markPos[a][0] -= dx * push
          markPos[a][1] -= dy * push
          markPos[b][0] += dx * push
          markPos[b][1] += dy * push
        }
      }
      // 원래 지점으로 당기는 힘 — 표식이 제 땅에서 멀어지지 않게
      for (let a = 0; a < markPos.length; a++) {
        markPos[a][0] += (markList[a].home[0] - markPos[a][0]) * 0.012
        markPos[a][1] += (markList[a].home[1] - markPos[a][1]) * 0.012
        markPos[a][0] = Math.max(20, Math.min(W - 20, markPos[a][0]))
        markPos[a][1] = Math.max(30, Math.min(H - 16, markPos[a][1]))
      }
    }
  }
  const markIndex = new Map(markList.map((m, k) => [m.i, k]))

  /* 그리는 순서 = 겹칠 때 누가 위에 오는가.
     장 표식 → 다음 자리 → 지금 자리. 지금 서 있는 자리가 방패 밑에 묻히면
     이 화면이 대답해야 할 단 하나의 질문("내가 어디 있나")이 사라진다. */
  const rank = (i: number) => (stops[i].state === 'current' ? 3 : stops[i].state === 'next' ? 2 : 1)
  const renderOrder = world
    ? markList.map((m) => m.i).sort((a, b) => rank(a) - rank(b))
    : pts.map((_, i) => i)

  /* 누르면 무슨 일이 일어나는가. 없으면 히트 영역 자체를 안 만든다(투명한 죽은 버튼을 안 남긴다). */
  const tapTarget = (st: QuestStop, chapter?: number): (() => void) | undefined => {
    if (world) {
      if (chapter != null && onSelectChapter) return () => onSelectChapter(chapter)
      // 지금/다음 자리는 월드맵에서도 그 자리로 바로 들어간다 — 오늘의 목표니까
      if (onSelectStop && (st.state === 'current' || st.state === 'next')) return () => onSelectStop(st.ep.id)
      return undefined
    }
    return onSelectStop ? () => onSelectStop(st.ep.id) : undefined
  }

  /* 지형 그림을 **길이 없는 사분면**에 놓는다.
     실좌표는 종횡비를 지켜 그리므로 길이 대각선으로 누우면 두 귀퉁이가 반드시 빈다.
     그 여백을 그냥 두면 "덜 만든 카드"로 보이고, 길 위에 그림을 얹으면 길을 가린다.
     점이 가장 적은 사분면을 골라 거기에만 깐다. */
  /* 내가 서 있는 지점.
   *
   * 처음엔 폴리라인(직선) 누적 길이로 비율을 구해 곡선에 적용했는데, 베지어는 직선보다 길고
   * 그 초과분이 구간마다 다르다 — 굽은 구간에서 토큰이 길 밖에 떠 있었다.
   * 그래서 **구간 곡선을 하나씩 실제로 재서** 누적 길이를 만든다. 자리 6개면 곡선 5개라 싸다. */
  const curIdx = stops.findIndex((s) => s.state === 'current')
  const segRefs = useRef<(SVGPathElement | null)[]>([])

  useEffect(() => {
    const road = roadRef.current
    const walked = walkedRef.current
    if (!road || !walked) return
    const L = road.getTotalLength()
    if (!L) return

    const segLens = segRefs.current.slice(0, Math.max(0, pts.length - 1)).map((el) => el?.getTotalLength() ?? 0)
    const cum = segLens.reduce<number[]>((acc, len, i) => [...acc, acc[i] + len], [0])

    let done = 0
    if (!atStart && curIdx >= 0) {
      if (curIdx >= pts.length - 1) done = L
      else {
        const t = Math.min(1, Math.max(0, segProgress))
        done = cum[curIdx] + (cum[curIdx + 1] - cum[curIdx]) * t
      }
    }
    done = Math.min(L, Math.max(0, done))

    const pt = road.getPointAtLength(done)
    setMe([pt.x, pt.y])

    // 걸어온 길이 앞에서부터 차오른다 — 거리가 곧 이야기라는 걸 눈으로 보여주는 유일한 장면
    walked.style.strokeDasharray = `${done} ${L}`
    if (shadowRef.current) {
      shadowRef.current.style.strokeDasharray = `${done} ${L}`
      shadowRef.current.style.strokeDashoffset = '0'
    }
    if (reduce) {
      walked.style.strokeDashoffset = '0'
      return
    }
    walked.style.strokeDashoffset = String(done)
    walked.getBoundingClientRect()
    walked.style.transition = 'stroke-dashoffset 1200ms cubic-bezier(0.22,1,0.36,1)'
    requestAnimationFrame(() => {
      walked.style.strokeDashoffset = '0'
    })
  }, [d, curIdx, segProgress, atStart, pts.length, reduce])

  if (!stops.length) return null

  return (
    /* 지도는 **라피스 야경 패널**이다 — 테마를 따라가지 않고 항상 어둡다.
     *
     * 처음엔 카드도 양피지색으로 뒀는데, 측정해 보니 그게 화면을 더 밋밋하게 만들었다:
     * 예전 홈은 어두운 씬 일러스트 덕에 명도 폭이 22였는데 창백한 지도로 바꾸니 9로 떨어졌고,
     * 찬 색 비율은 0.1%에 머물렀다. 즉 "지루하다·너무 따뜻하다"를 오히려 악화시켰다.
     *
     * 양피지 페이지 위에 채색 필사본의 미니어처 한 칸이 박혀 있는 형태로 바꾼다.
     * 이게 DESIGN-DETAILS의 "The Illuminated Path" 시그니처이고, 07-27에 재작업한 랜딩이
     * 이미 그 모습이다(라피스 여정선 + 금 이정표). 앱이 랜딩과 같은 얼굴을 갖게 된다. */
    <div
      className={`relative overflow-hidden rounded-[28px] ${className}`}
      style={{
        background: `linear-gradient(165deg, ${skin.from} 0%, ${skin.to} 100%)`,
        /* 테두리(ring)를 뺐다. 선으로 가두면 유리 카드가 되고, 그게 "딱딱하다"의 정체다.
           대신 안쪽으로 스며드는 그림자와 아래로 떨어지는 부드러운 그림자로 경계를 만든다 —
           책에 붙인 채색 삽화 한 장처럼. */
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,.5), 0 1px 2px rgba(80,60,30,.10), 0 16px 32px -22px rgba(80,60,30,.45)',
      }}
    >
      {/* 그 땅을 위에서 내려다본 그림 — 지도가 빈 종이가 아니라 **땅**이 된다.
          위에 얹는 것이 아니라 **밑에 깐다**: 길과 자리는 언제나 그림보다 앞이다.
          채도를 조금 빼고 종이색과 섞어, 그림이 주장하지 않고 배경으로 물러나게 한다. */}
      {terrain && (
        <img
          src={terrain}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ opacity: 0.62, filter: 'saturate(0.72)' }}
        />
      )}
      <svg viewBox={`0 0 ${W} ${H}`} className="relative block w-full" role="img" aria-label="여정 지도">
        <defs>
          {/* 봉인 안개 — 아직 열리지 않은 자리 위에 라피스를 **면**으로 얹는다.
              앱 7화면의 유채색이 100% 적–황이었다. 찬 색이 면으로 들어와야 온기도 온기로 읽힌다.
              처음엔 "오른쪽이 미래"라고 보고 세로 띠로 덮었는데, 실좌표 지도에서는 다음 자리가
              왼쪽일 수도 위일 수도 있다 — 베드로의 길에서 안개가 이미 걸어온 구간을 덮었다.
              그래서 방향을 가정하지 않고 **봉인된 자리마다** 안개를 깐다. */}
          {/* 어두운 패널 위에서 안개는 '더 어두워지는 것'이다 — 밝게 덮으면 빛으로 읽힌다 */}
          {/* 아직 열리지 않은 구역.
              어두운 패널일 때는 그늘로 덮었는데, 밝은 종이 위에서는 그게 **얼룩**으로 읽혔다.
              종이색으로 바래게 한다 — 아직 그려 넣지 않은 면. 필사본에서 미완성 구역이
              그렇게 보인다. 덮는 게 아니라 아직 안 채운 것이다. */}
          <radialGradient id={`fog${uid}`}>
            <stop offset="0%" stopColor={skin.from} stopOpacity="0.9" />
            <stop offset="55%" stopColor={skin.from} stopOpacity="0.5" />
            <stop offset="100%" stopColor={skin.from} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`lamp${uid}`}>
            <stop offset="0%" stopColor={MAP_INK.lamp} stopOpacity="0.4" />
            <stop offset="100%" stopColor={MAP_INK.lamp} stopOpacity="0" />
          </radialGradient>

          {/* 자리 메달리온의 면.
              MapNode가 이 셋을 참조한다. 없으면 url(#...)이 아무 데도 안 걸려서
              **면이 투명으로 빠지고 테두리만 남는다** — 실제로 그래서 지도가
              작고 검은 링 몇 개짜리 낙서로 보였다. 정의를 빠뜨린 것이 원인이었다. */}
          <radialGradient id={`face-gold-${uid}`} cx="35%" cy="28%" r="80%">
            <stop offset="0%" stopColor="#ffe9a8" />
            <stop offset="52%" stopColor={MAP_INK.seal} />
            <stop offset="100%" stopColor="#b47d15" />
          </radialGradient>
          <radialGradient id={`face-lock-${uid}`} cx="35%" cy="28%" r="82%">
            <stop offset="0%" stopColor="#4a5cc4" />
            <stop offset="55%" stopColor={MAP_INK.sealedFill} />
            <stop offset="100%" stopColor="#141d4e" />
          </radialGradient>
          <radialGradient id={`halo-${uid}`}>
            <stop offset="0%" stopColor={MAP_INK.lamp} stopOpacity="0.42" />
            <stop offset="60%" stopColor={MAP_INK.lamp} stopOpacity="0.14" />
            <stop offset="100%" stopColor={MAP_INK.lamp} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 이 땅의 결 — 여정마다 다르다.
            아브라함은 별(창 15:5), 출애굽은 시내산 능선, 예수는 갈릴리 물결,
            바울은 지중해, 베드로는 성벽. 다섯 길이 색만 다른 같은 화면이 아니게. */}
        /* 생성 아트(바탕 지형·여정 상징)를 지도에 얹었다가 걷어냈다.
           둘 다 정사각 이미지라 하드 엣지가 그대로 보였고, 두 장이 겹치면서 길과 자리가
           그림 속에 묻혔다 — 더 화려해진 게 아니라 더 복잡해졌다. 지도의 주인공은
           길과 자리이지 배경 그림이 아니다. 결은 코드로 그린 MapTexture만 남긴다
           (여정마다 다르고, 크기에 맞춰 줄고, 길을 절대 안 가린다).
           생성 아트는 큰 자리에서 쓴다 — 여정 카드와 리빌. */
        {!terrain && <MapTexture texture={skin.texture} ink={skin.textureInk} w={W} h={H} />}

        {/* 봉인된 자리마다 안개 한 겹 — 서로 겹치면서 "아직 열리지 않은 구역"이 된다.
            크고 옅게 깔아야 안개가 되고, 작고 진하면 얼룩으로 읽힌다(처음엔 얼룩이었다).
            다만 반경을 고정하면 안 된다: 길 전체를 한 장에 펼치면(자리 서른셋) 반경 78이
            서로 겹쳐 지도를 통째로 덮는다 — 실제로 베드로의 길 전체 지도가 그렇게 뭉갰다.
            자리 수에 반비례로 줄여, 창을 볼 때나 전체를 볼 때나 같은 밀도의 안개가 되게 한다. */}
        {/* 길보다 위에 그린다 — 아래에 깔면 점선이 그대로 비쳐 바랜 느낌이 안 난다 */}
        {!dense &&
          pts.map((p, i) =>
            stops[i].state === 'sealed' ? (
              <circle key={`fog-${stops[i].ep.id}`} cx={p[0]} cy={p[1]} r={fogR} fill={`url(#fog${uid})`} />
            ) : null,
          )}

        {/* ── 길 ────────────────────────────────────────────────────────────
            처음엔 2px 실선 하나였다. 그건 그래프의 선이지 걸어갈 길이 아니다.
            말판의 길처럼 **세 겹**으로 깐다:
              ① 바닥 그림자 — 길이 땅에 눌려 있게
              ② 길바닥 — 밝은 흙길. 폭이 있어야 위에 말을 올릴 수 있다
              ③ 발자국 점선 — 아직 안 간 구간
            그 위에 걸어온 만큼만 라피스 실선이 차오른다. */}
        {/* 아직 가지 않은 길 — **파선**.
            처음엔 dasharray="0.1 8" + round cap으로 점을 찍었는데, 그건 선이 아니라 흩뿌린 점이었다.
            길이 스스로 교차하는 여정(출애굽·바울)에서는 점들이 뒤엉켜 먼지처럼 보였다.
            길이 있는 파선이라야 "길"로 읽힌다. */}
        <path
          d={d}
          fill="none"
          stroke={MAP_INK.roadEdge}
          strokeOpacity="0.55"
          strokeWidth={dense ? 2 : 2.8}
          strokeLinecap="butt"
          strokeDasharray={dense ? '5 6' : '7 8'}
        />
        {/* 걸어온 길 — 여기만 실체가 있다. 밟은 자리가 길이 된다.
            그림자를 따로 깔았더니 선이 둘로 보여 지저분했다. 한 겹으로 두고
            아래쪽에만 아주 옅은 테두리를 둬 종이에서 살짝 뜨게 한다. */}
        <path ref={roadRef} d={d} fill="none" stroke="none" />
        <path
          ref={shadowRef}
          d={d}
          fill="none"
          stroke="#3b2a12"
          strokeOpacity="0.16"
          strokeWidth={road * 0.62 + 2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          ref={walkedRef}
          d={d}
          fill="none"
          stroke={MAP_INK.path}
          strokeWidth={road * 0.62}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 길이 측정용 — 그리지 않는다. display:none으로 감추면 브라우저에 따라 길이가 0이 되므로
            stroke/fill만 없앤다(레이아웃에는 있고 화면에는 안 보인다). */}
        {smoothSegments(pts).map((sd, i) => (
          <path
            key={`seg${i}`}
            ref={(el) => {
              segRefs.current[i] = el
            }}
            d={sd}
            fill="none"
            stroke="none"
          />
        ))}

        {/* 등불 — 지금 서 있는 자리에 켜 둔다 */}
        {me && <circle cx={me[0]} cy={me[1]} r="30" fill={`url(#lamp${uid})`} />}

        {/* ── 자리 ──────────────────────────────────────────────────────────
            납작한 원 대신 **말판의 칸**을 놓는다. 상태마다 형태가 다르다:
            닿은 자리는 번호 새긴 금 인장, 지금 자리는 순례자가 서 있고,
            다음 자리는 사슬과 자물쇠가 걸린 채 가장 크다(오늘의 목표는 하나다).
            자세한 것은 MapNode.tsx. */}
        {/* 월드맵의 자리들 — 점. 표식이 서는 자리(장의 시작·지금·다음)는 아래에서 따로 그린다.
            점은 "여기에도 자리가 있다"만 말한다. 다 말하면 아무것도 안 들린다. */}
        {world &&
          pts.map((p, i) => {
            if (markAt.has(i)) return null
            const st = stops[i]
            const walked = st.state === 'reached' || st.state === 'current'
            return (
              <motion.circle
                key={`dot-${st.ep.id}`}
                cx={p[0]}
                cy={p[1]}
                r={walked ? 3.4 : 2.8}
                fill={walked ? MAP_INK.seal : MAP_INK.roadEdge}
                fillOpacity={walked ? 0.95 : 0.45}
                stroke={walked ? MAP_INK.sealRing : 'none'}
                strokeWidth={walked ? 1 : 0}
                initial={reduce ? false : { opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: reduce ? 0 : 0.2 + i * 0.02, type: 'spring', stiffness: 420, damping: 22 }}
                style={{ transformOrigin: `${p[0]}px ${p[1]}px` }}
              />
            )
          })}

        {renderOrder.map((i, k) => {
          const st = stops[i]
          const home = pts[i]
          /* 월드맵에서는 표식이 비켜 서 있다 — 그린 자리와 진짜 지점이 다르다.
             둘을 가는 선으로 잇는다. 선이 없으면 표식이 허공에 뜬 것으로 읽힌다. */
          const mi = markIndex.get(i)
          const p = world && mi != null ? markPos[mi] : home
          const chapterOf = markAt.get(i)
          const delay = reduce ? 0 : 0.18 + (world ? Math.min(k, 12) * 0.05 : i * 0.06)
          return (
            <motion.g
              key={st.ep.id}
              initial={reduce ? false : { opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              /* 누르면 살짝 들어갔다 나온다.
                 처음엔 투명 히트 원에 걸었는데 그건 안 보이는 요소라 손끝에 아무 반응이 없었다.
                 메달리온을 감싼 이 그룹이 눌려야 "먹었다"가 눈으로 보인다. */
              whileTap={reduce || !tapTarget(st, chapterOf) ? undefined : { scale: 0.86 }}
              transition={{ delay, type: 'spring', stiffness: 380, damping: 20 }}
              style={{ transformOrigin: `${p[0]}px ${p[1]}px`, cursor: tapTarget(st, chapterOf) ? 'pointer' : undefined }}
            >
              {world && Math.hypot(p[0] - home[0], p[1] - home[1]) > 3 && (
                <g>
                  <line
                    x1={home[0]}
                    y1={home[1]}
                    x2={p[0]}
                    y2={p[1]}
                    stroke={MAP_INK.sealRing}
                    strokeOpacity="0.45"
                    strokeWidth="1"
                    strokeDasharray="2 2.5"
                  />
                  <circle cx={home[0]} cy={home[1]} r="2" fill={MAP_INK.sealRing} fillOpacity="0.55" />
                </g>
              )}
              {/* 다음 자리의 봉인 둘레를 빛이 돈다 — 9초에 한 바퀴.
                  빠르면 로딩 스피너로 읽혀 "기다리는 중"이 된다. 여기서는 "열릴 수 있다"여야 한다. */}
              {st.state === 'next' && !reduce && (
                <circle
                  cx={p[0]}
                  cy={p[1]}
                  r={22 * nodeScale}
                  fill="none"
                  stroke={MAP_INK.seal}
                  strokeOpacity="0.6"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeDasharray="3 8"
                  style={{ transformOrigin: `${p[0]}px ${p[1]}px`, animation: 'seal-orbit 9s linear infinite' }}
                />
              )}
              {chapterOf != null && st.state !== 'current' && st.state !== 'next' ? (
                <ChapterMark
                  x={p[0]}
                  y={p[1]}
                  n={chapterOf + 1}
                  sealed={st.state === 'sealed'}
                  scale={nodeScale}
                  uid={uid}
                />
              ) : (
                <MapNode x={p[0]} y={p[1]} state={st.state} scale={nodeScale} order={st.index + 1} uid={uid} />
              )}
              {/* 장이 시작되는 자리가 하필 지금/다음 자리와 같을 때.
                  메달리온이 이기는 게 맞지만(오늘의 목표가 우선), 그러면 그 장 번호가
                  월드맵에서 통째로 사라진다 — 베드로의 길에서 5장이 그렇게 없어졌다.
                  작은 번호 딱지를 어깨에 붙여 둘 다 살린다. */}
              {world && chapterOf != null && (st.state === 'current' || st.state === 'next') && (
                <g transform={`translate(${p[0] + 11 * nodeScale} ${p[1] - 11 * nodeScale})`}>
                  <circle r={7 * nodeScale} fill={MAP_INK.seal} stroke={MAP_INK.sealRing} strokeWidth={1.4 * nodeScale} />
                  <text
                    y={2.6 * nodeScale}
                    textAnchor="middle"
                    fontSize={8.4 * nodeScale}
                    fontWeight="700"
                    fill={MAP_INK.sealRing}
                    fontFamily="var(--font-display)"
                  >
                    {chapterOf + 1}
                  </text>
                </g>
              )}
              {/* 히트 영역은 그림보다 크다 — 봉인된 자리는 반지름 5.5라 손가락으로 못 누른다.
                  SVG 안이라 min-height 44px 규칙을 CSS로 못 걸므로 원으로 직접 넓힌다. */}
              {/* 월드맵에서는 **장**을 고르고, 장 지도에서는 **자리**를 연다.
                  월드맵에서 자리 하나하나에 손가락 크기의 히트 영역을 주면 서로 포개져
                  누를 때마다 엉뚱한 자리가 열린다 — 큰 표식만 받는 것이 정확하다. */}
              {tapTarget(st, chapterOf) && (
                <circle
                  cx={p[0]}
                  cy={p[1]}
                  r={world ? 17 : Math.max(16, 20 * nodeScale)}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  role="button"
                  tabIndex={0}
                  aria-label={
                    world && chapterOf != null && st.state !== 'current' && st.state !== 'next'
                      ? `${chapterOf + 1}장 지도 보기`
                      : `${st.ep.place} 자리 열기`
                  }
                  onClick={(e) => {
                    e.stopPropagation()
                    tapTarget(st, chapterOf)?.()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      tapTarget(st, chapterOf)?.()
                    }
                  }}
                />
              )}
            </motion.g>
          )
        })}

        {/* 내 토큰은 없앴다.
            길 위에 떠 있는 주황 점 하나는 게임의 말이 아니라 산점도의 마커다 — 지적받은 그대로였다.
            지금 서 있는 자리는 **자리 메달리온 위에 순례자가 올라서** 표시한다(MapNode의 current).
            사람이 서 있는 칸이 곧 내 위치다. 점을 따로 찍을 이유가 없다. */}
      </svg>

      {/* 종이 결 — 지도를 인쇄된 면이 아니라 **칠해진 종이**로 만든다.
          가장자리로 갈수록 그 땅의 어둠이 스며들어(비네트) 자른 자국이 안 보인다.
          라벨보다 아래에 둔다 — 위에 얹으면 자리 이름이 흐려진다. */}
      <span
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(120% 85% at 50% 42%, transparent 60%, ${skin.fog}66 100%)` }}
      />
      <span
        className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* 자리 이름은 SVG 밖에 둔다 — SVG 안의 텍스트는 글자 크기 설정(zoom)을 안 따라온다.
          라벨은 마커 위/아래로 갈라 붙인다. 둘 다 아래에 두면 지도 위쪽 자리에서
          다음 자리 라벨과 내 토큰이 정확히 같은 자리에 겹친다(실제로 겹쳤다). */}
      <div className="pointer-events-none absolute inset-0">
        {stops.map((s, i) => {
          /* 월드맵에는 이름표를 안 붙인다.
             표식 아홉 개가 이미 서 있는 카드에 흰 알약 두 개가 더 뜨면 서로를 덮는다
             (실제로 "변화산"이 장 표식 위에 얹혔다). 월드맵이 대답할 것은
             "이 길이 어떻게 생겼나" 하나다 — 지금 어디고 다음이 어디인지는 지도 아래 한 줄이 말한다. */
          if (world) return null
          if (s.state !== 'current' && s.state !== 'next') return null
          const mi = markIndex.get(i)
          const p = world && mi != null ? markPos[mi] : pts[i]
          const isNext = s.state === 'next'
          /* 다음 자리는 위로, 지금 자리는 아래로 — 항상 서로 반대편에 붙는다.
             단 카드 밖으로 나가면 안 된다: 위쪽에 붙은 자리의 라벨이 카드 상단에 잘려
             "4.0km 남음"이 반만 보이는 일이 실제로 있었다. 가장자리에서는 방향을 뒤집는다. */
          /* 지금 자리는 항상 위, 다음 자리는 항상 아래.
             예전엔 둘 다 "가장자리면 뒤집기" 규칙을 따로 적용해서, 두 자리가 가까우면
             같은 쪽에 붙어 글자가 서로를 먹었다(실제로 "비하히롯 · 홍해 도하"가 배지에 잘렸다).
             방향을 고정하면 둘이 아무리 가까워도 절대 겹치지 않는다. */
          /* 위냐 아래냐 — 방향을 고정했더니 이번엔 **자리 위**에 이름표가 얹혔다.
             다음 자리가 지도 위쪽에 서면 "아래"가 하필 걸어온 자리들이 늘어선 줄이다.
             그래서 방향을 고정하는 대신 **비어 있는 쪽**을 고른다. 양쪽이 같으면
             지금은 위, 다음은 아래로 — 둘이 가까워도 서로 반대편에 붙게. */
          const near = (dir: -1 | 1) =>
            pts.filter(
              (q, j) =>
                j !== i && Math.abs(q[0] - p[0]) < 52 && (q[1] - p[1]) * dir > 0 && Math.abs(q[1] - p[1]) < 46,
            ).length
          const up = near(-1)
          const down = near(1)
          const above = up === down ? !isNext : up < down
          /* 마커의 등불 링이 반지름 14다. 라벨을 그보다 가까이 붙이면, 가장자리 보정으로
             라벨이 옆으로 밀렸을 때 글자 앞부분이 마커에 걸려 "광야"가 "…야"로 보인다. */
          const y = above ? p[1] - 34 : p[1] + 26
          /* 폭 0짜리 상자를 좌표에 놓고 flex로 가운데 정렬한다.
             translateX(-50%)는 **상자 폭**의 절반만큼 미는 것이라, 내용이 상자보다 넓거나
             좁으면 라벨이 마커에서 어긋난다(실측 약 38px 왼쪽으로 밀렸다).
             폭이 0이면 밀 것이 없으므로 항상 정확히 그 점 위에 선다. */
          /* 카드 좌우 가장자리에서는 라벨을 안쪽으로 물린다.
             지도 자리가 x=30쯤에 서면 가운데 정렬된 이름이 카드 밖으로 나가 반만 보였다
             (실제로 "광야"가 "…야"로 잘렸다). 마커에서 조금 어긋나더라도 읽히는 쪽이 낫다. */
          const labelX = Math.min(W - 46, Math.max(46, p[0]))
          return (
            <span
              key={s.ep.id}
              className="absolute flex w-0 justify-center"
              style={{
                left: `${(labelX / W) * 100}%`,
                top: `${(y / H) * 100}%`,
                transform: above ? 'translateY(-100%)' : undefined,
              }}
            >
              <span className="whitespace-nowrap text-center">
                {/* 패널이 항상 어두우므로 글자도 테마와 무관하게 밝은 쪽으로 고정한다 */}
                <span
                  className="block rounded-full px-1.5 font-serif text-[13px] leading-tight"
                  style={{
                    background: `${skin.from}d9`,
                    color: skin.label,
                    // 글자 뒤에 그 땅의 어둠을 깔아, 별·물결 위에서도 이름이 읽히게
                    textShadow: `0 1px 3px ${skin.from}, 0 0 8px ${skin.from}`,
                  }}
                >
                  {s.ep.place}
                </span>
                {isNext && (
                  <span
                    className="mt-1 inline-block rounded-full px-2 py-[3px] font-display text-[11.5px] leading-none"
                    style={{
                      fontFeatureSettings: "'lnum' 1, 'tnum' 1",
                      background: MAP_INK.seal,
                      color: MAP_INK.sealedFill,
                    }}
                  >
                    {s.realKmAway < 10 ? s.realKmAway.toFixed(1) : Math.round(s.realKmAway)}
                    {units} 남음
                  </span>
                )}
              </span>
            </span>
          )
        })}
      </div>

      {/* 나침반만 남긴다. 지역 이름표(갈대아·욥바…)는 뺐다 — 지도 안의 자리 이름이
          이미 어디인지 말하고 있었고, 모서리의 작은 대문자 라벨은 지도가 아니라 계기판의 문법이다.
          나침반은 없앨 수 없다: 지도를 주축으로 눕혔으므로 이게 없으면 회전이 거짓말이 된다.
          대신 더 작고 조용하게. */}
      <svg
        className="pointer-events-none absolute bottom-3 right-3.5 opacity-40"
        width="24"
        height="24"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden
      >
        <circle cx="14" cy="14" r="10" stroke={skin.label} strokeOpacity="0.35" strokeWidth="1" />
        <g transform={`rotate(${projected.northDeg.toFixed(1)} 14 14)`}>
          <path d="M14 3.6 L16.2 12 L14 10.4 L11.8 12 Z" fill={MAP_INK.sealRing} />
          <path d="M14 24.4 L11.8 16 L14 17.6 L16.2 16 Z" fill={skin.label} fillOpacity="0.4" />
        </g>
      </svg>
    </div>
  )
}
