/* 예수님 사역 37자리의 자리별 스탬프 아트.
 *   RECRAFT_KEY=... node scripts/stations-art.mjs            (없는 것만)
 *   RECRAFT_KEY=... node scripts/stations-art.mjs --force baptism sower
 *
 * 왜 자리마다 따로 그리나: 지명이 겹친다(갈릴리 ×4, 골고다 ×3, 예루살렘 ×3, 팔복산 ×2).
 * 지형으로 배정하면 팔복과 긍휼이 같은 그림이 되어 수집물로서 의미가 없다.
 * 그래서 '장소'가 아니라 '그 자리에서 있었던 일'을 그린다.
 *
 * 신학 제약(PCK 검증): 그리스도를 인물로 직접 묘사하지 않는다. 후광·성인상·십자가 장식 금지.
 * 사람은 원경의 얼굴 없는 실루엣으로만. 그래서 대부분 사물과 지형으로 사건을 말한다.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const API = 'https://external.api.recraft.ai/v1'
const KEY = process.env.RECRAFT_KEY
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'src/assets/art/stations')

/* 스탬프 스캐폴드 — 씬(가로 풍경)과 달리 정사각 인장이다. 작게 줄여도 읽히는 실루엣이 최우선. */
const SCAFFOLD =
  'flat geometric illustration, a single square vignette for a Christian pilgrimage running app. ' +
  'Warm golden-hour Holy Land palette only: sand cream #f4ead7, terracotta clay #c05a30, olive sage #6e7a4c, ' +
  'sun-gold #e0a53f, deep umber #2c2118. Clean geometric shapes, flat fills, soft two-tone shading, ' +
  'subtle warm paper grain. One clear subject, centred, bold simple silhouette that still reads when the ' +
  'picture is shrunk to a small stamp. The illustration fills the whole square edge to edge — no border, ' +
  'no margin, no white frame, no inset panel. First-century Holy Land. ' +
  'Any person is a small faceless robed silhouette seen from far away, no facial features, no halo. ' +
  'NO depiction of Jesus, NO haloes, NO religious icons, NO crucifix ornament, NO outlines, NO ink linework, ' +
  'NO radiating fans, NO starbursts, NO text, NO letters, NO signature, NO watermark, NO neon, ' +
  'NO photorealism, NO clip-art. Subject: '

/* 자리 id → 그 사건을 말하는 사물·지형. 지명이 아니라 뜻으로 구분한다. */
const SUBJECTS = {
  baptism: 'a wide river between reed banks under an opening sky, a single shaft of pale light coming down onto the water',
  temptation: 'a bare stony desert floor with one dry thorn bush and three smooth stones, long hard shadows',
  'call-mt4': 'fishing nets left lying on a pebble shore beside an empty wooden boat, footprints leading away up the beach',
  'beat-1': 'a green terraced hillside with a small crowd of tiny distant seated silhouettes on the lower slope',
  'beat-2': 'two olive branches laid crossed on a flat stone at the top of a grassy hill',
  'light-mt5': 'a small clay oil lamp burning on a low stone wall at dusk, its warm light spilling over rooftops below',
  'lords-prayer': 'an open stone courtyard at dawn with one small lamp on the ground and wide sky above',
  sower: 'a ploughed field divided into four bands — a hard path, rocky ground, thorns, and rich dark soil with tall grain',
  feeding: 'five round barley loaves and two fish laid on a woven basket on the grass, a great empty hillside beyond',
  'walk-water': 'a dark night lake with a bright path of moonlight running across the water toward a small boat',
  'blind-sight': 'a still stone pool with clear water, a small clay jar on its rim, light entering from above',
  transfig: 'a high mountain summit in pale white light with three small booths of branches, a low cloud below the peak',
  'lost-sheep': 'ninety-nine sheep as a pale flock on a hilltop and one small lone sheep down in a dark ravine',
  prodigal: 'a farmhouse doorway at the end of a long dirt road, one small figure running far off down the road',
  samaritan: 'a stony descending road with a bundle lying at the roadside, a donkey and a lit inn lamp further on',
  'lazarus-come': 'a rock tomb mouth with the stone rolled back and folded linen cloths on the threshold',
  entry: 'a city gate with palm branches and cloaks strewn across the road leading up to it',
  'last-supper': 'a low table with a broken round loaf and one clay cup, empty places set around it',
  gethsemane: 'an olive grove at night with a heavy stone olive press and one small lamp among the trunks',
  arrest: 'torches burning in a dark ravine at night, one dropped cloak on the ground',
  pilate: 'an empty raised stone pavement with a bare judgment seat, columns casting long shadows',
  golgotha: 'a bare rounded hill outside a city wall with three empty post sockets cut into the rock at its top',
  finished: 'a darkening sky over a bare hill, a heavy woven curtain torn from top to bottom in the foreground',
  'empty-tomb': 'a rock-cut tomb at first light with the round stone rolled aside and the dark doorway open and empty',
  risen: 'a closed upper-room door with warm light pressing through every gap around its frame',
  commission: 'a mountain top with paths running out from it in every direction to distant horizons',
  pentecost: 'small flames like tongues hovering above an open courtyard, wind bending the grain beyond the wall',
  'peter-sermon': 'broad temple steps with a great crowd shown as bands of tiny silhouettes below them',
  saul: 'a long road with a sudden burst of white light across it, a fallen travelling staff and cloak on the ground',
  'ends-earth': 'a small ship leaving a rocky coastline toward a vast open horizon of sea and sky',
  talents: 'three cloth pouches of coins on a wooden table, one of them buried in a small pit of earth beside it',
  mustard: 'one tiny seed in the foreground and a great spreading tree behind it with birds nesting in its branches',
  'wise-builder': 'a stone house standing on bare rock beside a flooded sandy hollow where another house has slumped',
  'resurrection-hope': 'a rock-cut doorway in a hillside with light falling across its threshold, one olive tree beside it',
  'cross-luke': 'an evening sky over a bare hill with one single bright point of light low on the horizon',
  'call-mk1': 'two wooden boats drawn up on the shore with nets spread out being mended between them',
  'take-heart': 'a small boat sitting on suddenly calm water with dark storm clouds drawing back behind it',
}

const credits = async () => {
  const r = await fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${KEY}` } })
  return (await r.json()).credits
}

async function generate(subject) {
  const prompt = SCAFFOLD + subject
  const r = await fetch(`${API}/images/generations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, model: 'recraftv4_1', size: '1:1', n: 1 }),
  })
  if (!r.ok) throw new Error(`HTTP ${r.status} ${(await r.text()).slice(0, 180)}`)
  const url = (await r.json()).data[0].url
  return Buffer.from(await (await fetch(url)).arrayBuffer())
}

const [, , ...args] = process.argv
const force = args.includes('--force')
const only = args.filter((a) => !a.startsWith('--'))

if (!KEY) throw new Error('RECRAFT_KEY 환경변수가 필요합니다')
fs.mkdirSync(OUT, { recursive: true })

const targets = (only.length ? only : Object.keys(SUBJECTS)).filter((k) => {
  if (!SUBJECTS[k]) throw new Error(`알 수 없는 자리: ${k}`)
  return force || !fs.existsSync(path.join(OUT, `${k}.webp`))
})

const before = await credits()
console.log(`시작 — ${targets.length}자리, 크레딧 ${before}`)

let made = 0
for (const id of targets) {
  try {
    const buf = await generate(SUBJECTS[id])
    fs.writeFileSync(path.join(OUT, `${id}.webp`), buf)
    made++
    console.log(`  ok    ${id.padEnd(20)} ${(buf.length / 1024).toFixed(0)} KB`)
  } catch (e) {
    console.log(`  FAIL  ${id.padEnd(20)} ${e.message}`)
  }
}

const after = await credits()
console.log(`완료 — ${made}장, ${before - after} 크레딧 사용, 잔액 ${after}`)
console.log('※ 생성 후 반드시: node scripts/optimize-art.mjs --write')
