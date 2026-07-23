import { create } from 'zustand'
import type { PassageSlug } from './data/journey'

export type Screen =
  | 'home' | 'courses' | 'setup' | 'run' | 'reveal' | 'collection' | 'profile' | 'detail'
  | 'journeys' // 여정 선택(5종 카드)
  | 'journey' // 여정 상세(등급별 에피소드)
  | 'episode' // 에피소드 상세(말씀 읽기)

const SCREENS: Screen[] = [
  'home', 'courses', 'setup', 'run', 'reveal', 'collection', 'profile', 'detail',
  'journeys', 'journey', 'episode',
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
const ROOTS: Screen[] = ['home', 'journeys', 'courses', 'profile']

interface NavState extends Route {
  go: (s: Screen) => void
  openDetail: (id: PassageSlug, from?: Screen) => void
  openJourney: (journeyId: string) => void
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
}

export const useNav = create<NavState>((set) => ({
  ...initial,
  go: (screen) => {
    const r: Route = { screen }
    push(r)
    set({ ...r, detailId: undefined, journeyId: undefined, episodeId: undefined })
  },
  openDetail: (detailId, from) => {
    /* 어디서 열었는지를 들고 간다. 예전엔 Detail의 뒤로가기가 무조건 collection이라,
     * 심플 모드에서 "오늘의 말씀"만 읽으려던 사람이 존재도 모르던 37자리 목록에,
     * 그것도 어떤 탭도 켜지지 않은 상태로 떨어졌다. */
    const r: Route = { screen: 'detail', detailId, from }
    push(r)
    set(r)
  },
  openJourney: (journeyId) => {
    const r: Route = { screen: 'journey', journeyId }
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
