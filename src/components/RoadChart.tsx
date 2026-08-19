import { useMemo, useState } from 'react'
import type { Bucket } from '../lib/stats'
import { fmtDistance, fmtDuration, type Units } from '../lib/format'

/* ── 길 그래프 ──────────────────────────────────────────────────────────────
 * 막대 대신 **길**이다. 칸마다 거리가 높이가 되고, 그 점들을 보드의 길과 같은 문법으로 잇는다 —
 * 종이색 케이싱 위의 라피스 선, 달린 날엔 금 인장, 오늘은 숨 쉬는 링. 아래는 옅은 라피스로 물든다.
 * 값은 정직하다(높이 = 거리, 0은 바닥). 한 계열이므로 범례는 없다. 점을 누르면 그 칸의 값이 뜬다. */

type Pt = [number, number]
/* 수평 접선의 3차 곡선 — 점 사이를 S자로 잇되 값의 위아래로 **튀지 않는다**.
   Catmull-Rom은 0 다음에 큰 값이 오면 바닥 아래로 파고들어 "마이너스 거리"를 그렸다. */
function smooth(p: Pt[]): string {
  if (p.length < 2) return p.length ? `M${p[0][0]},${p[0][1]}` : ''
  let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`
  for (let i = 0; i < p.length - 1; i++) {
    const [x1, y1] = p[i]
    const [x2, y2] = p[i + 1]
    const mx = (x1 + x2) / 2
    d += ` C${mx.toFixed(1)},${y1.toFixed(1)} ${mx.toFixed(1)},${y2.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`
  }
  return d
}

export default function RoadChart({ buckets, units, unitLabel, height = 170 }: { buckets: Bucket[]; units: Units; unitLabel: string; height?: number }) {
  /* 여러 칸을 한 번에 고를 수 있다 — 누르면 더해지고, 다시 누르면 빠진다. 둘 이상이면 합계를 보여준다 */
  const [sel, setSel] = useState<Set<number>>(() => new Set())
  const toggle = (i: number) =>
    setSel((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  const W = 320
  const padL = 18
  const padR = 18
  const padT = 30
  const padB = 26
  const n = buckets.length
  const max = Math.max(1, ...buckets.map((b) => b.km))
  const innerW = W - padL - padR
  const innerH = height - padT - padB
  const y0 = padT + innerH
  const step = n > 1 ? innerW / (n - 1) : 0
  // 아직 오지 않은 칸은 그리지 않는다 — 길은 오늘까지만 있다
  const lastDrawn = Math.max(0, buckets.reduce((acc, b, i) => (b.future ? acc : i), 0))
  const pts = useMemo<Pt[]>(
    () => buckets.slice(0, lastDrawn + 1).map((b, i) => [padL + i * step, y0 - (b.km / max) * innerH * 0.92]),
    [buckets, lastDrawn, step, y0, max, innerH],
  )
  const d = smooth(pts)
  const area = pts.length > 1 ? `${d} L${pts[pts.length - 1][0].toFixed(1)},${y0} L${pts[0][0].toFixed(1)},${y0} Z` : ''
  const picked = [...sel].sort((a, b) => a - b).map((i) => buckets[i]).filter(Boolean)
  const cur = picked.length === 1 ? picked[0] : null
  const sumKm = picked.reduce((a, b) => a + b.km, 0)
  const sumSec = picked.reduce((a, b) => a + b.sec, 0)
  const sumRuns = picked.reduce((a, b) => a + b.runs, 0)
  const uid = useMemo(() => Math.random().toString(36).slice(2, 8), [])

  return (
    <div className="relative">
      <div className="absolute left-0 right-0 top-0 flex h-6 items-center justify-center text-[12px]" aria-live="polite">
        {picked.length > 0 ? (
          <button onClick={() => setSel(new Set())} className="rounded-full px-2.5 py-[3px] text-ink" style={{ background: 'var(--color-sand-sunk)' }} aria-label="선택 지우기">
            {cur ? cur.label || cur.key : `${picked.length}칸 합계`} ·{' '}
            <span className="font-display" style={{ fontFeatureSettings: "'lnum' 1" }}>{fmtDistance(sumKm, units, 1)}</span>
            {unitLabel}
            {sumSec > 0 && <span className="text-muted"> · {fmtDuration(sumSec)}</span>}
            {sumKm > 0.05 && sumSec > 0 && <span className="text-muted"> · {Math.floor(sumSec / sumKm / 60)}'{String(Math.round((sumSec / sumKm) % 60)).padStart(2, '0')}"/km</span>}
            {sumRuns > 1 && <span className="text-muted"> · {sumRuns}회</span>}
            <span className="ml-1.5 text-muted">×</span>
          </button>
        ) : (
          <span className="text-[11px] text-muted">점을 누르면 그 날의 기록 · 여러 개를 고르면 합계</span>
        )}
      </div>
      <svg viewBox={`0 0 ${W} ${height}`} className="block w-full" role="img" aria-label="기간별 거리">
        <defs>
          <linearGradient id={`road-fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-clay)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--color-clay)" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {/* 바닥 — 종이 위 한 줄 */}
        <line x1={padL - 8} x2={W - padR + 8} y1={y0} y2={y0} stroke="var(--color-line-strong)" />
        {/* 최대값 눈금 — 숫자는 하나 */}
        <line x1={padL - 8} x2={W - padR + 8} y1={y0 - innerH * 0.92} y2={y0 - innerH * 0.92} stroke="var(--color-line)" strokeDasharray="2 5" />
        <text x={W - padR + 8} y={y0 - innerH * 0.92 - 4} textAnchor="end" fontSize="9.5" fill="var(--color-muted)" fontFamily="var(--font-display)">
          {fmtDistance(max, units, max >= 10 ? 0 : 1)}
          {unitLabel}
        </text>
        {area && <path d={area} fill={`url(#road-fill-${uid})`} />}
        {pts.length > 1 && (
          <>
            <path d={d} fill="none" stroke="var(--color-sand-raised)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <path d={d} fill="none" stroke="var(--color-clay)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        {buckets.map((b, i) => {
          const x = padL + i * step
          const y = y0 - (b.km / max) * innerH * 0.92
          const on = sel.has(i)
          const ran = b.km > 0
          return (
            <g key={b.key} onClick={() => toggle(i)} style={{ cursor: 'pointer' }}>
              <rect x={x - step / 2} y={padT - 6} width={Math.max(step, 24)} height={innerH + padB + 6} fill="transparent" />
              {!b.future && (
                ran ? (
                  <>
                    {b.now && <circle cx={x} cy={y} r={11} fill="var(--color-clay)" opacity="0.16" />}
                    <circle cx={x} cy={y} r={on ? 6.2 : 5} fill={on || b.now ? 'var(--color-clay)' : 'var(--color-sand-raised)'} stroke="var(--color-clay-deep)" strokeWidth="1.8" />
                    {on && <circle cx={x} cy={y} r={10} fill="none" stroke="var(--color-ink)" strokeWidth="1.2" />}
                  </>
                ) : (
                  <>
                    <circle cx={x} cy={y0} r={b.now ? 3.2 : 2.2} fill={b.now ? 'var(--color-clay)' : 'var(--color-line-strong)'} />
                    {on && <circle cx={x} cy={y0} r={8} fill="none" stroke="var(--color-ink)" strokeWidth="1.2" />}
                  </>
                )
              )}
              {b.future && <circle cx={x} cy={y0} r={1.6} fill="var(--color-line)" />}
              {b.label && (
                <text x={x} y={height - 8} textAnchor="middle" fontSize="9.5" fill={b.now ? 'var(--color-clay-deep)' : 'var(--color-muted)'} fontFamily="var(--font-display)">
                  {b.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
