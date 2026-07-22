import { useNav } from './store'
import Home from './screens/Home'
import Courses from './screens/Courses'
import Setup from './screens/Setup'
import Run from './screens/Run'
import Reveal from './screens/Reveal'
import Collection from './screens/Collection'
import Profile from './screens/Profile'
import Detail from './screens/Detail'

const SCREENS = {
  home: Home,
  courses: Courses,
  setup: Setup,
  run: Run,
  reveal: Reveal,
  collection: Collection,
  profile: Profile,
  detail: Detail,
} as const

export default function App() {
  const screen = useNav((s) => s.screen)
  const Active = SCREENS[screen] ?? Home
  return (
    <div className="flex min-h-full justify-center bg-sand text-ink">
      <div className="relative flex min-h-full w-full max-w-[440px] flex-col overflow-hidden">
        <Active />
      </div>
    </div>
  )
}
