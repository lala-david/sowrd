/* 코스 여정에 쓰는 성경 본문을 실제 데이터에서 원문 그대로 추출 → src/data/passages.json
 * 개역한글 동일성유지권: 원문 수정 없이 그대로. 출처표기는 앱에서. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const kr = JSON.parse(readFileSync(join(root, 'data/bible/korean_krv.json'), 'utf8'))
const en = JSON.parse(readFileSync(join(root, 'data/bible/english_kjv.json'), 'utf8'))

// slug → [한글책이름, 장, 시작절, 끝절, 라틴표기]
const WANT = {
  'call-mt4': ['마태복음', 4, 18, 20, 'Matthew 4:18–20'],
  'call-mk1': ['마가복음', 1, 16, 20, 'Mark 1:16–20'],
  'beat-1': ['마태복음', 5, 1, 6, 'Matthew 5:1–6'],
  'beat-2': ['마태복음', 5, 7, 12, 'Matthew 5:7–12'],
  'light-mt5': ['마태복음', 5, 13, 16, 'Matthew 5:13–16'],
  'lords-prayer': ['마태복음', 6, 9, 13, 'Matthew 6:9–13'],
  'feeding': ['요한복음', 6, 8, 13, 'John 6:8–13'],
  'walk-water': ['마태복음', 14, 25, 31, 'Matthew 14:25–31'],
  'take-heart': ['마태복음', 14, 27, 33, 'Matthew 14:27–33'],
  'blind-sight': ['요한복음', 9, 1, 7, 'John 9:1–7'],
  'lazarus-come': ['요한복음', 11, 38, 44, 'John 11:38–44'],
  'sower': ['마태복음', 13, 3, 9, 'Matthew 13:3–9'],
  'mustard': ['마태복음', 13, 31, 32, 'Matthew 13:31–32'],
  'lost-sheep': ['누가복음', 15, 3, 7, 'Luke 15:3–7'],
  'prodigal': ['누가복음', 15, 20, 24, 'Luke 15:20–24'],
  'samaritan': ['누가복음', 10, 30, 35, 'Luke 10:30–35'],
  'talents': ['마태복음', 25, 20, 23, 'Matthew 25:20–23'],
  'wise-builder': ['마태복음', 7, 24, 27, 'Matthew 7:24–27'],
  'entry': ['마태복음', 21, 6, 11, 'Matthew 21:6–11'],
  'last-supper': ['마태복음', 26, 26, 29, 'Matthew 26:26–29'],
  'gethsemane': ['마태복음', 26, 38, 42, 'Matthew 26:38–42'],
  'arrest': ['마가복음', 14, 43, 46, 'Mark 14:43–46'],
  'pilate': ['요한복음', 19, 1, 6, 'John 19:1–6'],
  'golgotha': ['누가복음', 23, 33, 38, 'Luke 23:33–38'],
  'finished': ['요한복음', 19, 28, 30, 'John 19:28–30'],
  'temptation': ['마태복음', 4, 1, 4, 'Matthew 4:1–4'],
  'baptism': ['마태복음', 3, 13, 17, 'Matthew 3:13–17'],
  'transfig': ['마태복음', 17, 1, 5, 'Matthew 17:1–5'],
  'resurrection-hope': ['요한복음', 11, 23, 27, 'John 11:23–27'],
  'cross-luke': ['누가복음', 23, 44, 46, 'Luke 23:44–46'],
  'empty-tomb': ['마태복음', 28, 1, 6, 'Matthew 28:1–6'],
  'risen': ['요한복음', 20, 19, 22, 'John 20:19–22'],
  'commission': ['마태복음', 28, 18, 20, 'Matthew 28:18–20'],
  'pentecost': ['사도행전', 2, 1, 4, 'Acts 2:1–4'],
  'peter-sermon': ['사도행전', 2, 38, 39, 'Acts 2:38–39'],
  'saul': ['사도행전', 9, 3, 6, 'Acts 9:3–6'],
  'ends-earth': ['사도행전', 1, 8, 8, 'Acts 1:8'],
}

const bookKR = (name) => kr.books.find((b) => b.name === name)
const bookENByNr = (nr) => en.books.find((b) => b.nr === nr)
const range = (book, ch, vs, ve) => {
  const c = book.chapters.find((x) => x.chapter === ch)
  if (!c) return []
  return c.verses.filter((v) => v.verse >= vs && v.verse <= ve).map((v) => ({ v: v.verse, text: v.text.trim() }))
}

const out = {}
for (const [slug, [kname, ch, vs, ve, latin]] of Object.entries(WANT)) {
  const bk = bookKR(kname)
  if (!bk) throw new Error('KR book not found: ' + kname)
  const krv = range(bk, ch, vs, ve)
  const enb = bookENByNr(bk.nr)
  const env = enb ? range(enb, ch, vs, ve) : []
  if (!krv.length) throw new Error('empty passage: ' + slug)
  out[slug] = { ref: `${kname} ${ch}:${vs}${ve > vs ? '-' + ve : ''}`, refLatin: latin, kr: krv, en: env }
}

mkdirSync(join(root, 'src/data'), { recursive: true })
writeFileSync(join(root, 'src/data/passages.json'), JSON.stringify(out, null, 2) + '\n', 'utf8')
console.log('wrote', Object.keys(out).length, 'passages')
for (const [s, p] of Object.entries(out)) console.log(' ', s.padEnd(18), p.ref.padEnd(16), `${p.kr.length}v`, '·', p.kr[0].text.slice(0, 22) + '…')
