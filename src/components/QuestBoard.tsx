import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import type { Journey } from '../data/geo/journeys'
import { JOURNEY_CHROME, journeyProgress } from '../data/geo/journeys'
import { buildBoard, boardPath, boardSegments, boardRoute, BOARD_W, ROMAN, type Board, type BoardNode, type Pt } from '../lib/board'
import { celebrationAllowed } from '../lib/quest'
import { episodeArt, worldArt, figureArt } from '../assets/art'
import { IconLocked, IconSeal } from './icons'
import Ambient from './Ambient'
import { JOURNEY_WALKER } from '../data/ambient'
import { haptic } from '../lib/haptics'
import { usePilgrim } from '../state/pilgrim'

/* ── 길 위를 지나가는 것들 ──────────────────────────────────────────────────
 * 위에서 내려다본 모양(조감)이라 길의 방향을 따라 돌려도 거꾸로 보이는 일이 없다.
 * SMIL animateMotion이 베지어 길을 그대로 따라간다 — 굽이마다 정확히. */
function Walker({ kind, d, dur, begin }: { kind: 'camels' | 'cloud' | 'sheep'; d: string; dur: number; begin: number }) {
  const motion = <animateMotion dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" path={d} rotate="auto" />
  if (kind === 'cloud') {
    return (
      <g opacity="0.9">
        {motion}
        <circle r="9" fill="rgba(255,250,238,.95)" />
        <circle cx="-7" cy="2" r="6" fill="rgba(255,250,238,.95)" />
        <circle cx="7" cy="2" r="6.5" fill="rgba(255,250,238,.95)" />
        <circle r="14" fill="rgba(255,220,140,.28)" />
      </g>
    )
  }
  if (kind === 'camels') {
    return (
      <g>
        {motion}
        {[0, -16, -32].map((dx, i) => (
          <g key={i} transform={`translate(${dx} ${i % 2 ? 2 : -2})`}>
            <ellipse rx="6.5" ry="3.2" fill="#8a5a2b" />
            <circle cx="6.5" cy="-0.5" r="1.9" fill="#6b4420" />
            <ellipse rx="2.2" ry="1.6" fill="#a56d34" />
          </g>
        ))}
      </g>
    )
  }
  return (
    <g>
      {motion}
      {[
        [0, 0],
        [-9, 5],
        [-10, -5],
        [-19, 1],
      ].map(([dx, dy], i) => (
        <g key={i} transform={`translate(${dx} ${dy})`}>
          <ellipse rx="4.6" ry="3.1" fill="#f7f0e0" stroke="#6b5433" strokeWidth=".6" />
          <circle cx="4.4" r="1.5" fill="#3b2a18" />
        </g>
      ))}
    </g>
  )
}

/* ── 퀘스트 보드 ────────────────────────────────────────────────────────────
 *
 * 여정 하나가 세로로 긴 **월드**다. 장마다 그 땅을 그린 패널이 깔리고, 그 위로 하나의
 * 길이 모든 자리를 지나 아래로 내려간다. 닿은 자리는 그림이 열리고 금 인장이 찍힌다.
 * 다음 자리는 봉인이 숨 쉬듯 빛난다. 그 너머는 안개다. 순례자 말은 길 위 정확한 지점에 서 있다.
 *
 * 게임의 뼈, 순례의 살(DECISIONS D3): 상태 기계는 게임이고 어휘는 순례다. 레벨·클리어·보스 없음.
 * 수난 자리(mood=lament)는 인장은 찍히되 빛나지 않는다 — 십자가를 보스전으로 만들지 않는다.
 *
 * 좌표계는 논리 폭 440px. 컨테이너 폭에 맞춰 통째로 scale한다(선 굵기·글자·그림의 비율이
 * 모든 폰에서 같아야 한다). 높이는 scale을 곱해 래퍼에 준다 — transform은 흐름 높이를 안 바꾼다. */

export interface QuestBoardProps {
  journey: Journey
  journeyKm: number
  /** 자리를 눌렀을 때. 없으면 보드는 장식이다(홈 창) */
  onSelectNode?: (node: BoardNode) => void
  selectedId?: string
  /** 보드 레이아웃을 부모에게 알린다(장으로 스크롤·현재 위치 계산) */
  onBoard?: (board: Board, scale: number) => void
  /** 이 값(여정 km)에서 journeyKm까지 **걸어오는** 연출 — 리빌에서 오늘 나아간 만큼 말이 움직인다 */
  fromKm?: number
  className?: string
}

/* 잉크는 고정값이다 — 패널 그림은 테마를 안 따르므로 그 위의 잉크도 토큰을 쓰면 안 된다
   (다크에서 라피스가 하늘색으로 뒤집혀 대비가 사라진 적이 있다). */
const INK = {
  path: '#2b3ea8',
  casing: 'rgba(255,247,228,0.82)',
  casingShadow: 'rgba(70,48,22,0.28)',
  gold: '#e2a62a',
  goldBright: '#ffd868',
  goldDark: '#5a3a12',
  sealedRing: '#8c7b60',
  label: '#2f2114',
  labelDim: '#6b5a44',
  paper: '#fbf1dc',
}

/* 자리의 크기는 상태가 정한다 — 다음 자리가 압도적으로 커야 "오늘의 목표가 하나"라는 말이 형태가 된다 */
const SIZE: Record<BoardNode['state'], number> = { reached: 62, current: 66, next: 76, sealed: 50 }

export default function QuestBoard({ journey, journeyKm, onSelectNode, selectedId, onBoard, fromKm, className = '' }: QuestBoardProps) {
  const reduce = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const board = useMemo(() => buildBoard(journey, journeyKm), [journey, journeyKm])
  const { route, nodeAt } = useMemo(() => boardRoute(board.nodes), [board])
  const pts = useMemo<Pt[]>(() => board.nodes.map((n) => [n.x, n.y]), [board])
  const d = useMemo(() => boardPath(route), [route])
  const segs = useMemo(() => boardSegments(route, nodeAt), [route, nodeAt])
  const chrome = JOURNEY_CHROME[journey.id]

  /* 컨테이너 폭 → scale */
  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const apply = () => setScale(Math.max(0.5, el.clientWidth / BOARD_W))
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    onBoard?.(board, scale)
  }, [board, scale, onBoard])

  /* ── 걸어온 길 · 순례자 말의 위치 ─────────────────────────────────────
     폴리라인 누적 비율을 곡선에 그대로 쓰면 굽은 구간에서 말이 길 밖에 뜬다.
     구간 곡선 하나하나의 실제 길이를 재서 점을 찍는다. */
  const roadRef = useRef<SVGPathElement>(null)
  const walkedRef = useRef<SVGPathElement>(null)
  const segRefs = useRef<(SVGPathElement | null)[]>([])
  const [me, setMe] = useState<Pt | null>(null)
  const played = useRef(false)
  useEffect(() => {
    const road = roadRef.current
    const walked = walkedRef.current
    if (!road || !walked) return
    const L = road.getTotalLength()
    if (!L) return
    const lens = segRefs.current.slice(0, Math.max(0, pts.length - 1)).map((el) => el?.getTotalLength() ?? 0)
    const cum = lens.reduce<number[]>((acc, len, i) => [...acc, acc[i] + len], [0])
    const lengthAt = (curIdx: number, seg: number) => {
      if (curIdx < 0) return 0
      if (curIdx >= pts.length - 1) return L
      return Math.min(L, Math.max(0, cum[curIdx] + (cum[curIdx + 1] - cum[curIdx]) * Math.min(1, Math.max(0, seg))))
    }
    const curIdx = board.current ? board.nodes.indexOf(board.current) : -1
    const done = lengthAt(curIdx, board.segProgress)
    /* 어디서부터 그릴까 — 기본은 길의 처음부터(지도를 열 때마다 걸어온 길이 차오른다).
       fromKm이 있으면 그 지점부터(리빌: 오늘 나아간 만큼만 움직인다 — 그래야 "오늘"이 보인다). */
    let from = 0
    if (fromKm != null) {
      const pf = journeyProgress(journey, fromKm)
      from = lengthAt(pf.reachedCount - 1, pf.segProgress)
    }
    const pt = road.getPointAtLength(done)
    walked.style.strokeDasharray = `${done} ${L}`
    /* 처음 한 번만 "걸어오는" 연출을 한다. 그 뒤의 갱신(러닝 중 거리가 조금씩 늘 때)은
       말이 제자리에서 다음 점으로 옮겨 가야지, 길의 처음으로 튕겼다가 다시 와선 안 된다 —
       완주한 여정의 러닝 화면에서 말이 위에서 아래로 계속 떨어지던 버그가 그것이었다. */
    if (reduce || played.current) {
      walked.style.transition = 'none'
      walked.style.strokeDashoffset = '0'
      setMe([pt.x, pt.y])
      return
    }
    played.current = true
    const start = road.getPointAtLength(from)
    setMe([start.x, start.y])
    walked.style.strokeDashoffset = String(Math.max(0, done - from))
    walked.getBoundingClientRect()
    const ms = fromKm != null ? 2400 : 1400
    walked.style.transition = `stroke-dashoffset ${ms}ms cubic-bezier(0.22,1,0.36,1)`
    const raf = requestAnimationFrame(() => {
      walked.style.strokeDashoffset = '0'
      setMe([pt.x, pt.y])
    })
    return () => cancelAnimationFrame(raf)
  }, [d, board, pts.length, reduce, fromKm, journey])

  /* 안개는 다음 자리 조금 아래에서 시작한다. 다음 자리가 없으면(완주) 안개도 없다. */
  const fogY = board.next ? board.next.y + 74 : null
  const avatar = usePilgrim((s) => s.avatar)
  const pilgrim = figureArt(avatar) ?? figureArt('pilgrim')
  const walker = JOURNEY_WALKER[journey.id] ?? 'none'
  /* 길 전체를 한 번 지나는 데 자리당 ~6초 — 눈에 띄되 바쁘지 않게 */
  const walkDur = Math.max(40, board.nodes.length * 6)

  /* 탭 파문 — 보드 어디를 눌러도 그 자리에서 한 겹 퍼진다(살아 있는 땅이라는 피드백).
     자리 버튼 위의 탭은 버튼이 먹으므로 여기까지 안 온다. */
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const rippleId = useRef(0)
  const downAt = useRef<{ x: number; y: number } | null>(null)
  const onBoardDown = (e: React.PointerEvent<HTMLDivElement>) => {
    downAt.current = { x: e.clientX, y: e.clientY }
  }
  /* 손가락이 움직였으면 스크롤이다 — 탭일 때만 파문을 낸다 */
  const onBoardUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d0 = downAt.current
    downAt.current = null
    if (!d0 || !onSelectNode || reduce) return
    if (Math.hypot(e.clientX - d0.x, e.clientY - d0.y) > 8) return
    const host = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - host.left) / scale
    const y = (e.clientY - host.top) / scale
    const id = ++rippleId.current
    setRipples((r) => [...r.slice(-4), { id, x, y }])
    window.setTimeout(() => setRipples((r) => r.filter((q) => q.id !== id)), 800)
  }

  return (
    <div ref={wrapRef} className={`relative w-full overflow-hidden ${className}`} style={{ height: board.height * scale }} onPointerDown={onBoardDown} onPointerUp={onBoardUp}>
      <div
        className="absolute left-0 top-0"
        style={{ width: BOARD_W, height: board.height, transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        {/* ── 땅: 장마다 한 패널 ─────────────────────────────────────── */}
        {board.panels.map((p) => {
          const art = worldArt(journey.id, p.tierIndex)
          return (
            <div key={p.tier.id} className="absolute left-0 w-full overflow-hidden" style={{ top: p.y, height: p.height }}>
              {art ? (
                <img src={art} alt="" aria-hidden draggable={false} className="h-full w-full select-none object-cover" decoding="async" loading={p.tierIndex < 2 ? 'eager' : 'lazy'} />
              ) : (
                <div className="h-full w-full" style={{ background: 'linear-gradient(165deg,#f4e6c6,#e7d3a8)' }} />
              )}
            </div>
          )
        })}

        {/* 패널 이음매 — 그림자 한 줄로 이어 붙인다 */}
        {board.panels.slice(1).map((p) => (
          <div
            key={`seam-${p.tier.id}`}
            className="pointer-events-none absolute left-0 w-full"
            style={{
              top: p.y - 18,
              height: 36,
              background: 'linear-gradient(to bottom, rgba(60,40,18,0) 0%, rgba(60,40,18,0.22) 50%, rgba(60,40,18,0) 100%)',
            }}
          />
        ))}

        {/* 분위기 — 구름 그림자·새·빛 조각·별. 땅과 길 사이에 깔린다 */}
        <Ambient journeyId={journey.id} height={board.height} panels={board.panels} />

        {/* ── 길 ───────────────────────────────────────────────────────── */}
        <svg className="pointer-events-none absolute left-0 top-0" width={BOARD_W} height={board.height} viewBox={`0 0 ${BOARD_W} ${board.height}`} aria-hidden>
          <path d={d} fill="none" stroke={INK.casingShadow} strokeWidth={19} strokeLinecap="round" strokeLinejoin="round" transform="translate(0 3)" />
          <path d={d} fill="none" stroke={INK.casing} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
          {/* 아직 갈 길 — 발자국 점선 */}
          <path d={d} fill="none" stroke={INK.path} strokeOpacity={0.42} strokeWidth={4.2} strokeLinecap="round" strokeDasharray="0.1 10" />
          <path ref={roadRef} d={d} fill="none" stroke="none" />
          {/* 걸어온 길 — 라피스 실선, 앞에서부터 차오른다 */}
          <path ref={walkedRef} d={d} fill="none" stroke={INK.path} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          {segs.map((sd, i) => (
            <path
              key={`seg${i}`}
              ref={(el) => {
                segRefs.current[i] = el
              }}
              d={sd}
              fill="none"
              stroke="none"
            />
          ))}
          {/* 길 위를 지나가는 것들 — 양 떼·낙타·구름 기둥. 길을 그대로 따라간다 */}
          {walker !== 'none' && !reduce && d && (
            <>
              <Walker kind={walker} d={d} dur={walkDur} begin={-walkDur * 0.15} />
              <Walker kind={walker} d={d} dur={walkDur * 1.13} begin={-walkDur * 0.62} />
            </>
          )}
          {/* 다음 자리의 등불 — 화면에서 유일한 발광체 */}
          {board.next && (
            <circle cx={board.next.x} cy={board.next.y} r={64} fill="url(#board-halo)" className={reduce ? '' : 'board-breathe'} style={{ transformOrigin: `${board.next.x}px ${board.next.y}px` }} />
          )}
          <defs>
            <radialGradient id="board-halo">
              <stop offset="0%" stopColor={INK.goldBright} stopOpacity={0.55} />
              <stop offset="60%" stopColor={INK.goldBright} stopOpacity={0.16} />
              <stop offset="100%" stopColor={INK.goldBright} stopOpacity={0} />
            </radialGradient>
          </defs>
        </svg>

        {/* ── 안개: 다음 자리 너머 ────────────────────────────────────── */}
        {fogY != null && (
          <div
            className="pointer-events-none absolute left-0 w-full"
            style={{
              top: fogY,
              height: Math.max(0, board.height - fogY),
              background:
                'linear-gradient(to bottom, rgba(247,236,213,0) 0px, rgba(247,236,213,0.55) 140px, rgba(240,227,198,0.66) 100%)',
            }}
          />
        )}

        {/* ── 장 리본 ─────────────────────────────────────────────────── */}
        {board.panels.map((p) => (
          <div key={`ribbon-${p.tier.id}`} className="pointer-events-none absolute left-0 flex w-full justify-center" style={{ top: p.y + 30 }}>
            <div
              className="flex items-center gap-2 px-5 py-[7px] font-serif text-[13.5px] font-bold"
              style={{
                background: INK.paper,
                color: p.status === 'sealed' ? INK.labelDim : INK.label,
                clipPath: 'polygon(0 0, 100% 0, calc(100% - 9px) 50%, 100% 100%, 0 100%, 9px 50%)',
                boxShadow: '0 2px 0 rgba(90,58,18,.25)',
                filter: 'drop-shadow(0 3px 5px rgba(60,40,18,.28))',
              }}
            >
              <span className="font-display tracking-[0.08em]" style={{ color: chrome.accent }}>{ROMAN[p.tierIndex] ?? p.tierIndex + 1}</span>
              <span>{p.tier.name}</span>
              {p.status === 'done' && <IconSeal size={13} style={{ color: INK.gold }} />}
              {p.status === 'sealed' && <IconLocked size={12} style={{ color: INK.labelDim }} />}
            </div>
          </div>
        ))}

        {/* ── 자리 ────────────────────────────────────────────────────── */}
        {board.nodes.map((n) => {
          const size = SIZE[n.state]
          const art = episodeArt(journey.id, n.ep.id)
          const solemn = !celebrationAllowed(n.ep.mood)
          const selected = n.ep.id === selectedId
          const tap = onSelectNode
            ? () => {
                haptic('tap')
                onSelectNode(n)
              }
            : undefined
          const ring =
            n.state === 'sealed'
              ? `0 0 0 2px ${INK.sealedRing}, 0 5px 10px rgba(40,25,10,.28)`
              : n.state === 'next'
                ? `0 0 0 3px ${INK.paper}, 0 0 0 6px ${INK.path}, 0 8px 18px rgba(30,20,80,.35)`
                : `0 0 0 2.5px ${INK.goldDark}, 0 0 0 5.5px ${solemn ? '#b9935a' : INK.gold}, 0 6px 14px rgba(40,25,10,.3)`
          const Tag = tap ? 'button' : 'div'
          return (
            <Tag
              key={n.ep.id}
              type={tap ? 'button' : undefined}
              onClick={tap}
              aria-label={tap ? `${n.ep.place} — ${n.state === 'reached' || n.state === 'current' ? '닿은 자리' : n.state === 'next' ? '다음 자리' : '아직 봉인된 자리'}` : undefined}
              className={`absolute flex -translate-x-1/2 flex-col items-center ${tap ? 'cursor-pointer transition active:scale-95' : ''} ${n.state === 'next' && !reduce ? 'board-pulse' : ''}`}
              style={{ left: n.x, top: n.y - size / 2, width: 132, zIndex: n.state === 'next' ? 4 : 3 }}
            >
              <span
                className={`relative block overflow-hidden rounded-full ${selected ? 'board-selected' : ''}`}
                style={{ width: size, height: size, boxShadow: ring, background: INK.paper }}
              >
                {art ? (
                  <img
                    src={art}
                    alt=""
                    aria-hidden
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full select-none object-cover"
                    style={
                      n.state === 'sealed'
                        ? { filter: 'grayscale(1) brightness(.78) contrast(.9)', opacity: 0.9 }
                        : n.state === 'next'
                          ? { filter: 'saturate(.85) brightness(.92)' }
                          : undefined
                    }
                  />
                ) : (
                  <span className="block h-full w-full" style={{ background: 'linear-gradient(160deg,#f1dfb7,#d9bd86)' }} />
                )}
                {/* 닿은 자리는 가끔 빛을 받는다(수난 자리는 조용히) */}
                {(n.state === 'reached' || n.state === 'current') && !solemn && !reduce && (
                  <span className="board-gleam" style={{ animationDelay: `${-(n.index * 1.7) % 9}s` }} />
                )}
                {/* 유리 하이라이트 — 메달리온에 두께를 준다 */}
                <span className="pointer-events-none absolute inset-0 rounded-full" style={{ boxShadow: 'inset 0 2px 3px rgba(255,255,255,.55), inset 0 -3px 6px rgba(60,40,18,.28)' }} />
                {n.state === 'sealed' && <span className="pointer-events-none absolute inset-0 rounded-full" style={{ background: 'rgba(40,30,60,.28)' }} />}
              </span>

              {/* 배지 — 인장 / 봉인 */}
              {(n.state === 'reached' || n.state === 'current') && (
                <span
                  className="absolute flex items-center justify-center rounded-full"
                  style={{ width: 20, height: 20, left: `calc(50% + ${size / 2 - 14}px)`, top: size - 20, background: solemn ? '#b9935a' : INK.gold, color: INK.goldDark, boxShadow: `0 0 0 2px ${INK.paper}, 0 2px 4px rgba(0,0,0,.25)` }}
                >
                  <IconSeal size={12} strokeWidth={2.2} />
                </span>
              )}
              {n.state === 'next' && (
                <span
                  className="absolute flex items-center justify-center rounded-full"
                  style={{ width: 22, height: 22, left: `calc(50% + ${size / 2 - 15}px)`, top: size - 22, background: INK.path, color: '#ffe7a1', boxShadow: `0 0 0 2px ${INK.paper}, 0 2px 4px rgba(0,0,0,.3)` }}
                >
                  <IconLocked size={12} strokeWidth={2.2} />
                </span>
              )}
              {n.state === 'sealed' && (
                <span className="absolute flex items-center justify-center rounded-full" style={{ width: 16, height: 16, left: `calc(50% + ${size / 2 - 11}px)`, top: size - 16, background: INK.sealedRing, color: '#f6ecd6', boxShadow: `0 0 0 1.5px ${INK.paper}` }}>
                  <IconLocked size={9} strokeWidth={2.4} />
                </span>
              )}

              {/* 이름표 — 종이색 번짐 위의 잉크. 알약 배경은 스티커가 된다 */}
              <span
                className={`mt-1.5 block max-w-[128px] text-center font-serif leading-tight ${n.state === 'next' ? 'text-[13.5px] font-bold' : 'text-[12px]'}`}
                style={{
                  color: n.state === 'sealed' ? INK.labelDim : INK.label,
                  textShadow: `0 0 3px ${INK.paper}, 0 0 5px ${INK.paper}, 0 1px 2px ${INK.paper}, 0 0 8px ${INK.paper}`,
                }}
              >
                {n.ep.place}
              </span>
            </Tag>
          )
        })}

        {/* 탭 파문 */}
        {ripples.map((r) => (
          <span
            key={r.id}
            className="board-ripple pointer-events-none absolute rounded-full"
            style={{ left: r.x, top: r.y, width: 90, height: 90, border: '2px solid rgba(255,240,200,.9)', boxShadow: '0 0 18px rgba(255,216,104,.5)', zIndex: 5 }}
            aria-hidden
          />
        ))}

        {/* ── 순례자 말 ───────────────────────────────────────────────── */}
        {me && (
          <div
            className="pointer-events-none absolute"
            style={{
              left: me[0],
              top: me[1],
              zIndex: 6,
              transition: reduce ? undefined : `left ${fromKm != null ? 2400 : 1400}ms cubic-bezier(0.22,1,0.36,1), top ${fromKm != null ? 2400 : 1400}ms cubic-bezier(0.22,1,0.36,1)`,
            }}
            aria-hidden
          >
            {/* 발밑 그림자 */}
            <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: 30, height: 10, background: 'rgba(40,25,10,.35)', filter: 'blur(2px)' }} />
            <span
              className={`absolute left-1/2 block overflow-hidden rounded-full ${reduce ? '' : 'board-bob'}`}
              style={{
                width: 46,
                height: 46,
                transform: 'translate(-50%, -92%)',
                background: INK.paper,
                boxShadow: `0 0 0 2.5px ${INK.goldDark}, 0 0 0 5px ${INK.paper}, 0 8px 16px rgba(40,25,10,.35), 0 0 28px rgba(255,216,104,.55)`,
              }}
            >
              {pilgrim ? (
                <img src={pilgrim} alt="" className="h-full w-full scale-[1.12] object-cover" draggable={false} />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-serif text-[18px]" style={{ color: INK.goldDark }}>
                  ✦
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
