import { useEffect } from 'react'
import { useNav } from './store'
import { usePilgrim } from './state/pilgrim'
import Home from './screens/Home'
import Courses from './screens/Courses'
import Setup from './screens/Setup'
import Run from './screens/Run'
import Reveal from './screens/Reveal'
import Collection from './screens/Collection'
import Profile from './screens/Profile'
import Detail from './screens/Detail'
import Journeys from './screens/Journeys'
import JourneyDetail from './screens/JourneyDetail'
import EpisodeDetail from './screens/EpisodeDetail'
import Intro from './screens/Intro'

const SCREENS = {
  home: Home,
  courses: Courses,
  setup: Setup,
  run: Run,
  reveal: Reveal,
  collection: Collection,
  profile: Profile,
  detail: Detail,
  journeys: Journeys,
  journey: JourneyDetail,
  episode: EpisodeDetail,
} as const

export default function App() {
  const screen = useNav((s) => s.screen)
  // 홈은 하나다. 두 개로 갈라 두었더니 한쪽이 탭바까지 감춰 에피소드 진입로를 막았다.
  const Active = SCREENS[screen] ?? Home

  /* 글자 크기는 <html>에 걸어야 한다 — zoom을 앱 컨테이너에만 걸면 position:fixed 요소
   * (TabBar·러닝 컨트롤)가 새 좌표계를 안 따라와서 화면 밖으로 밀린다. */
  const textScale = usePilgrim((s) => s.textScale)
  useEffect(() => {
    const el = document.documentElement
    if (textScale === 'normal') el.removeAttribute('data-textscale')
    else el.setAttribute('data-textscale', textScale)
  }, [textScale])

  /* 첫 실행 안내는 심플/전체 모드와 무관하게 앱 전체 위에 한 번 뜬다. */
  const seenIntro = usePilgrim((s) => s.seenIntro)

  return (
    <div className="flex min-h-full justify-center bg-sand text-ink">
      {/* 앱 전체의 단일 main 랜드마크 — 스크린리더가 셸(탭바)을 건너뛰고 본문에 바로 닿는다.
          예전엔 홈에만 있고 나머지 화면엔 없었다. */}
      <main className="relative flex min-h-full w-full max-w-[440px] flex-col overflow-x-clip">
        <Active />
      </main>
      {!seenIntro && <Intro />}
    </div>
  )
}
