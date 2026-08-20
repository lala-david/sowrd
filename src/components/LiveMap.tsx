import { useEffect, useRef, useState } from 'react'
import type { Map as MLMap, Marker, GeoJSONSource } from 'maplibre-gl'
import type { FeatureCollection } from 'geojson'
import { parchmentStyle, routeGeoJSON, ROUTE_INK } from '../lib/mapStyle'
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
 * 라이브러리·타일·스타일은 RouteMap과 동일(MapLibre + OpenFreeMap + mapStyle.ts 양피지).
 * 동적 import로 이 화면에서만 받는다. 색은 ROUTE_INK 고정 hex — 러닝 화면이 다크 고정이라
 * 토큰을 풀어 쓰면(cssVar) 사용자 테마에 따라 같은 지도 위 선 색이 달라졌다. */

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
  const mapRef = useRef<MLMap | null>(null)
  const hereRef = useRef<Marker | null>(null)
  const lastDrawRef = useRef(0) // 마지막 재그리기 시각(스로틀)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false) // 소스·레이어 준비 완료 — 그리기 effect가 이걸 보고 다시 돈다
  const last = points[points.length - 1]

  // 최초 1회: 맵 생성
  useEffect(() => {
    if (!boxRef.current || !last) return
    let disposed = false
    ;(async () => {
      try {
        // 워커 URL을 명시하는 로더로만 연다 — 기본 부트스트랩은 번들 후 조용히 죽는다(lib/mapLibre.ts)
        const ml = await (await import('../lib/mapLibre')).loadMapLibre()
        if (disposed || !boxRef.current || mapRef.current) return
        const map = new ml.Map({
          container: boxRef.current,
          style: parchmentStyle(),
          center: [last.lng, last.lat],
          zoom: 17,
          // 달리는 중엔 손을 못 대므로 조작을 통째로 끈다 — 따라가기만 한다
          interactive: false,
          attributionControl: { compact: false },
        })
        mapRef.current = map
        let errs = 0
        let windowStart = 0
        map.on('error', () => {
          const now = performance.now()
          if (now - windowStart > 10000) { windowStart = now; errs = 0 }
          if (++errs >= 8 && !disposed) { map.remove(); mapRef.current = null; setFailed(true) }
        })
        map.on('load', () => {
          if (disposed) return
          const empty: FeatureCollection = { type: 'FeatureCollection', features: [] }
          map.addSource('trail-casing', { type: 'geojson', data: empty })
          map.addSource('trail', { type: 'geojson', data: empty })
          /* 케이싱 — 색선 밑에 종이색 한 겹. 도로가 z17에서 8~12px로 그려지므로(mapStyle의
           * wide) 그 폭에 맞춰야 "내가 이 길을 왔다"로 읽힌다. 보드의 길과 같은 문법. */
          map.addLayer({
            id: 'trail-casing',
            type: 'line',
            source: 'trail-casing',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': ROUTE_INK.casing, 'line-width': 14, 'line-opacity': 0.9 },
          })
          // 러닝 중에는 실선 하나로 단순하게 — 파선 구분은 사후 지도(RouteMap)의 몫
          map.addLayer({
            id: 'trail',
            type: 'line',
            source: 'trail',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
              'line-color': [
                'match', ['get', 'band'],
                'slow', ROUTE_INK.slow,
                'fast', ROUTE_INK.fast,
                ROUTE_INK.even,
              ],
              'line-width': 10,
              'line-opacity': 0.95,
            },
          })
          /* 현재 위치는 DOM 마커로 — WebGL 원은 CSS 애니메이션(livePulse)을 못 받는다.
           * 기존 .live-here 맥동을 그대로 쓴다(reduced-motion이면 CSS가 알아서 끈다). */
          const dot = document.createElement('div')
          dot.className = 'live-here'
          dot.style.cssText = `width:14px;height:14px;border-radius:50%;background:${ROUTE_INK.here};border:3px solid ${ROUTE_INK.casing};box-sizing:content-box`
          hereRef.current = new ml.Marker({ element: dot }).setLngLat([last.lng, last.lat]).addTo(map)
          map.resize()
          setReady(true) // 이제 그리기 effect가 마커·선을 갱신한다
        })
      } catch {
        // WebGL 미지원·로드 실패 — 지도 없이도 거리는 계속 잰다
        if (!disposed) setFailed(true)
      }
    })()
    return () => {
      disposed = true
      mapRef.current?.remove()
      mapRef.current = null
      hereRef.current = null
      setReady(false)
    }
    // 최초 위치가 잡힌 시점에 한 번만 만든다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!last])

  /* 위치가 갱신되면 현재 위치 마커를 옮기고 지도를 따라 이동하고, 경로 선을 다시 그린다.
   *
   * 스로틀이 핵심이다. 시뮬레이션은 120ms(초당 8회)마다 표본을 쏘는데, 그때마다
   * GeoJSON을 새로 만들어 setData 하고 panTo 애니메이션을 쌓으면 렌더러가 멈춘다.
   * (실제 GPS는 1초에 한 번이라 문제 없지만, 견고하게 만든다.)
   *  · 마커 이동은 매번(가벼움), 선 재그리기·따라가기는 800ms에 한 번으로 제한 */
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready || points.length < 1) return
    const cur = points[points.length - 1]

    // 마커는 매번 옮긴다(가볍다)
    hereRef.current?.setLngLat([cur.lng, cur.lat])

    const now = performance.now()
    if (now - lastDrawRef.current < 800) return
    lastDrawRef.current = now

    map.panTo([cur.lng, cur.lat], { duration: 500 })

    if (points.length >= 2) {
      const { casing, bands } = routeGeoJSON(points, avgPaceSecPerKm)
      ;(map.getSource('trail-casing') as GeoJSONSource | undefined)?.setData(casing)
      ;(map.getSource('trail') as GeoJSONSource | undefined)?.setData(bands)
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
