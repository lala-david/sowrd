import { create } from 'zustand'

export type Screen = 'home' | 'run' | 'reveal' | 'collection'

const SCREENS: Screen[] = ['home', 'run', 'reveal', 'collection']
const initial: Screen =
  typeof location !== 'undefined' && SCREENS.includes(location.hash.slice(1) as Screen)
    ? (location.hash.slice(1) as Screen)
    : 'home'

interface NavState {
  screen: Screen
  go: (s: Screen) => void
}

export const useNav = create<NavState>((set) => ({
  screen: initial,
  go: (screen) => set({ screen }),
}))
