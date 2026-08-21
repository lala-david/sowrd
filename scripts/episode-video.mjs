/* 자리 시네마틱 렌더러 — episode-scenes.mjs → showcase/episodes/{journey}/{station}.mp4
 *   node scripts/episode-frames.mjs   (키프레임 먼저)
 *   node scripts/episode-video.mjs                (전부)
 *   node scripts/episode-video.mjs jesus-baptism  (하나만)
 *
 * 도착의 문법: 접근 → 도착 → 사건 → 말씀(한/영 자막) → 머묾. 전환은 전부 fade —
 * 자리는 대적이 아니라 조용히 닿는 곳이다(갈라짐·화이트플래시는 대적의 어휘).
 *
 * 무드 프리셋(신학 가드의 기계 강제 — PLANNING §4.3 · CONTENT-UX 수난=OFF):
 *   wonder·joy      빛내림(말씀 컷부터)
 *   everyday·compassion  이펙트 없음(그레인·비네트만)
 *   wilderness      마른 먼지 오버레이(앞 두 컷)
 *   lament          빛내림 금지 · 채도 낮춤 · 컷과 전환이 느려짐 — 침묵의 문법.
 *                   여기 값을 바꾸는 것은 취향이 아니라 신학 결정이다.
 * 1080² · CRF21 · 무음. 대적 영상과 같은 그레인·비네트 마감. */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpeg from 'ffmpeg-static'
import { SCENES } from './episode-scenes-index.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ART = path.join(ROOT, 'src/assets/art')
const VF = path.join(ROOT, 'scripts/video-frames')
const OUT = path.join(ROOT, 'showcase/episodes')
const FONT = 'C\\:/Windows/Fonts/malgunbd.ttf'

const MOOD = {
  wonder: { godray: true },
  joy: { godray: true },
  everyday: {},
  compassion: {},
  wilderness: { overlay: 'dust', overlayCuts: 2 },
  lament: { slow: true, desat: true },
}

const resolveArt = (s) => {
  const [kind, file] = s.split(':')
  const base = kind === 'st' ? path.join(ART, 'stations') : kind === 'ep' ? path.join(ART, 'episodes') : kind === 'adv' ? path.join(ART, 'adversaries') : VF
  return path.join(base, file)
}

const capDir = path.join(ROOT, 'showcase/.captions')
fs.mkdirSync(capDir, { recursive: true })
const tf = (p) => p.replace(/\\/g, '/').replace(/:/g, '\\:')
const capFile = (name, text) => {
  const p = path.join(capDir, `${name}.txt`)
  fs.writeFileSync(p, text)
  return tf(p)
}
const dt = (file, size, color, x, y, alpha, spacing = 12) =>
  `,drawtext=fontfile='${FONT}':textfile='${file}':fontsize=${size}:fontcolor=${color}:borderw=3:bordercolor=0x1c140a@0.88:x=${x}:y=${y}:line_spacing=${spacing}:alpha=${alpha}`

const only = process.argv.slice(2)
for (const s of SCENES.filter((x) => !only.length || only.includes(x.id))) {
  const mood = MOOD[s.mood] ?? {}
  const F = mood.slow ? 3.1 : 2.6
  const T = mood.slow ? 1.6 : 1.15

  const frames = s.cuts
    .map((c) => ({ ...c, path: c.gen ? path.join(VF, 'ep', `${c.gen}.webp`) : resolveArt(c.art) }))
    .filter((c) => {
      if (fs.existsSync(c.path)) return true
      console.warn(`  (${s.id}: ${c.gen ?? c.art} 없음 — 컷 생략)`)
      return false
    })
  if (frames.length < 3) { console.error(`skip ${s.id}: 프레임 부족(${frames.length})`); continue }

  const inputs = []
  frames.forEach((f) => inputs.push('-loop', '1', '-t', String(F + T), '-i', f.path))
  const extra = []
  if (mood.overlay === 'dust') extra.push(path.join(VF, 'ov-dust.png'))
  if (mood.godray !== false) extra.push(path.join(VF, 'ov-godray.png'))
  const dustIdx = mood.overlay === 'dust' ? frames.length : -1
  const rayIdx = frames.length + (mood.overlay === 'dust' ? 1 : 0)
  extra.forEach((p) => inputs.push('-loop', '1', '-i', p))

  let graph = ''
  const seg = Math.round((F + T) * 30)
  const outAt = F + 0.3
  const fio = (inD) => `'min(1,t/${inD})*min(1,max(0,(${outAt.toFixed(2)}-t)/0.5))'`
  frames.forEach((f, i) => {
    const z = i % 2 === 0 ? `1+0.045*on/${seg}` : `1.055-0.045*on/${seg}`
    graph += `[${i}:v]scale=1620:1620,zoompan=z='${z}':d=${seg}:s=1080x1080:fps=30`
    if (i === 0) {
      graph += dt(capFile(`${s.id}-place`, s.place), 64, '0xf0e6d4', 64, 'h-232', fio('0.6'))
      graph += dt(capFile(`${s.id}-title`, s.title), 30, '0xd8c9ae', 66, 'h-148', fio('0.7'))
      graph += dt(capFile(`${s.id}-en`, `${s.placeEn} — ${s.titleEn}`), 22, '0xb9a884', 66, 'h-104', fio('0.8'))
    }
    if (f.verse) {
      // 영어 본문이 저장소 데이터에 없는 자리는 한글만 — 번역을 지어내지 않는다
      graph += dt(capFile(`${s.id}-verse`, s.verse), 34, '0xfff6e2', '(w-text_w)/2', s.verseEn ? 'h-300' : 'h-220', fio('0.7'), 14)
      if (s.verseEn) graph += dt(capFile(`${s.id}-verse-en`, s.verseEn), 22, '0xd8c9ae', '(w-text_w)/2', 'h-176', fio('0.8'), 8)
      graph += dt(capFile(`${s.id}-ref`, s.ref), 18, '0xb9a884', '(w-text_w)/2', 'h-92', fio('0.9'))
    }
    graph += `,format=yuv420p[v${i}];`
  })

  let label = 'v0'
  let len = F + T
  frames.slice(1).forEach((_, k) => {
    const off = len - T
    graph += `[${label}][v${k + 1}]xfade=transition=fade:duration=${T}:offset=${off.toFixed(2)}[x${k}];`
    label = `x${k}`
    len = off + F + T
  })
  const total = len - T + 0.2
  const verseIdx = frames.findIndex((f) => f.verse)
  const verseStart = (verseIdx > 0 ? verseIdx : frames.length - 2) * F - 0.4

  if (dustIdx >= 0) {
    const ovEnd = (mood.overlayCuts ?? 2) * F + T * 0.6
    graph += `[${dustIdx}:v]scale=2160:2160,format=rgba[dov];[${label}][dov]overlay=x='-mod(t*120,1080)':y='-mod(t*18,540)':enable='lt(t,${ovEnd.toFixed(2)})'[do];`
    label = 'do'
  }
  if (mood.godray) {
    graph += `[${rayIdx}:v]scale=1080:1080,format=rgba,fade=in:st=${verseStart.toFixed(2)}:d=1.6:alpha=1[ray];[${label}][ray]overlay=enable='gte(t,${verseStart.toFixed(2)})'[ro];`
    label = 'ro'
  }
  const desat = mood.desat ? 'eq=saturation=0.82,' : ''
  graph += `[${label}]${desat}noise=alls=4:allf=t,vignette=angle=PI/5,fade=in:st=0:d=0.45,fade=out:st=${(total - 0.6).toFixed(2)}:d=0.6,format=yuv420p[v]`

  const dir = path.join(OUT, s.journey)
  fs.mkdirSync(dir, { recursive: true })
  const out = path.join(dir, `${s.stationId}.mp4`)
  const r = spawnSync(ffmpeg, ['-y', ...inputs, '-filter_complex', graph, '-map', '[v]', '-t', total.toFixed(2), '-an', '-c:v', 'libx264', '-crf', '21', '-movflags', '+faststart', out], { encoding: 'utf8' })
  if (r.status !== 0) console.error(`FAIL ${s.id}:\n${(r.stderr || '').split('\n').slice(-8).join('\n')}`)
  else console.log(`ok   ${s.journey}/${s.stationId}.mp4  ${(fs.statSync(out).size / 1024).toFixed(0)}KB · ${frames.length}컷 · ${total.toFixed(1)}s · ${s.mood}`)
}
