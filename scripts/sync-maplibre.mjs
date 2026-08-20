/* maplibre dist 3파일을 public/maplibre/ 로 동기화한다 (predev·prebuild 자동 실행).
 *
 * 왜 번들하지 않나: v6 dist는 main·shared·worker 세 ESM이 **상대 경로**로 서로를
 * 부른다. 번들러가 main+shared를 청크로 합치는 순간 워커는 './maplibre-gl-shared.mjs'를
 * 찾지 못하고 — 에러 한 줄 없이 — 죽는다. 실측: dev 프리번들·rollup 빌드 모두에서
 * 타일 요청 0건(배포된 지도가 종이 배경만 보였던 원인). setWorkerUrl로 워커만 에셋으로
 * 빼도 같은 이유로 죽는다(워커 속의 상대 import가 남으니까).
 * 세 파일을 파일명 그대로 public에 두면 상대 참조가 전부 살아서 dev·build 어디서나 돈다. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'node_modules/maplibre-gl/dist')
const OUT = path.join(ROOT, 'public/maplibre')
const FILES = ['maplibre-gl.mjs', 'maplibre-gl-shared.mjs', 'maplibre-gl-worker.mjs']

fs.mkdirSync(OUT, { recursive: true })
let copied = 0
for (const f of FILES) {
  const src = path.join(SRC, f)
  const out = path.join(OUT, f)
  if (!fs.existsSync(src)) { console.error(`sync-maplibre: ${f} 없음 — maplibre-gl dist 구조가 바뀌었나?`); process.exit(1) }
  const s = fs.readFileSync(src)
  if (fs.existsSync(out) && Buffer.compare(fs.readFileSync(out), s) === 0) continue
  fs.writeFileSync(out, s)
  copied++
}
if (copied) console.log(`sync-maplibre: ${copied}개 갱신`)
