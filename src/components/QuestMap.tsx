import { useEffect, useId, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { QuestStop } from '../lib/quest'
import MapNode from './MapNode'
import type { Pt } from '../lib/mapShapes'
import { skinOf, MAP_INK } from '../lib/journeySkin'
import { terrainArt } from '../assets/art'

/* ── 여정 지도 ─────────────────────────────────────────────────────────────
 *
 * 이 앱을 여는 이유는 하나다 — **"내가 그 길 어디쯤 와 있나."**
 * 지도는 실좌표로 그린다(에피소드의 lat/lng). 꾸며낸 곡선이 아니라 그 사람이 걸은 실제
 * 지리의 모양이라는 것이 이 제품의 유일한 해자다 — 모양을 지어내면 그게 사라진다.
 *
 * 축척이 둘이고, **축척마다 그리는 것이 다르다.**
 *
 *   장 지도 — 자리 두셋~아홉. 실제 경로를 한 줄로 그린다. 자리 하나하나가 퀘스트 입구.
 *   월드맵  — 여정 전체. **아무것도 잇지 않는다.** 그 땅 위에 자리 인장만 놓인다.
 *
 * 월드맵에서 선을 지우기까지 세 번 틀렸다. 기록해 둔다.
 *   ① 자리를 순서대로 다 이었다 → 갈릴리와 예루살렘을 여섯 번 왕복하는 구간에서 선이
 *      스스로를 몇 번씩 가로질러 파란 매듭이 됐다. 지리가 그런 것이라 구부려서 될 일이 아니었다.
 *   ② 장과 장만 이었다 → **거짓말이 됐다.** 도식선과 실좌표 자리가 한 화면에 있는데
 *      선이 그 자리들을 지나지 않았다. 단순화가 아니라 모순이다.
 *   ③ 장마다 자리들을 감싸는 땅 덩어리를 그렸다 → 예수님의 사역 길은 **장이 공간으로
 *      갈리지 않는다**(모든 장이 같은 지역을 오간다). 덩어리 일곱이 서로 포개져 얼룩이 됐다.
 *
 * 남은 답은 하나였다. 종이 위에 인장만 놓는다. 걸어온 자리는 금으로 찍혀 있고 아직인 자리는
 * 눌린 자국만 있다. 진행은 "선이 자란다"가 아니라 **"금이 늘어난다"**이고, 순서는 지도가
 * 아니라 위의 장 고르기가 말한다. 여정의 크기는 인장이 흩어진 범위가 그대로 보여 주므로
 * 거짓이 끼어들 자리가 없다.
 *
 * 어휘는 전부 순례어다(자리·인장·봉인). 레벨·클리어·보스는 쓰지 않는다(DECISIONS D3). */

export interface QuestMapProps {
  stops: QuestStop[]
  /** 지금 구간을 얼마나 걸어왔나 0~1 */
  segProgress: number
  /** 아직 한 자리도 못 닿았는가 */
  atStart: boolean
  units: string
  /** 어느 길인가 — 그 땅이 달라진다 */
  journeyId: string
  /* 자리를 누를 수 있게 할지.
     홈의 지도는 한 번 탭하면 지도를 여는 **버튼 하나**다(작은 창에 버튼을 여섯 개 겹쳐
     놓으면 오탭만 는다). 펼친 장 지도에서만 자리 하나하나가 입구가 된다. */
  onSelectStop?: (episodeId: string) => void
  /** 여정 전체를 보는 모드 */
  world?: boolean
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
 * 대신 **회전**은 한다. 남북으로 긴 구간을 세로로 그대로 그리면 카드 양옆이 통째로 비고
 * 길은 가운데 6px 낙서가 된다. 점구름의 주축(PCA)을 가로로 눕히면 같은 모양 그대로 카드를
 * 채운다. 회전은 강체 변환이라 거리·각도·모양이 하나도 안 변한다 — 종이 지도를 돌려 보는
 * 것과 같다. 대신 나침반이 함께 돌아 북쪽을 정직하게 가리킨다. */
function project(stops: QuestStop[], H: number, padX: number, padTop: number, minSep: number) {
  const lats = stops.map((s) => s.ep.lat)
  const lngs = stops.map((s) => s.ep.lng)
  const midLat = (Math.min(...lats) + Math.max(...lats)) / 2
  const k = Math.cos((midLat * Math.PI) / 180)

  const raw = lngs.map((lng, i) => [lng * k, -lats[i]] as Pt) // 북쪽이 위로

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
    return [dx * cos - dy * sin, dx * sin + dy * cos] as Pt
  })

  const xs = rot.map((p) => p[0])
  const ys = rot.map((p) => p[1])
  const spanX = Math.max(...xs) - Math.min(...xs)
  const spanY = Math.max(...ys) - Math.min(...ys)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)

  const availW = W - padX * 2
  const availH = H - padTop - padX
  const scale = Math.min(spanX > 1e-9 ? availW / spanX : Infinity, spanY > 1e-9 ? availH / spanY : Infinity)
  const s = Number.isFinite(scale) ? scale : 1

  const offX = padX + (availW - spanX * s) / 2
  const offY = padTop + (availH - spanY * s) / 2

  const placed: Pt[] = xs.map((x, i) => [offX + (x - minX) * s, offY + (ys[i] - minY) * s])

  /* 같은 자리에 겹쳐 놓인 자리를 아주 조금 펼친다.
   *
   * 여정에는 같은 도시를 두 번 이상 지나는 자리가 있다(바울의 에베소, 예루살렘 여러 번).
   * 좌표가 거의 같으니 투영해도 한 점이 되고, 인장이 서로 위에 포개진다.
   * 손가락으로 누르는 물건은 떨어져 있어야 하므로 **사실상 같은 점**만 푼다.
   * 임계값을 크게 잡았다가 자리들이 가로로 일렬이 되어 지리가 거짓말이 된 적이 있다 —
   * 가까운 자리는 가깝게 보이는 것이 맞다. */
  for (let i = 1; i < placed.length; i++) {
    for (let j = 0; j < i; j++) {
      const dx = placed[i][0] - placed[j][0]
      const dy = placed[i][1] - placed[j][1]
      const dist = Math.hypot(dx, dy)
      if (dist >= minSep) continue
      const prev = placed[i - 1]
      let vx = placed[i][0] - prev[0]
      let vy = placed[i][1] - prev[1]
      if (Math.hypot(vx, vy) < 0.01) {
        vx = 1
        vy = 0
      }
      const len = Math.hypot(vx, vy)
      const push = (minSep - dist) * 0.6 + 4
      const sign = i % 2 === 0 ? 1 : -1
      placed[i] = [placed[i][0] + (-vy / len) * push * sign, placed[i][1] + (vx / len) * push * sign]
    }
  }
  for (const q of placed) {
    q[0] = Math.max(14, Math.min(W - 14, q[0]))
    q[1] = Math.max(padTop * 0.6, Math.min(H - 16, q[1]))
  }

  return { pts: placed, northDeg: (-theta * 180) / Math.PI }
}

/** 장력 — 너무 높이면 길이 출렁여서 지리가 거짓말이 된다 */
const TENSION = 0.2

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

/** 구간별 곡선 — 순례자를 길 위에 정확히 세우려고 하나씩 실제 길이를 잰다 */
function smoothSegments(p: Pt[]): string[] {
  const out: string[] = []
  for (let i = 0; i < p.length - 1; i++) {
    const { p1, p2, c1, c2 } = ctrl(p, i)
    out.push(
      `M${p1[0].toFixed(1)},${p1[1].toFixed(1)} C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`,
    )
  }
  return out
}

/** Catmull-Rom → 3차 베지어. 꺾인 폴리라인이 아니라 사람이 걸은 길처럼. */
function smoothPath(p: Pt[]): string {
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
  height = 234,
  className = '',
}: QuestMapProps) {
  const uid = useId().replace(/:/g, '')
  const skin = skinOf(journeyId)
  const terrain = terrainArt(journeyId)
  const reduce = useReducedMotion()
  const roadRef = useRef<SVGPathElement>(null)
  const walkedRef = useRef<SVGPathElement>(null)
  const [me, setMe] = useState<Pt | null>(null)

  /* 카드 비율은 두 보기에서 **같다.**
     예전엔 전체지도가 1.75:1, 장 지도가 1.19:1이라 탭 하나 누를 때마다 패널이 145px 자라며
     아래 글이 통째로 밀렸다. 주인공의 크기가 흔들리면 무슨 색을 써도 화면이 안 잡힌다. */
  const H = height
  /* 위쪽 여백이 더 넓다 — 이름표가 자리 위에 붙기 때문이다. */
  const padX = 28
  const padTop = 38
  /* 월드맵의 인장은 작고 누를 수 없으므로 겹침을 거의 풀지 않는다(지리가 그대로 남는다).
     장 지도의 자리는 손가락으로 누르는 지름 20~26의 메달리온이라 떨어져 있어야 한다. */
  const minSep = world ? 7 : 21

  const projected = stops.length ? project(stops, H, padX, padTop, minSep) : { pts: [] as Pt[], northDeg: 0 }
  const pts = projected.pts

  /* 자리 크기는 **자리 사이의 실제 간격**에서 뽑는다.
     개수로 정했더니 바울의 길이 무너졌다: 같은 개수라도 여정마다 밀도가 다르므로
     개수는 크기의 근거가 될 수 없다. 가장 좁은 곳에서도 안 겹쳐야 하니 하위 20%가 기준이다. */
  const gaps = pts
    .slice(1)
    .map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]))
    .sort((a, b) => a - b)
  const tightGap = gaps.length ? gaps[Math.max(0, Math.floor(gaps.length * 0.2))] : 60
  const nodeScale = world ? 0.5 : Math.max(stops.length <= 8 ? 0.62 : 0.44, Math.min(1, (tightGap * 0.9) / 30))
  const road = Math.max(4.5, Math.min(11, tightGap * 0.34))

  const d = world ? '' : smoothPath(pts)
  const curIdx = stops.findIndex((s) => s.state === 'current')
  const segRefs = useRef<(SVGPathElement | null)[]>([])

  useEffect(() => {
    if (world) return
    const roadEl = roadRef.current
    const walked = walkedRef.current
    if (!roadEl || !walked) return
    const L = roadEl.getTotalLength()
    if (!L) return

    /* 폴리라인 누적 길이로 비율을 구해 곡선에 적용하면 굽은 구간에서 순례자가 길 밖에 뜬다
       (베지어는 직선보다 길고 그 초과분이 구간마다 다르다). 구간을 하나씩 실제로 잰다. */
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

    const pt = roadEl.getPointAtLength(done)
    setMe([pt.x, pt.y])

    // 걸어온 길이 앞에서부터 차오른다 — 거리가 곧 이야기라는 걸 눈으로 보여주는 유일한 장면
    walked.style.strokeDasharray = `${done} ${L}`
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
  }, [d, curIdx, segProgress, atStart, pts.length, reduce, world])

  if (!stops.length) return null

  /* 등불이 앉는 곳 — 장 지도에서는 길 위의 그 점, 월드맵에서는 지금 서 있는 자리. */
  const lamp: Pt | null = world ? (curIdx >= 0 ? pts[curIdx] : null) : me

  /* 이름표는 최소한으로.
     월드맵은 여정의 **처음과 끝** 둘, 장 지도는 **다음 자리** 하나.
     남은 거리 배지는 뺐다 — 지도 바로 아래 한 줄이 이미 같은 말을 하고 있었다. */
  /* 위냐 아래냐 — 방향을 고정했더니 이름표가 자리 위에 얹혔다(바울의 "수리아 안디옥"이
     인장 다섯 개를 덮었다). 자리가 적은 쪽에 붙인다. */
  const emptierSideIsAbove = (at: Pt | undefined) => {
    if (!at) return true
    const near = (dir: -1 | 1) =>
      pts.filter((q) => Math.abs(q[0] - at[0]) < 54 && (q[1] - at[1]) * dir > 0 && Math.abs(q[1] - at[1]) < 44).length
    return near(-1) <= near(1)
  }
  /* 월드맵에는 이름표를 붙이지 않는다.
     처음과 끝 두 개만 놓아 봤는데, 자리가 몰린 여정에서는 위든 아래든 인장 무리를 덮었다
     (바울의 "수리아 안디옥"이 인장 다섯 개 위에 얹혔다). 어디서 어디까지인지는 지도 아래
     한 줄이 글로 말한다 — 글은 지도를 안 가린다. */
  const labels = world
    ? []
    : stops
        .map((s, i) => ({ key: s.ep.id, at: pts[i], text: s.ep.place, above: emptierSideIsAbove(pts[i]), state: s.state }))
        .filter((l) => l.state === 'next')

  return (
    /* 종이 위에 채색 필사본의 미니어처 한 칸이 박혀 있는 형태.
       테두리(ring)는 두지 않는다 — 선으로 가두면 유리 카드가 되고, 그게 "딱딱하다"의 정체다.
       경계는 안쪽으로 스며드는 빛과 아래로 떨어지는 부드러운 그림자가 만든다. */
    <div
      className={`relative overflow-hidden rounded-[28px] ${className}`}
      style={{
        background: `linear-gradient(165deg, ${skin.from} 0%, ${skin.to} 100%)`,
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,.5), 0 1px 2px rgba(80,60,30,.10), 0 16px 32px -22px rgba(80,60,30,.45)',
      }}
    >
      {/* 그 땅 — 육지와 물, 그 둘뿐이다.
          예전 지형 그림에는 나무·벽돌·기둥 같은 미세 아이콘이 깔려 있었는데, 그것들이
          자리 인장과 크기·명도가 겹쳐서 **어느 것이 자리인지 구분이 안 됐다**. 배경이 아니라
          경쟁자였던 셈이다. 지금은 실루엣 두 겹만 남는다.

          그런데 실루엣을 또렷하게 두면 새 거짓말이 생긴다: 그림의 해안선은 생성된 것이라
          실좌표와 맞지 않고, 그러면 **자리가 바다 위에 앉는다.** 바울의 길에서 자리 28개가
          전부 물 위에 떠 있었다 — 방금 지운 도식선과 같은 종류의 거짓이다.
          그래서 해안선을 알아볼 수 없을 만큼 문질러 **물든 종이**로 낮춘다. 남는 것은 색의
          기색뿐이라(바울은 푸르고, 아브라함은 모래빛, 출애굽은 장밋빛) 여정마다 다른 공기는
          그대로인데 특정 지형을 주장하지는 않는다. 지리를 말하는 것은 오직 자리의 위치다.
          saturate()로 채도를 눌렀던 것은 걷어냈다. 앱에서 유일한 찬 색(물)을 스스로 회색으로
          만들고 있었다(측정: 원본 찬색 40.9% → 화면 2.1%). 흐림은 형태만 지우고 색은 남긴다. */}
      {terrain && (
        <img
          src={terrain}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          // scale은 흐림 때문에 가장자리가 비는 것을 막는다
          /* 흐림은 **형태만** 지워야 한다. 처음엔 명암까지 같이 지워서 패널의 명도 폭이 9로
             떨어졌다 — 양피지 지도로 바꿨다가 22→9가 됐던 그 실패의 재판이다(CLAUDE.md).
             contrast로 층을 되살리면 알아볼 수 없는 얼룩인 채로 빛과 그늘이 돌아온다. */
          style={{
            opacity: 0.72,
            filter: 'blur(24px) contrast(1.7) saturate(1.15)',
            transform: 'scale(1.25)',
            mixBlendMode: 'multiply',
          }}
        />
      )}

      <svg viewBox={`0 0 ${W} ${H}`} className="relative block w-full" role="img" aria-label="여정 지도">
        <defs>
          <radialGradient id={`face-gold-${uid}`} cx="35%" cy="28%" r="80%">
            <stop offset="0%" stopColor="#ffe9a8" />
            <stop offset="52%" stopColor={MAP_INK.seal} />
            <stop offset="100%" stopColor="#b47d15" />
          </radialGradient>
          <radialGradient id={`halo-${uid}`}>
            <stop offset="0%" stopColor={MAP_INK.lamp} stopOpacity="0.5" />
            <stop offset="55%" stopColor={MAP_INK.lamp} stopOpacity="0.16" />
            <stop offset="100%" stopColor={MAP_INK.lamp} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── 장 지도의 길 ────────────────────────────────────────────────
            종이색 케이싱 위에 라피스 한 줄. 아직 안 간 구간은 파선이 아니라
            **같은 굵기의 옅은 라피스**다 — 굵기가 같아야 한 줄기로 읽힌다.
            (월드맵에는 길이 없다. 위 주석 참조.) */}
        {!world && (
          <>
            <path
              d={d}
              fill="none"
              stroke={skin.from}
              strokeOpacity="0.9"
              strokeWidth={road * 0.62 + 3.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={d}
              fill="none"
              stroke={MAP_INK.path}
              strokeOpacity="0.34"
              strokeWidth={road * 0.62}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path ref={roadRef} d={d} fill="none" stroke="none" />
            <path
              ref={walkedRef}
              d={d}
              fill="none"
              stroke={MAP_INK.path}
              strokeWidth={road * 0.62}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* 길이 측정용 — 그리지 않는다. display:none이면 브라우저에 따라 길이가 0이 되므로
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
          </>
        )}

        {/* 등불 — 지금 서 있는 곳에 켜 둔다. 화면에서 유일한 발광체다. */}
        {lamp && <circle cx={lamp[0]} cy={lamp[1]} r={world ? 28 : 30} fill={`url(#halo-${uid})`} />}

        {/* ── 자리 ───────────────────────────────────────────────────────
            납작한 원이 아니라 말판의 칸. 상태마다 안에 들어가는 것이 다르다(MapNode).
            월드맵에서는 작게, 누를 수 없게 — 서른셋을 전부 손가락 크기로 만들면
            히트 영역이 서로 포개져 누를 때마다 엉뚱한 자리가 열린다. */}
        {pts.map((p, i) => {
          const st = stops[i]
          const tap = onSelectStop && !world ? () => onSelectStop(st.ep.id) : undefined
          return (
            <motion.g
              key={st.ep.id}
              initial={reduce ? false : { opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={reduce || !tap ? undefined : { scale: 0.86 }}
              transition={{
                delay: reduce ? 0 : 0.16 + Math.min(i, 16) * (world ? 0.03 : 0.06),
                type: 'spring',
                stiffness: 380,
                damping: 20,
              }}
              style={{ transformOrigin: `${p[0]}px ${p[1]}px`, cursor: tap ? 'pointer' : undefined }}
            >
              <MapNode x={p[0]} y={p[1]} state={st.state} scale={nodeScale} order={st.index + 1} uid={uid} />
              {/* 히트 영역은 그림보다 크다 — 봉인된 자리는 반지름 5.5라 손가락으로 못 누른다.
                  SVG 안이라 min-height 44px 규칙을 CSS로 못 걸므로 원으로 직접 넓힌다. */}
              {tap && (
                <circle
                  cx={p[0]}
                  cy={p[1]}
                  r={Math.max(16, 20 * nodeScale)}
                  fill="transparent"
                  role="button"
                  tabIndex={0}
                  aria-label={`${st.ep.place} 자리 열기`}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    tap()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      tap()
                    }
                  }}
                />
              )}
            </motion.g>
          )
        })}
      </svg>

      {/* 비네트는 바깥 8%만 — 예전엔 모서리의 정보를 먹었다 */}
      <span
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(125% 95% at 50% 45%, transparent 82%, ${skin.fog}55 100%)` }}
      />

      {/* 이름표는 SVG 밖에 둔다 — SVG 안의 텍스트는 글자 크기 설정(zoom)을 안 따라온다. */}
      <div className="pointer-events-none absolute inset-0">
        {labels.map((l) => {
          if (!l.at) return null
          const y = l.above ? l.at[1] - 26 : l.at[1] + 20
          /* 폭 0짜리 상자를 좌표에 놓고 flex로 가운데 정렬한다.
             translateX(-50%)는 상자 폭의 절반만 미는 것이라 내용 폭이 다르면 어긋난다. */
          const x = Math.min(W - 46, Math.max(46, l.at[0]))
          return (
            <span
              key={l.key}
              className="absolute flex w-0 justify-center"
              style={{
                left: `${(x / W) * 100}%`,
                top: `${(y / H) * 100}%`,
                transform: l.above ? 'translateY(-100%)' : undefined,
              }}
            >
              <span
                className="whitespace-nowrap font-serif text-[13px] leading-tight"
                style={{
                  color: MAP_INK.sealRing,
                  // 알약 배경 대신 종이색 번짐 — 면을 얹으면 지도에 스티커가 붙는다
                  textShadow: `0 0 3px ${skin.from}, 0 0 4px ${skin.from}, 0 1px 2px ${skin.from}`,
                }}
              >
                {l.text}
              </span>
            </span>
          )
        })}
      </div>

      {/* 나침반 — 지도를 주축으로 눕혔으므로 이게 없으면 회전이 거짓말이 된다.
          예전엔 불투명도 40%라 안 보이면서 자리만 차지했다. 보이게 두거나 없애야 한다. */}
      <svg
        className="pointer-events-none absolute bottom-3 right-3.5 opacity-[0.6]"
        width="22"
        height="22"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden
      >
        <g transform={`rotate(${projected.northDeg.toFixed(1)} 14 14)`}>
          <path d="M14 4.5 L16.4 13 L14 11.3 L11.6 13 Z" fill={MAP_INK.sealRing} />
          <path d="M14 23.5 L11.6 15 L14 16.7 L16.4 15 Z" fill={MAP_INK.sealRing} fillOpacity="0.3" />
        </g>
      </svg>
      <span className="sr-only">{units}</span>
    </div>
  )
}
