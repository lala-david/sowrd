import type { ReactElement } from 'react'
import { useReducedMotion } from 'motion/react'
import { BOARD_W, imageRectToPanel, type BoardPanel } from '../lib/board'
import { panelAmbient, type Frac } from '../data/ambient'

/* ── 보드의 공기 ────────────────────────────────────────────────────────────
 *
 * 땅이 그림 한 장으로 멈춰 있으면 보드가 아니라 포스터다. 그래서 움직인다 — 단, **그 그림의
 * 그 자리에서만**. 배는 물 위에, 갈매기는 바닷가에, 별은 밤하늘에, 연기는 시내산 꼭대기에,
 * 모래 안개는 광야에. 어디가 물이고 하늘인지는 data/ambient.ts가 패널마다 적어 둔 것을 따른다.
 * (무작위로 뿌렸더니 갈매기가 사막에서 나오고 배가 언덕을 지났다.)
 *
 * 전부 CSS 키프레임(transform/opacity)이라 배터리를 거의 안 먹고,
 * prefers-reduced-motion이면 통째로 그리지 않는다. */

const rnd = (i: number, salt = 1) => {
  const x = Math.sin(i * 91.3 * salt + 47.11) * 21793.19
  return x - Math.floor(x)
}

type Rect = { x: number; y: number; w: number; h: number }

function Boat({ kind, size = 1 }: { kind: 'fishing' | 'sail'; size?: number }) {
  return (
    <svg width={34 * size} height={26 * size} viewBox="0 0 34 26" aria-hidden>
      {/* 물그림자 */}
      <ellipse cx="17" cy="22" rx="13" ry="2.4" fill="rgba(20,40,60,.28)" />
      {kind === 'sail' ? (
        <>
          <path d="M17 3 L17 16 L27 16 Z" fill="#fbf1dc" stroke="#6b5433" strokeWidth=".8" />
          <path d="M16.2 6 L16.2 16 L8 16 Z" fill="#f0dfbd" stroke="#6b5433" strokeWidth=".8" />
          <path d="M5 16 H29 L25 21 H9 Z" fill="#8b5a2b" stroke="#4a2f14" strokeWidth=".8" />
          <line x1="17" y1="2" x2="17" y2="16" stroke="#4a2f14" strokeWidth="1.1" />
        </>
      ) : (
        <>
          <path d="M4 15 Q17 20 30 15 L26 21 H8 Z" fill="#8b5a2b" stroke="#4a2f14" strokeWidth=".8" />
          <line x1="17" y1="4" x2="17" y2="15" stroke="#4a2f14" strokeWidth="1.1" />
          <path d="M17.5 5 L17.5 13 L23 13 Z" fill="#f4e6c6" stroke="#6b5433" strokeWidth=".7" />
          <path d="M9 16 Q17 13 25 16" fill="none" stroke="#e0c48a" strokeWidth=".8" />
        </>
      )}
    </svg>
  )
}

function Birds({ kind }: { kind: 'doves' | 'gulls' }) {
  const ink = kind === 'gulls' ? 'rgba(255,252,240,.92)' : 'rgba(50,35,15,.62)'
  const edge = kind === 'gulls' ? 'rgba(60,45,20,.55)' : 'transparent'
  return (
    <svg width="56" height="20" viewBox="0 0 56 20" fill="none" strokeLinecap="round" aria-hidden>
      <g stroke={edge} strokeWidth="3">
        <path d="M2 10 Q7 4 12 10 Q17 4 22 10" />
        <path d="M27 14 Q31 9 35 14 Q39 9 43 14" />
        <path d="M38 6 Q42 2 46 6 Q50 2 54 6" />
      </g>
      <g stroke={ink} strokeWidth="1.6">
        <path d="M2 10 Q7 4 12 10 Q17 4 22 10" />
        <path d="M27 14 Q31 9 35 14 Q39 9 43 14" />
        <path d="M38 6 Q42 2 46 6 Q50 2 54 6" />
      </g>
    </svg>
  )
}

export default function Ambient({ journeyId, height, panels }: { journeyId: string; height: number; panels: BoardPanel[] }) {
  const reduce = useReducedMotion()
  if (reduce) return null

  const nodes: ReactElement[] = []
  let seed = 0
  const R = (salt = 1) => rnd(++seed, salt)

  for (const p of panels) {
    const cfg = panelAmbient(journeyId, p.tierIndex)
    const mapped = (fr: Frac): Rect | null => {
      const r = imageRectToPanel(fr, p.height)
      return r ? { ...r, y: r.y + p.y } : null
    }

    /* 구름 그림자 — 어느 땅에나 지나간다(수난의 예루살렘에도, 천천히) */
    const cloudCount = Math.max(1, Math.round(p.height / 480))
    for (let i = 0; i < cloudCount; i++) {
      const w = 200 + R(2) * 160
      const h = 100 + R(3) * 70
      nodes.push(
        <span
          key={`c${p.tierIndex}-${i}`}
          className="board-drift absolute rounded-full"
          style={{
            top: p.y + 40 + R(5) * Math.max(40, p.height - h - 80),
            left: -w,
            width: w,
            height: h,
            background: cfg.solemn ? 'rgba(30,22,14,.2)' : 'rgba(45,32,14,.15)',
            filter: 'blur(26px)',
            animationDuration: `${(cfg.solemn ? 110 : 75) + R(7) * 50}s`,
            animationDelay: `${-R(11) * 90}s`,
          }}
        />,
      )
    }
    if (cfg.solemn) continue

    /* 물 — 반짝임과 배 */
    const waters = (cfg.water ?? []).map(mapped).filter(Boolean) as Rect[]
    waters.forEach((w, wi) => {
      const glints = Math.max(2, Math.round((w.w * w.h) / 9000))
      for (let i = 0; i < glints; i++) {
        nodes.push(
          <span
            key={`g${p.tierIndex}-${wi}-${i}`}
            className="board-glint absolute rounded-full"
            style={{
              left: w.x + 6 + R(13) * (w.w - 12),
              top: w.y + 6 + R(17) * (w.h - 12),
              width: 10 + R(19) * 10,
              height: 2,
              background: 'rgba(255,255,255,.85)',
              animationDuration: `${2.6 + R(23) * 2.4}s`,
              animationDelay: `${-R(29) * 5}s`,
            }}
          />,
        )
      }
    })
    if (cfg.boats && waters.length) {
      for (let i = 0; i < cfg.boats; i++) {
        const w = waters[i % waters.length]
        // 배가 떠다닐 수 있는 물이어야 한다 — 너무 작은 물에는 띄우지 않는다
        if (w.w < 80 || w.h < 40) continue
        const size = 0.8 + R(31) * 0.4
        const travel = Math.max(24, Math.min(w.w - 40 * size, 90 + R(37) * 60))
        const x = w.x + 8 + R(41) * Math.max(1, w.w - travel - 40 * size)
        const y = w.y + 8 + R(43) * Math.max(1, w.h - 30 * size - 8)
        nodes.push(
          <span
            key={`b${p.tierIndex}-${i}`}
            className="board-sail absolute"
            style={{
              left: x,
              top: y,
              ['--travel' as string]: `${travel}px`,
              animationDuration: `${28 + R(47) * 24}s`,
              animationDelay: `${-R(53) * 30}s`,
            }}
          >
            <span className="board-bob-soft block" style={{ animationDuration: `${2.4 + R(59)}s` }}>
              <Boat kind={cfg.boatKind ?? 'fishing'} size={size} />
            </span>
          </span>,
        )
      }
    }

    /* 새 — 이 패널 위로만 */
    if (cfg.birds && cfg.birds !== 'none') {
      const n = cfg.birds === 'gulls' ? 2 : 1
      for (let i = 0; i < n; i++) {
        nodes.push(
          <span
            key={`bird${p.tierIndex}-${i}`}
            className="board-fly absolute"
            style={{
              top: p.y + 60 + R(61) * Math.max(40, p.height - 160),
              left: -70,
              transform: `scale(${0.8 + R(67) * 0.5})`,
              animationDuration: `${26 + R(71) * 16}s`,
              animationDelay: `${-R(73) * 40}s`,
            }}
          >
            <Birds kind={cfg.birds} />
          </span>,
        )
      }
    }

    /* 별 */
    for (const fr of cfg.stars ?? []) {
      const r = mapped(fr)
      if (!r) continue
      const n = Math.max(4, Math.round((r.w * r.h) / 5200))
      for (let i = 0; i < n; i++) {
        nodes.push(
          <span
            key={`s${p.tierIndex}-${fr.join()}-${i}`}
            className="board-twinkle absolute rounded-full"
            style={{
              left: r.x + R(79) * r.w,
              top: r.y + R(83) * r.h,
              width: 1.6 + R(89) * 2.2,
              height: 1.6 + R(89) * 2.2,
              background: '#fff6dc',
              boxShadow: '0 0 6px rgba(255,240,200,.9)',
              animationDuration: `${2.4 + R(97) * 3}s`,
              animationDelay: `${-R(101) * 5}s`,
            }}
          />,
        )
      }
    }

    /* 모래 안개 */
    for (const fr of cfg.haze ?? []) {
      const r = mapped(fr)
      if (!r) continue
      const bands = Math.max(1, Math.round(r.h / 260))
      for (let i = 0; i < bands; i++) {
        nodes.push(
          <span
            key={`h${p.tierIndex}-${fr.join()}-${i}`}
            className="board-haze absolute"
            style={{
              left: r.x,
              width: r.w,
              top: r.y + (i + 0.3) * (r.h / bands),
              height: 90,
              background: 'linear-gradient(90deg, rgba(255,244,214,0), rgba(255,244,214,.55) 50%, rgba(255,244,214,0))',
              filter: 'blur(12px)',
              animationDuration: `${30 + R(103) * 30}s`,
              animationDelay: `${-R(107) * 40}s`,
            }}
          />,
        )
      }
    }

    /* 연기 — 시내산 */
    for (const [fx, fy] of cfg.smoke ?? []) {
      const r = mapped([fx - 0.02, fy - 0.02, fx + 0.02, fy + 0.02])
      if (!r) continue
      for (let i = 0; i < 4; i++) {
        nodes.push(
          <span
            key={`sm${p.tierIndex}-${i}`}
            className="board-smoke absolute rounded-full"
            style={{
              left: r.x + r.w / 2 - 14 + R(109) * 10,
              top: r.y + r.h / 2 - 14,
              width: 28,
              height: 28,
              background: 'rgba(235,228,214,.75)',
              filter: 'blur(5px)',
              animationDuration: `${5 + R(113) * 2}s`,
              animationDelay: `${-i * 1.6}s`,
            }}
          />,
        )
      }
    }

    /* 모닥불·등불 */
    for (const [fx, fy] of cfg.fire ?? []) {
      const r = mapped([fx - 0.03, fy - 0.03, fx + 0.03, fy + 0.03])
      if (!r) continue
      nodes.push(
        <span
          key={`f${p.tierIndex}-${fx}-${fy}`}
          className="board-ember absolute rounded-full"
          style={{
            left: r.x + r.w / 2 - 22,
            top: r.y + r.h / 2 - 22,
            width: 44,
            height: 44,
            background: 'radial-gradient(circle, rgba(255,190,90,.75) 0%, rgba(255,150,60,.25) 45%, rgba(255,150,60,0) 70%)',
            animationDuration: `${1.6 + R(127) * 1.2}s`,
          }}
        />,
      )
    }

    /* 빛 조각 */
    const moteN = cfg.motes === 'many' ? 16 : cfg.motes === 'none' ? 0 : 5
    for (let i = 0; i < moteN; i++) {
      const size = 3 + R(131) * 3
      const color = journeyId === 'paul' ? 'rgba(210,245,255,.9)' : journeyId === 'abraham' ? 'rgba(255,200,120,.95)' : 'rgba(255,232,170,.95)'
      nodes.push(
        <span
          key={`m${p.tierIndex}-${i}`}
          className="board-rise absolute rounded-full"
          style={{
            left: 20 + R(137) * (BOARD_W - 40),
            top: p.y + 60 + R(139) * (p.height - 100),
            width: size,
            height: size,
            background: color,
            boxShadow: `0 0 ${size * 2}px ${color}`,
            animationDuration: `${5 + R(149) * 5}s`,
            animationDelay: `${-R(151) * 10}s`,
          }}
        />,
      )
    }

    /* 번개 — 폭풍 바다 */
    if (cfg.lightning) {
      const r = mapped(cfg.lightning)
      if (r) {
        nodes.push(
          <span
            key={`l${p.tierIndex}`}
            className="board-lightning absolute"
            style={{ left: r.x, top: r.y, width: r.w, height: r.h, background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,.75), rgba(255,255,255,0) 70%)' }}
          />,
        )
      }
    }
  }

  return (
    <div className="pointer-events-none absolute left-0 top-0 overflow-hidden" style={{ width: BOARD_W, height }} aria-hidden>
      {nodes}
    </div>
  )
}
