import { motion } from 'motion/react'
import { getCompanion } from '../content/companions'
import { getEpisode } from '../content/episodes'
import { useGame } from '../state/store'

/** 피크-엔드: 각 장의 끝은 감정의 정점으로 (ENGAGEMENT §5) */
const EPISODE_CLOSING: Record<string, { line: string; ref: string }> = {
  ep08: {
    line: '“믿음이 작은 자여, 어찌하여 의심하였느냐” — 그리고 붙잡아 주신 손.',
    ref: '마태복음 14:31',
  },
}

export function RewardScreen() {
  const { currentEpisode, setScreen } = useGame()
  const ep = currentEpisode ? getEpisode(currentEpisode) : undefined
  const joined = ep?.companions.map(getCompanion).filter((c) => c != null) ?? []
  const closing = ep ? EPISODE_CLOSING[ep.id] : undefined

  return (
    <div className="reward-screen">
      <span className="reward-kicker">새 동행</span>
      <h2 className="reward-title serif">
        {joined.length > 0 ? `${joined[0]!.name}, 함께 걷다` : '한 걸음 더'}
      </h2>

      {joined.map((c, i) => (
        <motion.div
          key={c!.id}
          className="companion-card"
          initial={{ opacity: 0, y: 26, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15 + i * 0.12, duration: 0.5, ease: 'easeOut' }}
        >
          <div className={`orb orb-${c!.tone}`} aria-hidden />
          <div className="nm">{c!.name}</div>
          <div className="role">{c!.role}</div>
          <div className="desc">{c!.desc}</div>
          <div className="skill">
            <b>능력</b> · {c!.skill}
          </div>
        </motion.div>
      ))}

      {closing && (
        <p className="reward-verse">
          {closing.line}
          <span className="ref">{closing.ref}</span>
        </p>
      )}

      <div className="reward-actions">
        <button className="btn-primary" onClick={() => setScreen('map')}>
          여정으로
        </button>
        <button className="btn-ghost" onClick={() => setScreen('collection')}>
          사람들 보기
        </button>
      </div>
    </div>
  )
}
