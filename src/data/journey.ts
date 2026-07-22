/* THE WAY — 순례 여정 데이터 모델
 *
 * 개념: 달린 거리만큼 예수님의 사역 여정(세례 → 갈릴리 → 예루살렘 → 부활 → 땅 끝)이 이어진다.
 * - STATIONS: 사역 사건 하나 = 한 "자리(station)". 성경 본문(passages.json)에 매인다.
 * - COURSES: 거리별 순례길(1·3·5·10·21·42·50km). 각 코스는 자리들을 누적거리에 배치한다.
 *   달린 누적거리가 자리의 at(km)를 넘으면 그 자리가 "열린다(reveal)".
 *
 * 성경: 본문은 passages.json(개역한글 원문·동일성유지). 묵상/기도 카피는 창작(저작권 무관).
 */
import passages from './passages.json'

export type PassageSlug = keyof typeof passages

/* mood — 문서 톤 프리셋(6종). CSS 톤·모션·메커닉 on/off를 구동.
 * 신학적 강제: lament는 축하/거리목표 UI를 끈다("겟세마네에 컨페티 금지"). */
export type Mood = 'everyday' | 'wilderness' | 'wonder' | 'compassion' | 'lament' | 'joy'

export interface Station {
  id: PassageSlug
  place: string // 한글 지명
  placeLatin: string // 라틴 표기(디스플레이 폰트)
  title: string // 사건 이름
  passage: PassageSlug // passages.json 키
  verse: number // 대표로 크게 보여줄 절 번호
  arc: 'call' | 'teach' | 'miracle' | 'parable' | 'passion' | 'rise' | 'send'
  mood: Mood
  teaser: string // 러닝/홈에서 한 줄
  reflection: string // 리빌 묵상(창작)
  prayer: string // 짧은 기도 프롬프트(창작)
}

/* ── 마스터 스테이션 레지스트리 — 예수 사역의 시간 순서 ────────────────── */
export const STATIONS: Record<PassageSlug, Station> = {
  baptism: {
    id: 'baptism', place: '요단강', placeLatin: 'Jordan', title: '세례',
    passage: 'baptism', verse: 17, arc: 'call', mood: 'wonder',
    teaser: '하늘이 열리고, 여정이 시작되다',
    reflection: '모든 길에는 시작하는 물이 있습니다. 낮아져 물에 잠긴 그분처럼, 오늘의 첫 걸음도 낮은 곳에서 시작됩니다.',
    prayer: '나의 시작을 당신께 맡깁니다. 이 길의 첫 호흡을 받으소서.',
  },
  temptation: {
    id: 'temptation', place: '광야', placeLatin: 'Wilderness', title: '시험',
    passage: 'temptation', verse: 4, arc: 'call', mood: 'wilderness',
    teaser: '사십 일의 마른 땅, 말씀으로 서다',
    reflection: '지치고 목마른 구간에서 사람은 무엇으로 사는지 드러납니다. 다리가 아니라 말씀이 당신을 세웁니다.',
    prayer: '떡이 아니라 당신의 말씀으로 오늘을 걷게 하소서.',
  },
  'call-mt4': {
    id: 'call-mt4', place: '갈릴리 해변', placeLatin: 'Sea of Galilee', title: '첫 부르심',
    passage: 'call-mt4', verse: 19, arc: 'call', mood: 'everyday',
    teaser: '그물을 버려두고, 나를 따라오너라',
    reflection: '부르심은 준비된 다음이 아니라 일하던 그 자리에서 옵니다. 지금 놓아야 할 그물은 무엇입니까.',
    prayer: '내가 붙든 그물을 내려놓고 당신을 따르게 하소서.',
  },
  'beat-1': {
    id: 'beat-1', place: '팔복산', placeLatin: 'Mount of Beatitudes', title: '팔복',
    passage: 'beat-1', verse: 3, arc: 'teach', mood: 'everyday',
    teaser: '심령이 가난한 자는 복이 있나니',
    reflection: '세상은 가진 자를 복되다 하지만, 산 위의 말씀은 반대편을 가리킵니다. 비어 있는 사람에게 하늘이 채워집니다.',
    prayer: '가난한 마음으로 당신의 나라를 구하게 하소서.',
  },
  'beat-2': {
    id: 'beat-2', place: '팔복산', placeLatin: 'Mount of Beatitudes', title: '긍휼과 화평',
    passage: 'beat-2', verse: 9, arc: 'teach', mood: 'compassion',
    teaser: '화평케 하는 자는 복이 있나니',
    reflection: '핍박과 오해의 오르막에서도 긍휼을 잃지 않는 걸음이 있습니다. 그 걸음이 하나님의 아들이라 불립니다.',
    prayer: '지치는 오르막에서도 긍휼을 품게 하소서.',
  },
  'light-mt5': {
    id: 'light-mt5', place: '갈릴리', placeLatin: 'Galilee', title: '세상의 빛',
    passage: 'light-mt5', verse: 16, arc: 'teach', mood: 'everyday',
    teaser: '너희 빛을 사람 앞에 비취게 하라',
    reflection: '등불은 자기를 위해 타지 않습니다. 당신의 오늘 이 걸음도 누군가의 어둠을 위한 것일 수 있습니다.',
    prayer: '나의 작은 빛을 감추지 않게 하소서.',
  },
  'lords-prayer': {
    id: 'lords-prayer', place: '갈릴리', placeLatin: 'Galilee', title: '주기도문',
    passage: 'lords-prayer', verse: 10, arc: 'teach', mood: 'everyday',
    teaser: '뜻이 하늘에서 이룬 것같이 땅에서도',
    reflection: '기도는 숨과 같아서, 뛰는 동안에도 이어집니다. 들숨에 "아버지", 날숨에 "뜻이 이루어지이다".',
    prayer: '나라이 임하옵시며 뜻이 이 땅에 이루어지이다.',
  },
  sower: {
    id: 'sower', place: '호숫가', placeLatin: 'Lakeside', title: '씨 뿌리는 자',
    passage: 'sower', verse: 8, arc: 'parable', mood: 'everyday',
    teaser: '좋은 땅에 떨어져 백 배의 결실',
    reflection: '같은 씨앗도 땅에 따라 다르게 자랍니다. 오늘의 말씀을 어떤 땅으로 받고 있습니까—길가인가, 좋은 땅인가.',
    prayer: '내 마음을 갈아 좋은 땅이 되게 하소서.',
  },
  feeding: {
    id: 'feeding', place: '벳새다 들녘', placeLatin: 'Bethsaida', title: '오병이어',
    passage: 'feeding', verse: 11, arc: 'miracle', mood: 'wonder',
    teaser: '보리떡 다섯, 물고기 둘로 오천을 먹이다',
    reflection: '작은 것을 그분의 손에 드리면 넘치게 됩니다. 당신에게 남은 힘이 적어도, 그 적음이 드려지는 자리입니다.',
    prayer: '내 작은 것을 드리니 당신이 나누어 주소서.',
  },
  'walk-water': {
    id: 'walk-water', place: '갈릴리 호숫가', placeLatin: 'Sea of Galilee', title: '물 위를 걷다',
    passage: 'walk-water', verse: 27, arc: 'miracle', mood: 'wonder',
    teaser: '안심하라 내니 두려워 말라',
    reflection: '무엇이 당신을 가라앉게 합니까. 파도가 아니라 시선입니다. 발밑을 보면 잠기고, 그분을 보면 걷습니다.',
    prayer: '가라앉는 순간에도 당신께 눈을 두게 하소서.',
  },
  'blind-sight': {
    id: 'blind-sight', place: '실로암', placeLatin: 'Siloam', title: '소경이 보다',
    passage: 'blind-sight', verse: 7, arc: 'miracle', mood: 'compassion',
    teaser: '진흙을 바르고, 가서 씻으라',
    reflection: '보게 되는 일은 대개 순종한 뒤에 옵니다. 이해가 먼저가 아니라, 걸어가 씻는 것이 먼저입니다.',
    prayer: '이해되지 않아도 순종하여 보게 하소서.',
  },
  transfig: {
    id: 'transfig', place: '변화산', placeLatin: 'Mount Tabor', title: '변모',
    passage: 'transfig', verse: 2, arc: 'miracle', mood: 'wonder',
    teaser: '그 얼굴이 해같이 빛나고',
    reflection: '높은 곳의 빛은 오래 머물기 위한 것이 아니라, 다시 내려가 살아내기 위한 것입니다. 정상은 목적지가 아니라 전환점입니다.',
    prayer: '빛을 본 눈으로 다시 낮은 길을 걷게 하소서.',
  },
  'lost-sheep': {
    id: 'lost-sheep', place: '유대 들판', placeLatin: 'Judea', title: '잃은 양',
    passage: 'lost-sheep', verse: 5, arc: 'parable', mood: 'compassion',
    teaser: '아흔아홉을 두고 하나를 찾아 나서다',
    reflection: '목자는 남은 수가 아니라 잃은 하나를 셉니다. 당신도 누군가에게 그 하나입니다—찾아 나선 그 하나.',
    prayer: '길 잃은 나를 찾아오신 당신께 감사합니다.',
  },
  prodigal: {
    id: 'prodigal', place: '아버지의 집', placeLatin: "Father's House", title: '돌아온 아들',
    passage: 'prodigal', verse: 20, arc: 'parable', mood: 'compassion',
    teaser: '아직도 상거가 먼데 아버지가 달려가',
    reflection: '돌아오는 자보다 기다리던 아버지가 더 멀리 달렸습니다. 당신의 귀향길, 마주 달려오는 분이 계십니다.',
    prayer: '돌아서는 나를 향해 달려오시는 사랑을 믿습니다.',
  },
  samaritan: {
    id: 'samaritan', place: '여리고 길', placeLatin: 'Road to Jericho', title: '선한 사마리아인',
    passage: 'samaritan', verse: 33, arc: 'parable', mood: 'compassion',
    teaser: '그를 보고 불쌍히 여겨 다가가다',
    reflection: '거룩함은 지나치지 않고 멈추는 데 있습니다. 오늘 길에서 당신이 멈춰 설 사람은 누구입니까.',
    prayer: '바쁜 길에서도 멈추어 이웃을 보게 하소서.',
  },
  'lazarus-come': {
    id: 'lazarus-come', place: '베다니', placeLatin: 'Bethany', title: '나사로야 나오라',
    passage: 'lazarus-come', verse: 43, arc: 'miracle', mood: 'wonder',
    teaser: '죽은 지 나흘, 무덤 앞에서 부르다',
    reflection: '가장 늦었다고 여긴 곳에서 그분은 이름을 부릅니다. 당신이 이미 끝났다고 여긴 그 자리가 부활의 자리일 수 있습니다.',
    prayer: '죽은 것 같은 내 자리에도 생명을 부르소서.',
  },
  entry: {
    id: 'entry', place: '예루살렘', placeLatin: 'Jerusalem', title: '입성',
    passage: 'entry', verse: 9, arc: 'passion', mood: 'everyday',
    teaser: '호산나, 나귀를 타고 성으로',
    reflection: '왕은 군마가 아니라 나귀를 탔습니다. 낮아짐이 진짜 능력임을, 이 걸음이 다시 배웁니다.',
    prayer: '높아지려는 마음을 낮은 왕 앞에 내려놓습니다.',
  },
  'last-supper': {
    id: 'last-supper', place: '다락방', placeLatin: 'Upper Room', title: '최후의 만찬',
    passage: 'last-supper', verse: 26, arc: 'passion', mood: 'everyday',
    teaser: '이것은 너희를 위하는 내 몸이니',
    reflection: '떼어 나눈 떡처럼, 사랑은 부서져 나누어질 때 채워집니다. 오늘 당신은 누구를 위해 부서지고 있습니까.',
    prayer: '나를 떼어 나누는 사랑을 배우게 하소서.',
  },
  gethsemane: {
    id: 'gethsemane', place: '겟세마네', placeLatin: 'Gethsemane', title: '동산의 기도',
    passage: 'gethsemane', verse: 42, arc: 'passion', mood: 'lament',
    teaser: '내 원대로 마옵시고 아버지 원대로',
    reflection: '가장 힘든 오르막은 몸이 아니라 뜻을 내려놓는 자리입니다. "그러나 아버지 원대로"—이 한 마디가 십자가를 엽니다.',
    prayer: '내 뜻보다 당신의 뜻을 택하게 하소서.',
  },
  arrest: {
    id: 'arrest', place: '기드론', placeLatin: 'Kidron', title: '잡히심',
    passage: 'arrest', verse: 46, arc: 'passion', mood: 'lament',
    teaser: '입맞춤으로 넘겨지다',
    reflection: '배신과 어둠의 한복판에서도 그분은 도망치지 않았습니다. 사랑은 붙잡히기를 택했습니다—당신을 놓지 않으려고.',
    prayer: '어둠의 시간에도 당신을 신뢰하게 하소서.',
  },
  pilate: {
    id: 'pilate', place: '가바다', placeLatin: 'Gabbatha', title: '빌라도 앞에서',
    passage: 'pilate', verse: 5, arc: 'passion', mood: 'lament',
    teaser: '보라 이 사람이로다',
    reflection: '침묵으로 견딘 재판이 있습니다. 변명하지 않는 것이 때로 가장 강한 응답입니다.',
    prayer: '억울한 자리에서도 잠잠히 당신을 바라봅니다.',
  },
  golgotha: {
    id: 'golgotha', place: '골고다', placeLatin: 'Golgotha', title: '십자가',
    passage: 'golgotha', verse: 34, arc: 'passion', mood: 'lament',
    teaser: '아버지여 저들을 사하여 주옵소서',
    reflection: '가장 깊은 고통의 자리에서 나온 첫 말이 용서였습니다. 이 언덕은 끝이 아니라, 사랑이 끝까지 간 자리입니다.',
    prayer: '나를 위한 그 용서 앞에 무릎 꿇습니다.',
  },
  finished: {
    id: 'finished', place: '골고다', placeLatin: 'Golgotha', title: '다 이루었다',
    passage: 'finished', verse: 30, arc: 'passion', mood: 'lament',
    teaser: '다 이루었다, 머리를 숙이시다',
    reflection: '"다 이루었다"는 포기가 아니라 완성입니다. 완주는 남은 힘이 아니라, 끝까지 간 사랑으로 이루어집니다.',
    prayer: '내게 맡기신 길을 끝까지 이루게 하소서.',
  },
  'empty-tomb': {
    id: 'empty-tomb', place: '동산 무덤', placeLatin: 'The Tomb', title: '빈 무덤',
    passage: 'empty-tomb', verse: 6, arc: 'rise', mood: 'joy',
    teaser: '그가 여기 계시지 않고 살아나셨느니라',
    reflection: '가장 어두운 새벽 뒤에 가장 밝은 소식이 왔습니다. 끝이라 여긴 돌은 이미 굴러가 있었습니다.',
    prayer: '나의 무덤 같은 자리에도 부활을 믿게 하소서.',
  },
  risen: {
    id: 'risen', place: '다락방', placeLatin: 'Upper Room', title: '부활하신 주',
    passage: 'risen', verse: 21, arc: 'rise', mood: 'joy',
    teaser: '너희에게 평강이 있을지어다',
    reflection: '닫힌 문 안으로 그분이 오셔서 처음 하신 말은 "평강"이었습니다. 당신이 잠근 그 문 안으로도 오십니다.',
    prayer: '두려워 잠근 마음의 문으로 들어오소서.',
  },
  commission: {
    id: 'commission', place: '갈릴리 산', placeLatin: 'Galilee', title: '지상명령',
    passage: 'commission', verse: 19, arc: 'send', mood: 'joy',
    teaser: '가서 모든 족속으로 제자를 삼으라',
    reflection: '여정은 도착으로 끝나지 않고 파송으로 이어집니다. 당신이 받은 이 길은, 이제 누군가에게 전할 길입니다.',
    prayer: '내가 걸은 이 길을 다른 이에게 전하게 하소서.',
  },
  pentecost: {
    id: 'pentecost', place: '예루살렘', placeLatin: 'Jerusalem', title: '오순절',
    passage: 'pentecost', verse: 4, arc: 'send', mood: 'joy',
    teaser: '불의 혀같이, 성령이 임하다',
    reflection: '홀로 뛰던 걸음에 바람이 붙습니다. 당신의 다리가 다한 곳에서 성령의 힘이 시작됩니다.',
    prayer: '내 힘이 다한 곳에서 당신의 바람을 주소서.',
  },
  'peter-sermon': {
    id: 'peter-sermon', place: '예루살렘', placeLatin: 'Jerusalem', title: '베드로의 설교',
    passage: 'peter-sermon', verse: 38, arc: 'send', mood: 'joy',
    teaser: '회개하고 세례를 받으라',
    reflection: '한때 세 번 부인했던 입이 이제 삼천 명을 돌이킵니다. 넘어진 자리가 가장 크게 쓰이는 자리가 됩니다.',
    prayer: '나의 실패조차 당신의 도구로 쓰소서.',
  },
  saul: {
    id: 'saul', place: '다메섹 길', placeLatin: 'Damascus', title: '사울의 회심',
    passage: 'saul', verse: 4, arc: 'send', mood: 'wonder',
    teaser: '사울아 사울아 어찌하여 나를 핍박하느냐',
    reflection: '가장 반대편으로 달려가던 자가 가장 멀리 복음을 전했습니다. 방향이 바뀌면, 달려온 힘 그대로 복음이 됩니다.',
    prayer: '내 열심의 방향을 당신께로 돌리소서.',
  },
  'ends-earth': {
    id: 'ends-earth', place: '땅 끝', placeLatin: 'Ends of the Earth', title: '땅 끝까지',
    passage: 'ends-earth', verse: 8, arc: 'send', mood: 'joy',
    teaser: '땅 끝까지 이르러 내 증인이 되리라',
    reflection: '이 길에는 결승선이 없습니다. 한 사람의 완주가 다른 사람의 출발이 되어, 땅 끝까지 이어집니다.',
    prayer: '나의 걸음을 땅 끝을 향한 한 걸음이 되게 하소서.',
  },
  talents: {
    id: 'talents', place: '감람산', placeLatin: 'Mount of Olives', title: '달란트',
    passage: 'talents', verse: 21, arc: 'parable', mood: 'everyday',
    teaser: '착하고 충성된 종아, 잘하였도다',
    reflection: '많고 적음이 아니라 맡은 것에 충성했는가를 물으십니다. 오늘 당신에게 맡겨진 거리, 그것을 다하는 것으로 충분합니다.',
    prayer: '작게 맡은 것에도 충성하게 하소서.',
  },
  mustard: {
    id: 'mustard', place: '갈릴리', placeLatin: 'Galilee', title: '겨자씨',
    passage: 'mustard', verse: 32, arc: 'parable', mood: 'everyday',
    teaser: '모든 씨보다 작으나 자라면 나무가 되어',
    reflection: '오늘의 한 걸음은 겨자씨만큼 작아 보입니다. 그러나 심긴 씨는 자라 새들이 깃드는 나무가 됩니다.',
    prayer: '작은 오늘을 심어 큰 나무로 자라게 하소서.',
  },
  'wise-builder': {
    id: 'wise-builder', place: '갈릴리', placeLatin: 'Galilee', title: '반석 위의 집',
    passage: 'wise-builder', verse: 24, arc: 'teach', mood: 'everyday',
    teaser: '말씀을 듣고 행하는 자는 반석 위에',
    reflection: '듣는 것과 행하는 것 사이에 반석이 있습니다. 오늘 당신은 말씀을 들었을 뿐 아니라, 다리로 행했습니다.',
    prayer: '들은 말씀을 삶으로 행하게 하소서.',
  },
  'resurrection-hope': {
    id: 'resurrection-hope', place: '베다니', placeLatin: 'Bethany', title: '나는 부활이요',
    passage: 'resurrection-hope', verse: 25, arc: 'miracle', mood: 'wonder',
    teaser: '나는 부활이요 생명이니',
    reflection: '부활은 먼 훗날의 사건이 아니라 지금 붙드는 한 분입니다. 그를 믿는 자는 죽어도 살겠고, 살아 걷는 자는 영원히 죽지 않습니다.',
    prayer: '지금 여기서 부활의 생명을 살게 하소서.',
  },
  'cross-luke': {
    id: 'cross-luke', place: '골고다', placeLatin: 'Golgotha', title: '아버지 손에',
    passage: 'cross-luke', verse: 46, arc: 'passion', mood: 'lament',
    teaser: '내 영혼을 아버지 손에 부탁하나이다',
    reflection: '마지막 숨까지 신뢰였습니다. 완주의 끝에서 우리가 드릴 것도 결국 이 한 마디입니다—당신의 손에 맡깁니다.',
    prayer: '나의 끝을 당신의 손에 맡깁니다.',
  },
  'call-mk1': {
    id: 'call-mk1', place: '갈릴리 해변', placeLatin: 'Sea of Galilee', title: '어부를 부르시다',
    passage: 'call-mk1', verse: 17, arc: 'call', mood: 'everyday',
    teaser: '나를 따라오너라, 사람 낚는 어부가 되게 하리라',
    reflection: '같은 부르심이 마가의 눈으로 다시 울립니다. 부르심은 한 번 듣고 마는 소리가 아니라, 걸을 때마다 새로 들리는 음성입니다.',
    prayer: '오늘도 그 부르심을 새로 듣게 하소서.',
  },
  'take-heart': {
    id: 'take-heart', place: '갈릴리 호숫가', placeLatin: 'Sea of Galilee', title: '배에 오르시니',
    passage: 'take-heart', verse: 33, arc: 'miracle', mood: 'wonder',
    teaser: '진실로 하나님의 아들이로소이다',
    reflection: '파도가 잔잔해진 뒤에야 사람들은 그가 누구신지 고백했습니다. 폭풍이 지난 자리에서 믿음은 더 또렷해집니다.',
    prayer: '잔잔해진 마음으로 당신을 고백합니다.',
  },
}

/* ── 코스: 거리별 순례길 ─────────────────────────────────────────────── */
export interface CourseStation {
  id: PassageSlug
  at: number // 누적거리(km) — 이 지점을 넘으면 자리가 열린다
}

export interface Course {
  id: string
  name: string // 한글
  nameLatin: string
  distanceKm: number
  band: '1K' | '3K' | '5K' | '10K' | 'HALF' | 'FULL' | 'ULTRA'
  arcLabel: string // 이 코스가 담는 여정 구간
  blurb: string // 한 줄 소개
  hero: string // 히어로 아트 키(assets)
  stations: CourseStation[]
}

const S = (id: PassageSlug, at: number): CourseStation => ({ id, at })

export const COURSES: Course[] = [
  {
    id: 'calling', name: '첫 부르심', nameLatin: 'The Calling', distanceKm: 1, band: '1K',
    arcLabel: '세례 · 광야 · 부르심',
    blurb: '가장 짧은 순례. 물에서 시작해 첫걸음을 떼는 길.',
    hero: 'pilgrim-trail',
    stations: [S('baptism', 0.3), S('temptation', 0.6), S('call-mt4', 1.0)],
  },
  {
    id: 'sermon', name: '산 위에서', nameLatin: 'The Sermon', distanceKm: 3, band: '3K',
    arcLabel: '산상수훈',
    blurb: '팔복에서 반석 위의 집까지, 산 위의 말씀을 따라 걷는 길.',
    hero: 'sermon-mount',
    stations: [S('beat-1', 0.75), S('light-mt5', 1.5), S('lords-prayer', 2.25), S('wise-builder', 3.0)],
  },
  {
    id: 'galilee', name: '갈릴리의 기적', nameLatin: 'Miracles of Galilee', distanceKm: 5, band: '5K',
    arcLabel: '갈릴리 사역 · 기적',
    blurb: '오병이어에서 물 위를 걷기까지, 호숫가의 기적을 지나는 길.',
    hero: 'galilee-water',
    stations: [S('sower', 1.0), S('feeding', 2.0), S('walk-water', 3.0), S('blind-sight', 4.0), S('transfig', 5.0)],
  },
  {
    id: 'parables', name: '비유의 길', nameLatin: 'The Parables', distanceKm: 10, band: '10K',
    arcLabel: '천국 비유',
    blurb: '겨자씨에서 돌아온 아들까지, 이야기로 하늘을 여는 길.',
    hero: 'field-parable',
    stations: [S('mustard', 1.7), S('sower', 3.3), S('lost-sheep', 5.0), S('prodigal', 6.7), S('samaritan', 8.3), S('talents', 10.0)],
  },
  {
    id: 'jerusalem', name: '예루살렘으로', nameLatin: 'Road to Jerusalem', distanceKm: 21.0975, band: 'HALF',
    arcLabel: '고난주간 · 하프',
    blurb: '입성에서 십자가까지, 가장 무거운 한 주를 걷는 하프 순례.',
    hero: 'jerusalem-dusk',
    stations: [S('lazarus-come', 3), S('entry', 6), S('last-supper', 9), S('gethsemane', 12), S('arrest', 15), S('pilate', 18), S('golgotha', 21.0975)],
  },
  {
    id: 'finished', name: '다 이루었다', nameLatin: 'It Is Finished', distanceKm: 42.195, band: 'FULL',
    arcLabel: '세례에서 부활까지 · 풀 마라톤',
    blurb: '사역의 처음부터 빈 무덤까지, 예수의 전 여정을 한 번에 완주하는 길.',
    hero: 'pilgrim-trail',
    stations: [
      S('baptism', 3.5), S('call-mt4', 7), S('beat-1', 10.5), S('feeding', 14),
      S('walk-water', 17.5), S('lazarus-come', 21), S('entry', 25), S('last-supper', 28.5),
      S('gethsemane', 32), S('golgotha', 35.5), S('finished', 39), S('empty-tomb', 42.195),
    ],
  },
  {
    id: 'ends', name: '땅 끝까지', nameLatin: 'To the Ends of the Earth', distanceKm: 50, band: 'ULTRA',
    arcLabel: '부활 이후 · 사도행전 · 울트라',
    blurb: '부활에서 땅 끝까지, 결승선 없는 사명의 울트라 순례.',
    hero: 'dawn-road',
    stations: [S('risen', 8), S('commission', 16), S('pentecost', 25), S('peter-sermon', 33), S('saul', 42), S('ends-earth', 50)],
  },
]

export const courseById = (id: string) => COURSES.find((c) => c.id === id)

export function stationAt(course: Course, index: number): Station | undefined {
  const cs = course.stations[index]
  return cs ? STATIONS[cs.id] : undefined
}

/* 누적거리(km)로부터: 지금까지 열린 자리 수, 다음 자리까지 남은 거리 */
export function progressOf(course: Course, km: number) {
  const reached = course.stations.filter((s) => km >= s.at).length
  const next = course.stations[reached] // 아직 안 열린 첫 자리
  const prevAt = reached > 0 ? course.stations[reached - 1].at : 0
  const nextAt = next ? next.at : course.distanceKm
  const segLen = Math.max(0.0001, nextAt - prevAt)
  const segProgress = Math.min(1, Math.max(0, (km - prevAt) / segLen))
  return {
    reached,
    total: course.stations.length,
    nextStation: next ? STATIONS[next.id] : undefined,
    toNextKm: Math.max(0, nextAt - km),
    segProgress,
    done: reached >= course.stations.length || km >= course.distanceKm,
  }
}
