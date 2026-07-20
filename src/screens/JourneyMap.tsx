import { useEffect, useState } from 'react'
import { EPISODES } from '../content/episodes'
import { useGame } from '../state/store'

export function JourneyMap() {
  const { completed, companions, enterEpisode, setScreen } = useGame()
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 1800)
    return () => clearTimeout(t)
  }, [toast])

  const totalCompanions = 12

  const onTap = (id: string, playable: boolean, done: boolean) => {
    if (playable) {
      enterEpisode(id)
      return
    }
    // 부드러운 안내 — 좌절 없는 잠금 (Nielsen: 오류 예방)
    setToast(done ? '이미 걸어온 길입니다' : '아직 준비 중인 장입니다')
  }

  return (
    <div className="map-screen">
      <header className="map-head">
        <div className="hi">동행 중 · 3년의 여정</div>
        <div className="where serif">갈릴리 호숫가</div>
        <div className="map-pills">
          <span className="pill">
            👥 {companions.length} / {totalCompanions}
          </span>
          <span className="pill">
            ✦ {completed.length} / {EPISODES.length}장
          </span>
        </div>
      </header>

      <div className="ep-list">
        {EPISODES.map((ep) => {
          const done = completed.includes(ep.id)
          const current = ep.playable && !done
          const cls = done ? 'done' : current ? 'current' : 'locked'
          return (
            <button
              key={ep.id}
              className={`ep-row ${cls}`}
              onClick={() => onTap(ep.id, ep.playable, done)}
            >
              <span className="no">{done ? '✦' : ep.no}</span>
              <span>
                <span className="t serif">{ep.title}</span>
                <br />
                <span className="s">{ep.subtitle}</span>
              </span>
              <span className={`verb-tag verb-${ep.verb}`}>{ep.verb}</span>
            </button>
          )
        })}
      </div>

      {toast && <div className="toast">{toast}</div>}

      {/* 엄지 존 하단 내비 (ENGAGEMENT §1) */}
      <nav className="bottom-nav">
        <button className="nav-btn active">여정</button>
        <button className="nav-btn" onClick={() => setScreen('collection')}>
          사람들 ({companions.length})
        </button>
      </nav>
    </div>
  )
}
