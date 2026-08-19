import { useCallback, useEffect, useRef, useState } from 'react'
import { useNav } from '../store'
import { usePilgrim, journeyKmOf } from '../state/pilgrim'
import { useRun } from '../state/run'
import { journeyById, JOURNEYS, toJourneyKm, toRealKm, JOURNEY_CHROME } from '../data/geo/journeys'
import { questNow } from '../lib/quest'
import { BOARD_W, ROMAN, type Board, type BoardNode } from '../lib/board'
import QuestBoard from '../components/QuestBoard'
import NodeSheet from '../components/NodeSheet'
import { IconArrow, IconSeal, IconLocked, IconPilgrim } from '../components/icons'
import { journeyFigure } from '../assets/art'

/* ── 지도 화면 = 월드 ───────────────────────────────────────────────────────
 *
 * 화면 전체가 보드다. 위에서 아래로 내려가며 장이 바뀌고 땅이 바뀐다.
 * 열면 **내가 선 자리**로 스크롤돼 있다 — 이 앱을 여는 이유가 "내가 어디쯤 왔나"이므로.
 *
 *   · 위 고정 머리: 여정 이름 · 지금 걷는 장 · 자리 n/N
 *   · 그 아래 장 칩: 누르면 그 장으로 스크롤한다(보기를 바꾸는 게 아니라 **이동**한다 —
 *     전체와 장이 따로 놀던 예전 구조는 장과 장이 이어지지 않았다)
 *   · 자리 탭 → 시트(그림·상태·말씀·읽기·달리기)
 *   · 현재 자리가 화면 밖이면 "지금 자리로" 버튼이 뜬다 */
export default function JourneyMap() {
  const go = useNav((s) => s.go)
  const journeyId = useNav((s) => s.journeyId)
  const openEpisode = useNav((s) => s.openEpisode)
  const configure = useRun((s) => s.configure)
  const pilgrim = usePilgrim()

  const journey = (journeyId ? journeyById(journeyId) : undefined) ?? journeyById(pilgrim.activeJourneyId) ?? JOURNEYS[0]
  const km = toJourneyKm(journey.id, journeyKmOf(pilgrim, journey.id))
  const q = questNow(journey, km)
  const chrome = JOURNEY_CHROME[journey.id]
  const figure = journeyFigure(journey.id)

  const boardRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<{ board: Board; scale: number } | null>(null)
  const [selected, setSelected] = useState<BoardNode | null>(null)
  const [activeTier, setActiveTier] = useState(0)
  const [showJump, setShowJump] = useState(false)
  const didCenter = useRef(false)

  const onBoard = useCallback((board: Board, scale: number) => setLayout({ board, scale }), [])

  /* 핀치 줌 — 네이티브 touch 리스너(passive:false)로 두 손가락 거리 비율을 읽는다 */
  const [zoom, setZoom] = useState(1)
  useEffect(() => {
    const el = boardRef.current
    if (!el) return
    let startDist = 0
    let startZoom = 1
    const dist = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)
    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        startDist = dist(e.touches)
        startZoom = zoom
      }
    }
    const onMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && startDist > 0) {
        e.preventDefault()
        const z = Math.max(1, Math.min(2, startZoom * (dist(e.touches) / startDist)))
        setZoom(Math.round(z * 100) / 100)
      }
    }
    const onEnd = () => {
      startDist = 0
    }
    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd)
    el.addEventListener('touchcancel', onEnd)
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onEnd)
    }
  }, [zoom])

  /** 보드 좌표(논리 px) → 문서 y */
  const docY = (boardY: number) => {
    const el = boardRef.current
    if (!el || !layout) return 0
    return el.getBoundingClientRect().top + window.scrollY + boardY * layout.scale
  }
  const HEADER = 116

  const scrollToBoardY = (y: number, behavior: ScrollBehavior = 'smooth') => {
    window.scrollTo({ top: Math.max(0, docY(y) - HEADER), behavior })
  }
  const centerOn = (y: number, behavior: ScrollBehavior = 'smooth') => {
    window.scrollTo({ top: Math.max(0, docY(y) - window.innerHeight * 0.46), behavior })
  }

  /* 열자마자 내가 선 자리로 */
  useEffect(() => {
    if (!layout || didCenter.current) return
    const anchor = layout.board.next ?? layout.board.current ?? layout.board.nodes[0]
    if (!anchor) return
    didCenter.current = true
    // 레이아웃이 자리 잡은 다음 프레임에 — 첫 프레임엔 getBoundingClientRect가 0일 수 있다
    requestAnimationFrame(() => centerOn(anchor.y, 'auto'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout])

  /* 스크롤에 따라 — 지금 보이는 장, 현재 자리가 화면 안에 있는지 */
  useEffect(() => {
    if (!layout) return
    const onScroll = () => {
      const el = boardRef.current
      if (!el) return
      const top = el.getBoundingClientRect().top
      const probe = (window.innerHeight * 0.42 - top) / layout.scale
      const p = layout.board.panels.find((pp) => probe >= pp.y && probe < pp.y + pp.height)
      if (p) setActiveTier(p.tierIndex)
      const anchor = layout.board.next ?? layout.board.current
      if (anchor) {
        const ay = top + anchor.y * layout.scale
        setShowJump(ay < HEADER + 20 || ay > window.innerHeight - 40)
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [layout])

  /* 지금 보는 장의 칩이 보이게 칩 줄만 가로로 민다.
     scrollIntoView를 썼더니 조상 요소(문서 자체)까지 옆으로 밀어서 폰에서 화면이 오른쪽으로
     튀었다. 칩 컨테이너의 scrollLeft만 직접 움직인다. */
  const chipsRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const host = chipsRef.current
    const el = host?.querySelector<HTMLElement>(`[data-tier="${activeTier}"]`)
    if (!host || !el) return
    const target = el.offsetLeft - (host.clientWidth - el.offsetWidth) / 2
    host.scrollTo({ left: Math.max(0, target), behavior: 'smooth' })
  }, [activeTier])

  const back = () => {
    if (window.history.length > 1) window.history.back()
    else go('home')
  }

  const runToward = () => {
    pilgrim.setActiveJourney(journey.id)
    configure({ mode: 'guided', courseId: pilgrim.activeCourseId, journeyId: journey.id })
    go('run')
  }

  return (
    <div className="relative flex flex-1 flex-col" style={{ background: '#efe2c4' }}>
      {/* ── 머리(고정) ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30"
        style={{
          paddingTop: 'max(0.6rem, env(safe-area-inset-top))',
          background: 'linear-gradient(to bottom, rgba(251,241,220,.97) 0%, rgba(251,241,220,.92) 70%, rgba(251,241,220,0) 100%)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      >
        <div className="flex items-center gap-2 px-3">
          <button onClick={back} aria-label="뒤로" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft transition active:scale-90">
            <IconArrow size={17} className="rotate-180" />
          </button>
          {figure && (
            <span className="flex h-10 w-10 shrink-0 overflow-hidden rounded-full" style={{ boxShadow: '0 0 0 2px var(--color-line-strong)' }}>
              <img src={figure} alt="" className="h-full w-full scale-[1.1] object-cover" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-[17px] font-bold leading-tight text-ink">{journey.name}</p>
            <p className="truncate text-[11.5px] text-muted">
              {q.chapter ? `${ROMAN[q.chapter.index - 1] ?? q.chapter.index} · ${q.chapter.name}` : journey.who}
              {' · '}자리 <span className="font-display" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>{q.reachedCount}/{q.total}</span>
            </p>
          </div>
          {q.next && (
            <div className="shrink-0 pr-2 text-right">
              <p className="font-display text-[16px] leading-none text-clay-deep" style={{ fontFeatureSettings: "'lnum' 1" }}>
                {q.toRealKm < 10 ? q.toRealKm.toFixed(1) : Math.round(q.toRealKm)}
                <span className="text-[10.5px]">{pilgrim.units}</span>
              </p>
              <p className="mt-0.5 text-[10px] text-muted">{q.next.place}까지</p>
            </div>
          )}
        </div>

        {/* 장 칩 — 누르면 그 장으로 **이동** */}
        <div ref={chipsRef} className="mt-1.5 flex gap-1.5 overflow-x-auto px-4 pb-2.5" style={{ scrollbarWidth: 'none' }}>
          {layout?.board.panels.map((p) => {
            const on = p.tierIndex === activeTier
            return (
              <button
                key={p.tier.id}
                data-tier={p.tierIndex}
                onClick={() => scrollToBoardY(p.y)}
                aria-current={on ? 'true' : undefined}
                className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-[7px] text-[12px] transition active:scale-95"
                style={{
                  background: on ? 'var(--color-clay-deep)' : 'rgba(255,250,238,.8)',
                  color: on ? 'var(--color-sand-raised)' : p.status === 'sealed' ? 'var(--color-muted)' : 'var(--color-ink-soft)',
                  boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--color-line-strong)',
                }}
              >
                <span className="font-display">{ROMAN[p.tierIndex] ?? p.tierIndex + 1}</span>
                {p.tier.name}
                {p.status === 'done' && <IconSeal size={11} />}
                {p.status === 'sealed' && <IconLocked size={10} />}
              </button>
            )
          })}
        </div>
      </header>

      {/* ── 보드 ─────────────────────────────────────────────────────── */}
      {/* 두 손가락으로 벌리면 보드가 커진다(1~2배). 커진 만큼 옆으로 끌어서 본다. 페이지 자체는 안 커진다. */}
      <div ref={boardRef} className="-mt-3 overflow-x-auto overflow-y-hidden" style={{ touchAction: 'pan-x pan-y', scrollbarWidth: 'none' }}>
        <QuestBoard journey={journey} journeyKm={km} onSelectNode={setSelected} selectedId={selected?.ep.id} onBoard={onBoard} zoom={zoom} />
      </div>
      {zoom > 1 && (
        <button
          onClick={() => setZoom(1)}
          className="fixed right-4 z-30 rounded-full px-3 py-2 text-[12px] text-ink shadow-[0_6px_18px_rgba(40,25,10,.3)] transition active:scale-95"
          style={{ bottom: 'max(4.6rem, calc(env(safe-area-inset-bottom) + 3.6rem))', background: 'rgba(251,241,220,.95)' }}
        >
          원래 크기
        </button>
      )}

      {/* 길의 끝 — 보드 아래 한 문단 */}
      <div className="px-7 pb-10 pt-6 text-center" style={{ paddingBottom: 'max(3.5rem, env(safe-area-inset-bottom))' }}>
        <p className="font-display text-[11px] uppercase tracking-[0.22em]" style={{ color: chrome.accent }}>{journey.nameLatin}</p>
        <p className="mt-1.5 font-serif text-[15px] text-ink">
          {journey.episodes[0]?.place}에서 {journey.episodes[journey.episodes.length - 1]?.place}까지
        </p>
        <p className="mt-1 text-[12px] text-muted">
          {journey.who} · {journey.era} · 자리 {journey.episodes.length}곳 · 내가 달릴 {Math.round(toRealKm(journey.id, journey.totalKm)).toLocaleString()}
          {pilgrim.units}
        </p>
        {q.done && <p className="mt-3 font-serif text-[14px] text-clay-deep">이 길을 끝까지 걸었습니다.</p>}
      </div>

      {/* 지금 자리로 */}
      {showJump && layout && (
        <button
          onClick={() => {
            const a = layout.board.next ?? layout.board.current
            if (a) centerOn(a.y)
          }}
          className="fixed z-30 flex items-center gap-2 rounded-full px-4 py-2.5 text-[12.5px] text-ink shadow-[0_8px_24px_rgba(40,25,10,.35)] transition active:scale-95"
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 'max(1.25rem, env(safe-area-inset-bottom))',
            background: 'var(--color-seal-bright)',
            maxWidth: BOARD_W - 40,
          }}
        >
          <IconPilgrim size={15} /> 지금 자리로
        </button>
      )}

      {selected && (
        <NodeSheet
          journey={journey}
          node={selected}
          units={pilgrim.units}
          reachedAt={pilgrim.lifetime?.episodeReachedAt?.[journey.id]?.[selected.ep.id]}
          onClose={() => setSelected(null)}
          onRead={() => openEpisode(journey.id, selected.ep.id)}
          onRun={runToward}
        />
      )}
    </div>
  )
}
