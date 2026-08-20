/* 지도 미리보기(dev 전용) — RouteMap(사후 기록)과 LiveMap(러닝 중)을
 * 결정론적 경로 하나로 나란히 렌더한다. 지도 스타일을 바꿀 때 전후를
 * 같은 조건에서 비교하려면 데이터가 매번 같아야 한다(Math.random 금지). */
import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/index.css'
import RouteMap from '../src/components/RouteMap'
import LiveMap from '../src/components/LiveMap'
import type { TracePoint } from '../src/lib/geo'

/* 서울숲 둘레 ~2.3km 루프. 페이스는 구간별로 의도한 3계급이 다 나오게:
 * 앞 1/3 평소(370") → 가운데 오르막(430", slow) → 마지막 내리막(330", fast). */
const AVG = 375
function buildLoop(): TracePoint[] {
  const cx = 37.5443
  const cy = 127.0374
  const N = 240
  const pts: TracePoint[] = []
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2
    // 타원 + 낮은 배음 둘 — 실제 공원길처럼 살짝 우그러진 폐곡선
    const wobble = 1 + 0.08 * Math.sin(3 * t + 1.2) + 0.05 * Math.sin(5 * t)
    const lat = cx + 0.0031 * Math.sin(t) * wobble
    const lng = cy + 0.0046 * Math.cos(t) * wobble
    const frac = i / N
    const pace = frac < 0.34 ? 370 : frac < 0.67 ? 430 : 330
    pts.push({ lat, lng, pace })
  }
  return pts
}
const LOOP = buildLoop()

function Preview() {
  /* LiveMap은 점이 자라며 따라가는 지도다 — 실제처럼 점을 하나씩 먹인다 */
  const [liveCount, setLiveCount] = useState(2)
  useEffect(() => {
    const id = setInterval(() => setLiveCount((n) => (n >= LOOP.length ? n : n + 3)), 250)
    return () => clearInterval(id)
  }, [])
  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: 16, display: 'grid', gap: 20 }}>
      <section>
        <h2 style={{ font: '600 13px system-ui', margin: '0 0 8px', color: '#5d4a36' }}>RouteMap — 리빌(경로 전체)</h2>
        <RouteMap points={LOOP} avgPaceSecPerKm={AVG} height={260} />
      </section>
      <section>
        <h2 style={{ font: '600 13px system-ui', margin: '0 0 8px', color: '#5d4a36' }}>LiveMap — 러닝 중(현재 위치 따라가기)</h2>
        <LiveMap points={LOOP.slice(0, liveCount)} avgPaceSecPerKm={AVG} height={240} />
      </section>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
)
