import { useEffect, useState } from 'react'
import { useNav } from '../store'
import { usePilgrim } from '../state/pilgrim'
import { useRun } from '../state/run'
import { courseById, STATIONS, progressOf } from '../data/journey'
import { featuredVerse, SCRIPTURE_ATTRIBUTION } from '../data/scripture'
import { fmtDistance, unitLabel } from '../lib/format'
import { toneOf } from '../lib/mood'
import { SummaryTriple, SplitBars, SectionLabel } from '../components/ui'
import { arcIcon, IconShare, IconReached } from '../components/icons'
import { heroArt } from '../assets/art'

export default function Reveal() {
  const go = useNav((s) => s.go)
  const units = usePilgrim((s) => s.units)
  const run = useRun()
  const { courseId, startKm, distanceKm, elapsedSec, splits, reachedThisRun, prayerFor } = run
  const course = courseById(courseId)!

  const [shown, setShown] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setShown(true), 80)
    return () => window.clearTimeout(id)
  }, [])

  const primaryId = reachedThisRun[reachedThisRun.length - 1]
  const station = primaryId ? STATIONS[primaryId] : undefined
  const tone = toneOf(station?.mood ?? 'everyday')
  const celebrate = tone.celebrate
  const v = station ? featuredVerse(station) : undefined

  const cumulative = startKm + distanceKm
  const prog = progressOf(course, cumulative)
  const ordinal = prog.reached // 지금까지 닿은 총 자리 수
  const avgPace = distanceKm > 0 ? elapsedSec / distanceKm : 0

  const leave = () => {
    useRun.getState().reset()
    go('home')
  }

  const [shared, setShared] = useState(false)
  const share = async () => {
    // 프라이버시: GPS 경로·좌표·기도내용은 절대 포함하지 않는다. 자리·성구·거리만.
    const line = station && v ? `“${v.text}” — ${v.refLatin}` : ''
    const text = station
      ? `THE WAY · ${station.place}에 닿았습니다 (${fmtDistance(distanceKm, units)}${units})\n${line}`
      : `THE WAY · 오늘 ${fmtDistance(distanceKm, units)}${units}를 걸었습니다`
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'THE WAY', text })
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        setShared(true)
        window.setTimeout(() => setShared(false), 1800)
      }
    } catch {
      /* 사용자 취소 — 무시 */
    }
  }

  const StArc = station ? arcIcon(station.mood === 'lament' ? 'passion' : station.arc) : IconReached

  return (
    <div className="relative flex flex-1 flex-col overflow-y-auto bg-sand text-ink">
      {/* 장면 — 자리 아트(얼굴 없는 실루엣) + 리빌 페이드 */}
      <div className="relative h-[42%] min-h-[280px] w-full overflow-hidden">
        <img
          src={heroArt(course.hero)}
          alt={station?.place ?? course.name}
          className="h-full w-full object-cover transition-all duration-[1400ms] ease-out"
          style={{ transform: shown ? 'scale(1)' : 'scale(1.08)', opacity: shown ? 1 : 0.2, filter: celebrate ? 'none' : 'saturate(0.72)' }}
        />
        <div className="pointer-events-none absolute inset-0" style={{ background: celebrate ? `radial-gradient(60% 50% at 50% 40%, ${tone.glow}, transparent)` : 'none' }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28" style={{ background: 'linear-gradient(to top, var(--color-sand), transparent)' }} />
      </div>

      <div className="relative z-10 flex flex-1 flex-col px-8 pt-4" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
        {station ? (
          <>
            <div className="flex items-center gap-2" style={{ color: tone.accent }}>
              <StArc size={17} />
              <p className="font-display text-[12px] uppercase tracking-[0.22em]">{celebrate ? `${ordinal}번째 자리 · 닿았습니다` : '이 자리를 지나며'}</p>
            </div>
            <h1 className="mt-2.5 font-serif text-[36px] font-bold leading-[1.1]">{station.place}</h1>
            <p className="mt-1 font-serif text-[16px] text-ink-soft">{station.title}</p>

            {v && (
              <>
                <p className="mt-6 max-w-[26ch] font-serif text-[18px] leading-[1.72] text-ink">
                  <span className="versal" style={{ color: tone.accent }}>{v.text.slice(0, 1)}</span>{v.text.slice(1)}
                </p>
                <p className="mt-2.5 font-display text-[12px] uppercase tracking-[0.22em]" style={{ color: 'var(--color-clay-deep)' }}>{v.refLatin}</p>
              </>
            )}

            <p className="mt-6 max-w-[32ch] text-[14px] leading-relaxed text-ink-soft">{station.reflection}</p>
            <p className="mt-3 text-[12.5px] text-muted">기도 · {station.prayer}</p>
          </>
        ) : (
          <>
            <SectionLabel>오늘의 길</SectionLabel>
            <h1 className="mt-2.5 font-serif text-[32px] font-bold leading-[1.1]">여기까지 따라왔습니다</h1>
            <p className="mt-4 max-w-[30ch] text-[14px] leading-relaxed text-ink-soft">다음 자리까지 <span className="font-display text-clay-deep" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>{fmtDistance(prog.toNextKm, units)}{units}</span> 남았습니다. 길은 언제나 여기 있어요.</p>
          </>
        )}

        {prayerFor && (
          <p className="mt-5 rounded-xl bg-sand-raised/60 px-4 py-3 text-[13px] text-ink-soft">오늘 <span className="text-rubric">{prayerFor}</span>를 품고 {fmtDistance(distanceKm, units)}{units}를 걸었습니다.</p>
        )}

        {/* 런 요약 — celebrate일 때만 강조(lament는 rest 변형) */}
        {celebrate ? (
          <div className="mt-7 rounded-2xl border border-line bg-sand-raised/40 p-5">
            <SummaryTriple distance={fmtDistance(distanceKm, units)} unit={unitLabel(units)} durationSec={elapsedSec} paceSec={avgPace} units={units} />
            {splits.length > 1 && (
              <div className="mt-5 border-t border-line pt-4">
                <p className="mb-3 text-[11px] tracking-[0.1em] text-muted">구간 스플릿</p>
                <SplitBars splits={splits} units={units} />
              </div>
            )}
            {reachedThisRun.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                {reachedThisRun.map((id) => (
                  <span key={id} className="flex items-center gap-1.5 rounded-full bg-sand-sunk px-3 py-1.5 text-[12px] text-ink-soft">
                    <IconReached size={14} className="text-olive-deep" />{STATIONS[id].place}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="mt-7 text-[13px] leading-relaxed text-muted">오늘은 세지 않습니다. 다만 이 길을 함께 걸었습니다.</p>
        )}

        <div className="flex-1 min-h-6" />

        <p className="mb-3 mt-6 text-[10.5px] tracking-[0.04em] text-muted">{SCRIPTURE_ATTRIBUTION}</p>
        <div className="flex gap-3">
          <button onClick={share} className="relative flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-line-strong text-ink-soft transition active:scale-95" aria-label="공유">
            <IconShare size={20} />
            {shared && <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] text-sand">복사됨</span>}
          </button>
          <button onClick={leave} className="flex-1 rounded-2xl bg-clay py-4 text-center font-serif text-[17px] text-sand-raised shadow-[0_1px_2px_rgba(192,90,48,.25),0_16px_36px_-18px_rgba(156,69,34,.55)] transition active:scale-[0.99]">
            계속 걷기
          </button>
        </div>
      </div>
    </div>
  )
}
