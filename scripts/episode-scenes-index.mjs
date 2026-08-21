/* 장면 정본 집계 — 여정별 파일을 모아 하나의 SCENES로.
 * 병렬 작성(에이전트 여럿이 한 파일을 고치면 충돌한다) 때문에 여정별로 나눴다:
 *   episode-scenes.mjs           예수(파일럿 5 + 확장 28)
 *   episode-scenes-abraham.mjs   아브라함 10
 *   episode-scenes-exodus.mjs    출애굽 16
 *   episode-scenes-paul.mjs      바울 28
 *   episode-scenes-peter.mjs     베드로 14
 * 아직 없는 파일은 조용히 건너뛴다(단계 착수 순서와 무관하게 돌 수 있게). */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const FILES = [
  'episode-scenes.mjs',
  'episode-scenes-abraham.mjs',
  'episode-scenes-exodus.mjs',
  'episode-scenes-paul.mjs',
  'episode-scenes-peter.mjs',
]

export { SCAFFOLD } from './episode-scenes.mjs'

const all = []
for (const f of FILES) {
  if (!fs.existsSync(path.join(HERE, f))) continue
  const m = await import(`./${f}`)
  all.push(...m.SCENES)
}
// id 중복은 데이터 사고 — 조용히 지나가면 한 자리가 다른 자리를 덮어쓴다
const seen = new Set()
for (const s of all) {
  if (seen.has(s.id)) throw new Error(`장면 id 중복: ${s.id}`)
  seen.add(s.id)
}
export const SCENES = all
