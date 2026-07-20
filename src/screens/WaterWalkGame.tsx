import { useEffect, useRef, useState } from 'react'
import { useGame } from '../state/store'

/**
 * 8장 "내게로 오라" — 균형/집중 미니게임 (GDD §5, §7)
 *
 * 주제를 기계장치가 짊어진다:
 *  - 길게 누르면 빛을 향해 걷는다 (믿음 = 나아감)
 *  - 물결이 밀려올 땐 손을 떼고 숨을 고른다 (분별)
 *  - 집중이 다하면 가라앉는다 — 그러나 실패조차 따뜻하게 (마 14:31)
 *
 * Flow 3조건: 명확한 목표 · 즉각 피드백 · 도전-실력 균형(관대 모드)
 */

type Phase = 'intro' | 'playing' | 'clear' | 'fail'
type WaveState = 'calm' | 'warn' | 'wave'

const WALK_SPEED = 7.5 // %/s
const FOCUS_DRAIN_HOLD = 3.2
const FOCUS_REGEN = 17
const FOCUS_DRAIN_WAVE = 55 // 파도 중에 계속 누르고 있으면

export function WaterWalkGame() {
  const { completeEpisode, setScreen, gentleMode, toggleGentleMode } = useGame()

  const [phase, setPhase] = useState<Phase>('intro')
  const [progress, setProgress] = useState(0)
  const [focus, setFocus] = useState(100)
  const [waveState, setWaveState] = useState<WaveState>('calm')
  const [holding, setHolding] = useState(false)
  const [fails, setFails] = useState(0)

  const sim = useRef({
    progress: 0,
    focus: 100,
    holding: false,
    wave: 'calm' as WaveState,
    waveTimer: 0, // 현재 wave 상태의 남은 시간(ms)
    nextWaveIn: 4200, // 다음 물결까지(ms)
    last: 0,
  })
  const phaseRef = useRef<Phase>('intro')
  phaseRef.current = phase

  const start = () => {
    const s = sim.current
    s.progress = 0
    s.focus = 100
    s.wave = 'calm'
    s.nextWaveIn = 4200
    s.last = 0
    setProgress(0)
    setFocus(100)
    setWaveState('calm')
    setPhase('playing')
  }

  useEffect(() => {
    let raf = 0

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (phaseRef.current !== 'playing') return

      const s = sim.current
      if (s.last === 0) s.last = now
      const dt = Math.min((now - s.last) / 1000, 0.05)
      s.last = now

      const warnMs = gentleMode ? 1900 : 1100
      const waveMs = gentleMode ? 800 : 1000

      // 물결 사이클
      if (s.wave === 'calm') {
        s.nextWaveIn -= dt * 1000
        if (s.nextWaveIn <= 0) {
          s.wave = 'warn'
          s.waveTimer = warnMs
        }
      } else {
        s.waveTimer -= dt * 1000
        if (s.waveTimer <= 0) {
          if (s.wave === 'warn') {
            s.wave = 'wave'
            s.waveTimer = waveMs
          } else {
            s.wave = 'calm'
            s.nextWaveIn = 4200 + Math.random() * 3200
          }
        }
      }

      // 걷기 & 집중
      if (s.holding) {
        s.progress += WALK_SPEED * dt
        const drain =
          s.wave === 'wave'
            ? (gentleMode ? FOCUS_DRAIN_WAVE * 0.6 : FOCUS_DRAIN_WAVE)
            : FOCUS_DRAIN_HOLD
        s.focus -= drain * dt
      } else {
        s.focus = Math.min(100, s.focus + FOCUS_REGEN * dt)
      }

      // 판정
      if (s.progress >= 100) {
        s.progress = 100
        setPhase('clear')
      } else if (s.focus <= 0) {
        s.focus = 0
        setFails((f) => f + 1)
        setPhase('fail')
      }

      setProgress(s.progress)
      setFocus(s.focus)
      setWaveState(s.wave)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [gentleMode])

  const hold = (v: boolean) => {
    sim.current.holding = v
    setHolding(v)
  }

  // 메시지 — 시스템 상태 가시성 (Nielsen)
  let msg: React.ReactNode = '시선을 빛에 고정하세요'
  if (waveState === 'warn') msg = <span className="warn">먼 곳에서 물결이 밀려온다…</span>
  else if (waveState === 'wave') msg = <span className="warn">🌊 파도! 잠시 숨을 고르세요</span>
  else if (focus < 30) msg = '흔들린다…'

  // 베드로 위치: 진행할수록 빛(달)을 향해 멀어진다
  const peterBottom = 18 + progress * 0.3
  const peterScale = 1 - progress * 0.0035

  return (
    <div
      className="water-screen"
      onPointerDown={(e) => {
        e.preventDefault()
        if (phase === 'playing') hold(true)
      }}
      onPointerUp={() => hold(false)}
      onPointerLeave={() => hold(false)}
      onPointerCancel={() => hold(false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <button
        className="water-exit"
        aria-label="여정으로 돌아가기"
        onClick={(e) => {
          e.stopPropagation()
          setScreen('map')
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        ←
      </button>

      <div className="water-moon pulse" aria-hidden />
      <div className="water-reflect" aria-hidden />
      <div className="water-sea" aria-hidden />

      {phase === 'playing' && <div className="water-msg">{msg}</div>}

      <div
        className="peter-figure"
        style={{
          bottom: `${peterBottom}%`,
          transform: `translateX(-50%) scale(${peterScale})`,
        }}
        aria-hidden
      />
      <div
        className="peter-ripple"
        style={{ bottom: `${peterBottom - 2}%`, transform: 'translateX(-50%)' }}
        aria-hidden
      />

      <div className="water-hud">
        <div className="hud-labels">
          <span>집중</span>
          <b>{Math.round(focus)}%</b>
        </div>
        {/* 색+숫자 이중 부호화 (접근성) */}
        <div className={`meter ${focus < 30 ? 'focus-low' : ''}`}>
          <i style={{ width: `${focus}%` }} />
        </div>
        <div className="hud-labels" style={{ marginTop: 10 }}>
          <span>그분까지</span>
          <b>{Math.round(100 - progress)} 걸음</b>
        </div>
        <div className="meter">
          <i style={{ width: `${progress}%` }} />
        </div>
        <div className={`hold-hint ${holding ? 'holding' : ''}`}>
          {holding ? '걷는 중…' : '길게\n누르기'}
        </div>
      </div>

      {phase === 'intro' && (
        <div className="water-overlay">
          <h2 className="serif">물 위를 걷다</h2>
          <p>
            화면을 <b style={{ color: 'var(--lamp-soft)' }}>길게 누르면</b> 빛을 향해
            걸어갑니다. 물결이 밀려올 땐 잠시 손을 떼고 숨을 고르세요.
            <br />
            빛에서 눈을 떼지 마세요.
          </p>
          <button className="btn-primary" onClick={start} onPointerDown={(e) => e.stopPropagation()}>
            배에서 내리다
          </button>
          <label className="gentle-row" onPointerDown={(e) => e.stopPropagation()}>
            <input type="checkbox" checked={gentleMode} onChange={toggleGentleMode} />
            잔잔한 물결 (여유 있게 플레이)
          </label>
        </div>
      )}

      {phase === 'fail' && (
        <div className="water-overlay">
          <h2 className="serif">가라앉는다 —</h2>
          <p className="verse">
            “예수께서 즉시 손을 내밀어
            <br />
            그를 붙잡으시며”
          </p>
          <p style={{ fontSize: 12.5, marginTop: -16 }}>마태복음 14:31 · 실패해도 잃는 것은 없습니다</p>
          <button className="btn-primary" onClick={start} onPointerDown={(e) => e.stopPropagation()}>
            다시 걷기
          </button>
          {fails >= 2 && !gentleMode && (
            <label className="gentle-row" onPointerDown={(e) => e.stopPropagation()}>
              <input type="checkbox" checked={gentleMode} onChange={toggleGentleMode} />
              잔잔한 물결로 바꿀까요?
            </label>
          )}
        </div>
      )}

      {phase === 'clear' && (
        <div className="water-overlay">
          <h2 className="serif">그 손이 붙잡았다</h2>
          <p className="verse">
            “바람을 보고 무서워 빠져 갈 때에
            <br />
            즉시 손을 내밀어 붙잡으시며”
          </p>
          <button
            className="btn-primary"
            onClick={() => completeEpisode('ep08', ['peter'])}
            onPointerDown={(e) => e.stopPropagation()}
          >
            손을 잡다
          </button>
        </div>
      )}
    </div>
  )
}
