import { create } from 'zustand'
import type { PassageSlug } from './data/journey'
import { JOURNEYS } from './data/geo/journeys'

const JESUS_EPISODE_IDS = new Set((JOURNEYS.find((j) => j.id === 'jesus')?.episodes ?? []).map((e) => e.id))

export type Screen =
  | 'home' | 'setup' | 'run' | 'reveal' | 'collection' | 'profile' | 'detail'
  | 'journeys' // 여정 선택(5종 카드)
  | 'journey' // 여정 상세(등급별 에피소드)
  | 'episode' // 에피소드 상세(말씀 읽기)
  | 'map' // 지도만 보는 화면 — 길 전체
  | 'stats' // 기록 — 주·월·년
  | 'settings' // 설정(프로필에서 분리)

const SCREENS: Screen[] = [
  'home', 'setup', 'run', 'reveal', 'collection', 'profile', 'detail',
  'journeys', 'journey', 'episode', 'map', 'stats', 'settings',
]

/* 화면과 인자를 전부 해시에 담는다.
 * 이전에는 replaceState만 쓰고 인자를 URL에 안 담아서 (a) 안드로이드 뒤로가기가
 * 어느 화면에서든 앱을 종료시켰고 (b) #episode로 새로고침하면 "자리를 찾을 수 없어요"가 떴다. */
interface Route {
  screen: Screen
  detailId?: PassageSlug
  /** 이 화면을 연 곳 — 뒤로가기가 하드코딩된 목적지로 가지 않게 */
  from?: Screen
  journeyId?: string
  episodeId?: string
}

const encode = (r: Route): string => {
  const p = new URLSearchParams()
  if (r.detailId) p.set('d', r.detailId)
  if (r.journeyId) p.set('j', r.journeyId)
  if (r.episodeId) p.set('e', r.episodeId)
  if (r.from) p.set('f', r.from) // 새로고침 후에도 뒤로가기 목적지를 잃지 않게
  const q = p.toString()
  return '#' + r.screen + (q ? '?' + q : '')
}

const decode = (hash: string): Route => {
  const raw = hash.replace(/^#/, '')
  const [name, query] = raw.split('?')
  const screen = SCREENS.includes(name as Screen) ? (name as Screen) : 'home'
  const p = new URLSearchParams(query ?? '')
  return {
    screen,
    detailId: (p.get('d') as PassageSlug) ?? undefined,
    journeyId: p.get('j') ?? undefined,
    episodeId: p.get('e') ?? undefined,
    from: SCREENS.includes(p.get('f') as Screen) ? (p.get('f') as Screen) : undefined,
  }
}

/** 뒤로가기로 앱을 벗어나면 안 되는 최상위 화면들 */
const ROOTS: Screen[] = ['home', 'journeys', 'profile']

interface NavState extends Route {
  go: (s: Screen) => void
  openDetail: (id: PassageSlug, from?: Screen) => void
  openJourney: (journeyId: string) => void
  /** 지도만 보는 화면 — 그 길 전체를 한 장에 */
  openMap: (journeyId: string) => void
  openEpisode: (journeyId: string, episodeId: string) => void
  /** 뒤로가기(popstate)로 들어온 상태 반영 — 히스토리를 다시 밀지 않는다 */
  applyRoute: (r: Route) => void
}

const initial: Route =
  typeof location !== 'undefined' ? decode(location.hash) : { screen: 'home' }

const push = (r: Route) => {
  if (typeof location === 'undefined') return
  try {
    // 루트 화면끼리는 히스토리를 쌓지 않는다(탭 이동으로 뒤로가기가 오염되지 않게)
    const method = ROOTS.includes(r.screen) ? 'replaceState' : 'pushState'
    history[method](null, '', encode(r))
  } catch {
    /* 파일 프로토콜 등에서 실패해도 앱은 계속 동작해야 한다 */
  }
  /* 새 화면은 맨 위에서 시작한다. SPA라 문서가 그대로 남아, 홈을 끝까지 내리고
   * 여정 탭을 누르면 여정 목록의 중간이 먼저 보였다(실제 발생). 지도 화면은 열리면서
   * 스스로 내가 선 자리로 스크롤하므로 이 초기화와 충돌하지 않는다. */
  window.scrollTo(0, 0)
}

export const useNav = create<NavState>((set) => ({
  ...initial,
  go: (screen) => {
    const r: Route = { screen }
    push(r)
    set({ ...r, detailId: undefined, journeyId: undefined, episodeId: undefined })
  },
  openDetail: (detailId, from) => {
    /* 예수 자리는 이제 예수 **여정**의 자리다(geo/journeys/jesus.ts) — 읽기 화면은 하나(episode)면 된다.
     * 여정에 없는 자리(로마 '땅 끝' 같은 상징 좌표)만 옛 Detail로 연다. */
    if (JESUS_EPISODE_IDS.has(detailId)) {
      const r: Route = { screen: 'episode', journeyId: 'jesus', episodeId: detailId, from }
      push(r)
      set(r)
      return
    }
    const r: Route = { screen: 'detail', detailId, from }
    push(r)
    set(r)
  },
  /* 여정 "상세"는 지도다 — 목록 화면(JourneyDetail)은 지도의 재진술이라 없앴다 */
  openJourney: (journeyId) => {
    const r: Route = { screen: 'map', journeyId }
    push(r)
    set(r)
  },
  /* 지도를 누르면 지도가 나온다 — 그 길 전체를 한 장에, 다른 것 없이. */
  openMap: (journeyId) => {
    const r: Route = { screen: 'map', journeyId }
    push(r)
    set(r)
  },
  openEpisode: (journeyId, episodeId) => {
    const r: Route = { screen: 'episode', journeyId, episodeId }
    push(r)
    set(r)
  },
  applyRoute: (r) => set({ detailId: undefined, journeyId: undefined, episodeId: undefined, ...r }),
}))

/* 하드웨어/제스처 뒤로가기 → 이전 화면. 설치형 PWA에서 앱이 통째로 닫히는 것을 막는다. */
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    useNav.getState().applyRoute(decode(location.hash))
  })
  // 첫 진입 기록을 남겨야 첫 pushState 이후 뒤로가기가 앱 안에 머문다
  try {
    history.replaceState(null, '', encode(initial))
  } catch {
    /* noop */
  }
}
