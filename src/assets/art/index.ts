import pilgrimTrail from './pilgrim-trail.webp'
import galileeWater from './galilee-water.webp'
import sermonMount from './sermon-mount.webp'
import jerusalemDusk from './jerusalem-dusk.webp'
import dawnRoad from './dawn-road.webp'
import fieldParable from './field-parable.webp'

import sceneCity from './scenes/city.webp'
import sceneDawn from './scenes/dawn.webp'
import sceneDesert from './scenes/desert.webp'
import sceneFields from './scenes/fields.webp'
import sceneMountain from './scenes/mountain.webp'
import sceneRiver from './scenes/river.webp'
import sceneRoad from './scenes/road.webp'
import sceneSea from './scenes/sea.webp'

import crestAbraham from './crests/abraham.svg'
import crestExodus from './crests/exodus.svg'
import crestJesus from './crests/jesus.svg'
import crestPaul from './crests/paul.svg'
import crestPeter from './crests/peter.svg'

import type { SceneKey } from '../../data/geo/journeys'

/* 히어로/스팟 일러스트 매핑. key는 journey.ts Course.hero.
 * 전부 Recraft(recraftv3, digital_illustration)로 생성 — 얼굴 없는 뒷모습·역광 실루엣, 1세기 근동.
 * 새 아트 추가 시 여기 import + MAP 등록만. */
const MAP: Record<string, string> = {
  'pilgrim-trail': pilgrimTrail,
  'galilee-water': galileeWater,
  'sermon-mount': sermonMount,
  'jerusalem-dusk': jerusalemDusk,
  'dawn-road': dawnRoad,
  'field-parable': fieldParable,
}

export const heroArt = (key: string): string => MAP[key] ?? pilgrimTrail

/* 씬(지역) 배경 매핑. key는 journeys/index.ts의 SceneKey 유니온.
 * Record<SceneKey, string>이므로 유니온에 씬을 추가하면 여기서 컴파일 에러가 난다(누락 방지).
 */
const SCENE_MAP: Record<SceneKey, string> = {
  river: sceneRiver,
  mountain: sceneMountain,
  sea: sceneSea,
  fields: sceneFields,
  city: sceneCity,
  dawn: sceneDawn,
  road: sceneRoad,
  desert: sceneDesert,
}

export const sceneArt = (key: SceneKey): string => SCENE_MAP[key]

/* 여정 문장(crest) — 원형 엠블럼 SVG. 여정 선택 카드와 배지에 쓴다.
 * 벡터라 배지 크기로 줄여도 뭉개지지 않는다(씬은 래스터, 문장은 벡터로 나눈 이유). */
const CREST_MAP: Record<string, string> = {
  abraham: crestAbraham,
  exodus: crestExodus,
  jesus: crestJesus,
  paul: crestPaul,
  peter: crestPeter,
}

export const crestArt = (journeyId: string): string | undefined => CREST_MAP[journeyId]

/** 현재 여정의 씬 1장만 미리 당겨온다(나머지는 건드리지 않음). 러닝 시작 전 호출. */
export const preloadScene = (key: SceneKey): void => {
  const href = SCENE_MAP[key]
  if (document.head.querySelector(`link[rel="preload"][href="${href}"]`)) return
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = href
  link.fetchPriority = 'high'
  document.head.appendChild(link)
}

import st_arrest from './stations/arrest.webp'
import st_baptism from './stations/baptism.webp'
import st_beat_1 from './stations/beat-1.webp'
import st_beat_2 from './stations/beat-2.webp'
import st_blind_sight from './stations/blind-sight.webp'
import st_call_mk1 from './stations/call-mk1.webp'
import st_call_mt4 from './stations/call-mt4.webp'
import st_commission from './stations/commission.webp'
import st_cross_luke from './stations/cross-luke.webp'
import st_empty_tomb from './stations/empty-tomb.webp'
import st_ends_earth from './stations/ends-earth.webp'
import st_entry from './stations/entry.webp'
import st_feeding from './stations/feeding.webp'
import st_finished from './stations/finished.webp'
import st_gethsemane from './stations/gethsemane.webp'
import st_golgotha from './stations/golgotha.webp'
import st_last_supper from './stations/last-supper.webp'
import st_lazarus_come from './stations/lazarus-come.webp'
import st_light_mt5 from './stations/light-mt5.webp'
import st_lords_prayer from './stations/lords-prayer.webp'
import st_lost_sheep from './stations/lost-sheep.webp'
import st_mustard from './stations/mustard.webp'
import st_pentecost from './stations/pentecost.webp'
import st_peter_sermon from './stations/peter-sermon.webp'
import st_pilate from './stations/pilate.webp'
import st_prodigal from './stations/prodigal.webp'
import st_resurrection_hope from './stations/resurrection-hope.webp'
import st_risen from './stations/risen.webp'
import st_samaritan from './stations/samaritan.webp'
import st_saul from './stations/saul.webp'
import st_sower from './stations/sower.webp'
import st_take_heart from './stations/take-heart.webp'
import st_talents from './stations/talents.webp'
import st_temptation from './stations/temptation.webp'
import st_transfig from './stations/transfig.webp'
import st_walk_water from './stations/walk-water.webp'
import st_wise_builder from './stations/wise-builder.webp'

/* 자리별 스탬프 — 예수님 사역 37자리 각각의 사건을 그린 정사각 아트.
 * 지명이 겹쳐도(갈릴리 ×4, 골고다 ×3) 사건이 다르면 그림이 다르다.
 * scripts/stations-art.mjs 로 생성한다. */
const STATION_MAP: Record<string, string> = {
  'arrest': st_arrest,
  'baptism': st_baptism,
  'beat-1': st_beat_1,
  'beat-2': st_beat_2,
  'blind-sight': st_blind_sight,
  'call-mk1': st_call_mk1,
  'call-mt4': st_call_mt4,
  'commission': st_commission,
  'cross-luke': st_cross_luke,
  'empty-tomb': st_empty_tomb,
  'ends-earth': st_ends_earth,
  'entry': st_entry,
  'feeding': st_feeding,
  'finished': st_finished,
  'gethsemane': st_gethsemane,
  'golgotha': st_golgotha,
  'last-supper': st_last_supper,
  'lazarus-come': st_lazarus_come,
  'light-mt5': st_light_mt5,
  'lords-prayer': st_lords_prayer,
  'lost-sheep': st_lost_sheep,
  'mustard': st_mustard,
  'pentecost': st_pentecost,
  'peter-sermon': st_peter_sermon,
  'pilate': st_pilate,
  'prodigal': st_prodigal,
  'resurrection-hope': st_resurrection_hope,
  'risen': st_risen,
  'samaritan': st_samaritan,
  'saul': st_saul,
  'sower': st_sower,
  'take-heart': st_take_heart,
  'talents': st_talents,
  'temptation': st_temptation,
  'transfig': st_transfig,
  'walk-water': st_walk_water,
  'wise-builder': st_wise_builder,
}

export const stationArt = (id: string): string | undefined => STATION_MAP[id]

/* 여정 자리별 스탬프 — 68자리 각각의 사건을 그린 정사각 아트.
 * 예전엔 68자리가 씬 8종을 돌려 써서, 바울의 해안 도시 여러 곳이 전부 같은 그림이었다.
 * 지명이 겹치는 쌍(벧엘 ×2, 드로아 ×2, 에베소 ×2, 예루살렘 ×3, 로마 ×2)도 사건으로 갈린다.
 *
 * 68줄의 import 대신 glob을 쓴다 — 파일이 늘 때마다 손으로 줄을 추가하면 반드시 빠뜨린다.
 * query:'?url'이라 파일이 번들에 인라인되지 않고 별도 에셋으로 나간다(프리캐시에서 제외되는 몫).
 * scripts/episode-art.mjs 로 생성한다. */
const EPISODE_URLS = import.meta.glob('./episodes/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const EPISODE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(EPISODE_URLS).map(([file, url]) => [
    file.replace(/^\.\/episodes\//, '').replace(/\.webp$/, ''),
    url,
  ]),
)

/* 그 여정 그 자리의 그림. 없으면 undefined — 호출부가 씬으로 폴백한다.
 *
 * 예수 여정은 episodes/ 에 그림이 없다. 대신 같은 자리의 그림이 stations/ 에 이미 37장 있다
 * (예수 자리와 여정 자리가 같은 id를 쓴다 — geo/journeys/jesus.ts가 그 id로 조인한다).
 * 폴백을 안 걸면 예수 여정만 리빌·수집에서 씬 배경으로 떨어져, 있는 그림 37장을 놀린다. */
export const episodeArt = (journeyId: string, episodeId: string): string | undefined =>
  EPISODE_MAP[`${journeyId}-${episodeId}`] ?? (journeyId === 'jesus' ? stationArt(episodeId as never) : undefined)

/* ── 지도의 지형 그림 ──────────────────────────────────────────────────────
 * recraft로 뽑은 컷페이퍼 벡터(SVG). 여정마다 그 땅의 상징 하나.
 * 지도의 **빈 사분면**에 옅게 깔아 여백을 지형으로 채운다 — 길을 가리지 않는 자리에만 놓는다.
 * (베드로의 길은 아직 없다. 없으면 안 그린다.) */
const PROP_URLS = import.meta.glob('./props/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const PROP_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(PROP_URLS).map(([file, url]) => [file.replace(/^\.\/props\//, '').replace(/\.svg$/, ''), url]),
)
export const propArt = (journeyId: string): string | undefined => PROP_MAP[journeyId]

/** 지도 바탕에 까는 지형 한 장(모든 여정 공용). 언더바로 시작해 여정 prop과 안 섞인다. */
export const mapGroundArt = (): string | undefined => PROP_MAP['_ground']
/** 도달 인장 — 리빌처럼 **큰 자리**에서만 쓴다. 20px 노드로 줄이면 문양이 뭉갠다. */
export const sealArt = (): string | undefined => PROP_MAP['_seal']

/* ── 퀘스트 보드의 월드 패널 ─────────────────────────────────────────────────
 * 장(章)마다 한 장. 키 = `${journeyId}-${tierIndex}`(0-based). scripts/world-art.mjs로 생성.
 * 높은 조감의 손그림 게임 월드맵 — 가장자리까지 땅이라 패널을 위아래로 이어 붙일 수 있다.
 * 그 장의 그림이 없으면 같은 여정의 가장 가까운 장으로 폴백한다(전부 없으면 undefined). */
const WORLD_URLS = import.meta.glob('./world/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const WORLD_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(WORLD_URLS).map(([file, url]) => [file.replace(/^\.\/world\//, '').replace(/\.webp$/, ''), url]),
)
export const worldArt = (journeyId: string, tierIndex: number): string | undefined => {
  const exact = WORLD_MAP[`${journeyId}-${tierIndex}`]
  if (exact) return exact
  for (let d = 1; d < 12; d++) {
    const a = WORLD_MAP[`${journeyId}-${tierIndex - d}`]
    if (a) return a
    const b = WORLD_MAP[`${journeyId}-${tierIndex + d}`]
    if (b) return b
  }
  return undefined
}

/* ── 인물 토큰(벡터) ────────────────────────────────────────────────────────
 * 얼굴 없는 실루엣. pilgrim(순례자 말)·abraham·moses·paul·peter·lamp(예수 여정은 등불).
 * 여정 카드·보드 위의 말·장 머리에 쓴다. */
const FIGURE_URLS = import.meta.glob('./figures/*.{svg,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const FIGURE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(FIGURE_URLS).map(([file, url]) => [file.replace(/^\.\/figures\//, '').replace(/\.(svg|webp)$/, ''), url]),
)
export const figureArt = (key: string): string | undefined => FIGURE_MAP[key]
/** 그 여정의 주인공 토큰 */
export const journeyFigure = (journeyId: string): string | undefined =>
  FIGURE_MAP[{ jesus: 'lamp', abraham: 'abraham', exodus: 'moses', paul: 'paul', peter: 'peter' }[journeyId] ?? '']
