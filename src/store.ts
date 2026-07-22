import { create } from 'zustand'
import type { PassageSlug } from './data/journey'

export type Screen = 'home' | 'courses' | 'setup' | 'run' | 'reveal' | 'collection' | 'profile' | 'detail'

const SCREENS: Screen[] = ['home', 'courses', 'setup', 'run', 'reveal', 'collection', 'profile', 'detail']
const initial: Screen =
  typeof location !== 'undefined' && SCREENS.includes(location.hash.slice(1) as Screen)
    ? (location.hash.slice(1) as Screen)
    : 'home'

interface NavState {
  screen: Screen
  detailId?: PassageSlug
  go: (s: Screen) => void
  openDetail: (id: PassageSlug) => void
}

export const useNav = create<NavState>((set) => ({
  screen: initial,
  detailId: undefined,
  go: (screen) => {
    if (typeof location !== 'undefined') {
      try {
        history.replaceState(null, '', '#' + screen)
      } catch {
        /* ignore */
      }
    }
    set({ screen })
  },
  openDetail: (id) => set({ screen: 'detail', detailId: id }),
}))
