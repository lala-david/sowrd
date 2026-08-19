import type { Mood } from '../../journey'

/* ── 성경 여정 자리의 톤(mood) ─────────────────────────────────────────────
 *
 * 왜 이 파일이 필요한가.
 *
 * `CONTENT-UX.md`와 `PLANNING §4.3`은 **수난에서 게임 요소를 완전히 끈다**고 못박는다.
 * "예뻐서"가 아니라 십자가를 보스전으로 만들지 않겠다는 절대 원칙이다. 그 판정은 콘텐츠의
 * mood에서 나오는데, mood 필드는 예수 자리(`journey.ts`의 STATIONS)에만 있었다.
 * 성경 여정 데이터(abraham·exodus·paul·peter.json)에는 아예 없어서, **아브라함이 이삭을
 * 결박하는 자리와 모세가 느보산에서 죽는 자리에도 축하 인장이 찍히고 있었다.**
 * 예수 자리에만 걸려 있던 가드가 나머지 68자리에서는 통째로 비어 있던 셈이다.
 *
 * 왜 JSON을 안 고치고 여기에 두는가: 저 JSON들은 좌표·거리 리서치 산출물이고 스크립트가
 * 다시 만들 수 있다. 톤은 **신학·편집 판단**이라 사람이 검토해야 하는 다른 종류의 데이터다.
 * 분리해 두면 검수자가 이 파일 하나만 읽으면 된다.
 *
 * 배정 기준
 *   lament      애통·죽음·심판·배척 — **게임 요소 OFF**(축하·인장 애니메이션 없음)
 *   wilderness  마르고 힘든 구간 — 게임은 켜두되 축하만 뺀다
 *   wonder      이적·현현·계시
 *   compassion  고침·긍휼
 *   joy         구원·해방·문이 열림
 *   everyday    이동·정착·평범한 순종
 *
 * 여기 없는 자리는 'everyday'다. 검수 뒤 바뀔 수 있고, 바뀌어야 한다면 이 파일만 고치면 된다. */
export const EPISODE_MOODS: Record<string, Record<string, Mood>> = {
  abraham: {
    ur: 'everyday',
    haran: 'everyday',
    shechem: 'wonder', // 약속을 받은 자리
    bethel: 'everyday',
    egypt: 'wilderness', // 기근과 연약함
    'bethel-return': 'everyday',
    hebron: 'wonder', // 이신칭의(창 15:6)
    beersheba: 'everyday',
    moriah: 'lament', // 이삭의 결박 — 여기에 축하가 찍히면 안 된다
    machpelah: 'lament', // 사라의 죽음과 장사
  },
  exodus: {
    rameses: 'joy', // 유월절 밤 이후의 출발
    succoth: 'everyday',
    etham: 'wonder', // 구름 기둥·불 기둥
    pihahiroth: 'wonder', // 홍해가 갈라짐
    marah: 'wilderness',
    elim: 'joy', // 광야 한복판의 안식
    sin: 'wonder', // 만나와 메추라기
    rephidim: 'wilderness', // 다툼과 전쟁
    sinai: 'wonder', // 강림과 언약
    taberah: 'lament', // 원망에 임한 불
    kibroth: 'lament', // 탐욕의 무덤
    hazeroth: 'wilderness', // 미리암의 나병과 회복
    kadesh: 'lament', // 반역 — 그 세대가 땅을 보지 못함
    eziongeber: 'wilderness', // 사십 년의 방랑
    moab: 'everyday',
    nebo: 'lament', // 모세의 죽음
  },
  paul: {
    antioch: 'joy',
    salamis: 'everyday',
    paphos: 'wonder',
    perga: 'wilderness', // 마가가 떠남
    pisidian: 'everyday',
    iconium: 'wilderness', // 박해와 피신
    lystra: 'lament', // 돌에 맞아 성 밖에 버려짐
    derbe: 'joy',
    troas2: 'wonder', // 마게도냐 환상
    philippi: 'wilderness', // 매질과 투옥
    thessalonica: 'wilderness',
    berea: 'everyday',
    athens: 'everyday',
    corinth: 'everyday',
    ephesus2j: 'everyday',
    galatia3: 'everyday',
    ephesus3j: 'everyday',
    macedonia3: 'everyday',
    troas_eutychus: 'wonder', // 유두고가 살아남
    miletus: 'lament', // 눈물의 고별 — 다시 못 볼 것을 알고
    caesarea: 'lament', // 이 년의 감금
    fairhavens: 'wilderness',
    malta: 'wilderness', // 파선, 그러나 모두 무사
    syracuse: 'everyday',
    rhegium: 'everyday',
    puteoli: 'joy', // 형제들을 만남
    appii: 'joy', // 마중 나온 형제들, 감사
    rome: 'joy',
  },
  peter: {
    ep01: 'everyday', // 그물을 버리고 따름
    ep02: 'wonder', // 신앙 고백
    ep03: 'joy', // 오순절
    ep04: 'compassion', // 미문의 고침
    ep05: 'wonder',
    ep06: 'compassion', // 애니아
    ep07: 'wonder', // 다비다와 환상
    ep08: 'joy', // 이방의 문이 열림
    ep09: 'everyday',
    ep10: 'wilderness', // 공개적인 책망
    ep11: 'everyday',
    ep12: 'everyday',
    ep13: 'everyday',
    ep14: 'lament', // 전승상의 순교
  },
}

export const moodOfEpisode = (journeyId: string, episodeId: string): Mood =>
  EPISODE_MOODS[journeyId]?.[episodeId] ?? 'everyday'
