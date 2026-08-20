/* ── 실제 지도(러닝 경로용)의 양피지 스타일 — 우리가 소유하는 스타일 ──────────
 *
 * 2026-08-20, OSM 라스터 타일 → MapLibre + OpenFreeMap 벡터로 교체하며 만들었다.
 * 이유 셋:
 *   1) 기본 OSM 타일은 이 앱에서 이물질이었다 — 실측 평균 채도 0.541(앱 화면들은
 *      0.12~0.19), 민트색 공원과 분홍 도로가 양피지 위에 관광지도를 붙여 놓은 것처럼 떴다.
 *   2) OSM 공식 타일 usage policy는 "heavy use 앱 배포는 사전 허가 없이 금지·예고 없이
 *      차단 가능"을 명시한다. OpenFreeMap은 무제한·상업 허용·키 없음(등록조차 없음).
 *   3) 벡터라 스타일 JSON을 우리가 소유한다. 공급자가 사라져도 sources의 URL 한 줄만
 *      다른 OpenMapTiles 호환 타일(MapTiler 등)로 바꾸면 이 지도는 그대로다.
 *
 * 워터마크는 없다. MapLibre(BSD)도 OpenFreeMap도 로고를 강제하지 않는다.
 * 남는 것은 구석의 저작자 표기 한 줄 — 이것은 워터마크가 아니라 OSM 데이터
 * 라이선스(ODbL)의 조건이라 어느 공급자를 써도 뗄 수 없고, 떼면 안 된다.
 *
 * 색은 전부 **고정 hex**다. journeySkin.ts의 MAP_INK와 같은 규칙 — 종이(지도)는
 * 테마를 따라가지 않으므로 잉크가 토큰을 쓰면 다크 테마에서 값이 뒤집힌다.
 * (실제 사고: 다크에서 봉인 마커가 하늘색이 되어 대비 1.41:1로 사라졌다.)
 *
 * 명도 폭을 유지한다. 지도를 양피지색으로 칠했다가 명도 폭이 22→9로 떨어진 적이
 * 있다(개선인 줄 알았는데 악화). 종이는 밝게 두되 물·숲·글자는 뚜렷이 어둡거나
 * 차게 — 대비는 바탕이 아니라 잉크에서 만든다(journeySkin.ts 원칙).
 * 색을 만졌으면: node scripts/check-contrast.mjs (이 파일도 파싱한다)
 */
import type { StyleSpecification } from 'maplibre-gl'
import type { Feature, FeatureCollection, LineString } from 'geojson'
import type { TracePoint } from './geo'
import { bandOf, type PaceBand } from './runAnalysis'

/** 지도 종이와 그 위의 지형 잉크 — 고정값(테마 무관) */
export const MAP_PAPER = {
  /** 종이 바탕 — 앱의 sand(#f7ecd5)와 한 몸으로 읽히는 값 */
  paper: '#f6ecd4',
  /** 주거지 면 — 종이를 반 단만 가라앉힌다. 더 어두우면 도시가 얼룩이 된다 */
  paperShade: '#efe2c2',
  /** 물 — 바랜 청록. 이 지도에서 유일하게 차가운 면이라 명도 폭과 찬 색을 책임진다 */
  water: '#a5c4ba',
  waterLine: '#8fb3a7',
  /** 공원·풀밭 / 숲 — 올리브 쪽으로 바랜 초록 두 단 */
  park: '#dde2b2',
  wood: '#cbd59d',
  sand: '#f0e3bf',
  /** 건물 — 종이 위 옅은 도장. 러너가 도시에서 방향을 잡는 실마리 */
  building: '#e9dab7',
  buildingLine: '#d9c497',
  /** 길 — 종이보다 밝은 리본 + 가장자리 선. 보드의 roadBed/roadEdge와 같은 문법 */
  road: '#fffaea',
  roadCase: '#c9ac7c',
  /** 보행로·오솔길 — 러너가 실제로 달리는 길이라 점선으로 살려 둔다 */
  path: '#a98a56',
  rail: '#c4a97d',
  boundary: '#b39a72',
  /** 글자 잉크 — 진하게(지명), 옅게(길 이름·동네), 물 이름 */
  labelInk: '#463522',
  labelSoft: '#6d5939',
  labelWater: '#3d6f64',
  halo: '#f6ecd4',
} as const

/* 경로선 잉크 — 역시 고정값. 예전엔 CSS 토큰(var(--color-pace-*))을 풀어 썼는데,
 * 러닝 화면이 다크 고정이라 사용자 테마에 따라 같은 지도 위 선 색이 달라졌다.
 * 종이가 고정이 됐으니 선도 고정한다. 값은 라이트 토큰과 동일(대비 검증된 값). */
export const ROUTE_INK: Record<PaceBand, string> & {
  casing: string
  start: string
  end: string
  markerRing: string
  here: string
} = {
  slow: '#b75732',
  even: '#5a503f',
  fast: '#5672c4',
  /** 케이싱 — 보드의 길바닥(MAP_INK.roadBed)과 같은 값. 두 지도가 한 앱으로 읽힌다 */
  casing: '#fff6e2',
  start: '#f7ecd5',
  end: '#f0a81f',
  markerRing: '#2a1d12',
  here: '#d0552a',
}

const TILES = 'https://tiles.openfreemap.org/planet'
const GLYPHS = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf'

/** 지명 — 한국어 이름이 있으면 그것, 없으면 현지 이름. 이 앱의 언어 순서 그대로 */
const NAME = ['coalesce', ['get', 'name:ko'], ['get', 'name']]

/* 도로 폭 — z14(타일 최대줌) 근처와 러닝 줌(16~17)에서 맞춘 값.
 * z17에서 큰길 ~12px·골목 ~8px가 되도록 — 경로선(케이싱 14px + 색선 8~10px)이
 * "도로 위의 실"이 아니라 도로를 덮는 길로 읽히려면 이 비율이 맞아야 한다. */
const wide = (z13: number, z17: number) =>
  ['interpolate', ['exponential', 1.6], ['zoom'], 13, z13, 17, z17] as unknown as number

export function parchmentStyle(): StyleSpecification {
  return {
    version: 8,
    name: 'THE WAY parchment',
    glyphs: GLYPHS,
    sources: {
      omt: { type: 'vector', url: TILES },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': MAP_PAPER.paper } },
      {
        id: 'residential',
        type: 'fill',
        source: 'omt',
        'source-layer': 'landuse',
        filter: ['match', ['get', 'class'], ['residential', 'suburbs', 'neighbourhood'], true, false],
        paint: { 'fill-color': MAP_PAPER.paperShade, 'fill-opacity': 0.55 },
      },
      {
        id: 'landcover',
        type: 'fill',
        source: 'omt',
        'source-layer': 'landcover',
        filter: ['match', ['get', 'class'], ['wood', 'grass', 'sand'], true, false],
        paint: {
          'fill-color': [
            'match', ['get', 'class'],
            'wood', MAP_PAPER.wood,
            'sand', MAP_PAPER.sand,
            MAP_PAPER.park,
          ],
          'fill-opacity': 0.6,
        },
      },
      {
        id: 'park',
        type: 'fill',
        source: 'omt',
        'source-layer': 'park',
        paint: { 'fill-color': MAP_PAPER.park, 'fill-opacity': 0.55 },
      },
      {
        id: 'water',
        type: 'fill',
        source: 'omt',
        'source-layer': 'water',
        filter: ['!=', ['get', 'brunnel'], 'tunnel'],
        paint: { 'fill-color': MAP_PAPER.water },
      },
      {
        id: 'waterway',
        type: 'line',
        source: 'omt',
        'source-layer': 'waterway',
        paint: { 'line-color': MAP_PAPER.waterLine, 'line-width': wide(1, 3) },
      },
      {
        /* 건물은 z15부터만 — 러닝 줌에서 방향 잡는 실마리로 쓰되, 멀리서는 소음 */
        id: 'building',
        type: 'fill',
        source: 'omt',
        'source-layer': 'building',
        minzoom: 15,
        paint: {
          'fill-color': MAP_PAPER.building,
          'fill-outline-color': MAP_PAPER.buildingLine,
          'fill-opacity': 0.55,
        },
      },
      /* 길 — 가장자리(case)를 먼저 깔고 리본(fill)을 얹는다. 세 급으로만 나눈다:
       * 옛 지도의 문법은 "큰길·길·골목"이지 도로 행정 등급이 아니다. */
      {
        id: 'road-minor-case',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        minzoom: 13,
        filter: ['match', ['get', 'class'], ['minor', 'service', 'track'], true, false],
        layout: { 'line-join': 'round' },
        paint: { 'line-color': MAP_PAPER.roadCase, 'line-width': wide(1.4, 9.5) },
      },
      {
        id: 'road-mid-case',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        filter: ['match', ['get', 'class'], ['secondary', 'tertiary'], true, false],
        layout: { 'line-join': 'round' },
        paint: { 'line-color': MAP_PAPER.roadCase, 'line-width': wide(2.6, 12) },
      },
      {
        id: 'road-major-case',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        filter: ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], true, false],
        layout: { 'line-join': 'round' },
        paint: { 'line-color': MAP_PAPER.roadCase, 'line-width': wide(3.4, 14.5) },
      },
      {
        id: 'road-minor',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        minzoom: 13,
        filter: ['match', ['get', 'class'], ['minor', 'service', 'track'], true, false],
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': MAP_PAPER.road, 'line-width': wide(0.7, 7.5) },
      },
      {
        id: 'road-mid',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        filter: ['match', ['get', 'class'], ['secondary', 'tertiary'], true, false],
        paint: { 'line-color': MAP_PAPER.road, 'line-width': wide(1.7, 9.5) },
      },
      {
        id: 'road-major',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        filter: ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], true, false],
        paint: { 'line-color': MAP_PAPER.road, 'line-width': wide(2.3, 12) },
      },
      {
        /* 오솔길·보행로 — 러너의 길. 발자국 점선(보드의 "아직 갈 길"과 같은 문법) */
        id: 'path',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        minzoom: 14,
        filter: ['==', ['get', 'class'], 'path'],
        paint: {
          'line-color': MAP_PAPER.path,
          'line-width': wide(0.8, 2.2),
          'line-dasharray': [1.6, 1.3],
          'line-opacity': 0.75,
        },
      },
      {
        id: 'rail',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        minzoom: 13,
        filter: ['match', ['get', 'class'], ['rail', 'transit'], true, false],
        paint: {
          'line-color': MAP_PAPER.rail,
          'line-width': wide(0.8, 2),
          'line-dasharray': [4, 2.5],
          'line-opacity': 0.7,
        },
      },
      {
        id: 'boundary',
        type: 'line',
        source: 'omt',
        'source-layer': 'boundary',
        filter: ['all', ['<=', ['get', 'admin_level'], 4], ['!=', ['get', 'maritime'], 1]],
        paint: {
          'line-color': MAP_PAPER.boundary,
          'line-width': 1,
          'line-dasharray': [2.5, 2],
          'line-opacity': 0.6,
        },
      },
      {
        id: 'water-name',
        type: 'symbol',
        source: 'omt',
        'source-layer': 'water_name',
        layout: {
          'text-field': NAME as unknown as string,
          'text-font': ['Noto Sans Italic'],
          'text-size': 12,
          'text-letter-spacing': 0.06,
        },
        paint: {
          'text-color': MAP_PAPER.labelWater,
          'text-halo-color': MAP_PAPER.halo,
          'text-halo-width': 1.1,
        },
      },
      {
        id: 'road-name',
        type: 'symbol',
        source: 'omt',
        'source-layer': 'transportation_name',
        minzoom: 15,
        layout: {
          'text-field': NAME as unknown as string,
          'text-font': ['Noto Sans Regular'],
          'text-size': 10.5,
          'symbol-placement': 'line',
        },
        paint: {
          'text-color': MAP_PAPER.labelSoft,
          'text-halo-color': MAP_PAPER.road,
          'text-halo-width': 1,
        },
      },
      {
        id: 'place-small',
        type: 'symbol',
        source: 'omt',
        'source-layer': 'place',
        filter: ['match', ['get', 'class'], ['village', 'suburb', 'neighbourhood', 'quarter', 'hamlet'], true, false],
        layout: {
          'text-field': NAME as unknown as string,
          'text-font': ['Noto Sans Regular'],
          'text-size': 11.5,
        },
        paint: {
          'text-color': MAP_PAPER.labelSoft,
          'text-halo-color': MAP_PAPER.halo,
          'text-halo-width': 1.2,
        },
      },
      {
        id: 'place-town',
        type: 'symbol',
        source: 'omt',
        'source-layer': 'place',
        filter: ['==', ['get', 'class'], 'town'],
        layout: {
          'text-field': NAME as unknown as string,
          'text-font': ['Noto Sans Regular'],
          'text-size': 13.5,
        },
        paint: {
          'text-color': MAP_PAPER.labelInk,
          'text-halo-color': MAP_PAPER.halo,
          'text-halo-width': 1.3,
        },
      },
      {
        id: 'place-city',
        type: 'symbol',
        source: 'omt',
        'source-layer': 'place',
        filter: ['==', ['get', 'class'], 'city'],
        layout: {
          'text-field': NAME as unknown as string,
          'text-font': ['Noto Sans Bold'],
          'text-size': 15,
          'text-letter-spacing': 0.02,
        },
        paint: {
          'text-color': MAP_PAPER.labelInk,
          'text-halo-color': MAP_PAPER.halo,
          'text-halo-width': 1.4,
        },
      },
    ],
  }
}

/* ── 경로 GeoJSON ─────────────────────────────────────────────────────────
 * 같은 밴드끼리 이어붙인다(RouteMap의 폴리라인 병합과 같은 이유 — 399개 → 3~10개).
 * 구간(i-1→i)의 밴드는 points[i].pace가 정한다(기존 동작 그대로).
 * 밴드가 바뀔 때 한 점을 겹쳐 선이 끊기지 않게 한다. */
export function routeGeoJSON(points: TracePoint[], avgPaceSecPerKm: number): {
  casing: Feature<LineString>
  bands: FeatureCollection<LineString, { band: PaceBand }>
} {
  const coords = points.map((p) => [p.lng, p.lat] as [number, number])
  const casing: Feature<LineString> = {
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates: coords },
  }
  const features: Feature<LineString, { band: PaceBand }>[] = []
  if (points.length >= 2) {
    let segStart = 0
    let segBand = bandOf(points[1].pace ?? avgPaceSecPerKm, avgPaceSecPerKm)
    const pushSeg = (from: number, to: number, band: PaceBand) => {
      features.push({
        type: 'Feature',
        properties: { band },
        geometry: { type: 'LineString', coordinates: coords.slice(from, to + 1) },
      })
    }
    for (let i = 1; i < points.length; i++) {
      const b = bandOf(points[i].pace ?? avgPaceSecPerKm, avgPaceSecPerKm)
      if (b !== segBand) {
        pushSeg(segStart, i - 1, segBand)
        segStart = i - 1
        segBand = b
      }
    }
    pushSeg(segStart, points.length - 1, segBand)
  }
  return { casing, bands: { type: 'FeatureCollection', features } }
}
