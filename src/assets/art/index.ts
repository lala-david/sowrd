import pilgrimTrail from './pilgrim-trail.webp'
import galileeWater from './galilee-water.webp'
import sermonMount from './sermon-mount.webp'
import jerusalemDusk from './jerusalem-dusk.webp'
import dawnRoad from './dawn-road.webp'
import fieldParable from './field-parable.webp'

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
