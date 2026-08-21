/* 자리 영상 매니페스트 동기화 (predev·prebuild 자동 실행).
 * public/media/episodes/{journey}/{station}.mp4 를 스캔해
 * src/data/episode-videos.json ("journey:station" 배열)을 쓴다 —
 * 앱(EpisodeFilm)이 이 목록으로 "영상이 있는 자리"만 플레이어를 그린다.
 * 영상 파일을 넣고 빼는 것만으로 앱이 따라온다(수동 목록 관리 금지 — 반드시 어긋난다). */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const MEDIA = path.join(ROOT, 'public/media/episodes')
const OUT = path.join(ROOT, 'src/data/episode-videos.json')

const list = []
if (fs.existsSync(MEDIA)) {
  for (const j of fs.readdirSync(MEDIA)) {
    const dir = path.join(MEDIA, j)
    if (!fs.statSync(dir).isDirectory()) continue
    for (const f of fs.readdirSync(dir)) if (f.endsWith('.mp4')) list.push(`${j}:${f.replace(/\.mp4$/, '')}`)
  }
}
list.sort()
const next = JSON.stringify(list, null, 2) + '\n'
if (!fs.existsSync(OUT) || fs.readFileSync(OUT, 'utf8') !== next) {
  fs.writeFileSync(OUT, next)
  console.log(`sync-episode-videos: ${list.length}편`)
}
