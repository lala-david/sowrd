import { useEffect, useRef, useState } from 'react'
import { useNav } from '../store'
import { usePilgrim } from '../state/pilgrim'
import { useRun } from '../state/run'
import { courseById, progressOf } from '../data/journey'
import { fmtDistance, fmtDuration, fmtPace, unitLabel, paceUnitLabel, paceSecPerKm } from '../lib/format'
import { toneOf } from '../lib/mood'
import { LAMP_VERSE } from '../data/scripture'
import { IconLamp, IconCairn, IconLocked, IconStep } from '../components/icons'

/* THE LAMP — "밤의 순례길 · 등불"(dark). 시119:105 "주의 말씀은 내 발에 등이요…"
 * 거리가 곧 앞으로 나아가는 등불. 다음 자리는 어둠에 봉인(멈춰야 열림).
 * 프로토타입: 실제 GPS 대신 시간압축 시뮬레이션 — pace는 사실적으로 유지. */
const DEMO_SPEED = 26 // 실 1초 = 시뮬 26초(데모용). 실 GPS 연동 시 1로.
const BASE_PACE = 335 // 초/km (약 5'35")

export default function Run() {
  const go = useNav((s) => s.go)
  const units = usePilgrim((s) => s.units)
  const run = useRun()
  const { status, courseId, startKm, distanceKm, elapsedSec, flashAt, lastReached } = run
  const course = courseById(courseId)!

  const [locked, setLocked] = useState(false)
  const [breathIn, setBreathIn] = useState(true)
  const tRef = useRef<number | null>(null)

  // 시작
  useEffect(() => {
    if (status === 'idle') run.start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 시뮬레이션 틱
  useEffect(() => {
    if (status !== 'running') return
    const id = window.setInterval(() => {
      const t = (tRef.current = (tRef.current ?? 0) + 0.12)
      const jitter = Math.sin(t * 0.4) * 22 + Math.sin(t * 1.3) * 10
      const pace = BASE_PACE + jitter
      useRun.getState().tick(0.12 * DEMO_SPEED, pace)
    }, 120)
    return () => window.clearInterval(id)
  }, [status])

  // 호흡 기도 사이클(들숨/날숨 ~4.5s)
  useEffect(() => {
    const id = window.setInterval(() => setBreathIn((b) => !b), 4500)
    return () => window.clearInterval(id)
  }, [])

  // 자리 통과 플래시(2.4s)
  const [flash, setFlash] = useState<string | null>(null)
  useEffect(() => {
    if (flashAt > 0 && lastReached) {
      const st = course.stations.find((s) => s.id === lastReached)
      if (st) setFlash(lastReached)
      const id = window.setTimeout(() => setFlash(null), 2600)
      return () => window.clearTimeout(id)
    }
  }, [flashAt, lastReached, course])

  const cumulative = startKm + distanceKm
  const prog = progressOf(course, cumulative)
  const curPace = paceSecPerKm(distanceKm, elapsedSec)
  const tone = prog.nextStation ? toneOf(prog.nextStation.mood) : toneOf('everyday')

  const stop = () => {
    useRun.getState().finish()
    go('reveal')
  }

  const flashStation = flash ? course.stations.find((s) => s.id === flash) : null
  const flashData = flashStation ? { id: flashStation.id } : null

  return (
    <div
      data-theme="dark"
      className="relative flex flex-1 flex-col bg-sand text-ink"
      style={{ paddingTop: 'max(3rem, env(safe-area-inset-top))', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="pointer-events-none absolute left-1/2 top-[22%] h-[440px] w-[440px] -translate-x-1/2" style={{ background: `radial-gradient(circle, ${tone.glow}, transparent 62%)` }} />

      {/* 자리 통과 플래시 — 상단 골드 라인 + 토스트(멈추면 열림 예고) */}
      <div className={`pointer-events-none absolute inset-x-0 top-0 z-30 transition-opacity duration-500 ${flash ? 'opacity-100' : 'opacity-0'}`}>
        <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, transparent, var(--color-sun-bright), transparent)' }} />
        {flashData && (
          <div className="mx-auto mt-3 w-fit rounded-full bg-black/30 px-4 py-1.5 text-[12px] text-sun-bright backdrop-blur-[2px]">
            자리에 닿았습니다 · 멈추면 열립니다
          </div>
        )}
      </div>

      {/* 상단: 자리 + 러닝 표시 */}
      <div className="relative z-10 flex items-center justify-between px-7">
        <div>
          <p className="text-[11px] tracking-[0.14em] text-sun-deep">{course.name}</p>
          <p className="mt-0.5 font-serif text-[16px] text-ink">{prog.nextStation ? `${prog.nextStation.place}로` : '완주를 향해'}</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-sun" style={{ animation: status === 'running' ? 'glow 2s ease-in-out infinite' : 'none' }} />
          {status === 'paused' ? '멈춤' : '달리는 중'}
        </div>
      </div>

      {/* HERO — 거리는 등불 */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-7">
        <div className="flex items-baseline font-display text-sun" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          <span className="text-[112px] font-medium leading-none" style={{ textShadow: '0 0 48px rgba(236,192,105,.42)' }}>{fmtDistance(distanceKm, units)}</span>
          <span className="ml-3 text-[30px] text-sun-deep">{unitLabel(units)}</span>
        </div>

        {/* 위성 지표 — 시간 · 현재 페이스 · 평균(NRC 위계) */}
        <div className="mt-6 flex items-center gap-6 font-display text-muted" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          <Metric big={fmtDuration(elapsedSec)} small="시간" />
          <span className="h-8 w-px bg-line" />
          <Metric big={fmtPace(curPace, units)} small={`현재 ${paceUnitLabel(units)}`} />
        </div>

        {/* 등불 구절 시119:105 */}
        <p className="mt-8 max-w-[24ch] text-center font-serif text-[13.5px] leading-[1.7] text-ink-soft/90">{LAMP_VERSE.kr}</p>

        {/* 다음 자리 게이지 */}
        <div className="mt-9 w-full max-w-[300px]">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-muted">{prog.nextStation ? '다음 자리까지' : '완주까지'}</span>
            <span className="font-display text-sun" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>{fmtDistance(prog.toNextKm, units)} {unitLabel(units).toLowerCase()}</span>
          </div>
          <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-sun transition-[width] duration-300" style={{ width: `${prog.segProgress * 100}%` }} />
          </div>
        </div>

        {/* 호흡 기도(예수기도) — 발걸음에 실어 */}
        <div className="mt-8 h-5 text-center">
          <p className="text-[12.5px] tracking-[0.06em] text-muted transition-opacity duration-700" style={{ opacity: 0.9 }}>
            {breathIn ? '들숨 · 주 예수 그리스도여' : '날숨 · 저를 불쌍히 여기소서'}
          </p>
        </div>
      </div>

      {/* 컨트롤: 잠금 · 멈춤 · (일시정지) */}
      <div className="relative z-10 flex items-end justify-center gap-8 px-7">
        <button onClick={() => setLocked((v) => !v)} className={`flex h-12 w-12 items-center justify-center rounded-full border transition active:scale-95 ${locked ? 'border-sun text-sun' : 'border-line-strong text-muted'}`} aria-label="화면 잠금">
          <IconLocked size={19} />
        </button>

        <div className="flex flex-col items-center">
          <button
            onClick={stop}
            disabled={locked}
            className={`flex h-[80px] w-[80px] items-center justify-center rounded-full border-2 border-sun text-sun transition active:scale-95 ${locked ? 'opacity-30' : ''}`}
            aria-label="멈추기"
          >
            <IconCairn size={30} />
          </button>
          <p className="mt-2.5 text-[11.5px] text-muted">{locked ? '잠김 — 왼쪽 자물쇠 해제' : '멈추면 자리가 열립니다'}</p>
        </div>

        <button
          onClick={() => (status === 'paused' ? useRun.getState().resume() : useRun.getState().pause())}
          disabled={locked}
          className={`flex h-12 w-12 items-center justify-center rounded-full border border-line-strong text-muted transition active:scale-95 ${locked ? 'opacity-30' : ''}`}
          aria-label={status === 'paused' ? '다시 시작' : '일시정지'}
        >
          {status === 'paused' ? <IconStep size={19} /> : <IconLamp size={19} />}
        </button>
      </div>
    </div>
  )
}

function Metric({ big, small }: { big: string; small: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[19px] text-ink-soft">{big}</span>
      <span className="mt-1 text-[10.5px] tracking-[0.08em]">{small}</span>
    </div>
  )
}
