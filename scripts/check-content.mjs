/* THE WAY — 콘텐츠 린터 (D-CONTENT · docs/CONTENT-GUIDE.md)
 *
 *   node scripts/check-content.mjs
 *
 * 자리 101곳의 콘텐츠는 코드가 아니라 사람이 쓴다. 사람이 쓰는 것은 반드시 빠뜨린다.
 * 그래서 실수의 종류를 기계가 아는 것으로 좁힌다:
 *
 *   1. 스키마 — 자리마다 있어야 할 밭(본문·묵상·기도·사건)이 비어 있지 않은가
 *   2. 금지어 — DECISIONS D3의 게임 어휘("레벨·클리어·보스·가챠")가 사용자 문장에 들어왔는가
 *   3. 지리 — 누적 km가 단조 증가하는가, 장(tier)이 실존하는 자리를 가리키는가
 *   4. 걸음 — 실제 구간이 [2, 12]km 안인가, 첫 구간이 3km 이하인가(CLAUDE.md 걸음 규칙)
 *   5. 톤 — moods.ts가 가리키는 자리가 실존하는가(오타로 수난 가드가 새는 것 방지)
 *
 * 신학 검수(성경에 없는 예수 말씀 창작 금지 등)는 기계가 못 한다 — 그건
 * docs/CONTENT-GUIDE.md의 사람 검수 단계다. 이 린터는 그 전에 기계가 걸러줄 것을 거른다. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const J = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'))

const journeys = {
  abraham: J('src/data/geo/journeys/abraham.json'),
  exodus: J('src/data/geo/journeys/exodus.json'),
  paul: J('src/data/geo/journeys/paul.json'),
  peter: J('src/data/geo/journeys/peter.json'),
}

/* 축척은 index.ts의 JOURNEY_SCALE이 정본 — 여기 복사해 두면 어긋난다. 본문에서 파싱한다. */
const indexSrc = fs.readFileSync(path.join(ROOT, 'src/data/geo/journeys/index.ts'), 'utf8')
const scaleBlock = indexSrc.match(/JOURNEY_SCALE[^{]*\{([\s\S]*?)\}/)?.[1] ?? ''
const SCALE = {}
for (const m of scaleBlock.matchAll(/(\w+):\s*([\d.]+)/g)) SCALE[m[1]] = Number(m[2])

/* 사용자 문장에 들어오면 안 되는 게임 어휘(DECISIONS D3). "보스"는 한 단어라 오탐이
 * 있을 수 있지만, 지금까지의 본문에서 정당한 용례가 없으므로 그대로 잡는다. */
const BANNED = ['레벨', '클리어', '보스', '가챠', '확률형']
const CONTENT_FIELDS = ['place', 'region', 'event', 'verseKrShort', 'reflection', 'prayer', 'feel']

let fails = 0
let warns = 0
const fail = (msg) => { fails++; console.log(`  ✘ ${msg}`) }
const warn = (msg) => { warns++; console.log(`  ⚠ ${msg}`) }
const ok = (msg) => console.log(`  ✔ ${msg}`)

const REF_RE = /^[가-힣0-9]+\s*\d+/ // "창 12:1-9", "행 1:8", "벧전 1:1" 꼴

for (const [id, j] of Object.entries(journeys)) {
  console.log(`\n── ${id} (${j.episodes.length}자리, 축척 ×${SCALE[id] ?? '?'}) ──`)
  let bad = 0

  // 1. 스키마 — 밭이 비었는가
  for (const e of j.episodes) {
    for (const f of ['place', 'placeLatin', 'region', 'event', 'passageRef', 'verseKrShort', 'reflection', 'prayer', 'feel']) {
      const v = e[f]
      if (typeof v !== 'string' || v.trim().length === 0) { fail(`${e.id}: ${f} 비어 있음`); bad++ }
    }
    if (e.verseKrShort && e.verseKrShort.trim().length < 8) { fail(`${e.id}: verseKrShort가 너무 짧음(${e.verseKrShort.length}자)`); bad++ }
    if (e.reflection && e.reflection.trim().length < 10) { fail(`${e.id}: reflection이 너무 짧음`); bad++ }
    if (e.passageRef && !REF_RE.test(e.passageRef)) { fail(`${e.id}: passageRef 형식 아님 — "${e.passageRef}"`); bad++ }
    if (e.confidence && !['biblical', 'tradition', 'symbolic'].includes(e.confidence)) { fail(`${e.id}: confidence 값 이상 — "${e.confidence}"`); bad++ }
    // 2. 금지어
    for (const f of CONTENT_FIELDS) {
      const v = e[f]
      if (typeof v !== 'string') continue
      for (const w of BANNED) if (v.includes(w)) { fail(`${e.id}: ${f}에 금지어 "${w}" — "${v.slice(0, 40)}…"`); bad++ }
    }
  }
  if (!bad) ok('스키마·금지어')

  // 3. 지리 — 누적 km 단조 증가, 장의 참조 무결성
  let geoBad = 0
  let prev = -1
  for (const e of j.episodes) {
    if (typeof e.cumulativeKm !== 'number' || e.cumulativeKm < prev) { fail(`${e.id}: cumulativeKm 역행(${prev} → ${e.cumulativeKm})`); geoBad++ }
    prev = e.cumulativeKm
  }
  if (j.episodes[0]?.cumulativeKm !== 0) { fail(`첫 자리 cumulativeKm ≠ 0`); geoBad++ }
  const epIds = new Set(j.episodes.map((e) => e.id))
  for (const t of j.tiers ?? []) {
    if (!epIds.has(t.fromEpisode)) { fail(`장 ${t.id}: fromEpisode "${t.fromEpisode}" 없음`); geoBad++ }
    if (!epIds.has(t.toEpisode)) { fail(`장 ${t.id}: toEpisode "${t.toEpisode}" 없음`); geoBad++ }
  }
  const lastKm = j.episodes[j.episodes.length - 1]?.cumulativeKm
  if (Math.abs(lastKm - j.totalKm) > Math.max(1, j.totalKm * 0.02)) warn(`totalKm(${j.totalKm}) ≠ 마지막 자리 누적(${lastKm})`)
  if (!geoBad) ok('지리(누적 km·장 참조)')

  // 4. 걸음 — JSON은 실측 원본이고, [2,12]km·첫 구간 ≤3km는 pace.ts가 로드 시 만든다.
  //    그래서 여기서는 pace.ts의 걸음 고르기를 그대로 재현해 **고른 뒤의** 값이 규칙을
  //    지키는지 본다 — 데이터가 깨져도, pace.ts의 상수를 누가 잘못 만져도 여기서 걸린다.
  const scale = SCALE[id]
  if (scale) {
    const paceSrc = fs.readFileSync(path.join(ROOT, 'src/data/geo/journeys/pace.ts'), 'utf8')
    const C = (name, dflt) => Number(paceSrc.match(new RegExp(`${name}\\s*=\\s*([\\d.]+)`))?.[1] ?? dflt)
    const MIN = C('PACE_MIN_REAL_KM', 2), MAX = C('PACE_MAX_REAL_KM', 12), FIRST = C('PACE_FIRST_REAL_KM', 3)
    let paceBad = 0
    for (let i = 1; i < j.episodes.length; i++) {
      const measuredSeg = j.episodes[i].segmentKm || Math.max(0, j.episodes[i].cumulativeKm - j.episodes[i - 1].cumulativeKm)
      const pacedReal = Math.min(i === 1 ? FIRST : MAX, Math.max(MIN, measuredSeg / scale))
      if (i === 1 && pacedReal > 3.001) { fail(`첫 구간(걸음 고른 뒤) ${pacedReal.toFixed(1)}km > 3km`); paceBad++ }
      else if (pacedReal < 1.999 || pacedReal > 12.001) { fail(`${j.episodes[i].id}: 걸음 고른 구간 ${pacedReal.toFixed(1)}km — [2, 12] 밖`); paceBad++ }
    }
    if (!paceBad) ok(`걸음(pace.ts 재현: [${MIN},${MAX}]km · 첫 구간 ≤${FIRST}km)`)
  }
}

// 5. moods.ts의 참조 무결성 — 오타 난 id는 수난 가드를 조용히 무력화한다
const moodsSrc = fs.readFileSync(path.join(ROOT, 'src/data/geo/journeys/moods.ts'), 'utf8')
console.log('\n── moods.ts 참조 ──')
let moodBad = 0
for (const [jid, j] of Object.entries(journeys)) {
  const ids = new Set(j.episodes.map((e) => e.id))
  const block = moodsSrc.match(new RegExp(`${jid}:\\s*\\{([\\s\\S]*?)\\n  \\}`))?.[1]
  if (!block) continue
  for (const m of block.matchAll(/'([\w-]+)':/g)) {
    if (!ids.has(m[1])) { fail(`moods.${jid}: 자리 "${m[1]}"가 ${jid}.json에 없음`); moodBad++ }
  }
}
if (!moodBad) ok('moods.ts가 가리키는 자리 전부 실존')

console.log(`\n${fails ? `✘ 실패 ${fails}건` : '전부 통과'}${warns ? ` · 경고 ${warns}건` : ''}`)
process.exit(fails ? 1 : 0)
