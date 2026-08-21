/* 영상 합성용 오버레이 PNG 생성 — 비·먼지·빛내림 (scripts/adversary-video.mjs가 쓴다).
 *   node scripts/video-overlays.mjs
 * SVG를 문자열로 만들어 sharp로 래스터한다. 결정론(시드 난수) — 같은 입력, 같은 그림.
 * 2160²에 알파 포함: ffmpeg overlay에서 mod(t)로 굴리면 끊김 없이 흐른다. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'scripts/video-frames')
fs.mkdirSync(OUT, { recursive: true })

// 결정론 난수 — Math.random을 쓰면 재생성 때마다 비가 다르게 내린다
let seed = 42
const rnd = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff
  return seed / 0x7fffffff
}

const S = 2160

// 비 — 사선 줄기. 길이·굵기·투명도를 다양하게(같은 도형 반복 금지 — 아트 원칙과 동일)
let rain = ''
for (let i = 0; i < 260; i++) {
  const x = rnd() * S
  const y = rnd() * S
  const len = 50 + rnd() * 130
  const w = 1.5 + rnd() * 2.2
  const o = 0.08 + rnd() * 0.16
  rain += `<line x1="${x}" y1="${y}" x2="${x - len * 0.42}" y2="${y + len}" stroke="#f0e6d4" stroke-width="${w}" stroke-opacity="${o}" stroke-linecap="round"/>`
}

// 먼지 — 낮게 흐르는 마른 티끌
let dust = ''
for (let i = 0; i < 420; i++) {
  const x = rnd() * S
  const y = rnd() * S
  const r = 0.8 + rnd() * 2.4
  const o = 0.05 + rnd() * 0.13
  dust += `<ellipse cx="${x}" cy="${y}" rx="${r * (1.5 + rnd())}" ry="${r * 0.7}" fill="#c9ab7a" fill-opacity="${o}"/>`
}

// 빛내림 — 승리 컷 위에 얹는 따뜻한 신광(위에서 아래로 퍼짐)
const godray =
  `<defs><radialGradient id="g" cx="0.5" cy="0.02" r="1.05">` +
  `<stop offset="0" stop-color="#fff6e2" stop-opacity="0.5"/>` +
  `<stop offset="0.35" stop-color="#ffd868" stop-opacity="0.22"/>` +
  `<stop offset="0.7" stop-color="#ffd868" stop-opacity="0"/>` +
  `</radialGradient></defs><rect width="${S}" height="${S}" fill="url(#g)"/>`

const svg = (body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">${body}</svg>`)

for (const [name, body] of [['ov-rain', rain], ['ov-dust', dust], ['ov-godray', godray]]) {
  await sharp(svg(body)).png().toFile(path.join(OUT, `${name}.png`))
  console.log(`ok ${name}.png`)
}
