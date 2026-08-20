/* 팔레트 대비 검사.
 *
 * 왜 있나: 채도를 올리면 명도가 함께 움직여서 대비가 조용히 무너진다. 이 저장소는 예전에도
 * "다크에서 clay와 clay-deep이 ΔE 3.9로 같은 색", "muted가 2.88:1" 같은 실측으로 값을
 * 고쳐 왔다(index.css 주석). 색을 만질 때마다 사람이 눈으로 판정하면 반드시 새는 곳이 생긴다.
 *
 * 실행: node scripts/check-contrast.mjs
 * 규칙: 본문/보조 텍스트는 WCAG AA 4.5:1, 큰 글자·아이콘·경계선은 3:1.
 */
import fs from 'node:fs'

const css = fs.readFileSync('src/index.css', 'utf8')

/** 한 블록 안의 --color-* 를 뽑는다 */
function tokens(block) {
  const out = {}
  for (const m of block.matchAll(/--color-([\w-]+):\s*(#[0-9a-fA-F]{6})/g)) out[m[1]] = m[2]
  return out
}

const themeBlock = css.slice(css.indexOf('@theme {'), css.indexOf('\n}', css.indexOf('@theme {')))
const darkStart = css.indexOf('[data-theme="dark"] {')
const darkBlock = css.slice(darkStart, css.indexOf('\n}', darkStart))

const light = tokens(themeBlock)
const dark = { ...light, ...tokens(darkBlock) } // 다크는 라이트를 덮어쓴다

const srgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const lum = (h) => {
  const [r, g, b] = srgb(h).map(lin)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

/* 실제로 화면에서 겹치는 조합만 본다 — 쓰지도 않는 조합을 검사하면 통과 못 할 값을 쫓게 된다. */
const CHECKS = [
  // [전경, 배경, 최소비, 설명]
  ['ink', 'sand', 4.5, '본문'],
  ['ink', 'sand-raised', 4.5, '카드 본문'],
  ['ink-soft', 'sand', 4.5, '보조 본문'],
  ['muted', 'sand', 4.5, '흐린 라벨'],
  ['muted', 'sand-raised', 4.5, '카드 흐린 라벨'],
  ['clay-deep', 'sand', 4.5, '강조 텍스트'],
  ['clay-deep', 'sand-raised', 4.5, '카드 강조 텍스트'],
  ['sun-deep', 'sand', 4.5, '금색 텍스트'],
  ['sun-deep', 'sand-raised', 4.5, '카드 금색 텍스트'],
  ['olive-deep', 'sand', 4.5, '올리브 텍스트'],
  ['sea', 'sand', 4.5, '바다 텍스트'],
  ['lapis', 'sand', 4.5, '라피스 텍스트'],
  ['plum', 'sand', 4.5, '자두 텍스트'],
  ['rubric', 'sand', 4.5, '기도 강조'],
  ['line-strong', 'sand', 1.9, '경계선(장식)'],
  ['lapis', 'line', 3, '진행 게이지'],
  /* 지도는 양피지다(lib/journeySkin.ts). 종이색은 여정마다 다르지만 가장 밝은 장과
     가장 어두운 장 사이에 있으므로, 여기서는 앱의 종이(sand)를 대표값으로 본다. */
  ['lapis', 'sand-raised', 4.5, '지도 여정선'],

]

let fail = 0
for (const [name, pal] of [['LIGHT', light], ['DARK', dark]]) {
  console.log(`\n── ${name} ──`)
  for (const [fg, bg, min, label] of CHECKS) {
    if (!pal[fg] || !pal[bg]) { console.log(`  ?  ${fg}/${bg} — 토큰 없음`); continue }
    const r = ratio(pal[fg], pal[bg])
    const ok = r >= min
    if (!ok) fail++
    console.log(`  ${ok ? '✔' : '✘'} ${label.padEnd(18)} ${fg}/${bg} ${r.toFixed(2)}:1 (필요 ${min})`)
  }
}

/* 여정 다섯 색이 서로 구별되는가 — 같은 목록에 나란히 놓이므로 색상 거리가 필요하다 */
const JOURNEY_ACCENTS = ['clay-deep', 'plum', 'lapis', 'sea', 'olive-deep']
console.log('\n── 여정 악센트 상호 구별(라이트) ──')
for (let i = 0; i < JOURNEY_ACCENTS.length; i++) {
  for (let k = i + 1; k < JOURNEY_ACCENTS.length; k++) {
    const a = light[JOURNEY_ACCENTS[i]]
    const b = light[JOURNEY_ACCENTS[k]]
    const [ar, ag, ab] = srgb(a).map((v) => v * 255)
    const [br, bg2, bb] = srgb(b).map((v) => v * 255)
    const dist = Math.hypot(ar - br, ag - bg2, ab - bb)
    const ok = dist >= 60
    if (!ok) fail++
    console.log(`  ${ok ? '✔' : '✘'} ${JOURNEY_ACCENTS[i]} ↔ ${JOURNEY_ACCENTS[k]}  RGB거리 ${dist.toFixed(0)}`)
  }
}

/* 지도의 잉크가 **다섯 종이 전부**에서 읽히는가.
 *
 * 지도(lib/journeySkin.ts)는 테마를 따라가지 않는 고정 팔레트다. 그래서 CSS 토큰 검사만으로는
 * 못 잡는 구멍이 생긴다 — 실제로 잉크에 CSS 변수를 썼다가 다크 테마에서 봉인 마커가
 * 밝은 하늘색이 되어 대비 1.41:1로 사라졌다. 종이가 고정이면 잉크도 고정이어야 하고,
 * 그 조합은 여기서 검사해야 한다. */
const skinSrc = fs.readFileSync('src/lib/journeySkin.ts', 'utf8')
/* 주석 유무와 무관하게 `id: { … from: '#…' }`를 잡는다 — 예전 정규식은 여는 중괄호
 * 뒤에 // 주석이 있는 형태만 매칭해서, 주석이 없는 실제 파일에서 0건이 매칭됐고
 * 이 섹션 전체가 빈 출력으로 조용히 건너뛰어지고 있었다(검사가 죽은 줄도 몰랐다). */
const papers = [...skinSrc.matchAll(/(\w+):\s*\{\s*(?:\/\/[^\n]*\s*)?from:\s*'(#[0-9a-fA-F]{6})'/g)].map((m) => [m[1], m[2]])
if (papers.length === 0) { fail++; console.log('  ✘ journeySkin 종이를 하나도 못 읽음 — 파서 확인') }
const ink = Object.fromEntries(
  [...skinSrc.matchAll(/^\s{2}(\w+):\s*'(#[0-9a-fA-F]{6})',/gm)].map((m) => [m[1], m[2]]),
)
console.log('\n── 지도 잉크 × 종이 다섯 장 ──')
for (const [journey, paper] of papers) {
  for (const [name, min] of [['path', 3], ['seal', 1.6], ['token', 2.4]]) {
    if (!ink[name]) continue
    const r = ratio(ink[name], paper)
    const ok = r >= min
    if (!ok) fail++
    console.log(`  ${ok ? '✔' : '✘'} ${journey.padEnd(9)} ${name.padEnd(6)} ${r.toFixed(2)}:1 (필요 ${min})`)
  }
}

/* 실제 지도(러닝 경로)의 양피지 스타일 — lib/mapStyle.ts.
 *
 * 이 지도도 journeySkin처럼 테마 무관 고정 팔레트라 토큰 검사 밖에 있다.
 * 경로 밴드 3색은 케이싱(종이색 한 겹) 위에 앉고, 케이싱이 벌어진 곳에서는
 * 지도 종이 위에 바로 앉는다 — 두 바탕 모두에서 그래픽 기준(3:1)을 지켜야 한다.
 * 글자 잉크는 halo가 있어도 본문 기준(4.5:1)으로 본다. */
const mapSrc = fs.readFileSync('src/lib/mapStyle.ts', 'utf8')
const hexBlock = (marker) => {
  const i = mapSrc.indexOf(marker)
  const body = mapSrc.slice(i, mapSrc.indexOf('\n} as const', i) + 1 || undefined)
  return Object.fromEntries([...body.matchAll(/(\w+):\s*'(#[0-9a-fA-F]{6})'/g)].map((m) => [m[1], m[2]]))
}
const paper = hexBlock('export const MAP_PAPER')
const route = hexBlock('export const ROUTE_INK')
console.log('\n── 실제 지도(mapStyle) — 경로·글자 × 종이 ──')
for (const [fg, bg, min, label] of [
  ['slow', 'casing', 3, '느림 밴드/케이싱'],
  ['even', 'casing', 3, '평소 밴드/케이싱'],
  ['fast', 'casing', 3, '빠름 밴드/케이싱'],
  ['slow', 'paper', 3, '느림 밴드/종이'],
  ['even', 'paper', 3, '평소 밴드/종이'],
  ['fast', 'paper', 3, '빠름 밴드/종이'],
]) {
  const r = ratio(route[fg], fg === bg || bg === 'casing' ? route.casing : paper.paper)
  const ok = r >= min
  if (!ok) fail++
  console.log(`  ${ok ? '✔' : '✘'} ${label.padEnd(14)} ${r.toFixed(2)}:1 (필요 ${min})`)
}
for (const [fg, bg, min, label] of [
  ['labelInk', 'paper', 4.5, '지명 잉크/종이'],
  ['labelSoft', 'paper', 4.5, '길 이름/종이'],
  ['labelWater', 'water', 3, '물 이름/물'],
  ['labelPark', 'park', 3, '공원 이름/공원'],
  ['labelPark', 'paper', 4.5, '공원 이름/종이'],
]) {
  const r = ratio(paper[fg], paper[bg])
  const ok = r >= min
  if (!ok) fail++
  console.log(`  ${ok ? '✔' : '✘'} ${label.padEnd(14)} ${r.toFixed(2)}:1 (필요 ${min})`)
}

console.log(fail === 0 ? '\n전부 통과' : `\n실패 ${fail}건`)
process.exit(fail === 0 ? 0 : 1)
