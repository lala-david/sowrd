/* 씬 아트 배치 규칙.
 *
 * 씬은 9:16 세로로 그려졌고 상단은 UI 텍스트용으로 비워 두었다. 그래서 짧은 가로 박스에
 * 넣을 때 고정 object-position을 쓰면 빈 하늘만 나오거나(예수 여정 히어로가 100% 공백이었다)
 * 살리려던 실루엣이 잘려나간다(시나이 봉우리·바울의 돌무지). 파일마다 실제 그림이 시작되는
 * 지점이 다르므로 그 값을 여기 적어 두고 크롭을 구동한다. (검증에서 측정된 값)
 */
import type { SceneKey } from '../data/geo/journeys'
import type { JourneyEpisode } from '../data/geo/journeys'

/** 각 씬에서 그림이 시작되는 세로 위치(%) — object-position Y의 기준 */
const CONTENT_TOP: Record<SceneKey, number> = {
  city: 35,
  dawn: 35,
  mountain: 35,
  desert: 44,
  river: 49,
  road: 64,
  fields: 67,
  sea: 72,
}

/**
 * 가로로 납작한 박스에 씬을 넣을 때 쓸 object-position.
 * 박스가 낮을수록 아래를 봐야 그림이 나온다.
 */
export function sceneFocus(key: SceneKey, box: 'card' | 'hero' = 'card'): string {
  const top = CONTENT_TOP[key]
  // card(약 130px)는 그림만, hero(약 290px)는 하늘을 조금 남겨 글자 자리를 만든다.
  const y = box === 'card' ? Math.min(100, top + 40) : Math.min(100, top + 22)
  return `50% ${y}%`
}

/* 자리마다 배경이 달라야 모을 맛이 난다 — 여정당 씬 하나면 바울의 30개 자리가 전부 같은 그림이다.
 * 지명·지역·구간(육로/해로)에서 지형을 읽어 씬을 고른다. */
const RULES: [RegExp, SceneKey][] = [
  [/무덤|부활|빈\s?무덤|새벽|엠마오/, 'dawn'],
  [/요단|강|유브라데|나일/, 'river'],
  [/산|시내|모리아|느보|호렙|감람|다볼|헤르몬/, 'mountain'],
  [/광야|사막|수르|신\s?광야|가데스|르비딤|마라|엘림/, 'desert'],
  // "가바다"(빌라도 재판터)가 /바다/에 걸려 바다 그림이 나오던 것을 막는다
  [/(?:^|[^가])바다|호수|갈릴리\s?(해변|호숫가)|지중해|항해|밀레도|무라|미항|멜리데/, 'sea'],
  [/예루살렘|로마|안디옥|에베소|고린도|다메섹|성|도시|가이사랴|아덴|빌립보|데살로니가|두로|시돈/, 'city'],
  [/들|밭|마을|촌|평지|골짜기|보리|추수/, 'fields'],
]

/** 에피소드에 어울리는 씬. 규칙에 안 걸리면 '길'로 둔다(여정의 기본값). */
export function sceneForEpisode(ep: Pick<JourneyEpisode, 'place' | 'region' | 'event' | 'leg'>): SceneKey {
  if (ep.leg === 'sea') return 'sea'
  const hay = `${ep.place} ${ep.region}`
  for (const [re, key] of RULES) if (re.test(hay)) return key
  // 지명으로 안 잡히면 사건 서술에서 한 번 더 본다
  for (const [re, key] of RULES) if (re.test(ep.event ?? '')) return key
  return 'road'
}

/* 예수님 사역의 자리(STATIONS)도 같은 규칙으로 그림을 얻는다.
 * 자리마다 배경이 달라야 스탬프가 수집품처럼 보인다 — 전부 같은 그림이면 모을 이유가 없다. */
const STATION_ARC_FALLBACK: Record<string, SceneKey> = {
  call: 'sea',
  teach: 'mountain',
  parable: 'fields',
  miracle: 'fields',
  passion: 'city',
  rise: 'dawn',
  send: 'road',
}

export function sceneForStation(st: { place: string; title: string; arc: string }): SceneKey {
  const hay = `${st.place} ${st.title}`
  for (const [re, key] of RULES) if (re.test(hay)) return key
  return STATION_ARC_FALLBACK[st.arc] ?? 'road'
}
