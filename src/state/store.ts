import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Screen = 'title' | 'map' | 'game' | 'reward' | 'collection'

interface GameState {
  screen: Screen
  /** 현재 진입한 에피소드 id */
  currentEpisode: string | null
  /** 클리어한 에피소드 id 목록 */
  completed: string[]
  /** 합류한 동료 id 목록 — 사람 스크랩북 */
  companions: string[]
  /** 접근성: 리듬/타이밍 관대 모드 (ENGAGEMENT §1) */
  gentleMode: boolean

  setScreen: (s: Screen) => void
  enterEpisode: (id: string) => void
  completeEpisode: (id: string, companionIds: string[]) => void
  toggleGentleMode: () => void
}

export const useGame = create<GameState>()(
  persist(
    (set) => ({
      screen: 'title',
      currentEpisode: null,
      completed: [],
      companions: [],
      gentleMode: false,

      setScreen: (screen) => set({ screen }),

      enterEpisode: (id) => set({ currentEpisode: id, screen: 'game' }),

      completeEpisode: (id, companionIds) =>
        set((s) => ({
          screen: 'reward',
          completed: s.completed.includes(id) ? s.completed : [...s.completed, id],
          companions: [
            ...s.companions,
            ...companionIds.filter((c) => !s.companions.includes(c)),
          ],
        })),

      toggleGentleMode: () => set((s) => ({ gentleMode: !s.gentleMode })),
    }),
    {
      name: 'donghaeng-save-v1',
      // 세이브 = 진행 상태만. 현재 화면은 '이어하기' UX를 위해 포함하되
      // 미니게임 도중이었다면 맵으로 복귀시킨다 (무손실 원칙).
      partialize: (s) => ({
        completed: s.completed,
        companions: s.companions,
        gentleMode: s.gentleMode,
      }),
    },
  ),
)
