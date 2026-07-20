import { CompanionListSchema, type Companion } from './schema'

/** 함께 걷는 사람들 — 몬스터가 아니라 사람을 수집한다 (GDD §6) */
export const COMPANIONS: Companion[] = CompanionListSchema.parse([
  {
    id: 'peter',
    name: '베드로',
    role: '열혈 어부 · 먼저 뛰어드는',
    desc: '생각보다 말이 앞서는 큰 마음. 물 위를 걷는 그 챕터의 주인공.',
    skill: '전면 "일단 행동" 미니게임 보정',
    tone: 'lamp',
  },
  {
    id: 'andrew',
    name: '안드레',
    role: '연결자 · 사람을 데려오는',
    desc: '조용히 형을 데려오고, 도시락 든 아이를 찾아낸다.',
    skill: '영입·소개 특기',
    tone: 'blue',
  },
  {
    id: 'matthew',
    name: '마태',
    role: '전직 세리 · 숫자의 사람',
    desc: '사회적으로 회복된 회계사. 모든 자원 퍼즐을 돕는다.',
    skill: '물류·경제 계산 보정',
    tone: 'blue',
  },
  {
    id: 'john',
    name: '요한',
    role: '막내 시인 · 사랑받는',
    desc: '깊이 충성하는 마음. 성찰의 기록을 연다.',
    skill: '성찰 로어 해금',
    tone: 'rose',
  },
  {
    id: 'philip',
    name: '빌립',
    role: '실무 견적가',
    desc: '"이백 데나리온으로도 부족하리이다" — 현실적인 계산가.',
    skill: '물류 보조',
    tone: 'green',
  },
  {
    id: 'mary',
    name: '마리아',
    role: '어머니 · 마음에 새기는',
    desc: '이 모든 말을 마음에 새기어 생각하는 조용한 강함.',
    skill: '감정의 앵커 · 1장과 12장의 북엔드',
    tone: 'rose',
  },
  {
    id: 'joseph',
    name: '요셉',
    role: '성실한 보호자',
    desc: '말없이 지키는 목수. 여정의 첫 길잡이.',
    skill: '성탄 장 가이드',
    tone: 'green',
  },
  {
    id: 'john-baptist',
    name: '세례 요한',
    role: '광야의 예언자',
    desc: '낙타 털옷의 거침없는 목소리. 길을 예비하는 자.',
    skill: '게스트 대형 인물',
    tone: 'lamp',
  },
  {
    id: 'healed-friend',
    name: '나은 친구',
    role: '지붕으로 내려온',
    desc: '네 친구의 믿음이 그를 그분 앞에 데려다 놓았다.',
    skill: '인카운터 카드',
    tone: 'green',
  },
  {
    id: 'zacchaeus',
    name: '삭개오',
    role: '나무 위의 세리',
    desc: '키 작고 부유하고 미움받던, 그러나 끼고 싶었던 사람.',
    skill: '등반 미니게임 + 나눔 보상',
    tone: 'rose',
  },
  {
    id: 'nicodemus',
    name: '니고데모',
    role: '밤에 찾아온 바리새인',
    desc: '진심으로 궁금했던 사람. 적대 진영의 조용한 전향.',
    skill: '함정 질문 간파',
    tone: 'blue',
  },
  {
    id: 'mary-magdalene',
    name: '막달라 마리아',
    role: '부활의 첫 증인',
    desc: '가장 어두운 새벽에 가장 먼저 무덤으로 간 사람.',
    skill: '12장 피날레 시점',
    tone: 'lamp',
  },
])

export const getCompanion = (id: string): Companion | undefined =>
  COMPANIONS.find((c) => c.id === id)
