/* 대적 쇼케이스 영상 5편 — 대치 컷 → 걷힘 전환 → 승리 컷 (각 ~4.7초, 1080×1080 mp4).
 *
 *   node scripts/adversary-video.mjs            (전부)
 *   node scripts/adversary-video.mjs red-sea    (하나만)
 *
 * 앱 안의 연출(AdversaryVictory)과 같은 문법을 영상으로 옮긴 것 — 공유·홍보용이다.
 * 컷 편집: 대치 그림(느린 줌 + 이름 자막) → kind별 전환(바다·문=세로 갈라짐 vertopen,
 * 폭풍=번개 화이트 fadewhite, 광야·기근=fade) → 승리 그림(느린 줌 + 승리 서사 자막).
 * 이름·서사 문장의 정본은 src/data/adversaries.ts — 여기 복사본이 어긋나면 그쪽이 이긴다.
 * 출력은 showcase/ (.gitignore — 영상은 저장소에 안 담는다). */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpeg from 'ffmpeg-static'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ART = path.join(ROOT, 'src/assets/art')
const OUT = path.join(ROOT, 'showcase')
const FONT = 'C\\:/Windows/Fonts/malgunbd.ttf'

const CLIPS = [
  {
    id: 'red-sea', name: '홍해', title: '길을 막아선 바다', transition: 'vertopen',
    before: 'adversaries/red-sea.webp', after: 'episodes/exodus-pihahiroth.webp',
    victory: '바다가 갈라졌습니다\n마른 땅을 밟고 건넜습니다',
  },
  {
    id: 'wilderness-40', name: '사십 일의 광야', title: '마른 땅과 굶주림', transition: 'fade',
    before: 'adversaries/wilderness-40.webp', after: 'stations/temptation.webp',
    victory: '광야가 끝났습니다\n말씀으로 서서 지나왔습니다',
  },
  {
    id: 'euroclydon', name: '유라굴로', title: '밤낮 없는 광풍', transition: 'fadewhite',
    before: 'adversaries/euroclydon.webp', after: 'episodes/paul-malta.webp',
    victory: '모두 살아서 뭍에 닿았습니다\n한 사람도 잃지 않았습니다',
  },
  {
    id: 'council', name: '공회의 위협', title: '다시는 그 이름으로 말하지 말라', transition: 'vertopen',
    before: 'adversaries/council.webp', after: 'episodes/peter-ep04.webp',
    victory: '위협 앞에서 더 담대해졌습니다\n함께 기도한 이들과 같이',
  },
  {
    id: 'famine', name: '기근', title: '땅을 덮은 굶주림', transition: 'fade',
    before: 'adversaries/famine.webp', after: 'episodes/abraham-egypt.webp',
    victory: '기근의 때를 지나 살아남았습니다\n벧엘로 돌아가는 길이 다시 열립니다',
  },
]

fs.mkdirSync(OUT, { recursive: true })
const only = process.argv.slice(2)
const list = only.length ? CLIPS.filter((c) => only.includes(c.id)) : CLIPS

for (const c of list) {
  const before = path.join(ART, c.before)
  const after = path.join(ART, c.after)
  if (!fs.existsSync(before) || !fs.existsSync(after)) {
    console.error(`skip ${c.id}: 그림 없음 (${fs.existsSync(before) ? '' : c.before} ${fs.existsSync(after) ? '' : c.after})`)
    continue
  }
  // drawtext는 이스케이프 지옥이라 텍스트를 전부 파일로 준다
  const capDir = path.join(OUT, '.captions')
  fs.mkdirSync(capDir, { recursive: true })
  const f1 = path.join(capDir, `${c.id}-name.txt`)
  const f2 = path.join(capDir, `${c.id}-title.txt`)
  const f3 = path.join(capDir, `${c.id}-victory.txt`)
  fs.writeFileSync(f1, c.name)
  fs.writeFileSync(f2, c.title)
  fs.writeFileSync(f3, c.victory)
  const tf = (p) => p.replace(/\\/g, '/').replace(/:/g, '\\:')

  const filter =
    `[0:v]scale=1620:1620,zoompan=z='1+0.0008*on':d=90:s=1080x1080:fps=30,` +
    `drawtext=fontfile='${FONT}':textfile='${tf(f1)}':fontsize=64:fontcolor=0xf0e6d4:borderw=3:bordercolor=0x1c140a@0.9:x=64:y=h-190,` +
    `drawtext=fontfile='${FONT}':textfile='${tf(f2)}':fontsize=30:fontcolor=0xd8c9ae:borderw=2:bordercolor=0x1c140a@0.9:x=66:y=h-104,` +
    `format=yuv420p[v0];` +
    `[1:v]scale=1620:1620,zoompan=z='1.07-0.0008*on':d=105:s=1080x1080:fps=30,` +
    `drawtext=fontfile='${FONT}':textfile='${tf(f3)}':fontsize=38:fontcolor=0xfff6e2:borderw=3:bordercolor=0x1c140a@0.9:x=(w-text_w)/2:y=h-200:line_spacing=14:text_align=center,` +
    `format=yuv420p[v1];` +
    `[v0][v1]xfade=transition=${c.transition}:duration=1.3:offset=1.8,format=yuv420p[v]`

  const out = path.join(OUT, `${c.id}.mp4`)
  const r = spawnSync(ffmpeg, [
    '-y',
    '-i', before,
    '-i', after,
    '-filter_complex', filter,
    '-map', '[v]',
    '-an',
    '-c:v', 'libx264',
    '-crf', '20',
    '-movflags', '+faststart',
    out,
  ], { encoding: 'utf8' })
  if (r.status !== 0) {
    console.error(`FAIL ${c.id}:\n${(r.stderr || '').split('\n').slice(-6).join('\n')}`)
  } else {
    console.log(`ok   ${c.id}.mp4  ${(fs.statSync(out).size / 1024).toFixed(0)}KB`)
  }
}
