/* 대적(보스전) 5장의 대치(對峙) 아트 — "막아선 상태"를 그린다.
 *   RECRAFT_KEY=... node scripts/adversary-art.mjs            (없는 것만)
 *   RECRAFT_KEY=... node scripts/adversary-art.mjs --force red-sea
 *
 * 승리 장면은 그리지 않는다 — 그건 이미 자리 그림이 갖고 있다
 * (episodes/exodus-pihahiroth.webp가 갈라진 홍해다). 러닝 중에는 막아선 것을 보고,
 * 닿으면 리빌에서 열린 것을 본다. 두 그림이 대치→승리 한 쌍이 된다.
 *
 * 스캐폴드는 episode-art.mjs와 동일해야 한다(한 앱에 두 룩이 섞이면 수집이 지저분해진다).
 * 저쪽을 고치면 여기도 같이 고친다. 대적 그림도 사람 없이 — 지형과 사물이 위협을 말한다.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const API = 'https://external.api.recraft.ai/v1'
const KEY = process.env.RECRAFT_KEY
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'src/assets/art/adversaries')

const SCAFFOLD =
  'flat geometric illustration, a single square vignette for a Christian pilgrimage running app. ' +
  'Warm golden-hour Holy Land palette only: sand cream #f4ead7, terracotta clay #c05a30, olive sage #6e7a4c, ' +
  'sun-gold #e0a53f, deep umber #2c2118. Clean geometric shapes, flat fills, soft two-tone shading, ' +
  'subtle warm paper grain. One clear subject, centred, bold simple silhouette that still reads when the ' +
  'picture is shrunk to a small stamp. ' +
  'A square composition that completely fills the square canvas corner to corner. Colour and texture ' +
  'reach every one of the four corners. The ground meets the bottom edge and the sky meets the top edge. ' +
  'Ancient Near East and Roman Mediterranean world. ' +
  'Show the place itself, empty and still. Terrain, architecture and objects fill the foreground and ' +
  'middle ground and tell the story on their own. ' +
  'NO depiction of Jesus, NO ring or disc or arc behind any head, NO religious icons, NO crucifix ornament, NO outlines, NO ink linework, ' +
  'NO radiating fans, NO starbursts, NO text, NO letters, NO signature, NO watermark, NO neon, ' +
  'NO photorealism, NO clip-art. Subject: '

/* 키 = src/data/adversaries.ts 의 Adversary.id. 위협은 어둡게 그리되 팔레트는 웜 —
 * 깊은 엄버와 짙은 올리브가 위협을 말하고, 네온·차가운 색은 여기서도 금지다. */
const SUBJECTS = {
  famine:
    'a cracked dry riverbed winding through a parched land of dead thorn bushes, one empty clay water jar ' +
    'lying on its side in the foreground, pale heat haze flattening the far horizon',
  'red-sea':
    'a dark restless sea in deep umber and darkest olive filling the whole way ahead from shore to horizon, ' +
    'high ragged waves, a narrow empty strip of pale sand in the foreground, a faint column of dust rising ' +
    'far away at the land edge behind',
  'wilderness-40':
    'a vast empty wilderness of pale sun-bleached ridges and scattered black basalt stones under a huge ' +
    'silent sky, one thin footpath losing itself in the distance, dry heat shimmer, nothing green',
  euroclydon:
    'towering storm waves in deep umber and dark olive under a black storm sky, rain driven in long slanted ' +
    'bands, one small single-masted wooden ship tiny between the wave crests, no sun and no stars anywhere',
  council:
    'a heavy barred double door of dark wood shut fast in a high stone wall at dusk, iron studs and a thick ' +
    'crossbeam, one small clay oil lamp burning alone on the threshold stone below',
}

if (!KEY) {
  console.error('RECRAFT_KEY 환경변수가 필요합니다. (MCP로 생성했다면 이 스크립트는 재생성용 기록이다)')
  process.exit(1)
}
fs.mkdirSync(OUT, { recursive: true })

const args = process.argv.slice(2)
const force = args.includes('--force')
const only = args.filter((a) => !a.startsWith('--'))
const keys = (only.length ? only : Object.keys(SUBJECTS)).filter(
  (k) => SUBJECTS[k] && (force || !fs.existsSync(path.join(OUT, `${k}.webp`))),
)

console.log(`생성 대상 ${keys.length}개 / 전체 ${Object.keys(SUBJECTS).length}개`)
for (const [i, key] of keys.entries()) {
  try {
    const res = await fetch(`${API}/images/generations`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      // episode-art.mjs와 같은 호출 규약: v4.1, 비율 크기, 스타일 파라미터 없음
      body: JSON.stringify({ prompt: SCAFFOLD + SUBJECTS[key], model: 'recraftv4_1', size: '1:1', n: 1 }),
    })
    if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`)
    const url = (await res.json())?.data?.[0]?.url
    if (!url) throw new Error('URL 없음')
    const img = Buffer.from(await (await fetch(url)).arrayBuffer())
    fs.writeFileSync(path.join(OUT, `${key}.webp`), img)
    console.log(`[${i + 1}/${keys.length}] ok   ${key}  ${(img.length / 1024).toFixed(0)}KB`)
  } catch (e) {
    console.error(`[${i + 1}/${keys.length}] FAIL ${key}  ${e.message}`)
  }
}
