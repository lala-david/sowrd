import { useEffect, useRef, useState } from 'react'
import type { Map as MLMap } from 'maplibre-gl'
import { BAND_LABEL, type PaceBand } from './../lib/runAnalysis'
import { parchmentStyle, routeGeoJSON, ROUTE_INK } from '../lib/mapStyle'
import type { TracePoint } from '../lib/geo'
import RouteTrace from './RouteTrace'

/* 실제 지도 위에 달린 경로를 페이스 색으로 그린다.
 *
 * 라이브러리: MapLibre GL JS (BSD-3) + OpenFreeMap 벡터 타일 + 우리 스타일(mapStyle.ts).
 * 2026-08-20에 Leaflet + OSM 라스터에서 교체했다. 이전 헤더는 "MapLibre 18.9MB라 과하다"며
 * 기각했는데, 18.9MB는 npm 패키지 크기고 실제 비용은 동적 청크 gz ~210KB다 — 지도 화면에서만
 * 받고 PWA가 한 번 캐시한다. 대신 얻는 것: ① 기본 OSM 타일(실측 평균 채도 0.541 — 앱 화면의
 * 3~4배)이 아니라 양피지 스타일을 우리가 소유 ② OSM 공식 타일 usage policy(배포 앱 사전 허가·
 * 예고 없는 차단)에서 벗어남 ③ 로고 워터마크 없음. 저작자 표기(ODbL 조건)는 유지한다.
 *
 * 지도와 CSS는 동적 import로 이 컴포넌트가 실제로 보일 때만 받는다.
 * WebGL이 없는 기기에서는 Map 생성이 던진다 → SVG 폴백(RouteTrace)으로 내려간다.
 *
 * 색은 ROUTE_INK 고정 hex다. 예전엔 CSS 토큰을 풀어 썼는데(cssVar) 지도 종이가
 * 테마 무관 고정이 되면서 잉크도 고정이어야 한다(journeySkin.ts의 MAP_INK와 같은 규칙). */

export default function RouteMap({
  points,
  avgPaceSecPerKm,
  height = 240,
  className = '',
}: {
  points: TracePoint[]
  avgPaceSecPerKm: number
  height?: number
  className?: string
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MLMap | null>(null)
  /* 데이터 절약 모드면 처음부터 지도를 포기하고 SVG 폴백(RouteTrace, 네트워크 0건)으로 간다.
   * 벡터 타일은 라스터보다 가볍지만(화면당 대략 수십~200KB) 공짜는 아니다 —
   * 데이터를 아끼려는 사용자에게 물어보지 않고 쓰면 안 된다.
   * navigator.connection은 표준은 아니지만 있는 브라우저(주로 안드로이드 크롬)에서만 참이라
   * 없으면 평소대로 지도를 그린다. */
  const saveData =
    typeof navigator !== 'undefined' &&
    (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData === true
  const [failed, setFailed] = useState(saveData)

  useEffect(() => {
    if (saveData) return // 지도 로드를 아예 시작하지 않는다
    if (!boxRef.current || points.length < 2) return
    let disposed = false

    ;(async () => {
      try {
        // 워커 URL을 명시하는 로더로만 연다 — 기본 부트스트랩은 번들 후 조용히 죽는다(lib/mapLibre.ts)
        const ml = await (await import('../lib/mapLibre')).loadMapLibre()
        if (disposed || !boxRef.current) return

        /* 시야를 **먼저** 자기 동네에 고정한다 — 첫 좌표 + z16으로 시작하고,
         * 스타일이 로드되면 fitBounds로 경로 전체에 맞춘다. */
        const first = points[0]
        const map = new ml.Map({
          container: boxRef.current,
          style: parchmentStyle(),
          center: [first.lng, first.lat],
          zoom: 16,
          // 기록을 보는 화면이지 탐색하는 화면이 아니다 — 조작을 통째로 끈다
          interactive: false,
          // 저작자 표기는 항상 펼쳐 보인다(접힌 ⓘ 뒤에 숨기지 않는다 — 데이터 이용 조건)
          attributionControl: { compact: false },
        })
        mapRef.current = map

        /* 오프라인·차단이면 타일/스타일 요청이 error 이벤트로 온다.
         * 시간창으로 센다 — 일시적 한두 번의 실패로 멀쩡한 지도를 폴백으로 떨어뜨리지 않게.
         * 폴백으로 넘어갈 때 맵을 즉시 정리한다(리스너·타이머까지). */
        let errs = 0
        let windowStart = 0
        map.on('error', () => {
          const now = performance.now()
          if (now - windowStart > 10000) { windowStart = now; errs = 0 }
          if (++errs >= 6 && !disposed) {
            map.remove()
            mapRef.current = null
            setFailed(true)
          }
        })

        map.on('load', () => {
          if (disposed) return
          const { casing, bands } = routeGeoJSON(points, avgPaceSecPerKm)
          map.addSource('route-casing', { type: 'geojson', data: casing })
          map.addSource('route', { type: 'geojson', data: bands })
          /* 케이싱 — 경로 전체 밑에 종이색 한 겹. 퀘스트 보드의 길과 같은 문법이라
           * 두 지도가 한 앱으로 읽히고, 지도 위에서 색선의 대비도 벌어진다. */
          map.addLayer({
            id: 'route-casing',
            type: 'line',
            source: 'route-casing',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': ROUTE_INK.casing, 'line-width': 14, 'line-opacity': 0.9 },
          })
          /* 색 + 굵기 + 파선의 3중 인코딩(색약 대응 — 최악 쌍 protan ΔE 13.3).
           * 파선은 데이터 구동이 안 되므로 밴드마다 레이어를 나눈다.
           * 도로가 z16~17에서 8~12px로 그려진다(mapStyle의 wide) — 그에 맞춘 폭. */
          const bandLayer = (band: PaceBand, width: number, dashPx?: [number, number]) =>
            map.addLayer({
              id: `route-${band}`,
              type: 'line',
              source: 'route',
              filter: ['==', ['get', 'band'], band],
              layout: { 'line-cap': 'round', 'line-join': 'round' },
              paint: {
                'line-color': ROUTE_INK[band],
                'line-width': width,
                'line-opacity': 0.95,
                // MapLibre의 dasharray 단위는 px가 아니라 선 폭 배수다
                ...(dashPx ? { 'line-dasharray': [dashPx[0] / width, dashPx[1] / width] } : {}),
              },
            })
          bandLayer('slow', 10)
          bandLayer('even', 8, [3, 7])
          bandLayer('fast', 9, [14, 6])

          const start = points[0]
          const end = points[points.length - 1]
          map.addSource('route-ends', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [
                { type: 'Feature', properties: { kind: 'start' }, geometry: { type: 'Point', coordinates: [start.lng, start.lat] } },
                { type: 'Feature', properties: { kind: 'end' }, geometry: { type: 'Point', coordinates: [end.lng, end.lat] } },
              ],
            },
          })
          map.addLayer({
            id: 'route-ends',
            type: 'circle',
            source: 'route-ends',
            paint: {
              'circle-radius': ['match', ['get', 'kind'], 'start', 6, 8],
              'circle-color': ['match', ['get', 'kind'], 'start', ROUTE_INK.start, ROUTE_INK.end],
              'circle-stroke-color': ROUTE_INK.markerRing,
              'circle-stroke-width': 2,
            },
          })

          /* 컨테이너 크기를 다시 재고 나서 경로에 맞춘다.
           * maxZoom 17 — 제자리에서 GPS가 튄 정도의 경로에 그 이상 파고들면 길 이름만 남고
           * 어디를 달렸는지 알아볼 수 없다. 하한은 생성 시의 z16 시야가 잡아 뒀다. */
          let west = Infinity, south = Infinity, east = -Infinity, north = -Infinity
          for (const p of points) {
            if (p.lng < west) west = p.lng
            if (p.lng > east) east = p.lng
            if (p.lat < south) south = p.lat
            if (p.lat > north) north = p.lat
          }
          const fit = () => {
            if (disposed) return
            map.resize()
            map.fitBounds([[west, south], [east, north]], { padding: 24, maxZoom: 17, duration: 0 })
          }
          fit()
          // 카드가 펼쳐지는 중이면 첫 측정이 최종 크기가 아니다 — 한 프레임 뒤 한 번 더
          requestAnimationFrame(fit)
        })
      } catch {
        // 오프라인·WebGL 미지원이면 지도를 포기한다 — 화면이 깨지지는 않게
        if (!disposed) setFailed(true)
      }
    })()

    return () => {
      disposed = true
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [points, avgPaceSecPerKm, saveData])

  if (points.length < 2) return null
  /* 타일을 못 받으면 지도를 포기하되 화면을 비우지는 않는다 — 좌표는 있으므로
   * 형태와 페이스 분포는 SVG로 그릴 수 있다(RouteTrace가 그 폴백이다). */
  if (failed)
    return (
      <div className={className}>
        <RouteTrace points={points} avgPaceSecPerKm={avgPaceSecPerKm} height={height} />
        <p className="mt-2 px-1 text-[11px] text-muted">지도를 못 받아왔어요. 달린 길의 모양만 그렸습니다.</p>
      </div>
    )

  return (
    <div className={className}>
      <div
        ref={boxRef}
        style={{ height }}
        className="w-full overflow-hidden rounded-2xl ring-1 ring-line-strong"
        /* role="img"를 쓰지 않는다 — 하위 콘텐츠를 접근성 트리에서 지우는데,
           그 안에 저작자 표기가 들어 있다(데이터 이용 조건).
           대신 경로 요약을 아래에 텍스트로 준다. */
        aria-label="오늘 달린 경로 지도"
      />
      <p className="sr-only">
        {`${points.length}개 지점으로 기록된 경로입니다. 느린 구간은 굵은 실선, 평소 속도는 촘촘한 점선, 빠른 구간은 성긴 파선으로 그렸습니다.`}
      </p>
      {/* 색이 무엇을 뜻하는지 밝힌다 — 색만 칠하고 설명이 없으면 장식이 된다.
          범례 색은 지도의 선과 같은 고정 잉크(ROUTE_INK)라 테마와 무관하게 지도와 일치한다. */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 px-1">
        {(['fast', 'even', 'slow'] as PaceBand[]).map((b) => (
          <span key={b} className="flex items-center gap-1.5 text-[11px] text-muted">
            {/* 범례도 굵기·파선을 그대로 보여줘야 지도와 대조할 수 있다.
                선 밑에 지도 종이색 칩을 깐다 — 잉크가 고정이라 다크 테마의 어두운
                배경에 맨살로 놓으면 even(#5a503f)이 1.8:1로 사라진다. 지도와 같은
                종이 위에 놓아야 색도 지도와 똑같이 읽힌다. */}
            <svg width="20" height="9" aria-hidden>
              <rect x="0" y="0" width="20" height="9" rx="3" fill={ROUTE_INK.casing} />
              <line
                x1="2" y1="4.5" x2="18" y2="4.5"
                strokeWidth={b === 'slow' ? 4 : b === 'fast' ? 3 : 2.5}
                strokeDasharray={b === 'slow' ? undefined : b === 'fast' ? '5 2' : '1 2.5'}
                strokeLinecap="round"
                style={{ stroke: ROUTE_INK[b] }}
              />
            </svg>
            {BAND_LABEL[b]}
          </span>
        ))}
      </div>
    </div>
  )
}
