import { useGame } from '../state/store'

export function TitleScreen() {
  const setScreen = useGame((s) => s.setScreen)
  const hasSave = useGame((s) => s.completed.length > 0 || s.companions.length > 0)

  return (
    <div className="title-screen">
      <div className="title-moon pulse" aria-hidden />
      <h1 className="title-name">동행</h1>
      <p className="title-sub">The Gospel Road — 그분과 함께 걷는 3년</p>

      <p className="title-verse">
        “빛이 어둠에 비치되
        <br />
        어둠이 깨닫지 못하더라.”
        <span className="ref">요한복음 1:5</span>
      </p>

      <div className="title-actions">
        {/* 이어하기 원탭 — 재진입 3초 내 복귀 (ENGAGEMENT §6) */}
        <button className="btn-primary" onClick={() => setScreen('map')}>
          {hasSave ? '이어서 걷기' : '여정을 시작하다'}
        </button>
        {hasSave && (
          <button className="btn-ghost" onClick={() => setScreen('collection')}>
            함께 걷는 사람들
          </button>
        )}
      </div>
    </div>
  )
}
