/* 아트 QA용 컨택트 시트 — 여러 장을 한 장의 격자로 합친다.
 * 일관성은 나란히 놓고 봐야 판단되므로, 생성 후 육안·에이전트 검증에 이걸 쓴다.
 *
 * 사용법: node scripts/contact-sheet.mjs <입력디렉터리> <출력파일> [열수]
 * 예:     node scripts/contact-sheet.mjs src/assets/art/scenes .tmp/scenes.webp 4
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const [, , inDir = 'src/assets/art/scenes', outFile = '.tmp/sheet.webp', colsArg] = process.argv

const files = fs
  .readdirSync(inDir)
  .filter((f) => /\.(webp|png|jpe?g)$/i.test(f))
  .sort()
if (!files.length) throw new Error(`이미지가 없습니다: ${inDir}`)

const cols = Number(colsArg) || Math.ceil(Math.sqrt(files.length))
const rows = Math.ceil(files.length / cols)
// 셀 비율은 첫 이미지에서 읽는다 — 가로/세로 자산을 섞어 쓰므로 고정하면 찌그러진다.
const first = await sharp(path.join(inDir, files[0])).metadata()
const W = 512
const H = Math.round(W * (first.height / first.width))

const cells = await Promise.all(
  files.map((f) => sharp(path.join(inDir, f)).resize(W, H, { fit: 'cover' }).toBuffer()),
)

fs.mkdirSync(path.dirname(outFile), { recursive: true })
await sharp({ create: { width: W * cols, height: H * rows, channels: 3, background: '#ffffff' } })
  .composite(cells.map((input, i) => ({ input, left: (i % cols) * W, top: Math.floor(i / cols) * H })))
  .webp({ quality: 88 })
  .toFile(outFile)

console.log(`${files.length}장 -> ${outFile} (${cols}열)`)
files.forEach((f, i) => console.log(`  ${Math.floor(i / cols) + 1}행 ${(i % cols) + 1}열  ${f}`))
