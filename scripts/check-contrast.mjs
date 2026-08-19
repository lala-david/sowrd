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
  // 라피스 야경 패널(QuestMap) — 테마와 무관하게 항상 어둡다
  ['seal-bright', 'lapis-surface', 4.5, '지도 위 금선·라벨'],
  ['lapis-bright', 'lapis-surface', 3, '지도 위 점선'],
  ['joy', 'lapis-surface', 3, '지도 위 내 토큰'],
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

console.log(fail === 0 ? '\n전부 통과' : `\n실패 ${fail}건`)
process.exit(fail === 0 ? 0 : 1)
