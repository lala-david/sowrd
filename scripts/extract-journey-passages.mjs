/* 다중 여정(아브라함·출애굽·바울·베드로) 에피소드의 성경 본문을 실제 데이터에서 원문 그대로 추출.
 *   node scripts/extract-journey-passages.mjs  →  src/data/journey-passages.json
 *
 * 왜 필요한가: 각 에피소드에는 `verseKrShort`(의역 요약)만 있었는데 passageRef에는 판본명이
 * 붙어 있어 사용자가 그것을 성경 본문으로 오인한다. 신학 검증 지적사항(B-5).
 * 요약은 요약대로 두되, 실제 본문을 여기서 뽑아 화면에서 원문으로 보여준다.
 *
 * 판본: 개역한글. 개역개정은 대한성서공회 저작권이라 정식 라이선스 전까지 쓸 수 없다
 * (data/bible/README.md). 개역한글 인격권 준수 — ①원문 무수정 ②출처표기.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const kr = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/bible/korean_krv.json'), 'utf8'))

/* 한글 약어 → 개역한글 책 이름(66권). passageRef가 약어로 쓰여 있다. */
const ABBR = {
  창: '창세기', 출: '출애굽기', 레: '레위기', 민: '민수기', 신: '신명기',
  수: '여호수아', 삿: '사사기', 룻: '룻기', 삼상: '사무엘상', 삼하: '사무엘하',
  왕상: '열왕기상', 왕하: '열왕기하', 대상: '역대상', 대하: '역대하',
  스: '에스라', 느: '느헤미야', 에: '에스더', 욥: '욥기', 시: '시편',
  잠: '잠언', 전: '전도서', 아: '아가', 사: '이사야', 렘: '예레미야',
  애: '예레미야 애가', 겔: '에스겔', 단: '다니엘', 호: '호세아', 욜: '요엘',
  암: '아모스', 옵: '오바댜', 욘: '요나', 미: '미가', 나: '나훔',
  합: '하박국', 습: '스바냐', 학: '학개', 슥: '스가랴', 말: '말라기',
  마: '마태복음', 막: '마가복음', 눅: '누가복음', 요: '요한복음', 행: '사도행전',
  롬: '로마서', 고전: '고린도전서', 고후: '고린도후서', 갈: '갈라디아서',
  엡: '에베소서', 빌: '빌립보서', 골: '골로새서', 살전: '데살로니가전서',
  살후: '데살로니가후서', 딤전: '디모데전서', 딤후: '디모데후서', 딛: '디도서',
  몬: '빌레몬서', 히: '히브리서', 약: '야고보서', 벧전: '베드로전서',
  벧후: '베드로후서', 요일: '요한일서', 요이: '요한이서', 요삼: '요한삼서',
  유: '유다서', 계: '요한계시록',
}
// 긴 약어부터 매칭해야 '벧전'이 '벧'+'전'으로 쪼개지지 않는다.
const ABBRS = Object.keys(ABBR).sort((a, b) => b.length - a.length)

const bookOf = (name) => kr.books.find((b) => b.name === name)

/** "창 12:1-4", "출 14:21-22, 27-28", "민 22:1; 신 1:1-5" 등을 구간 배열로 파싱 */
function parseRef(raw) {
  const ref = raw.replace(/\s*\(.*?\)\s*$/, '').trim() // "(개역개정)" 같은 판본 꼬리 제거
  const out = []
  let book = null

  for (const seg of ref.split(';').map((s) => s.trim()).filter(Boolean)) {
    let rest = seg
    const hit = ABBRS.find((a) => rest.startsWith(a))
    if (hit) {
      book = ABBR[hit]
      rest = rest.slice(hit.length).trim()
    }
    if (!book) throw new Error(`책 이름을 찾을 수 없음: "${raw}"`)

    const m = rest.match(/^(\d+):(.+)$/)
    if (!m) throw new Error(`장:절 형식이 아님: "${seg}" (${raw})`)
    const chapter = Number(m[1])

    // "1-4, 27-28" 처럼 같은 장 안의 여러 구간
    for (const part of m[2].split(',').map((s) => s.trim()).filter(Boolean)) {
      const r = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/)
      if (!r) throw new Error(`절 범위 형식이 아님: "${part}" (${raw})`)
      out.push({ book, chapter, from: Number(r[1]), to: Number(r[2] ?? r[1]) })
    }
  }
  return out
}

function versesOf({ book, chapter, from, to }) {
  const bk = bookOf(book)
  if (!bk) throw new Error(`책 없음: ${book}`)
  const ch = bk.chapters.find((c) => c.chapter === chapter)
  if (!ch) throw new Error(`장 없음: ${book} ${chapter}`)
  return ch.verses
    .filter((v) => v.verse >= from && v.verse <= to)
    .map((v) => ({ book, chapter, v: v.verse, text: v.text.trim() }))
}

const JOURNEYS = ['abraham', 'exodus', 'paul', 'peter']
const out = {}
let total = 0
const failures = []

for (const jid of JOURNEYS) {
  const j = JSON.parse(fs.readFileSync(path.join(ROOT, `src/data/geo/journeys/${jid}.json`), 'utf8'))
  for (const ep of j.episodes) {
    const key = `${jid}:${ep.id}`
    try {
      const spans = parseRef(ep.passageRef)
      const verses = spans.flatMap(versesOf)
      if (!verses.length) throw new Error('해당 절이 비어 있음')
      out[key] = {
        ref: ep.passageRef.replace(/\s*\(.*?\)\s*$/, '').trim(),
        translation: '개역한글',
        verses,
      }
      total += verses.length
    } catch (e) {
      failures.push(`${key} — ${ep.passageRef} :: ${e.message}`)
    }
  }
}

if (failures.length) {
  console.log('실패:')
  failures.forEach((f) => console.log('  ' + f))
}

fs.writeFileSync(
  path.join(ROOT, 'src/data/journey-passages.json'),
  JSON.stringify(out) + '\n',
  'utf8',
)
const bytes = fs.statSync(path.join(ROOT, 'src/data/journey-passages.json')).size
console.log(
  `\n${Object.keys(out).length}개 에피소드 · ${total}절 추출 → src/data/journey-passages.json ` +
    `(${(bytes / 1024).toFixed(0)} KB), 실패 ${failures.length}건`,
)
