import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import { bandOf, BAND_COLOR, BAND_LABEL, type PaceBand } from '../lib/runAnalysis'
import type { TracePoint } from '../lib/geo'
import RouteTrace from './RouteTrace'

/* 실제 지도 위에 달린 경로를 페이스 색으로 그린다.
 *
 * 라이브러리: Leaflet 1.9.4 (BSD-2-Clause, 전이 의존성 0, 알려진 취약점 0).
 * react-leaflet은 쓰지 않는다 — Hippocratic-2.1 라이선스는 OSI 승인이 아니고 사용 제한 조항이 있다.
 * MapLibre는 같은 일을 하는데 18.9MB라 이 앱(번들 gz 137KB)에는 과하다.
 *
 * 지도와 Leaflet CSS는 동적 import로 이 컴포넌트가 실제로 보일 때만 받는다.
 * 타일: OpenStreetMap. 저작자 표시가 이용 조건이라 attribution을 끄지 않는다.
 * (프로덕션 트래픽에서는 OSM 타일 이용 정책상 자체 타일 서버가 필요하다 — MASTERPLAN 2절의
 *  Protomaps 자가호스팅 계획이 그 자리다.)
 */
/* CSS 변수를 실제 색으로 푼다.
 * Leaflet은 이 값을 SVG presentation attribute로 setAttribute 하는데, 거기서
 * var(--x)가 해석되는지는 브라우저마다 다르다(Chrome은 되고 WebKit은 역사적으로 안 됐다).
 * 이 앱은 build.target에 safari15가 있으므로 추측에 기대지 않는다. */
function cssVar(v: string): string {
  if (!v.startsWith('var(')) return v
  const name = v.slice(4, -1).split(',')[0].trim()
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || v
}

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
  const mapRef = useRef<LeafletMap | null>(null)
  /* 데이터 절약 모드면 처음부터 지도를 포기하고 SVG 폴백(RouteTrace, 네트워크 0건)으로 간다.
   * OSM 타일은 회당 150~500KB다 — 데이터를 아끼려는 사용자에게 물어보지도 않고 쓰면 안 된다.
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
        const [L] = await Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')])
        if (disposed || !boxRef.current) return

        /* 시야를 **먼저** 자기 동네에 고정한다.
         * L.map()을 center/zoom 없이 만들면 뷰가 없는 상태로 시작하고, 컨테이너가 아직
         * 레이아웃 전(높이 0)이면 뒤이은 fitBounds가 getBoundsZoom에서 minZoom(=0)을 골라
         * 지도 전체가 세계지도로 그려진다. 첫 좌표 + z16으로 시작하면 그 경로가 아예 없다. */
        const first = points[0]
        const map = L.map(boxRef.current, {
          center: [first.lat, first.lng],
          zoom: 16,
          zoomControl: false,
          attributionControl: true,
          // 기록을 보는 화면이지 탐색하는 화면이 아니다 — 조작을 줄여 오조작을 막는다
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          touchZoom: false,
          keyboard: false,
        })
        mapRef.current = map

        const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '&copy; OpenStreetMap',
        }).addTo(map)
        /* 오프라인이면 타일 요청이 조용히 실패한다(예외 아님) → 회색 빈 상자 위에 선만 남는다.
           일정 수 이상 실패하면 폴백으로 넘긴다. */
        /* 타일 실패 판정은 시간창으로 본다 — OSM은 바다·고줌에서 정상적으로 404를 내므로
         * 누적 4회로 세면 멀쩡한 지도를 폴백으로 떨어뜨린다.
         * 그리고 폴백으로 넘어갈 때 맵을 즉시 정리한다 — 예전엔 failed가 deps에 없어
         * 클린업이 안 돌았고, DOM에서 떨어진 컨테이너에 붙은 맵이 리사이즈 리스너·타일
         * 타이머와 함께 언마운트까지 살아 있었다. */
        let tileErrors = 0
        let windowStart = 0
        tiles.on('tileerror', () => {
          const now = performance.now()
          if (now - windowStart > 10000) { windowStart = now; tileErrors = 0 }
          if (++tileErrors >= 6 && !disposed) {
            map.remove()
            mapRef.current = null
            setFailed(true)
          }
        })

        /* 같은 밴드끼리 이어붙여 폴리라인 수를 줄인다.
         * 예전엔 점 쌍마다 폴리라인 하나였다(최대 399개). 색이 바뀔 때만 새 선을 시작하면
         * 실제 러닝에선 3~10개로 줄어 렌더가 가볍고 선도 매끄럽다.
         * 색 기준은 그날 자기 평균이라 남과 비교되지 않는다. */
        const styleOf = (band: PaceBand) => ({
          /* 색 + 굵기 + 파선의 3중 인코딩.
           * 색만 쓰면 이 앱에서 유일하게 색약 사용자가 정보를 못 받는 곳이 된다.
           * 하필 가장 약한 쌍(느림↔평소, protan ΔE 13.3)이 구불구불한 5px 선에 올라간다. */
          color: cssVar(BAND_COLOR[band]),
          weight: band === 'slow' ? 6 : band === 'fast' ? 5 : 4,
          dashArray: band === 'slow' ? undefined : band === 'fast' ? '10 4' : '2 5',
          opacity: 0.95,
          lineCap: 'round' as const,
        })
        // 각 구간(i-1→i)의 밴드는 points[i].pace로 정한다(원래 동작과 동일).
        let segStart = 0
        let segBand = bandOf(points[1].pace ?? avgPaceSecPerKm, avgPaceSecPerKm)
        for (let i = 1; i < points.length; i++) {
          const legBand = bandOf(points[i].pace ?? avgPaceSecPerKm, avgPaceSecPerKm)
          if (legBand !== segBand) {
            L.polyline(points.slice(segStart, i).map((p) => [p.lat, p.lng] as [number, number]), styleOf(segBand)).addTo(map)
            segStart = i - 1 // 한 점 겹쳐 선이 끊기지 않게
            segBand = legBand
          }
        }
        L.polyline(points.slice(segStart).map((p) => [p.lat, p.lng] as [number, number]), styleOf(segBand)).addTo(map)

        const start = points[0]
        const end = points[points.length - 1]
        L.circleMarker([start.lat, start.lng], {
          radius: 5,
          color: cssVar('var(--color-ink)'),
          weight: 2,
          fillColor: cssVar('var(--color-sand)'),
          fillOpacity: 1,
        }).addTo(map)
        L.circleMarker([end.lat, end.lng], {
          radius: 7,
          color: cssVar('var(--color-ink)'),
          weight: 2,
          fillColor: cssVar('var(--color-sun)'),
          fillOpacity: 1,
        }).addTo(map)

        /* 컨테이너 크기를 다시 재고 나서 경로에 맞춘다.
         * invalidateSize() 없이 fitBounds를 부르면 아직 0×0으로 알고 있는 크기로 줌을 계산한다.
         * maxZoom 17 — 제자리에서 GPS가 튄 정도의 경로에 z18까지 파고들면 길 이름만 남고
         * 어디를 달렸는지 알아볼 수 없다. 반대쪽 하한은 setView(z16)가 이미 잡아 뒀다. */
        const fit = () => {
          if (disposed) return
          map.invalidateSize({ animate: false })
          map.fitBounds(
            L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])),
            { padding: [24, 24], maxZoom: 17, animate: false },
          )
        }
        fit()
        // 카드가 펼쳐지는 중이면 첫 측정이 최종 크기가 아니다 — 한 프레임 뒤 한 번 더
        requestAnimationFrame(fit)
      } catch {
        // 오프라인이거나 타일을 못 받으면 지도를 포기한다 — 화면이 깨지지는 않게
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
   * 형태와 페이스 분포는 SVG로 그릴 수 있다(RouteTrace가 그 폴백인데 아무도 안 부르고 있었다). */
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
           그 안에 Leaflet이 렌더하는 OSM 저작자 표시가 들어 있다(타일 이용 조건).
           대신 경로 요약을 아래에 텍스트로 준다. */
        aria-label="오늘 달린 경로 지도"
      />
      <p className="sr-only">
        {`${points.length}개 지점으로 기록된 경로입니다. 느린 구간은 굵은 실선, 평소 속도는 촘촘한 점선, 빠른 구간은 성긴 파선으로 그렸습니다.`}
      </p>
      {/* 색이 무엇을 뜻하는지 밝힌다 — 색만 칠하고 설명이 없으면 장식이 된다 */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 px-1">
        {(['fast', 'even', 'slow'] as PaceBand[]).map((b) => (
          <span key={b} className="flex items-center gap-1.5 text-[11px] text-muted">
            {/* 범례도 굵기·파선을 그대로 보여줘야 지도와 대조할 수 있다 */}
            <svg width="18" height="7" aria-hidden>
              <line
                x1="1" y1="3.5" x2="17" y2="3.5"
                stroke={BAND_COLOR[b]}
                strokeWidth={b === 'slow' ? 4 : b === 'fast' ? 3 : 2.5}
                strokeDasharray={b === 'slow' ? undefined : b === 'fast' ? '5 2' : '1 2.5'}
                strokeLinecap="round"
              />
            </svg>
            {BAND_LABEL[b]}
          </span>
        ))}
      </div>
    </div>
  )
}
