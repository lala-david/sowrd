/* 대적 쇼케이스 영상 — 다중 컷 시네마틱 합성 (1080², 30fps).
 *
 *   node scripts/video-overlays.mjs            (오버레이 먼저, 1회)
 *   node scripts/adversary-video.mjs           (전부)
 *   node scripts/adversary-video.mjs red-sea   (하나만)
 *
 * 구조: 프레임(스틸)마다 켄번즈(줌인/아웃 교대) 세그먼트를 만들고 xfade로 잇는다.
 * 그 위에 kind별 오버레이(비/먼지 — mod(t)로 끊김 없이 흐름), 승리 컷의 빛내림,
 * 필름 그레인, 비네트, 검정 페이드 인·아웃, 자막(이름·서사·승리 — 페이드) 합성.
 * 중간 키프레임은 scripts/video-frames/ (recraft 생성 — 없으면 그 컷은 건너뛴다).
 * 문장 정본은 src/data/adversaries.ts — 어긋나면 그쪽이 이긴다. 출력 showcase/(.gitignore). */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpeg from 'ffmpeg-static'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ART = path.join(ROOT, 'src/assets/art')
const VF = path.join(ROOT, 'scripts/video-frames')
const OUT = path.join(ROOT, 'showcase')
const FONT = 'C\\:/Windows/Fonts/malgunbd.ttf'

const FRAME_DUR = 2.6 // 초/컷
const TRANS_DUR = 1.15

/* 프레임: src(존재 안 하면 컷 생략), cap(자막), big(이름 자막 크게) */
const CLIPS = [
  {
    id: 'red-sea',
    overlay: null,
    frames: [
      { src: 'adv:red-sea.webp', big: '홍해', cap: '길을 막아선 바다' },
      { src: 'vf:red-sea-stir.webp', cap: '물결 소리가 가까워집니다' },
      { src: 'vf:red-sea-mid.webp', cap: '동풍이 바다를 가르기 시작합니다' },
      { src: 'vf:red-sea-within.webp', cap: '마른 땅이 드러납니다' },
      { src: 'ep:exodus-pihahiroth.webp', cap: '바다가 갈라졌습니다 — 마른 땅을 밟고 건넜습니다', victory: true },
    ],
    transitions: ['fade', 'vertopen', 'fade', 'fade'],
  },
  {
    id: 'euroclydon',
    overlay: 'rain',
    overlayCuts: 1,
    frames: [
      { src: 'vf:euroclydon-v2.webp', alt: 'adv:euroclydon.webp', big: '유라굴로', cap: '밤낮 없는 광풍' },
      { src: 'vf:euroclydon-calm.webp', cap: '수심이 얕아집니다 — 뭍이 가깝습니다' },
      { src: 'vf:euroclydon-land.webp', cap: '섬이 보입니다' },
      { src: 'ep:paul-malta.webp', cap: '모두 살아서 뭍에 닿았습니다 — 한 사람도 잃지 않았습니다', victory: true },
    ],
    transitions: ['fadewhite', 'fade', 'fade'],
  },
  {
    id: 'council',
    overlay: null,
    frames: [
      { src: 'adv:council.webp', big: '공회의 위협', cap: '다시는 그 이름으로 말하지 말라' },
      { src: 'vf:council-pray.webp', cap: '교회가 함께 기도합니다' },
      { src: 'vf:council-shake.webp', cap: '모인 곳이 진동합니다' },
      { src: 'vf:council-mid.webp', cap: '문이 열립니다' },
      { src: 'ep:peter-ep04.webp', cap: '위협 앞에서 더 담대해졌습니다 — 함께 기도한 이들과 같이', victory: true },
    ],
    transitions: ['fade', 'fade', 'vertopen', 'fade'],
  },
  {
    id: 'wilderness-40',
    overlay: null,
    frames: [
      { src: 'adv:wilderness-40.webp', big: '사십 일의 광야', cap: '마른 땅과 굶주림' },
      { src: 'vf:wilderness-stones.webp', cap: '사람이 떡으로만 살 것이 아니요' },
      { src: 'vf:wilderness-night.webp', cap: '마른 땅 한가운데입니다' },
      { src: 'vf:wilderness-dawn.webp', cap: '광야의 끝이 보입니다' },
      { src: 'st:temptation.webp', cap: '광야가 끝났습니다 — 말씀으로 서서 지나왔습니다', victory: true },
    ],
    transitions: ['fade', 'fade', 'fade', 'fade'],
  },
  {
    id: 'famine',
    overlay: 'dust',
    overlayCuts: 3,
    frames: [
      { src: 'adv:famine.webp', big: '기근', cap: '땅을 덮은 굶주림' },
      { src: 'vf:famine-jars.webp', cap: '땅이 마르기 시작합니다' },
      { src: 'vf:famine-road.webp', cap: '멀리 애굽의 강이 보입니다' },
      { src: 'ep:abraham-egypt.webp', cap: '강가에서 살아남았습니다' },
      { src: 'vf:famine-return.webp', cap: '기근의 때를 지나 — 벧엘로 돌아가는 길이 다시 열립니다', victory: true },
    ],
    transitions: ['fade', 'fade', 'fade', 'fade'],
  },
]

const resolveSrc = (s) => {
  const [kind, file] = s.split(':')
  const base = kind === 'adv' ? path.join(ART, 'adversaries') : kind === 'ep' ? path.join(ART, 'episodes') : kind === 'st' ? path.join(ART, 'stations') : VF
  return path.join(base, file)
}

fs.mkdirSync(OUT, { recursive: true })
const capDir = path.join(OUT, '.captions')
fs.mkdirSync(capDir, { recursive: true })
const tf = (p) => p.replace(/\\/g, '/').replace(/:/g, '\\:')
const capFile = (id, i, text) => {
  const p = path.join(capDir, `${id}-${i}.txt`)
  fs.writeFileSync(p, text)
  return tf(p)
}

const only = process.argv.slice(2)
for (const c of CLIPS.filter((x) => !only.length || only.includes(x.id))) {
  // 존재하는 프레임만 남긴다(중간 키프레임이 아직 없으면 그 컷 생략, alt가 있으면 대체)
  const frames = []
  const trans = []
  c.frames.forEach((f, i) => {
    let p = resolveSrc(f.src)
    if (!fs.existsSync(p) && f.alt) p = resolveSrc(f.alt)
    if (fs.existsSync(p)) {
      frames.push({ ...f, path: p })
      if (frames.length > 1) trans.push(c.transitions[Math.min(i - 1, c.transitions.length - 1)] ?? 'fade')
    } else {
      console.warn(`  (${c.id}: ${f.src} 없음 — 컷 생략)`)
    }
  })
  if (frames.length < 2) { console.error(`skip ${c.id}: 프레임 부족`); continue }

  const inputs = []
  frames.forEach((f) => inputs.push('-loop', '1', '-t', String(FRAME_DUR + TRANS_DUR), '-i', f.path))
  const ovRain = path.join(VF, 'ov-rain.png')
  const ovDust = path.join(VF, 'ov-dust.png')
  const ovRay = path.join(VF, 'ov-godray.png')
  const ovIdx = frames.length
  if (c.overlay === 'rain') inputs.push('-loop', '1', '-i', ovRain)
  if (c.overlay === 'dust') inputs.push('-loop', '1', '-i', ovDust)
  const rayIdx = c.overlay ? ovIdx + 1 : ovIdx
  inputs.push('-loop', '1', '-i', ovRay)

  let graph = ''
  frames.forEach((f, i) => {
    // 켄번즈 — 홀수 컷은 줌인, 짝수 컷은 줌아웃(단조로움 방지). zoompan은 프레임을 스스로 만든다
    const frames30 = Math.round((FRAME_DUR + TRANS_DUR) * 30)
    const z = i % 2 === 0 ? `1+0.045*on/${frames30}` : `1.055-0.045*on/${frames30}`
    graph += `[${i}:v]scale=1620:1620,zoompan=z='${z}':d=${frames30}:s=1080x1080:fps=30`
    /* 자막 알파: 들어올 땐 0.6~0.7초 페이드인, 전환이 시작되기 전에 0.5초 페이드아웃 —
       안 그러면 xfade 동안 두 컷의 자막이 겹쳐 유령이 된다(실측). 승리 자막은 남긴다
       (영상 끝의 검정 페이드가 데려간다). */
    const outAt = FRAME_DUR + 0.3
    const fadeInOut = (inDur) => `'min(1,t/${inDur})*min(1,max(0,(${outAt.toFixed(2)}-t)/0.5))'`
    if (f.big) {
      graph += `,drawtext=fontfile='${FONT}':textfile='${capFile(c.id, `big${i}`, f.big)}':fontsize=68:fontcolor=0xf0e6d4:borderw=3:bordercolor=0x1c140a@0.9:x=64:y=h-206:alpha=${f.victory ? `'min(1,t/0.6)'` : fadeInOut('0.6')}`
    }
    if (f.cap) {
      const size = f.victory ? 40 : 30
      const y = f.big ? 'h-118' : f.victory ? 'h-170' : 'h-130'
      graph += `,drawtext=fontfile='${FONT}':textfile='${capFile(c.id, i, f.cap)}':fontsize=${size}:fontcolor=${f.victory ? '0xfff6e2' : '0xd8c9ae'}:borderw=3:bordercolor=0x1c140a@0.9:x=${f.victory && !f.big ? '(w-text_w)/2' : '66'}:y=${y}:line_spacing=12:alpha=${f.victory ? `'min(1,t/0.7)'` : fadeInOut('0.7')}`
    }
    graph += `,format=yuv420p[v${i}];`
  })

  // xfade 체인 — 길이 누적 계산
  let label = 'v0'
  let len = FRAME_DUR + TRANS_DUR
  frames.slice(1).forEach((_, k) => {
    const off = len - TRANS_DUR
    const next = `x${k}`
    graph += `[${label}][v${k + 1}]xfade=transition=${trans[k]}:duration=${TRANS_DUR}:offset=${off.toFixed(2)}[${next}];`
    label = next
    len = off + TRANS_DUR + FRAME_DUR + TRANS_DUR - TRANS_DUR
  })
  const total = len - TRANS_DUR + 0.2
  const vicStart = total - FRAME_DUR - 0.6

  // kind 오버레이(지정한 앞쪽 컷 동안만) → 빛내림(승리 컷) → 그레인 → 비네트 → 페이드
  const ovEnd = c.overlayCuts ? Math.min(c.overlayCuts, frames.length - 1) * FRAME_DUR + TRANS_DUR * 0.6 : vicStart
  if (c.overlay === 'rain') {
    graph += `[${ovIdx}:v]scale=2160:2160,format=rgba[ov];[${label}][ov]overlay=x='-mod(t*300,1080)':y='mod(t*880,1080)-1080':enable='lt(t,${ovEnd.toFixed(2)})'[o1];`
    label = 'o1'
  } else if (c.overlay === 'dust') {
    graph += `[${ovIdx}:v]scale=2160:2160,format=rgba[ov];[${label}][ov]overlay=x='-mod(t*120,1080)':y='-mod(t*18,540)':enable='lt(t,${ovEnd.toFixed(2)})'[o1];`
    label = 'o1'
  }
  graph += `[${rayIdx}:v]scale=1080:1080,format=rgba,fade=in:st=${vicStart.toFixed(2)}:d=1.4:alpha=1[ray];`
  graph += `[${label}][ray]overlay=enable='gte(t,${vicStart.toFixed(2)})'[o2];`
  // 그레인 alls=6은 인코더를 괴롭혀 클립당 9MB가 나왔다 — 4면 질감은 남고 무게는 절반
  graph += `[o2]noise=alls=4:allf=t,vignette=angle=PI/5,fade=in:st=0:d=0.45,fade=out:st=${(total - 0.55).toFixed(2)}:d=0.55,format=yuv420p[v]`

  const out = path.join(OUT, `${c.id}.mp4`)
  const r = spawnSync(ffmpeg, ['-y', ...inputs, '-filter_complex', graph, '-map', '[v]', '-t', total.toFixed(2), '-an', '-c:v', 'libx264', '-crf', '21', '-movflags', '+faststart', out], { encoding: 'utf8' })
  if (r.status !== 0) console.error(`FAIL ${c.id}:\n${(r.stderr || '').split('\n').slice(-8).join('\n')}`)
  else console.log(`ok   ${c.id}.mp4  ${(fs.statSync(out).size / 1024).toFixed(0)}KB · ${frames.length}컷 · ${total.toFixed(1)}s`)
}
