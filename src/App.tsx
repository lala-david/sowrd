import { AnimatePresence, motion } from 'motion/react'
import { useGame } from './state/store'
import { TitleScreen } from './screens/TitleScreen'
import { JourneyMap } from './screens/JourneyMap'
import { WaterWalkGame } from './screens/WaterWalkGame'
import { RewardScreen } from './screens/RewardScreen'
import { CollectionScreen } from './screens/CollectionScreen'

export default function App() {
  const screen = useGame((s) => s.screen)

  return (
    <div className="app-shell">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          className="screen-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {screen === 'title' && <TitleScreen />}
          {screen === 'map' && <JourneyMap />}
          {screen === 'game' && <WaterWalkGame />}
          {screen === 'reward' && <RewardScreen />}
          {screen === 'collection' && <CollectionScreen />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
