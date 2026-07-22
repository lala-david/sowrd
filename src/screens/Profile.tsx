import { useState } from 'react'
import { usePilgrim, pilgrimTotals, overallJourneyPct, journeyTier } from '../state/pilgrim'
import { STATIONS } from '../data/journey'
import { fmtDistance, fmtDuration, fmtPace, unitLabel } from '../lib/format'
import { StatTile, SectionLabel, ProgressBar } from '../components/ui'
import TabBar from '../components/TabBar'
import { IconPilgrim, IconHeld, IconEmber, IconReached, IconSettings } from '../components/icons'

export default function Profile() {
  const pilgrim = usePilgrim()
  const { units, setUnits, streakDays, prayerSubject, setPrayerSubject, runs, resetAll } = pilgrim
  const totals = pilgrimTotals(pilgrim)
  const overall = overallJourneyPct(pilgrim)
  const tier = journeyTier(pilgrim)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(prayerSubject ?? '')

  const saveSubject = () => {
    setPrayerSubject(draft.trim() || undefined)
    setEditing(false)
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <header className="flex items-center gap-4 px-7" style={{ paddingTop: 'max(3rem, env(safe-area-inset-top))' }}>
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-line-strong bg-sand-raised text-clay">
          <IconPilgrim size={28} />
        </span>
        <div>
          <h1 className="font-serif text-[24px] font-bold leading-tight">순례자</h1>
          <p className="mt-0.5 text-[13px] text-clay-deep">{tier}</p>
        </div>
      </header>

      {/* 누적 통계 */}
      <div className="mt-7 grid grid-cols-4 gap-2 px-6">
        <StatTile value={fmtDistance(totals.totalKm, units, totals.totalKm >= 100 ? 0 : 1)} unit={unitLabel(units).toLowerCase()} label="총 거리" accent />
        <StatTile value={totals.totalStations} label="닿은 자리" />
        <StatTile value={totals.totalRuns} label="순례 횟수" />
        <StatTile value={streakDays} label="연속일" />
      </div>

      {/* 여정 진도 */}
      <div className="mt-7 px-6">
        <div className="rounded-2xl border border-line bg-sand-raised/40 p-5">
          <div className="flex items-center justify-between">
            <SectionLabel>여정 진도</SectionLabel>
            <span className="font-display text-[15px] text-clay" style={{ fontFeatureSettings: "'lnum' 1" }}>{overall}%</span>
          </div>
          <div className="mt-3"><ProgressBar pct={overall} height={5} /></div>
          <p className="mt-3 text-[12.5px] text-muted">세례에서 땅 끝까지 — 예수님의 전 여정 중 {overall}%를 따라 걸었습니다.</p>
        </div>
      </div>

      {/* 개인 기록 */}
      <div className="mt-5 px-6">
        <SectionLabel>개인 기록</SectionLabel>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-line bg-sand-raised/30 px-4 py-3.5">
            <IconEmber size={18} className="text-clay" />
            <div>
              <p className="font-display text-[17px] text-ink" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>{totals.fastest1kSec ? fmtPace(totals.fastest1kSec, units) : '—'}</p>
              <p className="text-[11px] text-muted">가장 빠른 1{unitLabel(units).toLowerCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-line bg-sand-raised/30 px-4 py-3.5">
            <IconReached size={18} className="text-olive-deep" />
            <div>
              <p className="font-display text-[17px] text-ink" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>{fmtDistance(totals.longestRunKm, units, 1)}{unitLabel(units).toLowerCase()}</p>
              <p className="text-[11px] text-muted">가장 긴 순례</p>
            </div>
          </div>
        </div>
      </div>

      {/* 오늘 품고 달릴 사람 */}
      <div className="mt-5 px-6">
        <SectionLabel>오늘 품고 달릴 사람</SectionLabel>
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-sand-raised/30 px-4 py-3">
          <span className="text-rubric"><IconHeld size={20} /></span>
          {editing ? (
            <>
              <input
                autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={12}
                placeholder="이니셜 또는 별칭"
                className="flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-muted"
                onKeyDown={(e) => e.key === 'Enter' && saveSubject()}
              />
              <button onClick={saveSubject} className="rounded-lg bg-clay px-3 py-1.5 text-[12px] text-sand-raised">저장</button>
            </>
          ) : (
            <>
              <span className="flex-1 text-[14px] text-ink-soft">{prayerSubject ? prayerSubject : '아직 없어요'}</span>
              <button onClick={() => { setDraft(prayerSubject ?? ''); setEditing(true) }} className="text-[12.5px] text-clay-deep">{prayerSubject ? '바꾸기' : '더하기'}</button>
            </>
          )}
        </div>
        <p className="mt-2 px-1 text-[11.5px] text-muted">이름은 이니셜·별칭만. 기본 비공개입니다.</p>
      </div>

      {/* 활동 히스토리 */}
      <div className="mt-6 px-6">
        <SectionLabel>순례 기록</SectionLabel>
        <div className="mt-3 flex flex-col divide-y divide-line">
          {runs.length === 0 && <p className="py-4 text-[13px] text-muted">아직 기록이 없어요. 첫 순례를 시작해보세요.</p>}
          {runs.slice(0, 12).map((r) => {
            const d = new Date(r.endedAt)
            const reached = r.reached.map((id) => STATIONS[id]?.place).filter(Boolean)
            return (
              <div key={r.id} className="flex items-center gap-4 py-3.5">
                <div className="flex w-12 shrink-0 flex-col items-center">
                  <span className="font-display text-[19px] leading-none text-ink" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>{d.getDate()}</span>
                  <span className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-muted">{['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'][d.getMonth()]}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] text-ink">{r.courseName}{reached.length ? ` · ${reached.join(', ')}` : ''}</p>
                  <p className="mt-0.5 font-display text-[12px] text-muted" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>{fmtDistance(r.distanceKm, units)}{unitLabel(units).toLowerCase()} · {fmtDuration(r.durationSec)} · {fmtPace(r.avgPaceSecPerKm, units)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 설정 */}
      <div className="mt-6 px-6">
        <SectionLabel>설정</SectionLabel>
        <div className="mt-3 flex items-center justify-between rounded-xl border border-line bg-sand-raised/30 px-4 py-3">
          <span className="flex items-center gap-2.5 text-[14px] text-ink-soft"><IconSettings size={18} className="text-muted" /> 거리 단위</span>
          <div className="flex overflow-hidden rounded-lg border border-line-strong">
            {(['km', 'mi'] as const).map((u) => (
              <button key={u} onClick={() => setUnits(u)} className={`px-3.5 py-1.5 text-[12.5px] uppercase ${units === u ? 'bg-clay text-sand-raised' : 'text-muted'}`}>{u}</button>
            ))}
          </div>
        </div>
        <button onClick={() => { if (confirm('모든 순례 기록을 지울까요?')) resetAll() }} className="mt-3 w-full rounded-xl border border-line py-3 text-center text-[13px] text-muted transition active:scale-[0.99]">
          기록 초기화
        </button>
      </div>

      <TabBar active="profile" />
    </div>
  )
}
