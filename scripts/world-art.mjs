/* THE WAY — 월드(퀘스트 보드) 아트 생성기 · recraft v4.1
 *
 *   node scripts/world-art.mjs panels            (없는 패널만)
 *   node scripts/world-art.mjs panels jesus-3    (그 패널만, --force로 덮어쓰기)
 *   node scripts/world-art.mjs figures           (인물 토큰 · 벡터)
 *   node scripts/world-art.mjs --dry             (프롬프트만 출력, 호출 없음)
 *
 * 키는 RECRAFT_KEY 환경변수 또는 .env.local(RECRAFT_KEY=...)에서 읽는다.
 *
 * ── 왜 장(章)마다 한 장인가 ───────────────────────────────────────────────
 * 지도는 이제 **세로로 내려가는 퀘스트 보드**다. 장 하나가 패널 한 장(9:16)이고, 패널을
 * 위에서 아래로 이어 붙이면 그 여정의 월드가 된다. 그래서 같은 여정 안에서도 장이 바뀌면
 * 풍경이 바뀐다 — 요단강 골짜기에서 갈릴리 호숫가로, 호숫가에서 예루살렘 성벽으로.
 * 길(라피스 선)과 자리(메달리온)는 코드가 그 위에 그린다. 그림은 **땅만** 담는다.
 *
 * ── 프롬프트 원칙(이 저장소에서 이미 확인된 것) ─────────────────────────
 *  · 부정 목록은 그 사물을 부른다 → 긍정 서술로 말한다("땅만 있다", "하늘은 위쪽 가장자리에 닿는다").
 *  · 숫자·비율은 그림에 글자로 박힌다 → 말로 서술한다.
 *  · 인물은 후광을 부른다 → 패널에는 사람을 두지 않는다. 인물은 figures로 따로, 얼굴 없이.
 *  · 그리스도는 인물로 그리지 않는다(PCK 검증). 예수 여정의 "인물"은 등불이다.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const API = 'https://external.api.recraft.ai/v1'
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadKey() {
  if (process.env.RECRAFT_KEY) return process.env.RECRAFT_KEY
  const p = path.join(ROOT, '.env.local')
  if (fs.existsSync(p)) {
    const m = fs.readFileSync(p, 'utf8').match(/RECRAFT_KEY=(\S+)/)
    if (m) return m[1]
  }
  throw new Error('RECRAFT_KEY가 없습니다 (.env.local 또는 환경변수)')
}

/* ── 패널 스캐폴드 ────────────────────────────────────────────────────────
 * 높은 사선 조감(게임 월드맵의 그 시점). 수채·구아슈 결의 손그림. 가장자리까지 땅.
 * 위쪽 패널과 아래쪽 패널이 이어져야 하므로 지평선·하늘을 넣지 않는다 — 전부 땅이다. */
const PANEL_SCAFFOLD =
  'Hand-painted storybook adventure-game overworld map, seen from high above at a steep bird\'s-eye angle. ' +
  'Tall vertical composition. The land fills the entire frame and runs off all four edges — it is a piece of a ' +
  'much larger map, so there is no horizon, no sky, no frame, no border, no parchment edge. Everything in the ' +
  'picture is terrain, water, vegetation and small buildings, rendered as soft gouache and watercolour with ' +
  'subtle paper grain, gentle cast shadows, and clean readable shapes. Ancient first-century Near East and ' +
  'Mediterranean world; the only structures are small stone, mud-brick and timber buildings of that era. ' +
  'The land is empty of people and empty of writing. Large open areas of plain ground are left between ' +
  'landmarks so that route markers can be placed on top later. Calm, premium, warm editorial illustration. ' +
  'Scene: '

/* 여정별 팔레트 — 한 여정 안의 패널이 한 세계로 묶이게 controls.colors로도 건넨다. */
const WORLD = {
  jesus: {
    palette: 'sun-warmed cream and ochre land, soft olive-green hills, the lake a deep calm blue-teal, golden barley fields',
    colors: [[242, 226, 188], [122, 140, 88], [46, 110, 130], [222, 170, 80]],
  },
  abraham: {
    palette: 'dusk and night: deep plum-violet shadows, warm amber sand, pale moonlit stone, the river a dark indigo ribbon, scattered gold stars of campfires',
    colors: [[78, 44, 92], [214, 168, 104], [236, 220, 190], [40, 50, 100]],
  },
  exodus: {
    palette: 'rust-red granite, pale bone-white sand, the sea a bright turquoise, dark green palm oases, smoky lapis-blue mountain shadow',
    colors: [[168, 78, 52], [236, 222, 190], [58, 160, 160], [48, 72, 130]],
  },
  paul: {
    palette: 'Mediterranean sea in rich teal and ultramarine, white limestone coasts, terracotta roofs, silver-green olive terraces, warm ochre uplands',
    colors: [[26, 96, 112], [44, 72, 150], [228, 214, 180], [190, 92, 58]],
  },
  peter: {
    palette: 'olive and sage green hills, honey-coloured limestone cities, dusty rose roads, the sea a soft grey-blue, warm late-afternoon gold',
    colors: [[110, 124, 70], [222, 186, 110], [196, 150, 130], [120, 150, 168]],
  },
}

/* 장마다 한 패널. 키 = `${journeyId}-${tierIndex}` (0-based, quest.ts의 tier 순서와 같다) */
const PANELS = {
  /* 예수님의 사역 길 (7장) */
  'jesus-0': 'the Jordan river valley winding down through pale rocky Judean wilderness, reeds along the banks, a few tamarisk trees, dry wadis, and at the far end the green shore of a great lake with small fishing boats pulled up on the shingle',
  'jesus-1': 'a gentle green hillside above the lake of Galilee, terraced with wildflower meadows and scattered fig trees, a small spring, low stone sheepfolds, and below it the blue lake shore curving away',
  'jesus-2': 'the Sea of Galilee itself filling much of the frame, fishing boats with furled sails on the water, the lakeside village of Capernaum with a small stone synagogue, mustard-yellow fields, vineyards, and a tall rounded mountain rising beyond the lake',
  'jesus-3': 'the hill country road between Jericho and Bethany: rolling limestone hills, olive groves, a stone well, a sheepfold with an open gate, a small village of flat-roofed houses among terraced slopes, a lone inn by the road',
  'jesus-4': 'Jerusalem in solemn dusk light: the great limestone city walls and temple courts, the Mount of Olives with its ancient olive garden opposite, a quiet rocky hill outside the wall; muted subdued colours, long soft shadows, hushed and still',
  'jesus-5': 'a garden at first light: pale limestone hills, a rock-cut tomb with a great round stone rolled aside, flowering almond trees, dew on the grass, the first gold of dawn spilling across the ground',
  'jesus-6': 'a high mountain in Galilee with a wide road flowing down from it and fanning out into many paths across open country toward the distant blue edge of the sea — the land opening outward in every direction',

  /* 아브라함의 여정 (3장) */
  'abraham-0': 'Ur of the Chaldees at night: a great stepped mud-brick ziggurat beside the broad Euphrates, reed marshes and date palms along the water, flat-roofed houses, starry sky reflected in still canals',
  'abraham-1': 'the long caravan country from Haran down into Canaan: wide dusty plains, a bend of the Euphrates, black goat-hair tents and camels at rest, low grey hills of Syria, a single great oak on a rise at Shechem',
  'abraham-2': 'the hill country of Canaan under evening light: a stone altar on a hilltop, a grove of great ancient oaks, a deep stone well with a trough, a lone rocky mount with a stone altar on top, a cave in a hillside beside a field of trees, and in one corner the green edge of a river delta. Unlabelled — the map carries no names, no lettering, no writing of any kind',

  /* 출애굽 여정 (4장) */
  'exodus-0': 'the Nile delta with brick storehouses and grain silos of Rameses, green marsh and reeds, the road out into pale desert, and the Red Sea with its waters standing apart in two walls with a dry seabed path between them',
  'exodus-1': 'the wilderness of Sin: a small bitter brackish spring, a green oasis of tall date palms beside one single calm pool, wide white sand flats, a split rock with a stream flowing out of it, and the dark rust-red granite mass of Mount Sinai wrapped in cloud and smoke. The land is open and uncluttered, with broad plain stretches of sand',
  'exodus-2': 'the wilderness of Paran: broken limestone cliffs, the oasis of Kadesh Barnea with acacia trees and a spring, scattered tents, dry riverbeds, harsh pale rock and long shadows',
  'exodus-3': 'the gulf at Ezion-geber with turquoise water and coral shallows, the Arabah valley, the green plains of Moab by the Jordan, and the high ridge of Mount Nebo looking out over the Jordan valley to the far blue hills of the promised land',

  /* 바울의 전도 여정 (4장) */
  'paul-0': 'Syrian Antioch on the Orontes river, the island of Cyprus with the harbours of Salamis and Paphos, the coast of Pamphylia at Perga, and the high Anatolian plateau with Pisidian Antioch, Iconium, Lystra and Derbe among brown hills and lakes',
  'paul-1': 'the Aegean world: Troas on the coast, the crossing to Philippi and Thessalonica in Macedonia, Berea in the hills, Athens with its rocky acropolis, Corinth on its narrow isthmus between two seas, and across the water the harbour of Ephesus',
  'paul-2': 'the Galatian uplands, Ephesus with its great theatre and harbour, the coast of Macedonia, Troas, and the harbour of Miletus on a bay — olive terraces, Roman roads, aqueducts, ships at anchor',
  'paul-3': 'the long sea voyage to Rome: Caesarea harbour, Crete with the bay of Fair Havens, a stormy stretch of dark sea, the rocky island of Malta with a wrecked ship on the shore, Syracuse, Rhegium, the bay of Puteoli with Vesuvius, the Appian Way lined with pines leading to Rome on its seven hills',

  /* 베드로의 길 (5장) */
  'peter-0': 'from Capernaum on the lake of Galilee to the springs of Caesarea Philippi, south to Jerusalem and its temple, the hills of Samaria, Lydda on the plain, Joppa on the sea with a rooftop house, and the Roman harbour of Caesarea Maritima',
  'peter-1': 'Jerusalem seen from above: the walled city on its hills, the temple courts, narrow streets, olive groves and terraces around it',
  'peter-2': 'Antioch on the Orontes: a large Roman city with colonnaded streets, the river, orchards and the mountain behind it',
  'peter-3': 'the wide highlands of Asia Minor — Pontus, Galatia, Cappadocia, Bithynia: rolling steppe, odd rock pinnacles, small scattered villages, mountain passes and a distant Black Sea coast',
  'peter-4': 'Corinth on its isthmus, the sea crossing to Italy, and Rome on its seven hills with the Tiber river, the Forum, aqueducts, and the low Vatican hill with umbrella pines outside the walls',
}

/* ── 인물 토큰(벡터) ────────────────────────────────────────────────────
 * 얼굴 없는 실루엣 — ART-DIRECTION §얼굴 없는 실루엣, PCK 검증(그리스도 직접 묘사 금지).
 * 한 여정의 주인공 하나씩 + 순례자(사용자) 말. 예수 여정은 인물 대신 등불이다. */
const FIGURE_SCAFFOLD =
  'Flat vector illustration of a single small character token for a calm premium adventure game, ' +
  'centred on a plain pale cream background, full body, seen from slightly above, simple geometric shapes, ' +
  'warm flat colours with soft two-tone shading, clean edges, no outlines, readable when shrunk to a tiny badge. ' +
  'The figure has no face — the head is a smooth featureless shape — and nothing glows around the head. Subject: '

/* 장식 그림(래스터) — 기록 화면 머리 등. 패널과 같은 결로, 가로 16:9 */
const EXTRAS = {
  'stats-hero':
    'Hand-painted storybook map banner in the same soft gouache watercolour style, wide horizontal composition: ' +
    'a single winding pale road crossing rolling olive and ochre hills from the lower left to the far upper right, ' +
    'small stone cairns (stacked stone markers) beside the road at intervals, a tiny walled town far away, a few ' +
    'scattered trees, gentle morning light. The left half of the picture is calm open land with very little detail ' +
    'so that writing can be laid over it later. Warm cream, ochre, sage, a thread of deep blue for a stream. ' +
    'No people, no text, no border, edge to edge.',
  /* 완주 의식(리빌 D9) — 길이 도착하는 그림. 축하이되 경건하게: 트로피가 아니라 열린 문. */
  'journey-complete':
    'Hand-painted storybook map banner in the same soft gouache watercolour style, wide horizontal composition: ' +
    'a long pale road coming over gentle olive and ochre hills and arriving at an open ancient stone gate, ' +
    'olive branches growing over the gate arch, warm golden evening light spilling through the open gate onto the road, ' +
    'small terracotta oil lamps with tiny flames set along the last stretch of the road, a simple woven olive wreath ' +
    'resting on a flat stone beside the gate, and behind everything the whole travelled way fading softly into warm distance. ' +
    'Calm, festive and reverent at once. Warm cream, ochre, sage, deep gold. No people, no text, no border, edge to edge.',
}

const FIGURES = {
  pilgrim: 'a runner pilgrim seen from behind, walking forward with a light pack and a staff, simple tunic of deep umber and terracotta, feet on a small patch of ground',
  'pilgrim-2': 'a runner pilgrim seen from behind, a woman with a long braid and a light sage-green headscarf, small pack and a staff, tunic of olive and cream, feet on a small patch of ground',
  'pilgrim-3': 'a young runner pilgrim seen from behind, slim and light-footed, short curly hair, a small satchel across the back, tunic of lapis blue and sand, feet on a small patch of ground',
  'pilgrim-4': 'a runner pilgrim seen from behind with a wide-brimmed straw travelling hat and a rolled blanket on the pack, tunic of terracotta and gold, walking stick, feet on a small patch of ground',
  abraham: 'an old nomad patriarch in a striped wool robe with a shepherd\'s staff, a small tent and a night star beside him',
  moses: 'a robed leader holding a tall wooden staff, a small pillar of cloud rising behind him, sandals on desert sand',
  paul: 'a travelling apostle with a rolled scroll and a satchel, a small ship\'s sail behind him, Roman-era cloak',
  peter: 'a fisherman apostle holding a pair of crossed keys and a folded net, a small boat behind him',
  lamp: 'an object token only: a single small terracotta clay oil lamp, ancient Near Eastern shape, one warm flame, resting on a flat stone, soft golden light pooling around it. There is nobody in the picture — just the lamp on the stone',
}

async function credits(KEY) {
  const r = await fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${KEY}` } })
  return (await r.json()).credits
}

function sniff(buf) {
  const h = buf.subarray(0, 16)
  if (h.subarray(0, 4).toString('ascii') === 'RIFF') return 'webp'
  if (h[0] === 0x89 && h[1] === 0x50) return 'png'
  if (h[0] === 0xff && h[1] === 0xd8) return 'jpg'
  const t = buf.subarray(0, 300).toString('utf8').trimStart()
  if (t.startsWith('<svg') || t.startsWith('<?xml')) return 'svg'
  return 'bin'
}

async function generate(KEY, { prompt, vector, size, colors }) {
  const body = vector
    ? { prompt, model: 'recraftv4_1_vector', size: '1:1', n: 1 }
    : { prompt, model: 'recraftv4_1', size, n: 1 }
  if (colors) body.controls = { colors: colors.map((rgb) => ({ rgb })) }
  const r = await fetch(`${API}/images/generations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`HTTP ${r.status} ${(await r.text()).slice(0, 300)}`)
  const url = (await r.json()).data[0].url
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
  return { buf, kind: sniff(buf) }
}

async function run() {
  const argv = process.argv.slice(2)
  const kind = argv.find((a) => !a.startsWith('--')) ?? 'panels'
  const only = argv.filter((a) => !a.startsWith('--')).slice(1)
  const force = argv.includes('--force')
  const dry = argv.includes('--dry')
  const vector = kind === 'figures'
  const extra = kind === 'extras'
  const all = vector ? FIGURES : extra ? EXTRAS : PANELS
  const items = only.length ? Object.fromEntries(only.map((k) => [k, all[k]])) : all
  for (const [k, v] of Object.entries(items)) if (!v) throw new Error(`알 수 없는 키: ${k}`)
  const outDir = path.join(ROOT, 'src/assets/art', vector ? 'figures' : extra ? 'extras' : 'world')
  fs.mkdirSync(outDir, { recursive: true })

  const KEY = dry ? '' : loadKey()
  const before = dry ? 0 : await credits(KEY)
  console.log(`시작 — ${kind} ${Object.keys(items).length}종, 크레딧 ${before}`)

  let made = 0
  for (const [key, subject] of Object.entries(items)) {
    const out = path.join(outDir, `${key}.${vector ? 'svg' : 'webp'}`)
    if (fs.existsSync(out) && !force) {
      console.log(`  skip  ${key}`)
      continue
    }
    const journey = key.split('-')[0]
    const w = WORLD[journey]
    const prompt = vector ? FIGURE_SCAFFOLD + subject : extra ? subject : PANEL_SCAFFOLD + subject + '. Palette: ' + w.palette + '.'
    if (dry) {
      console.log(`\n[${key}] (${prompt.length}자)\n${prompt}`)
      continue
    }
    try {
      const { buf, kind: fmt } = await generate(KEY, { prompt, vector, size: extra ? '16:9' : '9:16', colors: vector || extra ? undefined : w?.colors })
      if (vector) {
        if (fmt !== 'svg') throw new Error(`벡터를 기대했는데 ${fmt}`)
        fs.writeFileSync(out, buf)
      } else {
        /* 손실 webp q80, 폭 1024 — 원본 무손실은 수 MB다(optimize-art.mjs 참고) */
        await sharp(buf).webp({ quality: 80 }).toFile(out)
      }
      made++
      const kb = (fs.statSync(out).size / 1024).toFixed(0)
      console.log(`  ok    ${key} -> ${path.relative(ROOT, out)} (${kb} KB)`)
    } catch (e) {
      console.log(`  FAIL  ${key}: ${e.message}`)
    }
  }
  if (!dry) {
    const after = await credits(KEY)
    console.log(`완료 — ${made}장, ${before - after} 크레딧 사용, 잔액 ${after}`)
  }
}

await run()
