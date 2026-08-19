import { useCallback, useState } from 'react'
import type { Journey } from '../data/geo/journeys'
import type { Board } from '../lib/board'
import QuestBoard from './QuestBoard'
import { IconCompass } from './icons'

/* ── 보드의 창 ──────────────────────────────────────────────────────────────
 * 홈·여정 상세에 박히는 지도 한 칸. 보드 전체를 그리되 **내가 선 자리** 둘레만 창으로 보인다.
 * 누르면 지도(월드)가 열린다. 창 안의 자리는 누를 수 없다 — 작은 창에 버튼을 겹쳐 놓으면
 * 오탭만 는다. 창 전체가 버튼 하나다. */
export default function BoardWindow({
  journey,
  journeyKm,
  height = 300,
  onOpen,
  className = '',
  caption,
  fromKm,
}: {
  journey: Journey
  journeyKm: number
  height?: number
  onOpen: () => void
  className?: string
  /** 창 아래 왼쪽에 얹는 한 줄(예: "가버나움까지 3.2km") */
  caption?: string
  /** 리빌: 오늘 출발한 여정 km — 거기서부터 말이 걸어온다 */
  fromKm?: number
}) {
  const [shift, setShift] = useState(0)
  const onBoard = useCallback(
    (board: Board, scale: number) => {
      const anchor = board.next ?? board.current ?? board.nodes[0]
      if (!anchor) return
      setShift(Math.max(0, Math.min(board.height * scale - height, anchor.y * scale - height * 0.5)))
    },
    [height],
  )

  return (
    <button
      onClick={onOpen}
      aria-label={`${journey.name} 지도 열기`}
      className={`relative block w-full overflow-hidden rounded-[28px] text-left transition active:scale-[0.995] ${className}`}
      style={{ height, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.5), 0 1px 2px rgba(80,60,30,.12), 0 18px 36px -22px rgba(80,60,30,.55)' }}
    >
      <div className="pointer-events-none absolute left-0 top-0 w-full" style={{ transform: `translateY(${-shift}px)`, transition: 'transform 600ms cubic-bezier(.22,1,.36,1)' }}>
        <QuestBoard journey={journey} journeyKm={journeyKm} onBoard={onBoard} fromKm={fromKm} />
      </div>
      {/* 위아래 가장자리는 종이로 녹는다 */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-12" style={{ background: 'linear-gradient(to bottom, rgba(247,236,213,.55), transparent)' }} />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-16" style={{ background: 'linear-gradient(to top, rgba(247,236,213,.75), transparent)' }} />
      <span className="pointer-events-none absolute inset-0 rounded-[28px]" style={{ boxShadow: 'inset 0 0 0 1px rgba(90,58,18,.18), inset 0 0 40px rgba(90,58,18,.12)' }} />

      {caption && (
        <span className="absolute bottom-3.5 left-4 rounded-full px-3 py-1.5 font-serif text-[12.5px] text-ink" style={{ background: 'rgba(251,241,220,.92)', boxShadow: '0 2px 8px rgba(60,40,18,.2)' }}>
          {caption}
        </span>
      )}
      <span className="absolute bottom-3.5 right-4 flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] text-ink-soft" style={{ background: 'rgba(251,241,220,.92)', boxShadow: '0 2px 8px rgba(60,40,18,.2)' }}>
        <IconCompass size={12} /> 지도 펼치기
      </span>
    </button>
  )
}
