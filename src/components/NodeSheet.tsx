import { useEffect, useRef, useState } from 'react'
import type { Journey } from '../data/geo/journeys'
import { tierOfEpisode, scaleOf } from '../data/geo/journeys'
import type { BoardNode } from '../lib/board'
import { ROMAN } from '../lib/board'
import { celebrationAllowed } from '../lib/quest'
import { episodeArt, sealArt } from '../assets/art'
import { IconArrow, IconLocked, IconScroll, IconSeal, IconStep } from './icons'

/* ── 자리 시트 ──────────────────────────────────────────────────────────────
 *
 * 보드의 자리를 누르면 올라오는 카드. 이 자리가 무엇인지, 내가 여기 닿았는지, 닿았다면
 * 언제인지, 아니면 얼마나 남았는지 — 그리고 **말씀**.
 *
 * 보상은 말씀이다. 닿은 자리에서는 그 자리에서 받은 말씀이 카드의 한가운데 놓이고 인장이
 * 찍혀 있다. 아직 닿지 않은 자리에서도 본문은 그대로 열린다(거리가 성경을 여는 열쇠가 되면
 * 공로주의가 된다 — PCK 검증). 거리로 열리는 것은 그림의 색과 인장뿐이다. */

export default function NodeSheet({
  journey,
  node,
  units,
  reachedAt,
  onClose,
  onRead,
  onRun,
}: {
  journey: Journey
  node: BoardNode
  units: string
  reachedAt?: number
  onClose: () => void
  onRead: () => void
  onRun?: () => void
}) {
  const { ep, state } = node
  const art = episodeArt(journey.id, ep.id)
  const tier = tierOfEpisode(journey, ep)
  const tierIdx = tier ? journey.tiers.findIndex((t) => t.id === tier.id) : -1
  const reached = state === 'reached' || state === 'current'
  const solemn = !celebrationAllowed(ep.mood)
  const seal = sealArt()
  const km = node.realKmAway
  const kmText = km < 10 ? km.toFixed(1) : Math.round(km).toString()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const when = reachedAt ? new Date(reachedAt) : undefined

  /* 아래로 끌어서 닫기 — 앱의 시트는 손가락으로 내린다. 90px 넘게 끌면 닫히고, 아니면 되돌아온다. */
  const [drag, setDrag] = useState(0)
  const startY = useRef<number | null>(null)
  const onDown = (e: React.PointerEvent) => {
    startY.current = e.clientY
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    if (startY.current == null) return
    setDrag(Math.max(0, e.clientY - startY.current))
  }
  const onUp = () => {
    if (startY.current == null) return
    startY.current = null
    if (drag > 90) onClose()
    else setDrag(0)
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={`${ep.place} 자리`}>
      <button aria-label="닫기" onClick={onClose} className="absolute inset-0" style={{ background: 'rgba(30,20,8,.42)' }} />
      <div
        className="sheet-up relative w-full max-w-[440px] overflow-hidden rounded-t-[28px]"
        style={{
          background: 'var(--color-sand-raised)',
          boxShadow: '0 -12px 40px rgba(30,20,8,.35)',
          paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))',
          transform: drag ? `translateY(${drag}px)` : undefined,
          transition: drag ? 'none' : 'transform .28s cubic-bezier(.22,1,.36,1)',
        }}
      >
        {/* 손잡이 — 여기를 잡고 내린다(머리 영역 전체가 손잡이다) */}
        <div
          className="flex cursor-grab touch-none justify-center pb-1 pt-2.5"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <span className="block h-[5px] w-11 rounded-full" style={{ background: 'var(--color-line-strong)' }} />
        </div>

        <div className="flex gap-4 px-6 pt-4">
          {/* 그 자리의 그림 — 닿았으면 색이, 아니면 봉인의 회색 */}
          <span
            className="relative block h-[104px] w-[104px] shrink-0 overflow-hidden rounded-[22px]"
            style={{
              boxShadow:
                state === 'sealed'
                  ? '0 0 0 2px #8c7b60'
                  : state === 'next'
                    ? '0 0 0 2.5px var(--color-lapis)'
                    : `0 0 0 2.5px ${solemn ? '#b9935a' : 'var(--color-seal)'}`,
            }}
          >
            {art && (
              <img
                src={art}
                alt=""
                className="h-full w-full object-cover"
                style={state === 'sealed' ? { filter: 'grayscale(1) brightness(.8)' } : state === 'next' ? { filter: 'saturate(.85)' } : undefined}
              />
            )}
            {state === 'sealed' && (
              <span className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(40,30,60,.32)', color: '#f6ecd6' }}>
                <IconLocked size={22} />
              </span>
            )}
            {reached && seal && (
              <img src={seal} alt="" className={`absolute -bottom-2 -right-2 h-11 w-11 ${solemn ? 'opacity-70' : 'anim-seal'}`} />
            )}
          </span>

          <div className="min-w-0 flex-1">
            {tier && (
              <p className="font-display text-[11px] uppercase tracking-[0.18em] text-muted">
                {ROMAN[tierIdx] ?? tierIdx + 1} · {tier.name}
              </p>
            )}
            <h2 className="mt-1 font-serif text-[22px] font-bold leading-tight text-ink">{ep.place}</h2>
            <p className="mt-0.5 truncate font-display text-[12px] italic text-muted">{ep.placeLatin}</p>
            <p className="mt-0.5 text-[11.5px] text-muted">{ep.region}</p>

            {/* 상태 한 줄 */}
            <p className="mt-2.5 flex items-center gap-1.5 text-[12.5px]">
              {reached ? (
                <>
                  <IconSeal size={13} style={{ color: solemn ? '#8a6a3c' : 'var(--color-sun-deep)' }} />
                  <span className="text-ink-soft">
                    {solemn ? '지나온 자리' : '인장이 찍힌 자리'}
                    {when && (
                      <span className="text-muted">
                        {' · '}
                        {when.getFullYear()}.{String(when.getMonth() + 1).padStart(2, '0')}.{String(when.getDate()).padStart(2, '0')}
                      </span>
                    )}
                  </span>
                </>
              ) : state === 'next' ? (
                <>
                  <IconStep size={13} style={{ color: 'var(--color-lapis)' }} />
                  <span className="text-ink-soft">
                    다음 자리 · <span className="font-display text-clay-deep" style={{ fontFeatureSettings: "'lnum' 1" }}>{kmText}</span>
                    {units} 남았습니다
                  </span>
                </>
              ) : (
                <>
                  <IconLocked size={12} className="text-muted" />
                  <span className="text-muted">
                    아직 봉인 · 여기까지 <span className="font-display" style={{ fontFeatureSettings: "'lnum' 1" }}>{kmText}</span>
                    {units}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* 사건 */}
        <p className="mt-4 px-6 text-[13.5px] leading-relaxed text-ink-soft">{ep.event}</p>
        {/* 거리 — 실측과 내 걸음을 나란히. 걸음을 고른 거리로 진행하되(pace.ts) 실측은 숨기지 않는다 */}
        {ep.measuredSegmentKm != null && ep.measuredSegmentKm > 0 && (
          <p className="mt-2 px-6 text-[11.5px] text-muted">
            앞 자리에서 실측 <span className="font-display" style={{ fontFeatureSettings: "'lnum' 1" }}>{Math.round(ep.measuredSegmentKm).toLocaleString()}</span>km
            {' · '}내 걸음으로 <span className="font-display" style={{ fontFeatureSettings: "'lnum' 1" }}>{(ep.segmentKm / scaleOf(journey.id)).toFixed(1)}</span>
            {units}
          </p>
        )}

        {/* 말씀 — 이 자리의 보상. 본문은 언제나 열려 있다 */}
        <div className="mx-6 mt-4 rounded-2xl px-5 py-4" style={{ background: 'var(--color-sand)', boxShadow: 'inset 0 0 0 1px var(--color-line)' }}>
          <p className="flex items-center gap-1.5 font-display text-[10.5px] uppercase tracking-[0.2em] text-muted">
            <IconScroll size={12} /> {ep.passageRef}
          </p>
          <p className="mt-2 font-serif text-[15px] leading-[1.75] text-ink">{ep.verseKrShort}</p>
        </div>

        <div className="mt-4 flex gap-2.5 px-6">
          <button
            onClick={onRead}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 font-serif text-[15px] transition active:scale-[0.98]"
            style={{ background: 'var(--color-clay-deep)', color: 'var(--color-sand-raised)' }}
          >
            말씀 읽기 <IconArrow size={14} />
          </button>
          {/* 봉인된 자리에서도 달리기로 갈 수 있어야 한다 — 막다른 시트는 없다 */}
          {onRun && !reached && (
            <button
              onClick={onRun}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 font-serif text-[15px] text-ink transition active:scale-[0.98]"
              style={{ background: 'var(--color-seal-bright)' }}
            >
              <IconStep size={15} /> {state === 'next' ? '이 자리로 달리기' : '이 길을 달리기'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
