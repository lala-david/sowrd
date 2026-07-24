/* 성경 여정 68자리의 자리별 스탬프 아트.
 *   RECRAFT_KEY=... node scripts/episode-art.mjs                 (없는 것만)
 *   RECRAFT_KEY=... node scripts/episode-art.mjs --force peter-ep01
 *
 * 왜 자리마다 따로 그리나: 지금은 68자리가 씬 8종을 돌려 쓴다. 바울의 28자리 중
 * 해안 도시가 전부 같은 그림이라 수집물로서 의미가 없다.
 * 그리고 지명도 겹친다 — 벧엘 ×2, 드로아 ×2, 에베소 ×2, 예루살렘 ×3, 로마 ×2.
 * 지형으로 배정하면 그 쌍들이 같은 그림이 된다. 그래서 '장소'가 아니라
 * **그 자리에서 있었던 일**을 그린다(stations-art.mjs와 같은 원칙).
 *
 * 신학 제약(PCK 검증): 그리스도를 인물로 직접 묘사하지 않는다. 후광·성인상·십자가 장식 금지.
 * 사람은 원경의 얼굴 없는 실루엣으로만. 그래서 대부분 사물과 지형으로 사건을 말한다.
 * 베드로 순교(ep14)는 거꾸로 된 십자가를 그리지 않는다 — 후대 전승이고, 위 규칙의 십자가 장식이다.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const API = 'https://external.api.recraft.ai/v1'
const KEY = process.env.RECRAFT_KEY
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'src/assets/art/episodes')

/* stations-art.mjs와 같은 스캐폴드 — 한 앱 안에서 두 벌의 룩이 섞이면 수집이 지저분해진다.
 * 숫자·비율 같은 레이아웃 언어는 절대 넣지 않는다(예전에 "45%"가 그림에 글자로 그려졌다). */
const SCAFFOLD =
  'flat geometric illustration, a single square vignette for a Christian pilgrimage running app. ' +
  'Warm golden-hour Holy Land palette only: sand cream #f4ead7, terracotta clay #c05a30, olive sage #6e7a4c, ' +
  'sun-gold #e0a53f, deep umber #2c2118. Clean geometric shapes, flat fills, soft two-tone shading, ' +
  'subtle warm paper grain. One clear subject, centred, bold simple silhouette that still reads when the ' +
  'picture is shrunk to a small stamp. ' +
  /* 긍정 서술로 말한다. "no border"라고 쓰면 오히려 테두리가 그려진다 —
     부정 목록은 그 사물을 불러온다는 것이 이 프로젝트에서 이미 확인된 사실이다. */
  'A square composition that completely fills the square canvas corner to corner. Colour and texture ' +
  'reach every one of the four corners. The ground meets the bottom edge and the sky meets the top edge. ' +
  'Ancient Near East and Roman Mediterranean world. ' +
  /* 인물 처리 — 여기가 이 스캐폴드에서 가장 중요한 문단이다.
   *
   * 실측: 68장 중 30장에 화면 높이의 16~43%짜리 인물이 들어갔고, 그중 다수의 머리 뒤에
   * 밝은 원반(후광)이 그려졌다. "at most one tenth"라고 크기를 지정해도, "no halo"라고
   * 부정형으로 막아도 소용이 없었다. 모델이 구도를 완성하려고 홀로 선 인물을 습관적으로 넣고,
   * 그 인물을 '성인'으로 해석해 빛을 두르기 때문이다.
   *
   * 그래서 크기를 제한하는 대신 **자리를 아예 비운다**. 사람이 없으면 후광도 없다.
   * 이건 stations 아트가 이미 쓰던 방식이기도 하다 — 사물과 지형이 사건을 말한다.
   * 군중이 사건 자체인 몇 자리(출애굽 행렬, 오순절, 마중 나온 형제들)만 주제문에서
   * 명시적으로 요청하고, 그때도 지평선 근처의 작은 점들의 무리로만 그린다. */
  'Show the place itself, empty and still. Terrain, architecture and objects fill the foreground and ' +
  'middle ground and tell the story on their own. Where the subject explicitly names people, they appear ' +
  'only as a distant mass of very small specks near the horizon, never as a single standing figure, ' +
  'and there is nothing but plain sky above them. ' +
  'NO depiction of Jesus, NO ring or disc or arc behind any head, NO religious icons, NO crucifix ornament, NO outlines, NO ink linework, ' +
  'NO radiating fans, NO starbursts, NO text, NO letters, NO signature, NO watermark, NO neon, ' +
  'NO photorealism, NO clip-art. Subject: '

/* "여정id-자리id" → 그 사건을 말하는 사물·지형. 지명이 아니라 뜻으로 구분한다. */
const SUBJECTS = {
  /* ── 아브라함 (10) ─────────────────────────────────────── */
  'abraham-ur': 'a great stepped brick ziggurat rising over a flat river plain of mud-brick rooftops at dusk',
  'abraham-haran': 'a lone caravan of laden camels leaving a walled town at dawn, the road ahead empty and open',
  'abraham-shechem': 'one huge spreading oak on a high ridge with a small altar of unhewn stones beneath it',
  'abraham-bethel': 'a cluster of dark goat-hair tents pitched on a bare hilltop with a low stone altar and thin smoke rising',
  'abraham-egypt': 'a broad green river delta with tall papyrus reeds and a distant row of palms, flat irrigated fields',
  'abraham-bethel-return': 'two flocks of sheep moving apart down two diverging valleys from a single hilltop altar',
  'abraham-hebron': 'a grove of ancient terebinth trees on a high plateau at night under a sky crowded with stars',
  'abraham-beersheba': 'a deep stone-lined well in dry scrubland with a young tamarisk tree planted beside it',
  'abraham-moriah': 'a rocky summit with a bundle of split wood laid on a stone altar and a ram caught in a thicket nearby',
  'abraham-machpelah': 'a dark cave mouth in a limestone hillside with a field of stubble before it and a boundary of stones',

  /* ── 출애굽 (16) ────────────────────────────────────────── */
  'exodus-rameses': 'a vast column of tiny distant figures and livestock streaming out of a mud-brick storehouse city at night',
  'exodus-succoth': 'flat unleavened bread cakes baking on hot stones beside a hastily pitched camp at first light',
  'exodus-etham': 'a tall pillar of cloud by day changing into a pillar of fire, standing over an empty desert horizon',
  'exodus-pihahiroth': 'a corridor of dry seabed between two towering walls of held-back water under a night sky',
  'exodus-marah': 'a bitter desert spring with a felled tree branch cast into the pool, the water clearing around it',
  'exodus-elim': 'twelve springs of water among seventy tall date palms in a green oasis hollow',
  'exodus-sin': 'fine white flakes lying like frost on the desert floor at dawn with quail settling on the sand',
  'exodus-rephidim': 'water bursting from a struck rock face in a dry wadi, a rough stone altar on the ridge above',
  'exodus-sinai': 'a great granite mountain wrapped in dark storm cloud and fire, two stone tablets at its foot',
  'exodus-taberah': 'fire burning at the far edge of a tent camp on the desert plain, smoke drifting over the sand',
  'exodus-kibroth': 'a field of low grave mounds in the desert with scattered quail feathers blowing across them',
  'exodus-hazeroth': 'a single tent set apart outside the camp on open sand, the camp small and distant behind it',
  'exodus-kadesh': 'an enormous cluster of grapes slung on a pole carried by two tiny distant figures across dry hills',
  'exodus-eziongeber': 'a small harbour of reed boats at the head of a deep blue gulf between red desert mountains',
  'exodus-moab': 'a wide river plain of acacia groves seen from the east bank, a walled oasis city far across the water',
  'exodus-nebo': 'a high bare ridge looking west over a hazy green valley and distant hills, one empty vantage point',

  /* ── 바울 (28) ──────────────────────────────────────────── */
  'paul-antioch': 'a river-side city gate at dawn with a stone road running down to a harbour, a ship rigged and ready',
  'paul-salamis': 'a colonnaded seaside town on a low island shore with fishing boats drawn up on the sand',
  'paul-paphos': 'a Roman governor\'s courtyard on a bright western coast, one dark staff lying broken on the paving',
  // 마가가 일행을 떠난 자리 — 인물 대신 갈라지는 길로 말한다(홀로 선 인물은 스캐폴드가 금한다)
  'paul-perga': 'a river mouth harbour where the road forks: one branch climbing inland into the hills, the other turning back down to the quay',
  'paul-pisidian': 'a high plateau town beyond a snow-edged mountain pass, wide grassland running to the horizon',
  'paul-iconium': 'a walled town on flat open steppe under a huge sky, a long straight road leaving it',
  'paul-lystra': 'a stone plain with a discarded pair of crutches and a scatter of rough stones on the ground',
  'paul-derbe': 'a small farming town at the edge of a plain with a road looping back the way it came',
  'paul-troas2': 'a night harbour on a dark strait, a faint distant coastline visible across the water',
  'paul-philippi': 'a riverside washing place with lengths of purple-dyed cloth spread to dry, a broken prison door beyond',
  'paul-thessalonica': 'a busy stepped port city rising from a wide bay, a paved highway running along the shore',
  'paul-berea': 'a quiet hillside town below wooded mountains with an open scroll unrolled on a stone bench',
  'paul-athens': 'a rocky outcrop below a marble temple hill, crowded with many small empty pedestals and altars',
  'paul-corinth': 'a narrow isthmus between two seas with a tentmaker\'s loom and rolls of goat-hair cloth in the foreground',
  'paul-ephesus2j': 'a great harbour temple city seen briefly from the deck of a departing ship',
  'paul-galatia3': 'a rolling inland highland with a winding road linking many small distant villages',
  'paul-ephesus3j': 'a lecture hall colonnade in a great city with silver shrine figurines heaped in a market stall below',
  'paul-macedonia3': 'a long paved highway crossing autumn plains between distant coastal towns',
  'paul-troas_eutychus': 'an upper room window three storeys up glowing with lamplight late at night',
  'paul-miletus': 'an empty stone quay at evening with a ship at anchor and a group of tiny distant figures on the shore',
  'paul-caesarea': 'a great artificial harbour with a fortress tower and a barred window facing the sea',
  'paul-fairhavens': 'a small exposed anchorage on a rocky southern coast under a hard grey winter sky',
  'paul-malta': 'a broken ship\'s timbers on a rocky island beach with a driftwood fire burning and a snake in the flames',
  'paul-syracuse': 'a Greek theatre carved into a hillside above a bright eastern harbour',
  // "a sail"이 앉은 인물+삼각 후광을 만들었다. 인물·돛을 빼고 해협과 바람 무늬만.
  'paul-rhegium': 'a narrow blue strait seen from a high cliff, a mainland cape on one side and a dark volcanic island on the other, long streaks of wind-blown ripples crossing the water, no boats',
  'paul-puteoli': 'a wide volcanic bay harbour with warehouses and a mountain smoking on the far shore',
  // "a traveller" 단수가 인물을 부른다. 마중은 지평선의 작은 무리로만, 전경은 텅 빈 길.
  'paul-appii': 'a long straight paved Roman road lined with tall poplars stretching to the horizon, empty in the foreground, a faint distant cluster of tiny specks far down the road near the vanishing point',
  // 거리 소실점 구도가 인물을 세웠다 → 방 안에서 본 열린 문, 사람 없음.
  'paul-rome': 'the interior of a modest bare upper room seen from within, a single wooden door standing open to a sunlit tiled city beyond, a low table and a rolled scroll on the floor, empty and quiet',

  /* ── 베드로 (14) ────────────────────────────────────────── */
  // 예수 코스 call-mt4(버려진 그물)와 겹치지 않게 베드로 쪽은 '만선의 그물'로 구분한다
  'peter-ep01': 'a small fishing boat low in the water at dawn, its nets bulging with a great catch, a wide calm lake behind',
  'peter-ep02': 'a great rock face at the foot of a snow-capped mountain, spring water pouring from a cave mouth, empty carved niches in the cliff',
  'peter-ep03': 'a crowded city rooftop terrace at morning with small flame shapes hovering above a wide assembled crowd',
  'peter-ep04': 'an ornate temple gateway with a discarded beggar\'s mat and a bowl left on its threshold step',
  'peter-ep05': 'a terraced hill town between two mountains with a single well at the crossroads below',
  'peter-ep06': 'an empty sleeping mat rolled up and standing upright against a plastered courtyard wall',
  // 지붕 위 린넨보 환상. 인물이 화면을 지배했다 → 부감으로 사물만: 지붕과 펼친 천, 그 너머 바다.
  'peter-ep07': 'a high overhead view looking straight down onto a flat sun-bleached rooftop where a large square linen sheet lies spread with its four corners weighted by stones, the sea visible past the roof edge, no people',
  'peter-ep08': 'a Roman coastal villa courtyard with an open door and a wide harbour beyond, wind moving through',
  'peter-ep09': 'a circle of low stone benches in a walled courtyard, one place at the centre left open',
  'peter-ep10': 'a long shared table in a city courtyard with two benches drawn slightly apart from each other',
  'peter-ep11': 'a sealed letter scroll on a mountain road, five distant valley towns visible below in the haze',
  'peter-ep12': 'a two-harbour city under a steep rock citadel seen from above, an open marketplace paved in stone split by a dividing line into two empty halves, tiny scattered specks near the far edges',
  'peter-ep13': 'a great river city of tiled roofs and arched aqueducts at dusk seen from a rooftop, one small warm lamp glowing in a low doorway in the foreground, no people',
  'peter-ep14': 'a bare windswept hillside above a great city at sunset, a single fisherman\'s net folded and laid on a stone',
}

/* ── 실행 ───────────────────────────────────────────────── */
if (!KEY) {
  console.error('RECRAFT_KEY 환경변수가 필요합니다.')
  process.exit(1)
}
fs.mkdirSync(OUT, { recursive: true })

const args = process.argv.slice(2)
const force = args.includes('--force')
const only = args.filter((a) => !a.startsWith('--'))
const keys = (only.length ? only : Object.keys(SUBJECTS)).filter((k) => {
  if (!SUBJECTS[k]) {
    console.warn('알 수 없는 자리:', k)
    return false
  }
  return force || !fs.existsSync(path.join(OUT, `${k}.webp`))
})

console.log(`생성 대상 ${keys.length}개 / 전체 ${Object.keys(SUBJECTS).length}개`)

let ok = 0
let fail = 0
for (const [i, key] of keys.entries()) {
  const prompt = SCAFFOLD + SUBJECTS[key]
  try {
    const res = await fetch(`${API}/images/generations`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      /* v4.1을 쓴다. v3는 프롬프트 상한이 1000자라 이 스캐폴드가 들어가지 않고,
         지시 준수도 나쁘다. v4.1은 비율 크기('1:1')만 받고 style 파라미터를 거부한다
         (stations-art.mjs와 같은 호출 규약 — 두 벌의 룩이 섞이면 안 되므로). */
      body: JSON.stringify({ prompt, model: 'recraftv4_1', size: '1:1', n: 1 }),
    })
    if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`)
    const json = await res.json()
    const url = json?.data?.[0]?.url
    if (!url) throw new Error('URL 없음: ' + JSON.stringify(json).slice(0, 200))
    const img = Buffer.from(await (await fetch(url)).arrayBuffer())
    fs.writeFileSync(path.join(OUT, `${key}.webp`), img)
    ok++
    console.log(`[${i + 1}/${keys.length}] ok   ${key}  ${(img.length / 1024).toFixed(0)}KB`)
  } catch (e) {
    fail++
    console.error(`[${i + 1}/${keys.length}] FAIL ${key}  ${e.message}`)
  }
}
console.log(`\n완료 — 성공 ${ok} / 실패 ${fail}`)
