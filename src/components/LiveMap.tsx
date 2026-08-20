import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap, CircleMarker, Polyline } from 'leaflet'
import { bandOf, BAND_COLOR } from '../lib/runAnalysis'
import type { TracePoint } from '../lib/geo'

/* 실시간 지도 — 달리는 중(Run)과 시작 전 미리보기(Setup)에서 "지금 내 위치"를 보여준다.
 *
 * RouteMap(리빌의 사후 지도)과 다르다: 저건 fitBounds로 경로 전체를 한눈에 보여주지만,
 * 여기선 **현재 위치를 따라가며(follow)** 그 주변만 확대해 보여준다. 러너는 "내가 지금
 * 여기 있고 이만큼 왔다"를 봐야 한다.
 *
 * 프라이버시: 이 지도는 화면 표시 전용이다. 좌표를 저장하지 않는다(저장은 「경로 기록」을
 * 켠 경우에만, 그것도 리빌에서 obfuscateEnds로 양 끝을 잘라낸 뒤). 여기 그리는 것은 휘발성이다.
 *
 * 라이브러리·타일은 RouteMap과 동일(Leaflet 1.9.4 + OSM). 동적 import로 이 화면에서만 받는다.
 * SVG 표현 속성의 var()는 WebKit에서 안 풀리므로 색은 cssVar()로 미리 실제 색으로 바꾼다. */

function cssVar(v: string): string {
  if (typeof document === 'undefined' || !v.startsWith('var(')) return v
  const name = v.slice(4, -1).split(',')[0].trim()
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || v
}

export default function LiveMap({
  points,
  avgPaceSecPerKm,
  height = 220,
  className = '',
}: {
  /** 지금까지의 경로. 마지막 점이 현재 위치다. */
  points: TracePoint[]
  avgPaceSecPerKm: number
  height?: number
  className?: string
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const hereRef = useRef<CircleMarker | null>(null)
  const linesRef = useRef<Polyline[]>([])
  const LRef = useRef<typeof import('leaflet') | null>(null) // leaflet 모듈 캐시 — 매번 import 안 한다
  const lastDrawRef = useRef(0) // 마지막 재그리기 시각(스로틀)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false) // 맵 생성 완료 — 그리기 effect가 이걸 보고 다시 돈다
  const last = points[points.length - 1]

  // 최초 1회: 맵 생성
  useEffect(() => {
    if (!boxRef.current || !last) return
    let disposed = false
    ;(async () => {
      try {
        const [L] = await Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')])
        if (disposed || !boxRef.current || mapRef.current) return
        LRef.current = L
        const map = L.map(boxRef.current, {
          center: [last.lat, last.lng],
          zoom: 17,
          zoomControl: false,
          attributionControl: true,
          // 달리는 중엔 손을 못 대므로 조작을 다 끈다 — 따라가기만 한다
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          touchZoom: false,
          keyboard: false,
        })
        mapRef.current = map
        const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap',
        }).addTo(map)
        let tileErrors = 0
        let windowStart = 0
        tiles.on('tileerror', () => {
          const now = performance.now()
          if (now - windowStart > 10000) { windowStart = now; tileErrors = 0 }
          if (++tileErrors >= 8 && !disposed) { map.remove(); mapRef.current = null; setFailed(true) }
        })
        map.invalidateSize({ animate: false })
        map.setView([last.lat, last.lng], 17, { animate: false })
        setReady(true) // 이제 그리기 effect가 마커·선을 그린다
      } catch {
        if (!disposed) setFailed(true)
      }
    })()
    return () => {
      disposed = true
      mapRef.current?.remove()
      mapRef.current = null
      hereRef.current = null
      linesRef.current = []
      setReady(false)
    }
    // 최초 위치가 잡힌 시점에 한 번만 만든다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!last])

  /* 위치가 갱신되면 현재 위치 마커를 옮기고 지도를 따라 이동하고, 경로 선을 다시 그린다.
   *
   * 스로틀이 핵심이다. 시뮬레이션은 120ms(초당 8회)마다 표본을 쏘는데, 그때마다 leaflet을
   * 재import하고 폴리라인을 전부 지웠다 다시 그리고 panTo 애니메이션을 쌓으면 렌더러가 멈춘다.
   * (실제 GPS는 1초에 한 번이라 문제 없지만, 견고하게 만든다.)
   *  · leaflet 모듈은 한 번 받아 LRef에 캐시(매번 import 안 함)
   *  · 마커 이동은 매번(가벼움), 선 재그리기는 800ms에 한 번으로 제한 */
  useEffect(() => {
    const map = mapRef.current
    const L = LRef.current
    if (!map || !L || points.length < 1) return
    const cur = points[points.length - 1]

    // 마커는 매번 옮긴다(가볍다)
    if (!hereRef.current) {
      hereRef.current = L.circleMarker([cur.lat, cur.lng], {
        radius: 7,
        color: cssVar('var(--color-sand)'),
        weight: 3,
        fillColor: cssVar('var(--color-clay)'),
        fillOpacity: 1,
        className: 'live-here',
      }).addTo(map)
      map.setView([cur.lat, cur.lng], map.getZoom(), { animate: false })
    } else {
      hereRef.current.setLatLng([cur.lat, cur.lng])
    }

    // 선 재그리기·따라가기는 800ms에 한 번만
    const now = performance.now()
    if (now - lastDrawRef.current < 800) return
    lastDrawRef.current = now

    map.panTo([cur.lat, cur.lng], { animate: true, duration: 0.5 })

    linesRef.current.forEach((ln) => ln.remove())
    linesRef.current = []
    if (points.length >= 2) {
      /* 케이싱 — 색선 밑에 종이색 한 겹. OSM 도로가 줌 17에서 10~14px라, 6px 단선은
       * 도로 위의 실처럼 보였다. 도로 폭에 맞춰야 "내가 이 길을 왔다"로 읽힌다. */
      linesRef.current.push(
        L.polyline(points.map((p) => [p.lat, p.lng] as [number, number]), {
          color: cssVar('var(--color-sand)'),
          weight: 14,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map),
      )
      let segStart = 0
      let segBand = bandOf(points[1].pace ?? avgPaceSecPerKm, avgPaceSecPerKm)
      const draw = (from: number, to: number, band: 'slow' | 'even' | 'fast') => {
        const ln = L.polyline(
          points.slice(from, to + 1).map((p) => [p.lat, p.lng] as [number, number]),
          { color: cssVar(BAND_COLOR[band]), weight: 10, opacity: 0.95, lineCap: 'round', lineJoin: 'round' },
        ).addTo(map)
        linesRef.current.push(ln)
      }
      for (let i = 1; i < points.length; i++) {
        const b = bandOf(points[i].pace ?? avgPaceSecPerKm, avgPaceSecPerKm)
        if (b !== segBand) { draw(segStart, i, segBand); segStart = i; segBand = b }
      }
      draw(segStart, points.length - 1, segBand)
    }
  }, [points, avgPaceSecPerKm, ready])

  if (!last) return null
  if (failed)
    return (
      <div className={`flex items-center justify-center rounded-2xl bg-sand-sunk/60 text-[12px] text-muted ${className}`} style={{ height }}>
        지도를 못 받아왔어요. 거리는 계속 재고 있습니다.
      </div>
    )
  return (
    <div className={className}>
      <div
        ref={boxRef}
        style={{ height }}
        className="w-full overflow-hidden rounded-2xl ring-1 ring-line-strong"
        role="img"
        aria-label="지금 내 위치와 달린 길"
      />
    </div>
  )
}
