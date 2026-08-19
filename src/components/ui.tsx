import { bandOf, BAND_COLOR } from '../lib/runAnalysis'
import type { ReactNode } from 'react'
import { fmtDuration, fmtPace, type Units } from '../lib/format'

/* 작은 라벨 — 섹션 머리. display 폰트 + 넓은 자간.
 * 기본은 h2다. span이었을 때는 Profile·Reveal·Collection·Setup의 모든 섹션 머리가
 * 스크린리더의 제목 탐색에서 사라져, 화면 구조를 잡을 방법이 없었다. */
export function SectionLabel({
  children,
  className = '',
  as: As = 'h2',
}: {
  children: ReactNode
  className?: string
  as?: 'h2' | 'h3' | 'span'
}) {
  return (
    <As className={`font-display text-[12px] uppercase tracking-[0.26em] text-muted ${className}`}>{children}</As>
  )
}

/* 설정 스위치 — 켜짐/꺼짐이 색만이 아니라 손잡이 위치로도 읽혀야 한다(색약 대응).
 * 행 전체가 라벨이라 44px 터치 타깃을 만족한다. */
export function SettingSwitch({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="mt-3 flex min-h-[56px] cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-sand-raised/30 px-4 py-3">
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] text-ink-soft">{label}</span>
        {hint && <span className="mt-0.5 block text-[11.5px] leading-relaxed text-muted">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="relative h-[34px] w-[58px] shrink-0 rounded-full border transition"
        style={{
          background: checked ? 'var(--color-clay-deep)' : 'var(--color-sand-sunk)',
          borderColor: checked ? 'var(--color-clay-deep)' : 'var(--color-muted)',
        }}
      >
        <span
          className="absolute left-[3px] top-[3px] h-7 w-7 rounded-full transition-transform duration-200"
          style={{
            transform: checked ? 'translateX(24px)' : 'none',
            background: checked ? 'var(--color-sand-raised)' : 'var(--color-muted)',
          }}
        />
      </button>
    </label>
  )
}

/* 통계 타일 — 큰 숫자 + 라벨(프로필/요약). 숫자는 등폭 lining */
export function StatTile({ value, unit, label, accent }: { value: ReactNode; unit?: string; label: string; accent?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex min-w-0 items-baseline gap-1">
        {/* 누적 1,285km는 주 3회 5km로 1년 4개월이면 닿는다. 그때 "1285 km"가 86.8px가 되어
            72px 트랙을 넘고 옆 칸 숫자와 겹쳤다 — 가장 오래 쓴 사용자에게만 깨지는 화면이었다. */}
        <span className={`font-display font-medium leading-none ${accent ? 'text-clay' : 'text-ink'}`} style={{ fontSize: String(value).length >= 5 ? 22 : String(value).length >= 4 ? 25 : 28, fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          {value}
        </span>
        {unit && <span className="font-display text-[12px] text-muted">{unit}</span>}
      </div>
      <span className="mt-1.5 text-[11px] tracking-[0.06em] text-muted">{label}</span>
    </div>
  )
}

/* 선형 진행 게이지 — 다음 자리까지 */
export function ProgressBar({ pct, height = 3, track = 'bg-line', fill = 'bg-clay-deep' }: { pct: number; height?: number; track?: string; fill?: string }) {
  return (
    <div className={`w-full overflow-hidden rounded-full ${track}`} style={{ height }}>
      <div className={`h-full rounded-full ${fill} transition-[width] duration-700`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  )
}

/* 1km마다 걸린 시간 — 오늘 평균을 중앙축으로 하는 발산 막대.
 *
 * 왜 0 기준이 아닌가: 실제 러너의 스플릿은 서로 5% 안쪽에서 놀기 때문에, 0에서 시작하는
 * 막대로 그리면 전형적인 5km 런(372·365·381·369·358초)의 길이 차가 300px 트랙에서
 * 18px(6%)밖에 안 난다 — 다섯 개가 사실상 같은 길이다. 평균을 중앙에 놓고 편차만 그리면
 * 같은 데이터가 ±15초 축에서 168px 차로 벌어진다(12.6배).
 *
 * 색은 발산 2색 + 중립. 글자는 막대 밖에 둔다 — 안에 넣으면 채움색에 따라 대비가 무너진다
 * (측정: 가장 자주 나오는 존에서 글자 1.99:1). */
export function SplitBars({
  splits,
  units = 'km',
  avgPaceSecPerKm,
}: {
  splits: number[]
  units?: Units
  avgPaceSecPerKm?: number
}) {
  if (!splits.length) return null
  /* 중앙축은 **스플릿의 평균**이다.
   * 예전엔 호출부가 넘긴 avgPaceSecPerKm(= elapsedSec/distanceKm)을 축으로 썼는데,
   * 그 값은 1km를 못 채운 마지막 구간까지 포함한다. 4.9km/1900초 런에서 화면 평균은
   * 6'28"인데 스플릿 평균은 5'50" — 38초가 어긋나 모든 막대가 한쪽으로 쏠렸다.
   * 라벨에는 호출부의 평균을 그대로 쓴다(요약 카드의 숫자와 맞아야 하므로). */
  const avg = splits.reduce((a, b) => a + b, 0) / splits.length
  const labelAvg = avgPaceSecPerKm ?? avg

  // 구간이 2개 이하면 막대로 비교할 것이 없다 — 값만 적는다
  if (splits.length < 3) {
    return (
      <div className="flex flex-col gap-1.5">
        {splits.map((sec, i) => (
          <div key={i} className="flex items-baseline justify-between">
            <span className="text-[12.5px] text-muted">{i + 1}km째</span>
            <span className="font-display text-[14px] text-ink" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
              {fmtPace(sec, units)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // 축은 대칭. 최대 편차를 15/30/60/90초 중 하나로 올려 잡는다(최소 ±15초)
  const maxAbs = Math.max(...splits.map((s) => Math.abs(s - avg)))
  /* 축이 데이터를 자르지 않게 한다.
   * `?? 90`이면 한 구간이 크게 터진 런에서 600초 구간과 900초 구간이 **같은 길이**로 그려져
   * 이상치가 시각적으로 삭제됐다. 넘어가면 30초 단위로 축을 키운다. */
  const axis = [15, 30, 60, 90].find((v) => maxAbs <= v) ?? Math.ceil(maxAbs / 30) * 30
  const fastest = Math.min(...splits)

  return (
    <div className="flex flex-col gap-2">
      {splits.map((sec, i) => {
        const d = sec - avg // 양수면 평균보다 느림
        const pct = Math.min(50, (Math.abs(d) / axis) * 50)
        const band = bandOf(sec, avg)
        return (
          <div key={i} className="flex items-center gap-2.5">
            <span className="w-12 shrink-0 text-right text-[11px] text-muted">{i + 1}km째</span>
            <div className="relative h-[16px] flex-1">
              {/* 중앙축 — 오늘 평균 */}
              <span className="absolute left-1/2 top-0 h-full w-px" style={{ background: 'var(--color-line-strong)' }} />
              <span
                className="absolute top-[3px] h-[10px] rounded-[3px]"
                style={{
                  background: BAND_COLOR[band],
                  width: `${Math.max(1.5, pct)}%`,
                  left: d >= 0 ? '50%' : undefined,
                  right: d < 0 ? '50%' : undefined,
                }}
              />
            </div>
            <span
              className="w-12 shrink-0 font-display text-[11.5px] text-ink-soft"
              style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
            >
              {fmtPace(sec, units)}
            </span>
          </div>
        )
      })}
      {/* 축 눈금은 좌우 두 개만. 세 토막으로 나누면 트랙 138px 안에서 전부 2줄로 접혀
          "빠름"과 "−15초"가 위아래로 갈라졌다 — 이 차트를 해독할 유일한 열쇠가 뭉개졌다.
          중앙축 설명은 아래 전체폭 한 문장으로 내린다. */}
      <div className="mt-1 flex items-center gap-2.5 text-[11px] text-muted">
        <span className="w-12 shrink-0" />
        <span className="flex flex-1 justify-between whitespace-nowrap">
          <span>−{axis}초</span>
          <span>+{axis}초</span>
        </span>
        <span className="w-12 shrink-0" />
      </div>
      <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">
        가운데 선은 구간 평균{' '}
        <span className="font-display text-ink-soft" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          {fmtPace(Math.round(labelAvg), units)}
        </span>
        . 왼쪽으로 뻗을수록 그보다 빨랐던 구간입니다.
      </p>
      <p className="sr-only">가장 빠른 구간 {fmtPace(fastest, units)}</p>
    </div>
  )
}

/* 주간 거리 추이 — 최근 8주, 월요일 시작.
 *
 * 왜 스트릭이 아니라 이것인가: 스트릭은 "매일"을 전제해서 월·수·금으로 꾸준히 달리는 사람을
 * 매주 0으로 되돌린다. 가장 흔하고 가장 건강한 러닝 패턴을 실패로 채점하는 지표다.
 * 주 단위 막대는 같은 사람을 "8주 연속"으로 정확히 센다.
 *
 * 형태: 크기 비교 + 시간 순서 → 세로 막대, 0 기준선. (스플릿과 달리 여기선 0 기준이 맞다 —
 * 주간 거리는 0에서 시작하는 절대량이고, 실제로 0인 주가 존재한다.)
 * 색: 단일 시리즈 + 이번 주만 강조. 지난 주는 clay와 정상시야 ΔE 16.4로 갈리는 중립 회색.
 * 값 라벨은 이번 주에만 붙인다 — 모든 막대에 숫자를 얹으면 형태가 안 보인다. */
export function WeeklyBars({
  weeks,
  units = 'km',
}: {
  weeks: { weekStart: string; km: number; runs: number }[]
  units?: Units
}) {
  const max = Math.max(...weeks.map((w) => w.km), 0)
  const total = weeks.reduce((a, w) => a + w.km, 0)
  const lastIdx = weeks.length - 1

  if (total <= 0) {
    return (
      <p className="text-[13px] leading-relaxed text-ink-soft">
        아직 그릴 기록이 없어요. 한 번 달리고 나면 여기에 주마다 쌓입니다.
      </p>
    )
  }

  // 눈금은 위 하나만 — 격자를 채우면 데이터보다 격자가 진해진다
  const axisTop = Math.ceil(max * 1.05 * 10) / 10
  const H = 92

  return (
    <div>
      {/* 막대는 텍스트 없는 span이라 스크린리더가 8주 중 이번 주 하나밖에 못 읽었다.
          표 형태로 전체를 읽히게 한다(시각적으로는 숨긴다 — 같은 정보를 두 번 그릴 이유는 없다). */}
      <table className="sr-only">
        <caption>최근 {weeks.length}주 주간 달린 거리</caption>
        <tbody>
          {weeks.map((w, i) => (
            <tr key={w.weekStart}>
              <th scope="row">{i === lastIdx ? '이번 주' : `${lastIdx - i}주 전`}</th>
              <td>{w.km > 0 ? `${w.km.toFixed(1)}${units}, ${w.runs}회` : '달리지 않음'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div aria-hidden="true" className="relative" style={{ height: H }}>
        {/* 눈금 하나 — axisTop이 계산만 되고 화면엔 없었다. 그래서 이번 주 말고는
            막대가 3km인지 30km인지 알 방법이 없었다. */}
        <span className="absolute inset-x-0 top-0 h-px" style={{ background: 'var(--color-line)' }} />
        <span className="absolute right-0 top-0 font-display text-[10px] leading-none text-muted" style={{ transform: 'translateY(-115%)', fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          {axisTop}{units}
        </span>
        <div className="flex h-full items-end justify-between gap-[3px]">
        {weeks.map((w, i) => {
          const isNow = i === lastIdx
          const h = axisTop > 0 ? (w.km / axisTop) * (H - 18) : 0
          return (
            <div key={w.weekStart} className="flex min-w-0 flex-1 flex-col items-center justify-end" style={{ height: H }}>
              {isNow && w.km > 0 && (
                <span
                  className="mb-1 font-display text-[10.5px] leading-none text-clay-deep"
                  style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
                >
                  {w.km.toFixed(1)}
                </span>
              )}
              <span
                className="w-full rounded-t-[4px]"
                style={{
                  height: Math.max(w.km > 0 ? 3 : 1.5, h),
                  /* 0km 주는 --color-line이라 표면 대비 1.27:1 — 사실상 안 보였다.
                     "쉰 주"도 데이터이므로 보여야 한다. line-strong이면 3:1을 넘는다. */
                  background: w.km > 0 ? (isNow ? 'var(--color-clay)' : 'var(--color-chart-quiet)') : 'var(--color-line-strong)',
                }}
              />
            </div>
          )
        })}
        </div>
      </div>
      {/* 0 기준선 — 막대가 어디에 앉아 있는지 밝힌다 */}
      <div className="h-px w-full" style={{ background: 'var(--color-line-strong)' }} />
      {/* 축 라벨은 양 끝만. 8칸 전부에 "n주 전"을 적으면 360px에서 글자가 서로 겹친다 */}
      <div aria-hidden="true" className="mt-1.5 flex justify-between text-[11px] leading-none text-muted">
        <span>{lastIdx}주 전</span>
        <span className="text-ink-soft">이번 주</span>
      </div>
      {/* 색만으로 읽히지 않게 문장으로도 말한다 */}
      <p className="mt-3 text-[12.5px] leading-relaxed text-ink-soft">
        최근 {weeks.length}주에 <span className="font-display text-ink" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>{total.toFixed(1)}{units}</span>
        를 달렸어요. 달린 주는 {weeks.filter((w) => w.km > 0).length}주입니다.
      </p>
    </div>
  )
}

/* 요약 3-업 그리드(거리/시간/페이스) */
export function SummaryTriple({ distance, unit, durationSec, paceSec, units }: { distance: string; unit: string; durationSec: number; paceSec: number; units: Units }) {
  return (
    <div className="grid grid-cols-3 divide-x divide-line">
      <Cell big={distance} small={unit} />
      <Cell big={fmtDuration(durationSec)} small="시간" />
      <Cell big={fmtPace(paceSec, units)} small="평균 페이스" />
    </div>
  )
}
function Cell({ big, small }: { big: string; small: string }) {
  /* 자릿수에 따라 줄인다.
   * 360px에서 이 칸의 내용폭은 76.8px인데, 26px 서체로 "1:02:33"은 88.2px다(+11.4px 초과).
   * grid-cols-3은 minmax(0,1fr)이라 트랙이 늘어나지 않고 글자가 그대로 삐져나와
   * 구분선과 옆 칸 숫자를 덮었다 — 하프(21km) 이상을 뛴 사람은 예외 없이 겪는다.
   * pad(pl-2)도 한쪽만 밀어서 중앙축을 어긋나게 했다. 좌우 균등으로 바꾼다. */
  const fs = big.length >= 8 ? 19 : big.length >= 7 ? 21 : big.length >= 6 ? 23 : 26
  return (
    <div className="flex min-w-0 flex-col items-center px-1">
      <span className="font-display font-medium leading-none text-ink" style={{ fontSize: fs, fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>{big}</span>
      <span className="mt-1.5 text-center text-[11px] tracking-[0.08em] text-muted">{small}</span>
    </div>
  )
}
