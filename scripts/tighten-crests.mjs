/* 문장(crest) SVG의 viewBox를 실제 그림에 맞춰 조인다.
 *   node scripts/tighten-crests.mjs [--write]
 *
 * 왜: 엠블럼이 2048² 캔버스의 37~54%만 차지해서, UI가 쓰는 42~56px 배지로 줄이면
 * 실제 그림은 16~23px밖에 안 된다(검증 결과 5개 중 4개가 그 크기에서 판독 불가).
 * 그림을 다시 그리지 않고 여백만 걷어내면 배지 픽셀이 두세 배로 늘어난다.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIR = path.join(ROOT, 'src/assets/art/crests')
const WRITE = process.argv.includes('--write')
const R = 512 // 측정용 래스터 해상도

for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.svg')).sort()) {
  const p = path.join(DIR, file)
  const svg = fs.readFileSync(p, 'utf8')

  const vb = svg.match(/viewBox="([\d.\-\s]+)"/)
  if (!vb) {
    console.log(`  skip  ${file} (viewBox 없음)`)
    continue
  }
  const [vx, vy, vw, vh] = vb[1].trim().split(/\s+/).map(Number)

  // 흰 바탕에 얹어 래스터화한 뒤, 배경이 아닌 픽셀의 경계를 찾는다
  const { data, info } = await sharp(Buffer.from(svg))
    .resize(R, R, { fit: 'contain', background: '#ffffff' })
    .flatten({ background: '#ffffff' })
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info

  /* 문장은 캔버스 전체를 덮는 크림 바탕 위에 그려져 있다. 그래서 "흰 여백"을 찾으면
   * 100%가 나온다. 모서리 색을 바탕으로 보고, 그와 눈에 띄게 다른 픽셀만 그림으로 센다. */
  const bg = [data[0], data[1], data[2]]
  const differs = (i) =>
    Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]) > 24

  let minX = width, minY = height, maxX = -1, maxY = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels
      if (!differs(i)) continue
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
  if (maxX < 0) {
    console.log(`  skip  ${file} (내용 없음)`)
    continue
  }

  // 정사각 배지이므로 가장 긴 변에 맞춰 정사각으로 자르고, 숨 쉴 여백 2%만 남긴다
  const pad = 0.02
  const cx = (minX + maxX) / 2 / width
  const cy = (minY + maxY) / 2 / height
  const side = Math.max((maxX - minX) / width, (maxY - minY) / height) * (1 + pad * 2)

  const nw = vw * side
  const nh = vh * side
  const nx = vx + vw * cx - nw / 2
  const ny = vy + vh * cy - nh / 2

  const fill = (((maxX - minX) / width) * 100).toFixed(0)
  const gain = (1 / side).toFixed(2)
  if (side > 0.97) {
    console.log(`  keep  ${file}  이미 꽉 참 (${fill}%)`)
    continue
  }

  console.log(`  ${WRITE ? 'write' : 'check'} ${file}  그림 ${fill}% → viewBox 조임, 배지 픽셀 ×${gain}`)
  if (WRITE) {
    const out = svg.replace(
      /viewBox="[\d.\-\s]+"/,
      `viewBox="${nx.toFixed(1)} ${ny.toFixed(1)} ${nw.toFixed(1)} ${nh.toFixed(1)}"`,
    )
    fs.writeFileSync(p, out)
  }
}

if (!WRITE) console.log('\n※ 검사만 했습니다. 적용하려면 --write')
