import { useMemo, useState } from 'react'
import { useNav } from '../store'
import { usePilgrim } from '../state/pilgrim'
import { summarize, shiftPeriod, earliestRecord, type Period } from '../lib/stats'
import { fmtDistance, fmtDuration, fmtPace, unitLabel } from '../lib/format'
import RoadChart from '../components/RoadChart'
import { SectionLabel } from '../components/ui'
import { IconArrow, IconChevron, IconSeal, IconStep, IconTime, IconEmber, IconCairn } from '../components/icons'
import { figureArt, extraArt } from '../assets/art'

/* ── 기록 ───────────────────────────────────────────────────────────────────
 *
 * 주 · 월 · 년. 한 기간에 한 장 — 거리 막대 하나, 숫자 네 개(거리·시간·횟수·달린 날),
 * 평균 페이스, 받은 인장, 지난 기간 대비. 그 이상은 두지 않는다.
 * 비교 상대는 언제나 "지난 나"뿐이다 — 순위·친구 대비는 이 제품에 없다. */

const PERIODS: { id: Period; label: string }[] = [
  { id: 'week', label: '주' },
  { id: 'month', label: '월' },
  { id: 'year', label: '년' },
]

export default function Stats() {
  const go = useNav((s) => s.go)
  const pilgrim = usePilgrim()
  const { units } = pilgrim
  const [period, setPeriod] = useState<Period>('week')
  const [anchor, setAnchor] = useState(() => Date.now())
  const sum = useMemo(() => summarize(pilgrim, period, anchor), [pilgrim, period, anchor])
  const earliest = earliestRecord(pilgrim)
  const canPrev = earliest != null ? shiftPeriod(period, sum.from, -1) + 0 >= shiftPeriod(period, earliest, -1) : false
  const canNext = sum.to <= Date.now()
  const u = unitLabel(units).toLowerCase()
  const delta = sum.km - sum.prevKm
  const avatar = figureArt(pilgrim.avatar)

  const back = () => {
    if (window.history.length > 1) window.history.back()
    else go('profile')
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <header className="flex items-center gap-2 px-3" style={{ paddingTop: 'max(2.2rem, env(safe-area-inset-top))' }}>
        <button onClick={back} aria-label="뒤로" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft transition active:scale-90">
          <IconArrow size={17} className="rotate-180" />
        </button>
        <div className="min-w-0 flex-1">
          <SectionLabel as="span">기록</SectionLabel>
          <h1 className="font-serif text-[22px] font-bold leading-tight text-ink">내가 달린 길</h1>
        </div>
        {avatar && (
          <span className="flex h-10 w-10 shrink-0 overflow-hidden rounded-full" style={{ boxShadow: '0 0 0 2px var(--color-line-strong)' }}>
            <img src={avatar} alt="" className="h-full w-full scale-[1.15] object-cover" />
          </span>
        )}
      </header>

      {/* 기간 고르기 */}
      <div className="mt-4 px-6">
        <div className="flex rounded-full p-[3px]" style={{ background: 'var(--color-sand-sunk)' }} role="tablist" aria-label="기간">
          {PERIODS.map((p) => {
            const on = p.id === period
            return (
              <button
                key={p.id}
                role="tab"
                aria-selected={on}
                onClick={() => {
                  setPeriod(p.id)
                  setAnchor(Date.now())
                }}
                className={`min-h-[38px] flex-1 rounded-full text-[13px] transition ${on ? 'text-ink' : 'text-muted'}`}
                style={{ background: on ? 'var(--color-sand-raised)' : 'transparent', boxShadow: on ? '0 1px 3px rgba(60,40,18,.18)' : 'none' }}
              >
                {p.label}
              </button>
            )
          })}
        </div>

        {/* 기간 이동 */}
        <div className="mt-4 flex items-center justify-between">
          <button onClick={() => setAnchor((a) => shiftPeriod(period, a, -1))} disabled={!canPrev} aria-label="이전 기간" className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition active:scale-90 disabled:opacity-30">
            <IconChevron size={16} className="rotate-180" />
          </button>
          <p className="font-serif text-[16px] text-ink">{sum.title}</p>
          <button onClick={() => setAnchor((a) => shiftPeriod(period, a, 1))} disabled={!canNext} aria-label="다음 기간" className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition active:scale-90 disabled:opacity-30">
            <IconChevron size={16} />
          </button>
        </div>
      </div>

      {/* 주인공 숫자 — 이 기간의 거리. 뒤에는 recraft로 그린 길(돌 이정표가 선 언덕길)이 깔린다 */}
      <div className="relative mt-3 overflow-hidden px-7 py-6">
        {extraArt('stats-hero') && (
          <>
            <img src={extraArt('stats-hero')} alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ objectPosition: 'center 40%' }} />
            <span className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(247,236,213,.92) 0%, rgba(247,236,213,.78) 48%, rgba(247,236,213,.15) 100%)' }} />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-10" style={{ background: 'linear-gradient(to top, var(--color-sand), transparent)' }} />
          </>
        )}
        <p className="relative font-display text-[54px] leading-none text-ink" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          {fmtDistance(sum.km, units, sum.km >= 100 ? 0 : 1)}
          <span className="ml-1.5 text-[18px] text-clay-deep">{u}</span>
        </p>
        <p className="relative mt-1.5 text-[12.5px] text-ink-soft">
          {sum.prevKm > 0 || sum.km > 0 ? (
            delta === 0 ? (
              '지난 기간과 같습니다'
            ) : (
              <>
                지난 {period === 'week' ? '주' : period === 'month' ? '달' : '해'}보다{' '}
                <span className="font-display" style={{ fontFeatureSettings: "'lnum' 1", color: delta > 0 ? 'var(--color-clay-deep)' : 'var(--color-muted)' }}>
                  {delta > 0 ? '+' : '−'}
                  {fmtDistance(Math.abs(delta), units, 1)}
                </span>
                {u}
              </>
            )
          ) : (
            '이 기간에는 기록이 없습니다'
          )}
        </p>
      </div>

      {/* 막대 */}
      <div className="mt-4 px-5">
        <div className="rounded-[22px] px-3 pb-2 pt-3" style={{ background: 'var(--color-sand-raised)', boxShadow: '0 1px 2px rgba(80,60,30,.08), 0 14px 28px -22px rgba(80,60,30,.45)' }}>
          <RoadChart buckets={sum.buckets} units={units} unitLabel={u} height={170} />
        </div>
      </div>

      {/* 숫자 넷 */}
      <div className="mt-5 grid grid-cols-2 gap-3 px-6">
        <Tile icon={<IconTime size={16} />} value={fmtDuration(sum.sec)} label="달린 시간" />
        <Tile icon={<IconEmber size={16} />} value={sum.paceSecPerKm ? fmtPace(sum.paceSecPerKm, units) : '—'} label="평균 페이스" />
        <Tile icon={<IconStep size={16} />} value={`${sum.runs}회`} label={`순례 ${sum.activeDays}일`} />
        <Tile icon={<IconSeal size={16} />} value={`${sum.seals}개`} label="받은 인장" />
      </div>

      <p className="mt-6 flex items-start gap-2 px-7 text-[12px] leading-relaxed text-muted">
        <IconCairn size={13} className="mt-[2px] shrink-0" />
        비교 상대는 지난 나뿐입니다. 순위도, 연속 일수도 세지 않습니다 — 달린 날은 달린 날대로 남습니다.
      </p>

      <div className="h-8" />
    </div>
  )
}

function Tile({ icon, value, label, gold }: { icon: React.ReactNode; value: string; label: string; gold?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-4 py-3.5" style={{ background: 'var(--color-sand-raised)', boxShadow: 'inset 0 0 0 1px var(--color-line)' }}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: gold ? 'var(--color-seal)' : 'var(--color-sand-sunk)', color: gold ? 'var(--color-lapis-surface)' : 'var(--color-clay-deep)' }}>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-display text-[18px] leading-none text-ink" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          {value}
        </span>
        <span className="mt-1 block text-[11px] text-muted">{label}</span>
      </span>
    </div>
  )
}
