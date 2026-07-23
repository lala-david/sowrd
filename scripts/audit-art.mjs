/* 생성 아트의 신학·구도 위반 자동 검출.
 *
 * 68장을 눈으로 다 보면 반드시 놓친다. 두 가지를 기계로 잡는다.
 *  1) 후광 — 어두운 인물 실루엣의 머리 주변이 그 바깥 배경보다 뚜렷하게 밝은 고리.
 *     "no halo"라고 써도 모델이 넣는다(부정 지시가 그 사물을 불러온다). PCK 제약 위반이므로
 *     한 장도 남으면 안 된다.
 *  2) 과대 인물 — 스캐폴드는 "화면 높이의 1/10 이하"를 요구한다. 크게 그려지면 성인상처럼 읽히고
 *     수집물의 주제(사건)가 인물로 바뀐다.
 *
 *   node scripts/audit-art.mjs <디렉터리>
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const dir = process.argv[2] ?? 'src/assets/art/episodes'
const files = fs.readdirSync(dir).filter((f) => /\.webp$/i.test(f)).sort()

const DARK = 70 // 이보다 어두우면 실루엣 후보
const N = 256 // 분석 해상도

const flagged = []
for (const f of files) {
  const { data } = await sharp(fs.readFileSync(path.join(dir, f)))
    .resize(N, N, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const lum = new Float32Array(N * N)
  for (let i = 0; i < N * N; i++) {
    lum[i] = 0.2126 * data[i * 3] + 0.7152 * data[i * 3 + 1] + 0.0722 * data[i * 3 + 2]
  }

  // 연결 성분(어두운 덩어리) 라벨링
  const seen = new Uint8Array(N * N)
  const comps = []
  for (let s = 0; s < N * N; s++) {
    if (seen[s] || lum[s] > DARK) continue
    const stack = [s]
    seen[s] = 1
    let minX = N, maxX = 0, minY = N, maxY = 0, count = 0
    while (stack.length) {
      const p = stack.pop()
      const x = p % N
      const y = (p / N) | 0
      count++
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue
        const q = ny * N + nx
        if (!seen[q] && lum[q] <= DARK) {
          seen[q] = 1
          stack.push(q)
        }
      }
    }
    comps.push({ minX, maxX, minY, maxY, count, w: maxX - minX + 1, h: maxY - minY + 1 })
  }

  /* 인물 후보 — 세로로 긴(사람 비율) 중간 크기 덩어리.
   * 지형·건물은 대개 화면폭을 크게 차지하므로 폭 비율로 걸러낸다. */
  const people = comps.filter(
    (c) => c.h >= 6 && c.h / c.w >= 1.3 && c.w <= N * 0.22 && c.count >= 20 && c.count / (c.w * c.h) > 0.35,
  )

  const reasons = []
  // 1) 과대 인물
  const tallest = people.sort((a, b) => b.h - a.h)[0]
  if (tallest && tallest.h / N > 0.16) {
    reasons.push(`과대인물 높이 ${(tallest.h / N * 100).toFixed(0)}%`)
  }

  // 2) 후광 — 인물 머리 위 반원 고리가 그 바깥보다 밝은가
  for (const c of people) {
    const cx = ((c.minX + c.maxX) / 2) | 0
    const headY = c.minY
    const r = Math.max(3, Math.round(c.w * 1.5))
    const sample = (rad) => {
      let sum = 0
      let n = 0
      for (let a = Math.PI * 0.15; a <= Math.PI * 0.85; a += 0.12) {
        const x = Math.round(cx + Math.cos(a) * rad)
        const y = Math.round(headY + c.h * 0.12 - Math.sin(a) * rad)
        if (x < 0 || y < 0 || x >= N || y >= N) continue
        const i = y * N + x
        if (lum[i] <= DARK) continue // 인물 본체는 제외
        sum += lum[i]
        n++
      }
      return n >= 4 ? sum / n : null
    }
    const inner = sample(r)
    const outer = sample(Math.round(r * 2.6))
    if (inner !== null && outer !== null && inner - outer > 16) {
      reasons.push(`후광 의심 (머리 주변 ${inner.toFixed(0)} vs 바깥 ${outer.toFixed(0)})`)
      break
    }
  }

  if (reasons.length) {
    flagged.push({ f, reasons })
    console.log(`  ⚠ ${f.padEnd(28)} ${reasons.join(' · ')}`)
  }
}
console.log(`\n검출 ${flagged.length}장 / 전체 ${files.length}장`)
console.log(flagged.map((x) => x.f.replace(/\.webp$/, '')).join(' '))
