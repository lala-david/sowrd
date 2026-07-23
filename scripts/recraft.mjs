/* THE WAY — recraft 아트 배치 생성기
 *
 * 사용법:  RECRAFT_KEY=... node scripts/recraft.mjs scenes
 *          RECRAFT_KEY=... node scripts/recraft.mjs crests
 *          RECRAFT_KEY=... node scripts/recraft.mjs scenes --force   (기존 파일 덮어쓰기)
 *
 * 왜 REST인가: MCP(OAuth)와 API 키는 크레딧 풀이 다르다. 잔액 10,000은 키 쪽에 있고,
 * MCP 응답의 b64 프리뷰가 에이전트 컨텍스트를 채우는 문제도 REST에선 없다.
 * 왜 recraftv3인가: 커스텀 style_id가 digital_illustration(=v3) 베이스에 바인딩된다.
 * v4.1은 raster 프리셋을 지원하지 않아 스타일 락이 불가 → 일관성 우선으로 v3 고정.
 *
 * create_style은 MCP에서 500이 나므로 REST 멀티파트로 만들었다(scripts/README 참고).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const API = 'https://external.api.recraft.ai/v1'
const KEY = process.env.RECRAFT_KEY
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/* 앵커 1장에서 락한 하우스 스타일 2종(private) — 전 생성에 재사용 = 일관성의 핵심.
 * 같은 앵커에서 뽑았으므로 래스터/벡터가 한 룩으로 묶인다. */
export const SCENE_STYLE_ID = '86f934ab-3667-40f8-87dd-f40bcd5c50ab' // v3 · digital_illustration · 래스터
export const CREST_STYLE_ID = '2824443f-e053-4ba1-a4d1-3123559865ce' // v4.1 · vector_illustration · SVG

/* BUILD-SPECS A절 스캐폴드 + 1차 검증에서 드러난 실패 대응.
 * 1차에서 돔·미나렛·곤돌라·야자수·챙모자·벌집흙집 같은 시대착오가 절반에서 나왔고,
 * 인물이 과대하거나 프레임에 잘렸다. 그래서 (a) 시대 네거티브 (b) 구도 규칙을 명시한다. */
/* 씬 스캐폴드 — 검증 3종(UI/UX·아트디렉션·사용자패널)에서 나온 지적을 전부 반영한 3차 버전.
 *  · 세로 네이티브: 앱은 세로 화면인데 가로 자산을 cover로 깔면 폰에서 가로 30%만 보여 주요
 *    피사체(무덤·배·소실점)가 잘려나갔다.
 *  · 길 위의 라피스: 8장이 모두 따뜻한 색뿐이라 적록색약·썸네일·1초 응시에서 서로 붕괴했다.
 *    차가운 선 하나가 유일하게 분리되는 앵커이자 "나는 길이요"라는 시그니처(The Illuminated Line).
 *  · 빛의 사건: "장소만 있고 사건이 없어" 모을 이유가 없다는 지적.
 *  · 접지·그림자: 순례자가 물 위에 떠 있고 그림자가 없었다.
 *  · 타일 금지: 성가퀴·덤불·능선이 동일 도형 반복으로 찍혀 AI 티가 났다.
 *  숫자 비율을 문장에 쓰면 모델이 그걸 글자로 그려버리므로(2차 실패) 전부 말로 서술한다. */
const SCAFFOLD =
  'flat geometric vector illustration, minimal warm pilgrimage iconography for a Christian running app THE WAY. ' +
  'Tall vertical portrait composition. Golden-hour Holy Land palette: warm sand cream #f4ead7, terracotta clay ' +
  '#c05a30, olive sage #6e7a4c, sun-gold #e0a53f, deep umber #2c2118. First-century Holy Land. Clean geometric ' +
  'shapes, flat fills, soft two-tone shading, subtle warm paper grain. ' +
  // 구도 — 세로 + 텍스트 안전영역
  'The entire upper half of the tall frame is one uninterrupted flat field of empty sky, left completely clear ' +
  'for overlaid interface text. The landscape and every subject sit low in the frame, held within the central ' +
  'column so nothing important is lost when the left and right edges are cropped away. ' +
  /* 라피스 길은 프롬프트에서 뺀다. 모델이 #2e3f8f 대신 형광 코발트 리본으로 그려 화면을 지배했고
   * ("네온 금지" 위반), 애초에 그 선은 진행도에 따라 차오르는 UI(IlluminatedLine)라서 코드가 그린다.
   * 그림은 '장소'만 담고, '길'은 그 위에 얹는다. */
  'A natural path of pale packed earth leads from the bottom edge of the frame toward the subject, wide enough ' +
  'to stay visible but drawn in the same warm earth tones as the land. Keep the whole picture warm — no blue. ' +
  /* 프레임 계약 — 2차 검증에서 dawn·river가 흰 여백을 두른 액자형으로 나왔다(river는 캔버스의 26%만 그림).
   * 여백을 금지하는 문장이 없었던 게 원인이다. */
  'The illustration fills the entire frame edge to edge and bleeds off all four sides — no border, no margin, ' +
  'no white frame, no inset panel, no picture within a picture. The ground meets the sky about two thirds of ' +
  'the way down the frame. ' +
  // 인물 규격 — 자유롭게 두었더니 8장에서 5가지 처리가 나왔다
  'Exactly one warm light event at the subject, a low golden glow still legible when the picture is shrunk to a ' +
  'small thumbnail. Any person is a small faceless pilgrim drawn as one flat deep umber #2c2118 silhouette with ' +
  'no second robe colour, head merged into the body, about one fifteenth of the frame in height, feet planted on ' +
  'the ground and casting one short hard shadow to the lower right — never a mirrored reflection. ' +
  'Vary every repeated element — never repeat an identical shape in an even row. ' +
  'Calm reverent premium editorial. NO outlines, NO dark contour strokes around shapes, NO ink linework, ' +
  'NO vignette, NO radiating fans, NO starbursts, NO spokes, NO text, NO letters, NO signature, NO watermark, ' +
  'NO artist mark, NO neon, NO photorealism, NO heavy-3D gradients, NO Strava sport look, NO clip-art, ' +
  'NO modern city/cars. Subject: '

/* 문장(crest)은 풍경이 아니라 원형 엠블럼이다. 씬 스캐폴드의 "넓은 하늘·먼 풍경" 지시가
 * 정반대로 작용하므로 별도 스캐폴드를 쓴다. 작게 축소돼도 읽히는 실루엣이 최우선. */
const CREST_SCAFFOLD =
  'flat geometric vector emblem for a Christian pilgrimage running app. Warm palette only: sand cream background, ' +
  'terracotta clay, olive sage, sun-gold, deep umber. Clean geometric shapes, flat fills, soft two-tone shading, ' +
  'one bold simple silhouette that stays readable when shrunk to a small badge. A single centered subject inside ' +
  'a thin deep umber circular border that touches all four edges of the square canvas with no surrounding margin, plain flat background. Calm reverent premium editorial. ' +
  'NO text, NO letters, NO signature, NO watermark, NO neon, NO photorealism, NO gradients, NO clip-art. Subject: '

/* 지역 씬 8종 — 파일명 = journeys/index.ts 의 SceneKey. 상단 하늘을 크게 비워 UI 텍스트를 얹는다. */
const SCENES = {
  /* 각 씬은 고유한 실루엣 기하로 구별한다 — 색만으로는 적록색약·썸네일에서 전부 붕괴했다.
   * 대부분 인물을 둘로 둔 것은 의도적이다: 이 앱의 핵심이 중보(함께 달림)인데 1차 아트는
   * 전부 홀로 선 인물이라 "혼자"를 말하고 있다는 사용자 패널 지적을 받았다. */
  river: /* 실루엣: 구불구불한 S자 물길. 물이 크림색 리본으로 나와 "길"로 읽혔으므로 값을 지정한다. */
    'the Jordan River as a wide sinuous S-curve of calm water winding up from the bottom of the frame and filling ' +
    'the picture, the water a dark olive-sage band clearly darker than the sandy banks, banks edged with low soft ' +
    'rounded clumps of grass, two pilgrims walking on the near bank close to the viewer.',
  desert: // 실루엣: 양쪽 어두운 절벽이 만드는 좁은 협곡. 방사형 부채꼴 아티팩트가 붙어 관목 표현을 바꿨다.
    'a narrow wadi in the wilderness of Sinai, dark jagged ridges on both sides framing a pale sandy floor, ' +
    'a dry watercourse threading up the middle, a few low rounded scrub bushes, one pilgrim walking up it. ' +
    'Keep every shape solid and simple — no radiating fans, no starbursts, no spokes.',
  sea: // 실루엣: 수평 물 띠 + 배의 곡선
    'the Sea of Galilee as a broad calm band of water, bare low brown hills beyond, one open wooden fishing boat ' +
    'drawn up on the near shore with a folded net, two pilgrims standing together on the shingle beside it.',
  mountain: // 실루엣: 단일 삼각 봉우리. 정상 정복 도상은 피한다(공로주의·자기영광 지적).
    'a single tall triangular mountain of natural weathered rock, a thin winding footpath of pale earth traced up ' +
    'the near slope, two pilgrims walking together low on that slope, scattered bushes of varying size. ' +
    'Nobody stands on the summit.',
  city: // 실루엣: 각진 성벽 수평선 + 아치문
    'the great limestone city wall of Jerusalem filling the width of the lower frame, uneven crenellations along ' +
    'its top and one deep arched gate at its centre, a road climbing from the bottom edge to that gate, a few ' +
    'olive trees of differing heights, two pilgrims near the gate.',
  dawn: /* 실루엣: 둥근 동굴 입구 + 기대 세운 돌.
         * "맷돌(millstone)"이라 썼더니 가운데 구멍이 뚫려 바퀴로 읽혔고, 세 번 연속 흰 액자형으로
         * 나왔다. 그래서 (a) 맷돌이라는 말을 빼고 (b) 언덕이 화면 밖으로 이어진다고 못박는다. */
    'a wide dawn landscape of pale limestone hills filling the whole picture from edge to edge, in the near hillside ' +
    'a rounded dark tomb opening with one large solid round stone rolled aside beside it, no hole in the stone, ' +
    'warm first light spilling from the opening across the ground, two olive trees, two pilgrims walking up toward ' +
    'it. The hills run right off the left and right edges of the picture.',
  road: // 실루엣: 일점투시 수렴선
    'an ancient road of packed earth running from the bottom of the frame straight to a distant horizon across open ' +
    'country in one-point perspective, flat banded fields on either side, one small waist-high stack of rough ' +
    'memorial stones standing at the left roadside and no taller than a person, one pilgrim walking away down the road.',
  fields: // 실루엣: 수평 곡물 띠 + 원형 타작마당
    'ripe barley fields in flat golden bands, an irrigation channel running up from the bottom of the frame, a low ' +
    'flat circular threshing floor of packed earth, a cluster of small flat-roofed mud-brick houses far off on a ' +
    'low rise, two pilgrims on the field path.',
}

/* 여정 문장(crest) 5종 — 엠블럼이라 벡터. ART-DIRECTION: 아이콘·로고·스팟은 SVG. */
const CRESTS = {
  abraham:
    'a circular emblem crest: a night sky full of stars above a simple nomad tent, one flat geometric star larger at ' +
    'the top, enclosed in a thin round border. Centered single subject on plain background.',
  exodus:
    'a circular emblem crest: two tall flat walls of water standing apart with a narrow dry path running straight ' +
    'between them, one simple vertical pillar of cloud rising above the gap. Bold simple silhouette, ' +
    'readable as a badge. Centered single subject on plain background.',
  jesus:
    'a circular emblem crest: a simple oil lamp with a small flame above flat banded lake water, enclosed in a thin ' +
    'round border. Centered single subject on plain background.',
  paul:
    'a circular emblem crest: a small single-masted sailing ship on flat banded Mediterranean waves under one star, ' +
    'enclosed in a thin round border. Centered single subject on plain background.',
  peter:
    'a circular emblem crest: two crossed keys over a fishing net and a small boat, enclosed in a thin round border. ' +
    'Centered single subject on plain background.',
}

const credits = async () => {
  const r = await fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${KEY}` } })
  return (await r.json()).credits
}

async function generate({ subject, vector }) {
  /* 씬=래스터(그레인·배경), 문장=벡터 SVG(엠블럼). v4.1은 픽셀 크기 대신 비율만 받는다.
   *
   * 씬에 style_id를 안 쓰고 v4.1 생짜로 가는 이유: v3+style_id는 룩은 고정했지만 지시 준수가
   * 약해서 프롬프트 문구를 그림 안에 글자로 그리고, 금지 목록에 적은 돔·첨탑·피라미드를 오히려
   * 소환했다(2차 검증에서 6장 중 5장 실패). v4.1은 같은 스캐폴드로 시대착오·글자가 0이었다.
   * 일관성은 스캐폴드 고정으로 확보한다. */
  const prompt = (vector ? CREST_SCAFFOLD : SCAFFOLD) + subject
  /* 프롬프트 상한: v4.1은 10000자, v3는 1000자. 넘기면 크레딧만 쓰고 전부 400이 난다.
   * (v3로 되돌릴 경우를 대비해 남겨둔 가드 — 지금은 둘 다 v4.1이다.) */
  if (prompt.length > 10000) throw new Error(`프롬프트 ${prompt.length}자 (상한 10000)`)

  /* 문장은 vector_illustration 프리셋으로 SVG를 받는다. v4.1은 커스텀 style_id를
   * 생성은 시켜주면서 생성 요청에서는 "doesn't support style references"로 거부한다(API 불일치).
   * 일관성은 CREST_SCAFFOLD 고정으로 유지한다. */
  const body = vector
    ? { prompt, model: 'recraftv4_1', style: 'vector_illustration', size: '1:1', n: 1 }
    : { prompt, model: 'recraftv4_1', size: '9:16', n: 1 }

  const r = await fetch(`${API}/images/generations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`HTTP ${r.status} ${(await r.text()).slice(0, 200)}`)
  const url = (await r.json()).data[0].url
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
  /* 확장자는 내용으로 판별한다. recraft의 벡터 응답 URL이 .svg로 끝나지 않는 경우가 있어
   * URL만 믿으면 SVG가 .webp로 저장된다(기존 sea-galilee.webp가 그렇게 잘못 저장돼 있었다). */
  const head = buf.subarray(0, 300).toString('utf8').trimStart()
  return { buf, isSvg: head.startsWith('<svg') || head.startsWith('<?xml') }
}

async function run(kind, force, only = []) {
  if (!KEY) throw new Error('RECRAFT_KEY 환경변수가 필요합니다')
  const vector = kind === 'crests'
  const all = vector ? CRESTS : SCENES
  // 검증에서 떨어진 것만 골라 다시 돌릴 수 있어야 한다(전량 재생성은 낭비).
  const items = only.length ? Object.fromEntries(only.map((k) => [k, all[k]])) : all
  for (const [k, v] of Object.entries(items)) if (!v) throw new Error(`알 수 없는 키: ${k}`)
  const outDir = path.join(ROOT, 'src/assets/art', vector ? 'crests' : 'scenes')
  fs.mkdirSync(outDir, { recursive: true })

  const before = await credits()
  console.log(`시작 — ${kind} ${Object.keys(items).length}종, 크레딧 ${before}`)

  let made = 0
  for (const [key, subject] of Object.entries(items)) {
    const out = path.join(outDir, `${key}.${vector ? 'svg' : 'webp'}`)
    if (fs.existsSync(out) && !force) {
      console.log(`  skip  ${key} (이미 있음)`)
      continue
    }
    try {
      const { buf, isSvg } = await generate({ subject, vector })
      const final = isSvg ? out.replace(/\.webp$/, '.svg') : out.replace(/\.svg$/, '.webp')
      fs.writeFileSync(final, buf)
      made++
      console.log(`  ok    ${key} -> ${path.relative(ROOT, final)} (${(buf.length / 1024).toFixed(0)} KB)`)
    } catch (e) {
      console.log(`  FAIL  ${key}: ${e.message}`)
    }
  }

  const after = await credits()
  console.log(`완료 — ${made}장 생성, ${before - after} 크레딧 사용, 잔액 ${after}`)
}

const [, , kind = 'scenes', ...rest] = process.argv
await run(kind, rest.includes('--force'), rest.filter((a) => !a.startsWith('--')))
