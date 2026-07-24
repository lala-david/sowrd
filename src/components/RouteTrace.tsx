import { bandOf, BAND_COLOR } from '../lib/runAnalysis'
import type { TracePoint } from '../lib/geo'

/* 달린 경로의 '모양'을 페이스 색으로 그린다.
 *
 * 지도(RouteMap)를 못 쓸 때의 폴백이다 — 오프라인이거나 타일을 못 받는 상황.
 * 좌표는 같지만 타일을 안 받으므로 네트워크 요청이 0건이고, 형태와 페이스 분포는 그대로 읽힌다.
 *
 * 색: 느린 구간이 따뜻한 테라코타, 빠른 구간이 찬 라피스, 평소 속도가 중립 회색.
 * 순차형이 아니라 발산형이다 — 가장 어두운 색은 '느림'이 아니라 '평소'다.
 * 기준은 그날 자신의 평균이라 남과 비교되지 않는다. */
export default function RouteTrace({
  points,
  avgPaceSecPerKm,
  height = 200,
  className = '',
}: {
  points: TracePoint[]
  avgPaceSecPerKm: number
  height?: number
  className?: string
}) {
  if (points.length < 2) return null

  /* 날짜변경선(±180°) 대응 — 경도를 그대로 min/max 하면 179.9995와 -179.9995가
   * 0.002도가 아니라 359.999도로 계산돼 지구 반대편까지 선이 그어진다.
   * 첫 점 기준으로 ±180을 넘는 값을 풀어(unwrap) 연속된 축으로 만든다. */
  const base = points[0].lng
  const unwrap = (lng: number) => {
    let v = lng
    while (v - base > 180) v -= 360
    while (v - base < -180) v += 360
    return v
  }
  /* 경도는 미터로 환산해서 다룬다.
   * 위도 1도와 경도 1도는 같은 거리가 아니다(서울에서 경도 1도는 위도 1도의 0.79배).
   * 도(degree) 단위를 그대로 쓰면 동서로 달린 경로가 79%로 눌려 형태가 거짓말이 된다. */
  const kx = Math.cos((points[0].lat * Math.PI) / 180)
  const xs = points.map((p) => unwrap(p.lng) * kx)
  const ys = points.map((p) => p.lat)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  const pad = 14
  /* 하한이 1이면 안 된다 — 단위가 '도'라서 5km 루프의 경도 폭 0.018도가 1로 올림되고,
   * 축척이 55배 작아져 경로 전체가 240px 상자 안에서 3.1px짜리 점으로 그려졌다.
   * 오프라인 사용자가 보던 것이 바로 그 점이다. 0 나눗셈만 막으면 충분하다. */
  const w = Math.max(1e-9, maxX - minX)
  const h = Math.max(1e-9, maxY - minY)
  // 가로세로 비를 유지한 채 뷰박스에 맞춘다(경로가 찌그러지면 형태가 거짓말이 된다)
  const box = 100
  const scale = (box - pad * 2) / Math.max(w, h)
  const ox = (box - w * scale) / 2
  const oy = (box - h * scale) / 2
  // unwrap을 여기서도 써야 한다 — min/max만 풀고 좌표는 원본을 쓰면 날짜변경선에서 25,919배로 튄다
  const px = (p: TracePoint) => ox + (unwrap(p.lng) * kx - minX) * scale
  // SVG는 y가 아래로 커지므로 북쪽이 위로 오게 뒤집는다
  const py = (p: TracePoint) => box - (oy + (p.lat - minY) * scale)

  return (
    <svg
      viewBox={`0 0 ${box} ${box}`}
      style={{ height }}
      className={`w-full ${className}`}
      role="img"
      aria-label="오늘 달린 경로의 모양. 붉은 선은 평소보다 느린 구간, 푸른 선은 평소보다 빠른 구간입니다."
    >
      {points.slice(1).map((p, i) => {
        const a = points[i]
        const pace = p.pace ?? avgPaceSecPerKm
        return (
          <line
            key={i}
            x1={px(a)}
            y1={py(a)}
            x2={px(p)}
            y2={py(p)}
            style={{ stroke: BAND_COLOR[bandOf(pace, avgPaceSecPerKm)] }}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
        )
      })}
      {/* 출발·도착 */}
      <circle cx={px(points[0])} cy={py(points[0])} r={3} strokeWidth={1.4} style={{ fill: 'var(--color-sand)', stroke: 'var(--color-ink)' }} />
      <circle cx={px(points[points.length - 1])} cy={py(points[points.length - 1])} r={3.4} style={{ fill: 'var(--color-sun)' }} />
    </svg>
  )
}
