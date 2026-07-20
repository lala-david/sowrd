import { COMPANIONS } from '../content/companions'
import { EPISODES } from '../content/episodes'
import { useGame } from '../state/store'

/** 이 동료가 합류하는 장 번호 (목표 구배: "n장에서" 힌트) */
function joinEpisodeNo(companionId: string): number | null {
  const ep = EPISODES.find((e) => e.companions.includes(companionId))
  return ep ? ep.no : null
}

export function CollectionScreen() {
  const { companions, setScreen } = useGame()

  return (
    <div className="coll-screen">
      <header className="map-head">
        <div className="hi">사람 스크랩북</div>
        <div className="where serif">함께 걷는 사람들</div>
        <div className="map-pills">
          {/* 목표 구배 효과 — 채워지는 세트 (ENGAGEMENT §5) */}
          <span className="pill">
            모은 이야기 · {companions.length} / {COMPANIONS.length}
          </span>
        </div>
      </header>

      <div className="coll-grid">
        {COMPANIONS.map((c) => {
          const owned = companions.includes(c.id)
          const epNo = joinEpisodeNo(c.id)
          return (
            <div key={c.id} className={`coll-card ${owned ? '' : 'locked'}`}>
              <span className={`orb orb-${c.tone}`} aria-hidden />
              <span className="nm">{owned ? c.name : '???'}</span>
              <span className="rl">
                {owned ? c.role : epNo ? `${epNo}장에서 만납니다` : '언젠가, 길 위에서'}
              </span>
            </div>
          )
        })}
      </div>

      <nav className="bottom-nav">
        <button className="nav-btn" onClick={() => setScreen('map')}>
          여정
        </button>
        <button className="nav-btn active">사람들 ({companions.length})</button>
      </nav>
    </div>
  )
}
