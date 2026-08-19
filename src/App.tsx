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
import JourneyMap from './screens/JourneyMap'
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
  map: JourneyMap,
} as const

export default function App() {
  const screen = useNav((s) => s.screen)
  // 홈은 하나다. 두 개로 갈라 두었더니 한쪽이 탭바까지 감춰 에피소드 진입로를 막았다.
  const Active = SCREENS[screen] ?? Home

  /* 글자 크기 — 두 가지를 곱해 하나의 zoom으로 <html>에 건다.
   *  1) 인앱 설정(normal/large/xlarge): 사용자가 직접 고른 배율.
   *  2) 브라우저·OS 글꼴 설정: 이 앱은 폰트가 전부 px 하드코딩이라 rem/em이 없어서
   *     브라우저 "기본 글꼴 크기"나 iOS/안드로이드 글꼴 설정이 그냥 무시됐다. 그것을 존중하려면
   *     224곳의 px를 전부 rem으로 바꿔야 하는데(위험), 대신 사용자가 설정한 루트 글꼴 크기를
   *     읽어(16px 대비 비율) zoom에 곱한다. 브라우저에서 글자를 키운 사람은 인앱 토글을
   *     건드리지 않아도 앱 글자가 함께 커진다.
   * zoom을 앱 컨테이너가 아니라 <html>에 거는 이유: position:fixed(TabBar·러닝 컨트롤)가
   * 컨테이너 zoom의 새 좌표계를 안 따라와 화면 밖으로 밀리기 때문이다. */
  const textScale = usePilgrim((s) => s.textScale)
  useEffect(() => {
    const factor = textScale === 'xlarge' ? 1.3 : textScale === 'large' ? 1.15 : 1
    const apply = () => {
      // 루트 글꼴 크기(브라우저/OS 설정 반영). zoom은 이 값을 안 바꾸므로 재측정이 안전하다.
      const root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      const browserRatio = Math.min(1.5, Math.max(1, root / 16))
      // 합쳐서 상한 1.6 — 그 이상은 360px 레이아웃이 감당 못 한다
      const zoom = Math.min(1.6, browserRatio * factor)
      document.documentElement.style.zoom = zoom === 1 ? '' : String(zoom)
    }
    apply()
    // 브라우저 글꼴 설정을 러닝 중 바꾸는 사람은 없지만, 탭 복귀 시 한 번 다시 잰다
    window.addEventListener('focus', apply)
    return () => window.removeEventListener('focus', apply)
  }, [textScale])

  /* 테마 — 다크 토큰은 처음부터 전부 정의돼 있었는데 실제로 켜지는 곳은 러닝 화면
   * 한 군데(Run.tsx의 data-theme="dark")뿐이었다. 새벽에 열어도 크림색이라는 뜻이다.
   * 여기서 <html>에 걸어 앱 전체가 따르게 한다. 'system'이면 OS 설정을 실시간으로 따라간다.
   * (러닝 화면은 자기 컨테이너에 dark를 직접 걸므로 라이트를 골라도 몰입 화면은 그대로 밤이다.) */
  const theme = usePilgrim((s) => s.theme)
  useEffect(() => {
    const root = document.documentElement
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches)
      root.setAttribute('data-theme', dark ? 'dark' : 'light')
      // 스크롤바·폼 컨트롤 같은 브라우저 UI도 같이 따라오게 한다
      root.style.colorScheme = dark ? 'dark' : 'light'
    }
    apply()
    if (theme !== 'system') return
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])

  /* 첫 실행 안내는 심플/전체 모드와 무관하게 앱 전체 위에 한 번 뜬다. */
  const seenIntro = usePilgrim((s) => s.seenIntro)

  return (
    <div className="flex min-h-full justify-center bg-sand text-ink">
      {/* 스킵 링크 — 키보드/스위치 사용자가 탭바를 건너뛰고 본문으로 바로 간다.
          포커스 받기 전에는 화면 밖에 숨어 있다가 Tab 첫 눌림에 나타난다(WCAG 2.4.1). */}
      <a href="#main" className="skip-link">본문으로 건너뛰기</a>
      {/* 앱 전체의 단일 main 랜드마크 — 스크린리더가 셸(탭바)을 건너뛰고 본문에 바로 닿는다.
          예전엔 홈에만 있고 나머지 화면엔 없었다. */}
      <main id="main" className="relative flex min-h-full w-full max-w-[440px] flex-col overflow-x-clip">
        <Active />
      </main>
      {!seenIntro && <Intro />}
    </div>
  )
}
