import { useState } from 'react'
import { usePilgrim, pilgrimTotals, overallJourneyPct, activeTier, weeklyKm, daysThisWeek } from '../state/pilgrim'
import { STATIONS } from '../data/journey'
import { journeyById } from '../data/geo/journeys'
import { fmtDistance, fmtDuration, fmtPace, unitLabel } from '../lib/format'
import { StatTile, SectionLabel, ProgressBar, SettingSwitch, WeeklyBars } from '../components/ui'
import TabBar from '../components/TabBar'
import { IconPilgrim, IconHeld, IconEmber, IconReached, IconSettings, IconLamp } from '../components/icons'
import { validateAlias } from '../data/prayer'

export default function Profile() {
  const pilgrim = usePilgrim()
  const { units, setUnits, intercessions, addIntercession, removeIntercession, runs, resetAll, textScale, setTextScale, theme, setTheme } = pilgrim
  const totals = pilgrimTotals(pilgrim)
  const overall = overallJourneyPct(pilgrim)
  const tier = activeTier(pilgrim)

  const [draft, setDraft] = useState('')
  const [aliasErr, setAliasErr] = useState<string | null>(null)

  const addPerson = () => {
    const v = validateAlias(draft)
    if (!v.ok) { setAliasErr(v.reason ?? '다시 확인해 주세요.'); return }
    addIntercession(draft)
    setDraft('')
    setAliasErr(null)
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <header className="flex items-center gap-4 px-7" style={{ paddingTop: 'max(3rem, env(safe-area-inset-top))' }}>
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-line-strong bg-sand-raised text-clay-deep">
          <IconPilgrim size={28} />
        </span>
        <div>
          <h1 className="font-serif text-[24px] font-bold leading-tight">순례자</h1>
          {/* 단계는 지금 걷는 여정의 tiers에서 온다 — 예전엔 예수 코스 arc 기반이라
              기본 설정으로 1,000km를 달려도 영원히 3단계 "기적을 지나"였다. */}
          {tier && (
            <>
              <p className="mt-0.5 text-[13px] text-clay-deep">
                {tier.index}/{tier.total}단계 · {tier.name}
              </p>
              {/* 지금 단계를 얼마나 지났는지 — 등급을 정지된 이름표가 아니라 차오르는 게이지로 */}
              <div className="mt-1.5 h-[3px] w-[132px] overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-clay-deep transition-[width] duration-700" style={{ width: `${tier.pct}%` }} />
              </div>
            </>
          )}
        </div>
      </header>

      {/* 누적 통계 */}
      {/* 4칸을 360px에 넣으면 칸당 72px이라 1,000km부터 옆 칸을 침범한다.
          2×2면 152px로 두 배가 되고, 위계상으로도 총 거리가 "이번 주 1일"과 동급일 이유가 없다. */}
      <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-5 px-6">
        <StatTile value={fmtDistance(totals.totalKm, units, totals.totalKm >= 100 ? 0 : 1)} unit={unitLabel(units).toLowerCase()} label="총 거리" accent />
        <StatTile value={totals.totalStations} label="닿은 자리" />
        <StatTile value={totals.totalRuns} label="순례 횟수" />
        {/* 연속일 → 이번 주 달린 날. 스트릭은 월·수·금 러너를 매주 0으로 되돌렸다. */}
        <StatTile value={`${daysThisWeek(pilgrim)}일`} label="이번 주" />
      </div>

      {/* 여정 진도 */}
      <div className="mt-7 px-6">
        <div className="rounded-2xl border border-line bg-sand-raised/40 p-5">
          <div className="flex items-center justify-between">
            <SectionLabel>여정 진도</SectionLabel>
            <span className="font-display text-[15px] text-clay-deep" style={{ fontFeatureSettings: "'lnum' 1" }}>{overall}%</span>
          </div>
          <div className="mt-3"><ProgressBar pct={overall} height={5} /></div>
          {/* 문구도 지금 걷는 여정을 따라간다 — 예전엔 어느 길을 걷든 "예수님의 전 여정"이었다 */}
          <p className="mt-3 text-[12.5px] text-muted">
            {journeyById(pilgrim.activeJourneyId)?.name ?? '이 길'} — 전체 여정 중 {overall}%를 따라 걸었습니다.
          </p>
        </div>
      </div>

      {/* 주간 추이 — 스트릭이 못 보여주던 "꾸준함"을 형태로 보여준다.
          카드 표면은 sand-raised여야 한다(막대 색이 sand-sunk 위에서는 대비 검사에 걸린다). */}
      <div className="mt-5 px-6">
        <SectionLabel>주마다 달린 거리</SectionLabel>
        <div className="mt-3 rounded-2xl border border-line bg-sand-raised/40 p-4">
          <WeeklyBars weeks={weeklyKm(pilgrim, 8)} units={units} />
        </div>
      </div>

      {/* 개인 기록 */}
      <div className="mt-5 px-6">
        <SectionLabel>개인 기록</SectionLabel>
        {/* 기록이 없을 때 '—'를 두지 않는다.
            처음 켠 사람의 프로필에는 0·0·0·0일·0%·"아직 없어요"·—·— 가 한 화면에 열네 개 있었다.
            빈 칸은 사실이지만 아무 일도 시키지 않는다. 첫 기록이 어떻게 생기는지를 대신 말한다. */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-line bg-sand-raised/30 px-4 py-3.5">
            <IconEmber size={18} className="text-clay-deep" />
            <div className="min-w-0">
              {totals.fastest1kSec ? (
                <>
                  <p className="font-display text-[17px] text-ink" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>{fmtPace(totals.fastest1kSec, units)}</p>
                  <p className="text-[11px] text-muted">가장 빠른 1{unitLabel(units).toLowerCase()}</p>
                </>
              ) : (
                <>
                  <p className="font-serif text-[14px] leading-tight text-ink-soft">첫 1{unitLabel(units).toLowerCase()}을 달리면</p>
                  <p className="text-[11px] text-muted">여기 기록이 남습니다</p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-line bg-sand-raised/30 px-4 py-3.5">
            <IconReached size={18} className="text-olive-deep" />
            <div className="min-w-0">
              {totals.longestRunKm > 0 ? (
                <>
                  <p className="font-display text-[17px] text-ink" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>{`${fmtDistance(totals.longestRunKm, units, 1)}${unitLabel(units).toLowerCase()}`}</p>
                  <p className="text-[11px] text-muted">가장 긴 순례</p>
                </>
              ) : (
                <>
                  <p className="font-serif text-[14px] leading-tight text-ink-soft">가장 멀리 간 날</p>
                  <p className="text-[11px] text-muted">아직 그 날이 오지 않았습니다</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 품고 달리는 사람들 — 여러 명을 등록하고, 러닝을 시작할 때 한 명을 고른다.
          예전엔 단 한 명만 저장됐고 실명 필터(validateAlias)를 우회했다. */}
      <div className="mt-5 px-6">
        <SectionLabel>품고 달리는 사람들</SectionLabel>

        {intercessions.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {intercessions.map((ic) => (
              <div key={ic.id} className="flex items-center gap-3 rounded-xl border border-line bg-sand-raised/30 px-4 py-3">
                <span className="text-rubric"><IconHeld size={18} /></span>
                <span className="flex-1 text-[14px] text-ink-soft">{ic.alias}</span>
                <button
                  onClick={() => removeIntercession(ic.id)}
                  aria-label={`${ic.alias} 지우기`}
                  className="-mr-1 flex min-h-[44px] min-w-[44px] items-center justify-center text-[13px] text-muted transition active:scale-90"
                >
                  지우기
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-line bg-sand-raised/30 px-4 py-2">
          <span className="text-muted"><IconHeld size={18} /></span>
          <input
            value={draft}
            onChange={(e) => { setDraft(e.target.value); setAliasErr(null) }}
            maxLength={8}
            placeholder="이니셜 또는 별칭 (예: J.S, 은혜)"
            className="min-h-[44px] flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-muted"
            onKeyDown={(e) => e.key === 'Enter' && addPerson()}
          />
          <button onClick={addPerson} className="min-h-[44px] rounded-lg bg-clay-deep px-4 text-[13px] text-sand-raised transition active:scale-95">더하기</button>
        </div>
        {aliasErr && <p className="mt-1.5 px-1 text-[11.5px] text-rubric">{aliasErr}</p>}
        <p className="mt-2 px-1 text-[11.5px] leading-relaxed text-muted">
          실명 대신 이니셜·별칭만. 기도 제목은 이 기기에만 남고 공유되지 않습니다.
        </p>
      </div>

      {/* 활동 히스토리 */}
      <div className="mt-6 px-6">
        <SectionLabel>순례 기록</SectionLabel>
        <div className="mt-3 flex flex-col divide-y divide-line">
          {runs.length === 0 && <p className="py-4 text-[13px] text-muted">아직 기록이 없어요. 첫 순례를 시작해보세요.</p>}
          {runs.slice(0, 12).map((r) => {
            const d = new Date(r.endedAt)
            /* 이 런에서 닿은 자리 이름.
             * 진행을 여정 하나로 통일하면서 새 런의 r.reached(예수 코스)는 늘 비어 있고,
             * 실제 도달은 r.reachedEpisodes(여정)에 담긴다. 예전 기록은 r.reached에 남아 있으므로
             * 둘 다 읽어야 기록이 과거·현재 모두 온전히 보인다. */
            const journeyOfRun = r.journeyId ? journeyById(r.journeyId) : undefined
            const reached = [
              ...r.reached.map((id) => STATIONS[id]?.place),
              ...(r.reachedEpisodes ?? []).map((id) => journeyOfRun?.episodes.find((e) => e.id === id)?.place),
            ].filter(Boolean)
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
              <button key={u} onClick={() => setUnits(u)} className={`min-h-[44px] min-w-[52px] px-3.5 text-[13px] uppercase ${units === u ? 'bg-clay-deep text-sand-raised' : 'text-muted'}`}>{u}</button>
            ))}
          </div>
        </div>
        {/* 글자 크기 — 이 앱의 폰트는 전부 px 하드코딩이라 브라우저·OS의 글꼴 설정이 듣지 않는다.
            그래서 앱이 직접 레버를 준다. 노안 사용자에게는 이게 유일한 수단이다. */}
        <div className="mt-3 flex items-center justify-between rounded-xl border border-line bg-sand-raised/30 px-4 py-3">
          <span className="flex items-center gap-2.5 text-[14px] text-ink-soft">
            <IconSettings size={18} className="text-muted" /> 글자 크기
          </span>
          <div className="flex overflow-hidden rounded-lg border border-line-strong">
            {([['normal', '보통'], ['large', '크게'], ['xlarge', '더 크게']] as const).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setTextScale(v)}
                aria-pressed={textScale === v}
                className={`min-h-[44px] px-3 text-[13px] ${textScale === v ? 'bg-clay-deep text-sand-raised' : 'text-muted'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 테마 — "밤의 순례길 · 등불" 토큰은 처음부터 다 정의돼 있었는데 켜지는 곳이
            러닝 화면 한 군데뿐이었다. 새벽 5시에 열어도 크림색이었다는 뜻이다.
            기본은 '기기 설정'이라 아무것도 안 만져도 밤에는 밤이 된다. */}
        <div className="mt-3 flex items-center justify-between rounded-xl border border-line bg-sand-raised/30 px-4 py-3">
          <span className="flex items-center gap-2.5 text-[14px] text-ink-soft">
            <IconLamp size={18} className="text-muted" /> 화면
          </span>
          <div className="flex overflow-hidden rounded-lg border border-line-strong">
            {([['system', '기기'], ['light', '낮'], ['dark', '밤']] as const).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setTheme(v)}
                aria-pressed={theme === v}
                className={`min-h-[44px] px-3 text-[13px] ${theme === v ? 'bg-clay-deep text-sand-raised' : 'text-muted'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 경로 기록 — 기본 꺼짐. 켜야 지도에 오늘 달린 길이 그려진다.
            켜면 실좌표를 다루므로, 왜 안전한지를 여기서 밝힌다. */}
        <SettingSwitch
          label="경로 기록"
          hint="달린 길을 지도에 그립니다. 시작·끝 200m는 잘라내 집 위치가 드러나지 않고, 좌표는 이 기기에만 남습니다."
          checked={pilgrim.traceRoute}
          onChange={pilgrim.setTraceRoute}
        />

        <SettingSwitch
          label="호흡 기도"
          hint="발걸음에 맞춰 짧은 기도를 띄웁니다. 반복 자체에 효력이 있지는 않습니다."
          checked={pilgrim.breathPrayer}
          onChange={pilgrim.setBreathPrayer}
        />

        <SettingSwitch
          label="전체 해금"
          hint="모든 자리를 도달한 것으로 봅니다(개발·시연용)."
          checked={pilgrim.admin}
          onChange={pilgrim.setAdmin}
        />

        <div className="mt-4 flex gap-3">
          <button onClick={() => { if (confirm('지금까지의 기록이 데모 데이터로 바뀝니다. 되돌릴 수 없어요. 계속할까요?')) pilgrim.loadDemo() }} className="flex-1 rounded-xl border border-line py-3.5 text-center text-[13px] text-muted transition active:scale-[0.99]">
            데모 데이터 넣기
          </button>
          <button onClick={() => { if (confirm('모든 순례 기록을 지울까요?')) resetAll() }} className="flex-1 rounded-xl border border-line py-3.5 text-center text-[13px] text-muted transition active:scale-[0.99]">
            기록 초기화
          </button>
        </div>
      </div>

      <TabBar active="profile" />
    </div>
  )
}
