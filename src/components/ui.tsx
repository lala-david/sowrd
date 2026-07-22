import type { ReactNode } from 'react'
import { fmtDuration, fmtPace, type Units } from '../lib/format'

/* 작은 라벨 — 섹션 머리. display 폰트 + 넓은 자간 */
export function SectionLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`font-display text-[12px] uppercase tracking-[0.26em] text-muted ${className}`}>{children}</span>
  )
}

/* 통계 타일 — 큰 숫자 + 라벨(프로필/요약). 숫자는 등폭 lining */
export function StatTile({ value, unit, label, accent }: { value: ReactNode; unit?: string; label: string; accent?: boolean }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-1">
        <span className={`font-display text-[28px] font-medium leading-none ${accent ? 'text-clay' : 'text-ink'}`} style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          {value}
        </span>
        {unit && <span className="font-display text-[12px] text-muted">{unit}</span>}
      </div>
      <span className="mt-1.5 text-[11px] tracking-[0.06em] text-muted">{label}</span>
    </div>
  )
}

/* 선형 진행 게이지 — 다음 자리까지 */
export function ProgressBar({ pct, height = 3, track = 'bg-line', fill = 'bg-clay' }: { pct: number; height?: number; track?: string; fill?: string }) {
  return (
    <div className={`w-full overflow-hidden rounded-full ${track}`} style={{ height }}>
      <div className={`h-full rounded-full ${fill} transition-[width] duration-700`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  )
}

/* km 스플릿 바 — NRC 스플릿 테이블의 순례 버전. 가장 빠른 구간 하이라이트 */
export function SplitBars({ splits, units = 'km' }: { splits: number[]; units?: Units }) {
  if (!splits.length) return null
  const max = Math.max(...splits)
  const min = Math.min(...splits)
  return (
    <div className="flex flex-col gap-2">
      {splits.map((sec, i) => {
        const w = max > 0 ? Math.max(14, (sec / max) * 100) : 0
        const fastest = sec === min && splits.length > 1
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="w-6 shrink-0 text-right font-display text-[12px] text-muted" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>{i + 1}</span>
            <div className="h-[18px] flex-1 overflow-hidden rounded-[5px] bg-sand-sunk">
              <div className={`flex h-full items-center justify-end rounded-[5px] pr-2 ${fastest ? 'bg-clay' : 'bg-line-strong'}`} style={{ width: `${w}%` }}>
                <span className={`font-display text-[10.5px] ${fastest ? 'text-sand-raised' : 'text-ink-soft'}`} style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                  {fmtPace(sec, units)}
                </span>
              </div>
            </div>
          </div>
        )
      })}
      <div className="mt-0.5 flex items-center gap-3 pl-9">
        <span className="text-[10.5px] text-muted">가장 빠른 구간 · {fmtPace(min, units)}</span>
      </div>
    </div>
  )
}

/* 요약 3-업 그리드(거리/시간/페이스) */
export function SummaryTriple({ distance, unit, durationSec, paceSec, units }: { distance: string; unit: string; durationSec: number; paceSec: number; units: Units }) {
  return (
    <div className="grid grid-cols-3 divide-x divide-line">
      <Cell big={distance} small={unit} />
      <Cell big={fmtDuration(durationSec)} small="시간" pad />
      <Cell big={fmtPace(paceSec, units)} small={units === 'mi' ? '평균 /MI' : '평균 /KM'} pad />
    </div>
  )
}
function Cell({ big, small, pad }: { big: string; small: string; pad?: boolean }) {
  return (
    <div className={`flex flex-col items-center ${pad ? 'pl-2' : ''}`}>
      <span className="font-display text-[26px] font-medium leading-none text-ink" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>{big}</span>
      <span className="mt-1.5 text-[10.5px] tracking-[0.08em] text-muted">{small}</span>
    </div>
  )
}
