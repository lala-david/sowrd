import type { StopState } from '../lib/quest'
import { MAP_INK } from '../lib/journeySkin'

/* ── 자리 메달리온 ─────────────────────────────────────────────────────────
 *
 * 지도의 자리는 **말판의 칸**이어야 한다. 처음엔 반지름 6짜리 납작한 원이었다 —
 * 그건 꺾은선 그래프의 데이터 점이지 게임의 자리가 아니다. 지적받은 그대로였다.
 *
 * 말판의 칸이 되려면 세 가지가 필요하다:
 *   1) **두께** — 테두리와 면이 분리되고, 아래로 그림자가 진다(눌러지는 물건처럼 보인다)
 *   2) **상태가 형태로 갈린다** — 크기·색만이 아니라 안에 들어가는 것이 다르다
 *      (인장 / 순례자 / 자물쇠와 사슬 / 빈 자리)
 *   3) **다음 자리가 압도적으로 크다** — 한 화면에 목표가 하나라는 걸 형태로 말한다
 *
 * 크기는 지도 밀도에 따라 줄어든다(scale). 자리 서른셋을 한 장에 펼칠 때 같은 크기를 쓰면
 * 메달리온끼리 겹쳐서 덩어리가 된다. */

export interface MapNodeProps {
  x: number
  y: number
  state: StopState
  /** 밀도 보정 — 1이면 기본, 0.6이면 전체 지도 */
  scale?: number
  /** 이 자리가 몇 번째인가(1-based). 닿은 자리에 새긴다 */
  order?: number
  uid: string
}

/** 순례자 말 — 자리 위에 서 있는 사람. 얼굴은 그리지 않는다(아트 디렉션 §얼굴 없는 실루엣) */
function Pilgrim({ s }: { s: number }) {
  return (
    <g fill={MAP_INK.sealRing}>
      <circle cx="0" cy={-4.4 * s} r={2.5 * s} />
      <path d={`M0,${-1.6 * s} c${3.6 * s},0 ${5 * s},${3.2 * s} ${5.2 * s},${6.4 * s} l${-10.4 * s},0 c${0.2 * s},${-3.2 * s} ${1.6 * s},${-6.4 * s} ${5.2 * s},${-6.4 * s} z`} />
    </g>
  )
}

export default function MapNode({ x, y, state, scale = 1, order, uid }: MapNodeProps) {
  const s = scale
  const at = `translate(${x.toFixed(1)} ${y.toFixed(1)})`

  if (state === 'sealed') {
    /* 아직 열리지 않은 자리 — 있다는 것만 알린다. 여기에 힘을 주면 다음 자리가 안 보인다.
       점선 링을 둘렀더니 반지름 7에서 톱니바퀴·눈꽃처럼 보였다(작은 원의 점선은 형태가 깨진다).
       그냥 눌러 넣은 자국 하나로 둔다. */
    const r = 5.5 * s
    return (
      <g transform={at}>
        <circle r={r} fill={MAP_INK.roadEdge} fillOpacity="0.34" />
        <circle r={r * 0.42} fill={MAP_INK.roadEdge} fillOpacity="0.6" />
      </g>
    )
  }

  if (state === 'next') {
    /* 다음 자리 — 화면에서 가장 크고 가장 밝다. 자물쇠와 사슬이 걸려 있다.
       "여기가 오늘의 목표다"를 크기로 말한다. */
    const r = 15 * s
    return (
      <g transform={at}>
        <circle cy={2.4 * s} r={r + 1} fill="#000" opacity="0.16" />
        {/* 사슬 — 자물쇠만 있으면 아이콘이고, 사슬이 걸려야 잠긴 물건이 된다 */}
        <g stroke={MAP_INK.seal} strokeWidth={2.6 * s} strokeLinecap="round" opacity="0.9">
          <path d={`M${-r * 0.86},${-r * 0.5} L${r * 0.86},${r * 0.5}`} />
          <path d={`M${-r * 0.86},${r * 0.5} L${r * 0.86},${-r * 0.5}`} />
        </g>
        <circle r={r} fill={`url(#face-lock-${uid})`} />
        <circle r={r} fill="none" stroke={MAP_INK.seal} strokeWidth={2.6 * s} />
        {/* 자물쇠 */}
        <g transform={`scale(${s})`} fill="none" stroke="#ffdf8f" strokeWidth="1.7" strokeLinecap="round">
          <rect x="-4.4" y="-1.2" width="8.8" height="7" rx="1.7" fill="#ffdf8f" stroke="none" />
          <path d="M-2.5,-1.4 V-3.4 a2.5,2.5 0 0 1 5,0 V-1.4" />
        </g>
      </g>
    )
  }

  if (state === 'current') {
    /* 지금 서 있는 자리 — 순례자가 올라서 있다. 등불이 켜져 있다. */
    const r = 13 * s
    return (
      <g transform={at}>
        <circle r={r * 2.4} fill={`url(#halo-${uid})`} />
        <circle cy={2.2 * s} r={r + 1} fill="#000" opacity="0.16" />
        <circle r={r} fill={`url(#face-gold-${uid})`} />
        <circle r={r} fill="none" stroke={MAP_INK.sealRing} strokeWidth={2.2 * s} />
        <Pilgrim s={s} />
      </g>
    )
  }

  /* 닿은 자리 — 인장이 찍혀 있다. 몇 번째 자리인지 새긴다. */
  const r = 10 * s
  return (
    <g transform={at}>
      <circle cy={1.8 * s} r={r} fill="#000" opacity="0.13" />
      <circle r={r} fill={`url(#face-gold-${uid})`} />
      <circle r={r} fill="none" stroke={MAP_INK.sealRing} strokeWidth={1.8 * s} />
      {order != null && s > 0.75 ? (
        <text
          y={3.4 * s}
          textAnchor="middle"
          fontSize={9.5 * s}
          fontWeight="600"
          fill={MAP_INK.sealRing}
          fontFamily="var(--font-display)"
        >
          {order}
        </text>
      ) : (
        <circle r={2.6 * s} fill={MAP_INK.sealRing} />
      )}
    </g>
  )
}

/* ── 장 표식 ───────────────────────────────────────────────────────────────
 *
 * 월드맵에만 선다. 자리 서른셋을 전부 메달리온으로 세우면 덩어리가 되므로,
 * 월드맵에서는 **장이 시작되는 자리**에만 이 표식을 세우고 나머지는 점으로 둔다.
 * 게임의 월드맵에 지역 아이콘이 찍히는 것과 같다 — 누르면 그 지역 안으로 들어간다.
 *
 * 형태를 자리 메달리온(원)과 일부러 다르게 잡았다. 같은 원이면 "여기도 자리인가"로 읽힌다.
 * 땅에 꽂아 세운 **깃발 방패**다: 아래가 뾰족해 한 점을 가리키고, 안에 장 번호가 있다. */
export function ChapterMark({
  x,
  y,
  n,
  sealed,
  scale = 1,
  uid,
}: {
  x: number
  y: number
  /** 장 번호(1-based) */
  n: number
  /** 아직 못 간 장인가 — 있다는 것만 알리고 조용히 둔다 */
  sealed: boolean
  scale?: number
  uid: string
}) {
  const s = scale
  const w = 13 * s
  const h = 15 * s
  const tip = 7 * s
  // 뾰족한 끝이 실제 좌표를 가리키게 위로 띄운다 — 지리가 어긋나면 안 된다
  const at = `translate(${x.toFixed(1)} ${(y - h - tip * 0.5).toFixed(1)})`
  const shield = `M${-w},${-h} L${w},${-h} L${w},${h * 0.35} L0,${h + tip} L${-w},${h * 0.35} Z`

  return (
    <g transform={at} opacity={sealed ? 0.72 : 1}>
      <path d={shield} transform={`translate(1.4 ${2.2 * s})`} fill="#000" opacity="0.15" />
      <path d={shield} fill={sealed ? `url(#face-lock-${uid})` : `url(#face-gold-${uid})`} />
      <path
        d={shield}
        fill="none"
        stroke={sealed ? MAP_INK.seal : MAP_INK.sealRing}
        strokeOpacity={sealed ? 0.7 : 1}
        strokeWidth={1.8 * s}
        strokeLinejoin="round"
      />
      <text
        y={h * 0.05}
        textAnchor="middle"
        fontSize={13 * s}
        fontWeight="700"
        fill={sealed ? MAP_INK.seal : MAP_INK.sealRing}
        fontFamily="var(--font-display)"
        style={{ fontFeatureSettings: "'lnum' 1" }}
      >
        {n}
      </text>
    </g>
  )
}
