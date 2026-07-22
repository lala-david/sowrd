import { useEffect, useRef } from 'react'

/* THE WAY signature — The Pilgrim Trail: a warm clay road winding across the hills,
   with sun-gold milestone stones marking each station reached. */
export default function IlluminatedLine({
  total = 12,
  current = 8,
  height = 66,
}: {
  total?: number
  current?: number
  height?: number
}) {
  const doneRef = useRef<SVGPathElement>(null)
  useEffect(() => {
    const el = doneRef.current
    if (!el) return
    const len = el.getTotalLength()
    el.style.strokeDasharray = String(len)
    el.style.strokeDashoffset = String(len)
    el.getBoundingClientRect()
    el.style.transition = 'stroke-dashoffset 1100ms cubic-bezier(0.22,1,0.36,1)'
    requestAnimationFrame(() => (el.style.strokeDashoffset = '0'))
  }, [])

  const W = 340
  const H = height
  const pad = 8
  const pts = Array.from({ length: total }, (_, i) => {
    const x = pad + ((W - 2 * pad) * i) / (total - 1)
    const y = H / 2 + Math.sin(i * 0.8 + 0.5) * 13
    return [x, y] as const
  })
  const d = (arr: readonly (readonly [number, number])[]) =>
    arr.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
      {/* the road ahead — faint clay */}
      <path d={d(pts)} fill="none" stroke="var(--color-clay)" strokeOpacity={0.24} strokeWidth={1.4} strokeLinecap="round" strokeDasharray="1 5" />
      {/* the road walked — solid clay */}
      <path ref={doneRef} d={d(pts.slice(0, current))} fill="none" stroke="var(--color-clay)" strokeWidth={2.2} strokeLinecap="round" />
      {pts.map((p, i) => {
        if (i === current - 1)
          return (
            <g key={i}>
              <circle cx={p[0]} cy={p[1]} r={11} fill="none" stroke="var(--color-sun)" strokeWidth={1.1} style={{ transformOrigin: `${p[0]}px ${p[1]}px`, animation: 'glow 4.5s ease-in-out infinite' }} />
              <circle cx={p[0]} cy={p[1]} r={5.4} fill="var(--color-sun-bright)" />
              <circle cx={p[0]} cy={p[1]} r={5.4} fill="var(--color-sun)" fillOpacity={0.85} />
            </g>
          )
        if (i < current - 1) return <circle key={i} cx={p[0]} cy={p[1]} r={3.1} fill="var(--color-sun-deep)" />
        return <circle key={i} cx={p[0]} cy={p[1]} r={2.6} fill="none" stroke="var(--color-clay)" strokeOpacity={0.4} strokeWidth={1.2} />
      })}
    </svg>
  )
}
