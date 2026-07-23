/* 아트 자산 최적화 — recraft 원본을 배포 가능한 크기로 만든다.
 *
 * 사용법: node scripts/optimize-art.mjs        (검사만)
 *         node scripts/optimize-art.mjs --write (실제 변환)
 *
 * 왜 필요한가: recraft는 기본이 무손실 WebP(VP8L)다. 일러스트에 무손실은 잘못된 코덱이라
 * 씬 8장 + 히어로 6장이 18.48 MB나 된다. 러너가 야외 데이터로 여는 앱에서 이건 배포 불가.
 * 같은 해상도로 손실 q75 재인코딩만 해도 95% 넘게 줄어든다.
 *
 * 벡터(문장)는 건드리지 않는다 — recraft가 SVG를 .webp 이름으로 주므로 내용으로 판별해
 * .svg로 고쳐두기만 한다.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** 좌우 순백 기둥의 폭을 재서 잘라낼 영역을 돌려준다. 없으면 null. */
async function trimWhitePillars(buf, meta) {
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  const colIsWhite = (x) => {
    for (let y = 0; y < height; y += 8) {
      const i = (y * width + x) * channels
      if (data[i] < 250 || data[i + 1] < 250 || data[i + 2] < 250) return false
    }
    return true
  }
  let left = 0
  while (left < width && colIsWhite(left)) left++
  let right = width - 1
  while (right > left && colIsWhite(right)) right--

  const w = right - left + 1
  if (left === 0 && w === width) return null // 여백 없음
  if (w < width * 0.5) return null // 절반 넘게 잘리면 판정이 틀린 것이다 — 건드리지 않는다
  return { left, top: 0, width: w, height: meta.height }
}
const WRITE = process.argv.includes('--write')
const QUALITY = 75
const MAX_W = 1280 // 3x 디스플레이의 430pt 폰이 1290px — 그 이상은 낭비

const DIRS = ['src/assets/art', 'src/assets/art/scenes', 'src/assets/art/crests', 'src/assets/art/stations', 'src/assets/art/episodes']
const kb = (n) => (n / 1024).toFixed(1)

let before = 0
let after = 0
const renamed = []

for (const dir of DIRS) {
  const abs = path.join(ROOT, dir)
  if (!fs.existsSync(abs)) continue

  for (const file of fs.readdirSync(abs).sort()) {
    if (!/\.(webp|png|jpe?g)$/i.test(file)) continue
    const src = path.join(abs, file)
    const buf = fs.readFileSync(src)
    before += buf.length

    // SVG가 래스터 확장자로 저장돼 있으면 이름만 고친다(브라우저가 MIME으로 거부한다).
    const head = buf.subarray(0, 300).toString('utf8').trimStart()
    if (head.startsWith('<svg') || head.startsWith('<?xml')) {
      const dst = src.replace(/\.(webp|png|jpe?g)$/i, '.svg')
      if (WRITE && dst !== src) {
        fs.renameSync(src, dst)
        renamed.push(`${dir}/${file} -> ${path.basename(dst)}`)
      }
      after += buf.length
      console.log(`  svg   ${dir}/${file}  ${kb(buf.length)} KB (이름만 교정, 재인코딩 안 함)`)
      continue
    }

    // 이미 손실 압축(VP8)이면 건너뛴다 — 다시 돌리면 세대 손실만 쌓인다.
    if (buf.subarray(12, 16).toString('ascii') === 'VP8 ') {
      after += buf.length
      console.log(`  skip  ${dir}/${file}  ${kb(buf.length)} KB (이미 손실 압축됨)`)
      continue
    }

    const meta = await sharp(buf).metadata()
    let pipeline = sharp(buf)

    /* recraft가 이따금 그림 좌우에 순백 필러박스를 붙여 내보낸다(액자처럼 보인다).
     * 크림색 하늘은 살려야 하므로, 순백(>=250)인 가장자리 열만 잘라낸다. */
    const white = await trimWhitePillars(buf, meta)
    if (white) {
      pipeline = pipeline.extract(white)
      console.log(`        └ 흰 여백 제거: 좌 ${white.left}px, 폭 ${white.width}/${meta.width}`)
    }

    if ((white?.width ?? meta.width) > MAX_W) pipeline = pipeline.resize({ width: MAX_W })
    const out = await pipeline.webp({ quality: QUALITY, effort: 6 }).toBuffer()

    after += out.length
    const pct = (100 - (out.length / buf.length) * 100).toFixed(1)
    console.log(
      `  ${WRITE ? 'write' : 'check'} ${dir}/${file}  ${kb(buf.length)} -> ${kb(out.length)} KB  (-${pct}%)` +
        (meta.width > MAX_W ? `  [${meta.width}w -> ${MAX_W}w]` : ''),
    )
    if (WRITE) fs.writeFileSync(src, out)
  }
}

if (renamed.length) console.log('\n이름 교정:', renamed.join(', '))
console.log(
  `\n합계 ${kb(before)} KB -> ${kb(after)} KB  (-${(100 - (after / before) * 100).toFixed(1)}%)` +
    (WRITE ? '' : '   ※ 검사만 했습니다. 적용하려면 --write'),
)
