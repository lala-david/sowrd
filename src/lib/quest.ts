import type { Journey, JourneyEpisode } from '../data/geo/journeys'
import { journeyProgress, toRealKm, tierOfEpisode } from '../data/geo/journeys'

/* ── 퀘스트 레이어 ─────────────────────────────────────────────────────────
 *
 * DECISIONS D3: **"게임의 뼈, 순례의 살"** — 동작 메커니즘은 게임급(진행·해금·수집·연속),
 * 표면 어휘는 순례(자리·인장·봉인·여권). "레벨/클리어/보스/가챠"는 금지어다.
 * 그래서 이 파일은 게임 상태기(state machine)를 만들되, 이름은 전부 순례의 말로 붙인다.
 *
 * 왜 필요한가: 이 앱이 지루했던 이유는 취향이 아니라 구조였다.
 *   · 다음 자리까지 4km인데 한 번 달리면 3km — 열 번에 여덟아홉 번은 아무 일도 안 일어난다
 *     (코드 주석에 "78~91%에 달하는 '자리에 못 닿은 러닝'"이라고 이미 적혀 있었다).
 *   · 그 사이를 메울 중간 사건이 홈에서 11px 회색 글씨 하나였다.
 * 진행을 **눈에 보이는 상태**(닿음·지금·다음·봉인)로 바꾸고, 다음 한 걸음을 항상
 * 화면 한가운데 놓는 것이 이 레이어의 일이다. */

export type StopState =
  /** 이미 닿아 인장이 찍힌 자리 */
  | 'reached'
  /** 방금 지나온, 지금 서 있는 자리 */
  | 'current'
  /** 바로 다음 — 이 앱에서 가장 중요한 한 점 */
  | 'next'
  /** 아직 봉인된 자리 */
  | 'sealed'

export interface QuestStop {
  ep: JourneyEpisode
  /** journey.episodes 안에서의 인덱스 */
  index: number
  state: StopState
  /** 이 자리까지 지금부터 **내가 달려야 하는** km (닿은 자리는 0) */
  realKmAway: number
}

export interface QuestChapter {
  name: string
  note: string
  /** 1-based */
  index: number
  total: number
}

export interface QuestNow {
  reachedCount: number
  total: number
  /** 여정 전체 진행률 0~100 */
  pct: number
  current?: JourneyEpisode
  next?: JourneyEpisode
  /** 다음 자리까지 내가 달릴 실제 km */
  toRealKm: number
  /** 지금 구간을 얼마나 걸어왔나 0~1 — 게이지가 차오르는 값 */
  segProgress: number
  chapter?: QuestChapter
  done: boolean
}

export function questNow(journey: Journey, journeyKm: number): QuestNow {
  const p = journeyProgress(journey, journeyKm)
  const anchor = p.next ?? p.current
  const tier = anchor ? tierOfEpisode(journey, anchor) : undefined
  const tierIdx = tier ? journey.tiers.findIndex((t) => t.id === tier.id) : -1

  return {
    reachedCount: p.reachedCount,
    total: p.total,
    pct: p.pct,
    current: p.current,
    next: p.next,
    toRealKm: toRealKm(journey.id, p.toNextKm),
    segProgress: p.segProgress,
    chapter:
      tier && tierIdx >= 0
        ? { name: tier.name, note: tier.note, index: tierIdx + 1, total: journey.tiers.length }
        : undefined,
    done: p.done,
  }
}

/** 자리 하나의 상태 */
export function stopStateAt(index: number, reachedCount: number): StopState {
  if (index < reachedCount - 1) return 'reached'
  if (index === reachedCount - 1) return 'current'
  if (index === reachedCount) return 'next'
  return 'sealed'
}

/* 보드 레이아웃(자리 좌표·패널)은 lib/board.ts가 맡는다. 예전의 questWindow/questAll/
 * questChapterStops(실좌표 창 자르기)는 보드가 여정 전체를 한 장으로 그리면서 필요 없어졌다. */

/** 지금 걷고 있는 장의 번호(0-based) */
export function currentTierIndex(journey: Journey, journeyKm: number): number {
  const p = journeyProgress(journey, journeyKm)
  const anchor = p.next ?? p.current
  if (!anchor) return 0
  const t = tierOfEpisode(journey, anchor)
  const i = t ? journey.tiers.findIndex((x) => x.id === t.id) : 0
  return Math.max(0, i)
}

/* ── 오늘 한 걸음 ───────────────────────────────────────────────────────────
 * "아직 없음" 대신 **지금 할 수 있는 다음 것**을 말한다. 빈 상태를 장부가 아니라
 * 초대로 바꾸는 문장들이다. 과장하지 않는다 — 유쾌하되 호들갑스럽지 않게. */
export function questCall(q: QuestNow, units: string, firstRun: boolean, nextMilestoneRealKm?: number): string {
  if (q.done) return '이 길을 끝까지 걸었습니다'
  if (!q.next) return '길이 이어집니다'
  const km = q.toRealKm
  const d = km < 10 ? km.toFixed(1) : Math.round(km).toString()
  if (firstRun) return `${d}${units}면 첫 자리 ${q.next.place}에 닿습니다`
  if (km <= 1) return `${d}${units} 남았습니다 — ${q.next.place}가 코앞입니다`
  /* 자리가 멀면 이정표를 먼저 말한다 — "37km"가 홈에 뜨면 오늘 달릴 이유가 안 된다 */
  if (km > 8 && nextMilestoneRealKm != null && nextMilestoneRealKm > 0.2 && nextMilestoneRealKm < km) {
    return `다음 이정표까지 ${nextMilestoneRealKm.toFixed(1)}${units} · ${q.next.place}까지 ${d}${units}`
  }
  if (q.segProgress >= 0.5) return `${q.next.place}까지 ${d}${units} — 절반을 넘었습니다`
  return `${q.next.place}까지 ${d}${units}`
}

/* 수난 구간에서는 게임 요소를 끈다.
 *
 * "예뻐서"가 아니라 기획서의 절대 원칙이다(PLANNING §4.3 — 십자가를 보스전으로 만들지 않는다,
 * CONTENT-UX §수난 = 게임 완전 OFF). 축하·팝·인장 애니메이션은 이 함수가 false를 주면 전부 죽는다.
 *
 * 한계: 성경 여정 데이터(geo/journeys/*.json)에는 mood 필드가 없다 — 예수 자리(journey.ts의
 * STATIONS)에만 있다. 그래서 지금은 예수 자리에서만 판정이 가능하고, 나머지 여정은
 * 데이터가 생기기 전까지 항상 on이다. 이 구멍은 데이터 쪽에서 막아야 한다. */
export const SOLEMN_MOODS = ['lament'] as const
export function celebrationAllowed(mood?: string): boolean {
  return !mood || !(SOLEMN_MOODS as readonly string[]).includes(mood)
}
