import { useNav } from './store'
import Home from './screens/Home'
import Run from './screens/Run'
import Reveal from './screens/Reveal'

export default function App() {
  const screen = useNav((s) => s.screen)
  return (
    <div className="flex min-h-full justify-center bg-paper text-ink">
      <div className="relative flex min-h-full w-full max-w-[440px] flex-col overflow-hidden">
        {screen === 'run' ? <Run /> : screen === 'reveal' ? <Reveal /> : <Home />}
      </div>
    </div>
  )
}
