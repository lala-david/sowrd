/* 생성 아트의 '액자' 제거.
 *
 * v4.1이 "no border"를 무시하고 균일한 여백 프레임을 넣는 경우가 있다(부정 지시가
 * 그 사물을 불러오는 그 현상). 68장 중 상당수가 그랬다.
 * 크레딧을 다시 쓰지 않고 기계적으로 잘라낸다 — 프레임은 균일색이라 감지가 확실하다.
 *
 *   node scripts/trim-frames.mjs <디렉터리> [--write]
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const [, , dir = 'src/assets/art/episodes', ...rest] = process.argv
const write = rest.includes('--write')
const TOL = 16 // 프레임 내부 균일성 판정(채널당)
/* 모서리끼리 비교할 때는 더 느슨하게 본다 — 종이 그레인 텍스처 때문에 같은 프레임인데도
   모서리 색이 채널당 20 안팎으로 갈린다. 14로 재면 실제 프레임을 대부분 놓친다. */
const CORNER_TOL = 34
const MIN_RATIO = 0.012 // 이보다 얇으면 프레임이 아니라 그림의 일부로 본다

const files = fs.readdirSync(dir).filter((f) => /\.webp$/i.test(f)).sort()
let hit = 0

for (const f of files) {
  const p = path.join(dir, f)
  /* 원본을 메모리로 먼저 읽는다 — Windows에서 sharp가 파일 핸들을 쥔 채로
     같은 경로에 쓰면 UNKNOWN(EBUSY) 에러가 난다. */
  const src = fs.readFileSync(p)
  const img = sharp(src)
  const { width: W, height: H } = await img.metadata()
  const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true })
  const ch = info.channels
  const at = (x, y) => {
    const i = (y * W + x) * ch
    return [data[i], data[i + 1], data[i + 2]]
  }
  const near = (a, b) => Math.abs(a[0] - b[0]) <= TOL && Math.abs(a[1] - b[1]) <= TOL && Math.abs(a[2] - b[2]) <= TOL

  // 네 모서리 색이 서로 같아야 '프레임'이다. 다르면 그라데이션 배경이므로 건드리지 않는다.
  const c = at(0, 0)
  const nearCorner = (a, b) =>
    Math.abs(a[0] - b[0]) <= CORNER_TOL && Math.abs(a[1] - b[1]) <= CORNER_TOL && Math.abs(a[2] - b[2]) <= CORNER_TOL
  if (!nearCorner(c, at(W - 1, 0)) || !nearCorner(c, at(0, H - 1)) || !nearCorner(c, at(W - 1, H - 1))) {
    console.log(`  skip  ${f}  (모서리 색이 달라 프레임 아님)`)
    continue
  }

  const rowUniform = (y) => {
    let n = 0
    for (let x = 0; x < W; x += 2) if (near(at(x, y), c)) n++
    return n / Math.ceil(W / 2) > 0.985
  }
  const colUniform = (x) => {
    let n = 0
    for (let y = 0; y < H; y += 2) if (near(at(x, y), c)) n++
    return n / Math.ceil(H / 2) > 0.985
  }

  let top = 0
  while (top < H / 3 && rowUniform(top)) top++
  let bottom = 0
  while (bottom < H / 3 && rowUniform(H - 1 - bottom)) bottom++
  let left = 0
  while (left < W / 3 && colUniform(left)) left++
  let right = 0
  while (right < W / 3 && colUniform(W - 1 - right)) right++

  /* 진짜 액자는 네 면에 다 있다.
   * 한쪽만 두꺼운 것은 평평한 하늘 띠 같은 구도의 일부라 자르면 그림이 상한다. */
  const pad = [top, bottom, left, right]
  const sides = pad.filter((v) => v / Math.max(W, H) >= MIN_RATIO).length
  if (sides < 3) continue

  const x = left
  const y = top
  const w = W - left - right
  const h = H - top - bottom
  if (w < W * 0.4 || h < H * 0.4) {
    console.log(`  skip  ${f}  (잘라낼 양이 과해 보류: ${w}x${h})`)
    continue
  }

  hit++
  console.log(`  ${write ? 'trim ' : 'check'} ${f}  여백 T${top} B${bottom} L${left} R${right} → ${w}x${h}`)
  if (write) {
    /* 잘라낸 뒤 정사각으로 되돌린다 — 수집 격자가 정사각이라 비율이 흐트러지면 안 된다.
       cover로 맞추면 가장자리가 조금 더 잘리지만, 프레임이 남는 것보다 낫다. */
    const buf = await sharp(src)
      .extract({ left: x, top: y, width: w, height: h })
      .resize(1024, 1024, { fit: 'cover', position: 'centre' })
      .webp({ quality: 78 })
      .toBuffer()
    fs.writeFileSync(p, buf)
  }
}
console.log(`\n프레임 감지 ${hit}장 / 전체 ${files.length}장${write ? ' — 적용됨' : ' (적용하려면 --write)'}`)
