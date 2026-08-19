import { useId } from 'react'
import type { SkinTexture } from '../lib/journeySkin'

/* ── 지도의 결 ─────────────────────────────────────────────────────────────
 *
 * 배경이 그냥 어두운 면이면 "카드"이지 "땅"이 아니다. 각 여정의 지형을 아주 옅게 깐다.
 * 규칙 셋:
 *   1) 읽기를 방해하지 않는다 — 여정선·자리·라벨보다 항상 뒤에, 낮은 불투명도로.
 *   2) 움직임은 **느리게**. 물결 18~26초, 별 3~6초. 눈이 따라가면 지도를 못 읽는다.
 *   3) reduce-motion이면 전부 정지한다(아래 CSS 미디어쿼리가 animation을 끈다).
 *
 * 결정론적으로 그린다 — Math.random을 쓰면 리렌더마다 별자리가 바뀌어서
 * "같은 땅"이라는 감각이 깨진다. 인덱스에서 값을 만든다.
 */

/** 인덱스로 만드는 의사난수(0~1). 같은 i는 언제나 같은 값 — 별자리가 흔들리지 않게. */
const rnd = (i: number, salt = 1) => {
  const x = Math.sin(i * 127.1 * salt + 311.7) * 43758.5453
  return x - Math.floor(x)
}

export default function MapTexture({
  texture,
  ink,
  w,
  h,
}: {
  texture: SkinTexture
  ink: string
  w: number
  h: number
}) {
  const uid = useId().replace(/:/g, '')

  if (texture === 'stars') {
    /* 창 15:5 — "하늘을 우러러 뭇별을 셀 수 있나 보라."
       별은 크기를 셋으로 나눈다. 전부 같은 크기면 무늬가 되고, 무늬는 하늘이 아니다. */
    const stars = Array.from({ length: 54 }, (_, i) => {
      const r = rnd(i)
      const size = r < 0.62 ? 0.7 : r < 0.9 ? 1.15 : 1.8
      return {
        x: rnd(i, 2) * w,
        y: rnd(i, 3) * h,
        r: size,
        // 큰 별만 반짝인다 — 54개가 전부 깜빡이면 화면이 지직거린다
        twinkle: size > 1.1,
        delay: rnd(i, 4) * 5,
        dur: 3 + rnd(i, 5) * 3,
      }
    })
    return (
      <g aria-hidden>
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.x.toFixed(1)}
            cy={s.y.toFixed(1)}
            r={s.r}
            fill={ink}
            opacity={s.twinkle ? 0.9 : 0.42}
            style={
              s.twinkle
                ? { animation: `twinkle ${s.dur.toFixed(1)}s ease-in-out ${s.delay.toFixed(1)}s infinite` }
                : undefined
            }
          />
        ))}
      </g>
    )
  }

  if (texture === 'waves' || texture === 'deep-waves') {
    /* 갈릴리 호수 / 지중해. 같은 사인파를 세 겹 겹치되 속도와 진폭을 달리해 깊이를 만든다.
       가로로 두 배 길이를 그려 두고 한 폭만큼 흘려보내면 이음매 없이 순환한다. */
    const deep = texture === 'deep-waves'
    const rows = deep
      ? [
          { y: 0.3, amp: 7, dur: 26, op: 0.16, sw: 1.3 },
          { y: 0.55, amp: 10, dur: 20, op: 0.22, sw: 1.6 },
          { y: 0.78, amp: 13, dur: 15, op: 0.3, sw: 2 },
        ]
      : [
          { y: 0.26, amp: 5, dur: 24, op: 0.14, sw: 1.2 },
          { y: 0.52, amp: 8, dur: 19, op: 0.2, sw: 1.5 },
          { y: 0.8, amp: 11, dur: 14, op: 0.26, sw: 1.8 },
        ]
    const wave = (y: number, amp: number) => {
      const seg = w / 2
      let d = `M0,${(h * y).toFixed(1)}`
      for (let i = 0; i < 4; i++) {
        const x0 = i * seg
        d += ` q${(seg / 4).toFixed(1)},${(-amp).toFixed(1)} ${(seg / 2).toFixed(1)},0`
        d += ` q${(seg / 4).toFixed(1)},${amp.toFixed(1)} ${(seg / 2).toFixed(1)},0`
        void x0
      }
      return d
    }
    return (
      <g aria-hidden>
        {rows.map((r, i) => (
          <g key={i} style={{ animation: `drift ${r.dur}s linear infinite` }}>
            <path
              d={wave(r.y, r.amp)}
              fill="none"
              stroke={ink}
              strokeOpacity={r.op}
              strokeWidth={r.sw}
              strokeLinecap="round"
            />
          </g>
        ))}
      </g>
    )
  }

  if (texture === 'ridges') {
    /* 시내산 — 능선 세 겹. 뒤로 갈수록 옅고 높게(대기원근). */
    const ridge = (base: number, peak: number, seed: number) => {
      const pts: string[] = [`M-10,${h}`]
      const steps = 9
      for (let i = 0; i <= steps; i++) {
        const x = -10 + ((w + 20) * i) / steps
        const jag = (rnd(i + seed, 7) - 0.5) * peak * 0.55
        const y = h * base - Math.sin((i / steps) * Math.PI) * peak + jag
        pts.push(`L${x.toFixed(1)},${y.toFixed(1)}`)
      }
      pts.push(`L${w + 10},${h} Z`)
      return pts.join(' ')
    }
    return (
      <g aria-hidden>
        <path d={ridge(1.02, h * 0.46, 3)} fill={ink} fillOpacity={0.12} />
        <path d={ridge(1.06, h * 0.32, 11)} fill={ink} fillOpacity={0.16} />
        <path d={ridge(1.1, h * 0.2, 23)} fill={ink} fillOpacity={0.22} />
      </g>
    )
  }

  if (texture === 'walls') {
    /* 예루살렘에서 로마까지 — 성벽과 성문. 아래쪽에 낮게 깔아 지평선을 만든다. */
    const merlonW = 13
    const count = Math.ceil(w / merlonW) + 1
    const baseY = h * 0.82
    return (
      <g aria-hidden>
        <rect x="0" y={baseY + 9} width={w} height={h - baseY} fill={ink} fillOpacity={0.2} />
        {Array.from({ length: count }, (_, i) => {
          const tall = rnd(i, 13) > 0.78
          const bh = tall ? 15 : 9
          return (
            <rect
              key={i}
              x={i * merlonW}
              y={baseY + 9 - bh}
              width={merlonW - 4}
              height={bh}
              fill={ink}
              fillOpacity={0.2}
            />
          )
        })}
        {/* 성문 하나 — 벽만 있으면 담이지 도시가 아니다 */}
        <path
          d={`M${(w * 0.62).toFixed(1)},${h} L${(w * 0.62).toFixed(1)},${(baseY + 2).toFixed(1)} a11,11 0 0 1 22,0 L${(w * 0.62 + 22).toFixed(1)},${h} Z`}
          fill={ink}
          fillOpacity={0.3}
        />
        {/* 성문 안의 등불 — 도시가 살아 있다는 유일한 신호. 아주 느리게 숨 쉰다 */}
        <circle
          cx={(w * 0.62 + 11).toFixed(1)}
          cy={(baseY + 6).toFixed(1)}
          r="2.6"
          fill="var(--color-seal-bright)"
          opacity="0.8"
          style={{ animation: 'glow 5.5s ease-in-out infinite' }}
        />
      </g>
    )
  }

  return <g id={uid} aria-hidden />
}
