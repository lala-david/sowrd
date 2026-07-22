import type { PassageSlug } from './journey'

/* 자리에 등장하는 신약 배경 인물 — 성경 본문에 근거. note는 창작 소개(저작권 무관). */
export interface Figure {
  name: string
  note: string
}

export const STATION_PEOPLE: Partial<Record<PassageSlug, Figure[]>> = {
  baptism: [
    { name: '세례 요한', note: '광야에서 회개를 외친 선구자. 그가 예수께 세례를 베풀다' },
  ],
  temptation: [{ name: '마귀', note: '광야에서 세 번 시험한 자' }],
  'call-mt4': [
    { name: '시몬 베드로', note: '갈릴리 어부, 훗날 열두 제자의 첫째' },
    { name: '안드레', note: '베드로의 형제, 먼저 예수를 따른 어부' },
  ],
  'call-mk1': [
    { name: '야고보', note: '세베대의 아들, 그물을 버리고 따르다' },
    { name: '요한', note: '야고보의 형제, 사랑받은 제자' },
  ],
  feeding: [
    { name: '안드레', note: '보리떡 다섯과 물고기 둘을 든 아이를 데려오다' },
    { name: '빌립', note: '이백 데나리온으로도 부족하다 말한 제자' },
    { name: '한 아이', note: '자기 도시락을 내어드린 이름 없는 소년' },
  ],
  'walk-water': [{ name: '베드로', note: '물 위를 향해 배에서 내려선 제자' }],
  'take-heart': [{ name: '제자들', note: '풍랑 뒤에 "하나님의 아들"이라 고백하다' }],
  'blind-sight': [{ name: '날 때부터 소경 된 사람', note: '실로암에서 씻고 보게 된 이' }],
  transfig: [
    { name: '모세', note: '율법의 대표, 영광 중에 나타나다' },
    { name: '엘리야', note: '선지자의 대표, 예수와 말하다' },
    { name: '베드로·야고보·요한', note: '변모를 목격한 세 제자' },
  ],
  'lazarus-come': [
    { name: '나사로', note: '죽은 지 나흘, 무덤에서 걸어 나온 이' },
    { name: '마르다', note: '"주는 그리스도시요"라 고백한 자매' },
    { name: '마리아', note: '주의 발 앞에 엎드린 자매' },
  ],
  'lost-sheep': [{ name: '목자', note: '아흔아홉을 두고 하나를 찾아 나선 이' }],
  prodigal: [
    { name: '아버지', note: '멀리서 달려와 아들을 안은 이' },
    { name: '둘째 아들', note: '재산을 허비하고 돌아온 아들' },
    { name: '맏아들', note: '밭에서 돌아와 분노한 형' },
  ],
  samaritan: [
    { name: '사마리아인', note: '멸시받던 이방인, 이웃이 되어준 사람' },
    { name: '강도 만난 사람', note: '길에 버려진 채 도움을 기다린 이' },
    { name: '제사장·레위인', note: '보고도 피하여 지나간 사람들' },
  ],
  entry: [{ name: '무리', note: '겉옷과 종려나무로 "호산나"를 외친 사람들' }],
  'last-supper': [{ name: '열두 제자', note: '떡과 잔을 나누어 받은 이들' }],
  gethsemane: [{ name: '베드로·야고보·요한', note: '깨어 있으라는 부탁을 받았으나 잠든 제자들' }],
  arrest: [{ name: '가룟 유다', note: '입맞춤으로 스승을 넘긴 제자' }],
  pilate: [{ name: '빌라도', note: '"이 사람에게서 죄를 찾지 못하노라"던 총독' }],
  golgotha: [
    { name: '두 행악자', note: '좌우편에 함께 못 박힌 두 사람' },
    { name: '백부장', note: '십자가 아래서 지켜본 로마 군인' },
  ],
  'empty-tomb': [
    { name: '여인들', note: '새벽에 무덤을 찾은 이들' },
    { name: '천사', note: '"그가 살아나셨느니라" 전한 사자' },
  ],
  risen: [{ name: '제자들', note: '닫힌 문 안에서 부활의 주를 만나다' }],
  commission: [{ name: '열한 제자', note: '갈릴리 산에서 파송받은 이들' }],
  pentecost: [{ name: '제자들', note: '한 곳에 모여 성령을 받은 무리' }],
  'peter-sermon': [{ name: '베드로', note: '삼천 명을 돌이킨 설교자' }],
  saul: [{ name: '사울(바울)', note: '핍박자에서 이방인의 사도로 돌이킨 이' }],
  'cross-luke': [{ name: '예수', note: '"내 영혼을 아버지 손에 부탁하나이다"' }],
}

export const peopleOf = (id: PassageSlug): Figure[] => STATION_PEOPLE[id] ?? []
