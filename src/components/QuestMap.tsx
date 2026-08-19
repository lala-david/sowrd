import { useEffect, useId, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { QuestStop } from '../lib/quest'
import { IconLocked } from './icons'
import MapTexture from './MapTexture'
import { skinOf, MAP_INK } from '../lib/journeySkin'

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
function project(stops: QuestStop[], H: number, pad: number) {
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

  return {
    pts: xs.map((x, i) => [offX + (x - minX) * s, offY + (ys[i] - minY) * s] as [number, number]),
    /** 화면에서 북쪽이 향하는 각도(도). 나침반 바늘이 이만큼 돌아야 정직해진다. */
    northDeg: (-theta * 180) / Math.PI,
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
  height = 234,
  className = '',
}: QuestMapProps) {
  const uid = useId().replace(/:/g, '')
  const skin = skinOf(journeyId)
  const reduce = useReducedMotion()
  const roadRef = useRef<SVGPathElement>(null)
  const walkedRef = useRef<SVGPathElement>(null)
  const [me, setMe] = useState<[number, number] | null>(null)

  const H = height
  const pad = 38
  /* 자리가 빽빽할수록 마커와 안개를 줄인다 — 창(자리 여섯)과 전체(자리 서른셋)가
     같은 크기를 쓰면 전체 지도는 점과 안개로 가득 찬 얼룩이 된다. */
  const dense = stops.length > 10
  const fogR = Math.max(24, Math.min(78, 460 / stops.length))
  const dotR = dense ? 3 : 4
  const sealR = dense ? 4.5 : 6
  const projected = stops.length ? project(stops, H, pad) : { pts: [], northDeg: 0 }
  const pts = projected.pts
  const d = smoothPath(pts)

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
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="여정 지도">
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
        </defs>

        {/* 이 땅의 결 — 여정마다 다르다.
            아브라함은 별(창 15:5), 출애굽은 시내산 능선, 예수는 갈릴리 물결,
            바울은 지중해, 베드로는 성벽. 다섯 길이 색만 다른 같은 화면이 아니게. */}
        <MapTexture texture={skin.texture} ink={skin.textureInk} w={W} h={H} />

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

        {/* 아직 가지 않은 길 — 흐린 점선 */}
        <path d={d} fill="none" stroke={MAP_INK.path} strokeOpacity={dense ? 0.3 : 0.42} strokeWidth={dense ? 1.5 : 2} strokeLinecap="round" strokeDasharray="1 7" />
        {/* 걸어온 길 — 밤 지도 위의 금선. 이 한 줄이 "내가 여기까지 왔다"이다 */}
        <path ref={roadRef} d={d} fill="none" stroke="none" />
        <path
          ref={walkedRef}
          d={d}
          fill="none"
          stroke={MAP_INK.path}
          strokeWidth={dense ? 2.4 : 3.4}
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(43,62,168,.35))' }}
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

        {pts.map((p, i) => {
          const s = stops[i]
          const delay = reduce ? 0 : 0.16 + i * 0.07
          const common = {
            initial: reduce ? false : { opacity: 0, scale: 0.5 },
            animate: { opacity: 1, scale: 1 },
            transition: { delay, type: 'spring' as const, stiffness: 420, damping: 24 },
            style: { transformOrigin: `${p[0]}px ${p[1]}px` },
          }

          if (s.state === 'reached' || s.state === 'current') {
            // 닿은 자리 — 인장이 찍혀 있다
            return (
              <motion.g key={s.ep.id} {...common}>
                <circle cx={p[0]} cy={p[1]} r={s.state === 'current' ? 9 : sealR} fill={MAP_INK.seal} />
                <circle cx={p[0]} cy={p[1]} r={s.state === 'current' ? 9 : sealR} fill="none" stroke={MAP_INK.sealRing} strokeWidth="1.5" />
                {s.state === 'current' && (
                  <circle
                    cx={p[0]}
                    cy={p[1]}
                    r="14"
                    fill="none"
                    stroke={MAP_INK.sealRing}
                    strokeWidth="1.2"
                    style={reduce ? undefined : { animation: 'glow 4.5s ease-in-out infinite' }}
                  />
                )}
              </motion.g>
            )
          }

          if (s.state === 'next') {
            // 다음 자리 — 화면에서 가장 밝은 한 점. 봉인돼 있고, 남은 거리가 붙는다
            return (
              <motion.g key={s.ep.id} {...common}>
                <circle cx={p[0]} cy={p[1]} r="13" fill={MAP_INK.sealedFill} fillOpacity="0.95" />
                {/* 봉인 위를 빛이 돈다 — "잠겨 있다"와 "열릴 수 있다"를 동시에 말한다.
                    점선 링을 아주 느리게 돌린다(9초). 빠르면 로딩 스피너로 읽힌다. */}
                {!reduce && (
                  <circle
                    cx={p[0]}
                    cy={p[1]}
                    r="17.5"
                    fill="none"
                    stroke={MAP_INK.path}
                    strokeOpacity="0.55"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeDasharray="3 7"
                    style={{ transformOrigin: `${p[0]}px ${p[1]}px`, animation: 'seal-orbit 9s linear infinite' }}
                  />
                )}
                <circle cx={p[0]} cy={p[1]} r="13" fill="none" stroke={MAP_INK.seal} strokeWidth="2" />
                <g transform={`translate(${p[0] - 7},${p[1] - 7})`} color="#ffd868">
                  <IconLocked size={14} />
                </g>
              </motion.g>
            )
          }

          // 봉인된 자리 — 있다는 것만 알린다
          return (
            <motion.circle
              key={s.ep.id}
              {...common}
              cx={p[0]}
              cy={p[1]}
              r={dotR}
              fill="none"
              stroke={MAP_INK.path}
              strokeOpacity="0.5"
              strokeWidth="1.4"
            />
          )
        })}

        {/* 내 토큰 — 길 위에 떠 있다. 정지한 점이면 "살아있는 지도"가 아니다 */}
        {me && (
          <motion.g
            initial={reduce ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduce ? 0 : 1.05, type: 'spring', stiffness: 300, damping: 18 }}
          >
            <g className={reduce ? undefined : 'anim-bob'} style={{ transformOrigin: `${me[0]}px ${me[1]}px` }}>
              <circle cx={me[0]} cy={me[1]} r="7.5" fill={MAP_INK.token} />
              <circle cx={me[0]} cy={me[1]} r="7.5" fill="none" stroke={skin.from} strokeWidth="2" />
            </g>
          </motion.g>
        )}
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
          if (s.state !== 'current' && s.state !== 'next') return null
          const p = pts[i]
          const isNext = s.state === 'next'
          /* 다음 자리는 위로, 지금 자리는 아래로 — 항상 서로 반대편에 붙는다.
             단 카드 밖으로 나가면 안 된다: 위쪽에 붙은 자리의 라벨이 카드 상단에 잘려
             "4.0km 남음"이 반만 보이는 일이 실제로 있었다. 가장자리에서는 방향을 뒤집는다. */
          const above = isNext ? p[1] > 58 : p[1] > H - 52
          /* 마커의 등불 링이 반지름 14다. 라벨을 그보다 가까이 붙이면, 가장자리 보정으로
             라벨이 옆으로 밀렸을 때 글자 앞부분이 마커에 걸려 "광야"가 "…야"로 보인다. */
          const y = above ? p[1] - 26 : p[1] + 25
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
                  className="block font-serif text-[13px] leading-tight"
                  style={{
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
