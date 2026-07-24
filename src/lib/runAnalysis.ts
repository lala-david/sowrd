/* 러닝 분석 — 기록에서 읽어낼 수 있는 것만 정직하게 계산한다.
 *
 * 원칙
 *  · 남과 비교하지 않는다. 모든 지표는 "나의 오늘"과 "나의 지난 기록" 사이에서만 의미를 갖는다
 *    (DESIGN-PHILOSOPHY §1-⑤ 순례의 시간 — 순위표 금지).
 *  · 추정을 사실처럼 말하지 않는다. VO2max·칼로리처럼 체중·심박 없이 못 구하는 값은 만들지 않는다.
 *  · 못 잰 것은 못 잰다고 한다(고도·심박·케이던스는 센서가 없으면 비운다).
 */

/* 지도용 3계급 — 5계급은 all-pairs 색약 검사에서 붕괴한다(최악 쌍 protan ΔE 3.7).
 * 지도는 어떤 두 선분도 이웃이 될 수 있어 인접 쌍만 보는 것보다 훨씬 엄격한 검사가 필요하다. */
export type PaceBand = 'slow' | 'even' | 'fast'

export const BAND_COLOR: Record<PaceBand, string> = {
  slow: 'var(--color-pace-slow)',
  even: 'var(--color-pace-even)',
  fast: 'var(--color-pace-fast)',
}
export const BAND_LABEL: Record<PaceBand, string> = {
  slow: '평소보다 느리게',
  even: '평소 속도',
  fast: '평소보다 빠르게',
}

export function bandOf(paceSecPerKm: number, avgPaceSecPerKm: number): PaceBand {
  if (avgPaceSecPerKm <= 0) return 'even'
  const r = paceSecPerKm / avgPaceSecPerKm
  return r > 1.08 ? 'slow' : r < 0.92 ? 'fast' : 'even'
}

/* 구간 하나. 5계급 zone·deltaSec 필드가 있었지만 어느 화면도 안 써서 지웠다
 * (5계급 존 자체가 색약 검사에 걸리는 죽은 코드였다 — bandOf 3계급만 남긴다). */
export interface SplitAnalysis {
  km: number
  sec: number
}

export interface RunAnalysis {
  splits: SplitAnalysis[]
  avgPaceSecPerKm: number
  fastestKm?: number
  /** 후반이 전반보다 빨랐는가 — 러닝에서 가장 좋은 신호로 치는 배분 */
  negativeSplit: boolean
  /** 앞뒤 절반의 평균 페이스 차(초). 음수면 후반이 빠름 */
  halfDiffSec: number
  /** 페이스 폭(초). 관측값 max−min. n<2면 0 */
  spreadSec: number
  /** 후반 배분을 주장해도 될 만큼 구간이 있는가(4개 이상) */
  splitConfident: boolean
  /** 자기 중앙값보다 25% 이상 느린 구간 수 — 걷기라고 주장하지 않는다 */
  slowSegments: number
}

/** 후반 배분을 주장해도 되는 최소 차이(초). 참 효과 0에서 오탐 5% 수준 */
function halfDiffThreshold(splits: number[]): number {
  const n = splits.length
  if (n < 4) return Infinity
  const mean = splits.reduce((a, b) => a + b, 0) / n
  const sd = Math.sqrt(splits.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, n - 1))
  // σ(halfDiff) ≈ sd·√(4/n), 단측 5% → 1.645배. 최소 10초는 둔다(sd가 0에 가까울 때의 방어)
  return Math.max(10, 1.645 * sd * Math.sqrt(4 / n))
}

export function analyzeRun(splits: number[], distanceKm: number, durationSec: number): RunAnalysis {
  const avg = distanceKm > 0 ? durationSec / distanceKm : 0
  const list: SplitAnalysis[] = splits.map((sec, i) => ({ km: i + 1, sec }))

  const half = Math.floor(splits.length / 2)
  const mean = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)
  const firstHalf = mean(splits.slice(0, half))
  const secondHalf = mean(splits.slice(splits.length - half))
  const halfDiffSec = half > 0 ? Math.round(secondHalf - firstHalf) : 0

  /* 페이스 폭 — 관측값 하나로 통일한다(max − min).
   *
   * 예전엔 n<5면 범위, n≥5면 MAD×1.4826을 썼다. 셋 다 틀렸다:
   *  1. SD를 버린 근거("n=3에서 90% 구간이 7.7배")가 대체품에 그대로 적용됐다 —
   *     구현된 값의 p95/p05는 n=3에서 7.3배, n=5에서 8.8배로 오히려 SD(3.7배)보다 나빴다.
   *  2. n=4→5 경계에서 숫자가 2.6~2.9배 급락했다. 같은 러너가 4km 대신 5km를 달렸다는
   *     이유만으로 "폭 39초"가 "폭 15초"가 됐다.
   *  3. `sorted[Math.floor(n/2)]`가 짝수 n에서 위쪽 중앙값이라 1km마다 24%씩 톱니가 났다.
   *  4. 무엇보다 MAD가 실제 사건을 지웠다. [350,355,348,600,352,349](4km째에 걸어서 쉼)에서
   *     MAD 기반 값은 4초다 — 실제 max−min은 252초다. 그 폭발은 지워야 할 이상치가 아니라
   *     오늘 러닝에서 일어난 가장 중요한 사건이다.
   *
   * 관측값은 추정량이 아니라서 틀릴 수가 없고, n 경계 불연속도 없다.
   * 다만 n에 따라 커지는 성질이 있으므로 러닝 간 비교에는 쓰지 않는다(추이 그래프 금지). */
  const spreadSec = splits.length < 2 ? 0 : Math.round(Math.max(...splits) - Math.min(...splits))

  const fastest = splits.length ? Math.min(...splits) : undefined

  return {
    splits: list,
    avgPaceSecPerKm: Math.round(avg),
    fastestKm: fastest !== undefined ? splits.indexOf(fastest) + 1 : undefined,
    /* 후반 배분 판정.
     *
     * 예전엔 `n >= 4 && halfDiffSec < 0`이었다. 그 게이트는 오탐률을 **1%도 낮추지 못했다** —
     * 참 효과가 0인 러너 5만 명 시뮬레이션에서 n=4일 때 49.2%, n=12일 때도 47.8%가 true였다.
     * 부호만 보면 동전던지기이고, n은 "판정을 할지 말지"만 정할 뿐 정확도를 못 올린다.
     * 그런데 그 판정 위에 "힘을 아껴 두었다가 뒤에 쓴 배분입니다"라는 의도까지 얹고 있었다.
     *
     * 문턱을 귀무분포에서 유도한다. halfDiff의 표준편차는 대략 σ√(4/n)이고, 단측 5%면
     * 1.645배다. σ는 구간들의 관측 산포에서 추정한다. 이러면 오탐이 5% 근처로 내려간다.
     * 검정력이 낮아지는 것(n=4에서 약 10%)은 결함이 아니라 4km로는 정말 알 수 없다는 사실이다. */
    negativeSplit: splits.length >= 4 && halfDiffSec < -halfDiffThreshold(splits),
    halfDiffSec,
    spreadSec,
    splitConfident: splits.length >= 4,
    slowSegments: (() => {
      // 짝수 n에서 위쪽 중앙값을 쓰면 기준이 위로 밀려 느린 구간이 과소 계상된다
      const sorted = [...splits].sort((a, b) => a - b)
      const n = sorted.length
      const med = n === 0 ? 0 : n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      return splits.filter((x) => med > 0 && x > med * 1.25).length
    })(),
  }
}

/* 오늘의 러닝을 한 문장으로. 칭찬도 질책도 아닌 관찰이어야 한다.
 * 표본이 적을 때는 아무 주장도 하지 않는다 — 예전엔 참 편차 20초짜리 러닝에도
 * n=3에서 23.6% 확률로 "거의 흔들리지 않았습니다"가 나왔다. 숫자로 위장한 노이즈였다. */
export function readingOf(a: RunAnalysis): string {
  if (!a.splits.length) return '1km를 채우기 전에 멈췄습니다. 그래도 걸음은 남았습니다.'
  if (!a.splitConfident) return `${a.splits.length}구간을 달렸습니다. 페이스 이야기를 하기엔 아직 짧습니다.`

  /* 순서를 바꿨다 — 오늘 실제로 일어난 가장 큰 사건을 먼저 말한다.
   * 예전엔 negativeSplit이 먼저라, 4km째에 한 번 걸어서 쉰 러닝도 "후반 배분" 이야기로 처리됐다.
   * [350,355,348,600,352,349] → "후반이 83초 느려졌습니다. 초반을 조금 아껴 두면 끝이 편해집니다."
   * 이 러닝에 대해 그건 틀린 조언이다. 느려진 건 초반 배분 때문이 아니라 한 구간에서 멈췄기 때문이다. */
  if (a.slowSegments > 0) return `${a.splits.length}구간 중 ${a.slowSegments}구간이 눈에 띄게 느렸습니다.`

  /* 의도와 처방을 뺐다. 이 파일이 선언한 원칙은 "관찰"이고, 데이터에는 의도가 없다.
   * "힘을 아껴 두었다가 뒤에 쓴 배분입니다" → 관찰만 남긴다. */
  if (a.negativeSplit) return `뒤 절반이 앞 절반보다 ${Math.abs(a.halfDiffSec)}초 빨랐습니다.`
  if (a.halfDiffSec > 20) return `뒤 절반이 앞 절반보다 ${a.halfDiffSec}초 느렸습니다.`

  /* "고르게"는 실제로 고를 때만 말한다.
   * 예전엔 조건 없이 마지막 분기라, [300,400,300,400](±100초 요동)에도 "고르게 이어진
   * 걸음이었습니다"가 떴다 — 바로 옆에 "구간 차 100초"를 띄워 놓고서. 이 분기가 실제로
   * 나온 러닝들의 max−min 중앙값이 61초, p95가 100초였다. 균일성을 실제로 검사한다. */
  const secs = a.splits.map((s) => s.sec)
  const spread = Math.max(...secs) - Math.min(...secs)
  if (spread <= a.avgPaceSecPerKm * 0.04) return '고르게 이어진 걸음이었습니다.'
  return `가장 빠른 구간과 가장 느린 구간이 ${Math.round(spread)}초 차이였습니다.`
}
