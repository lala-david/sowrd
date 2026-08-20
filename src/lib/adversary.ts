/* 대적 판정 — 상태를 새로 만들지 않는다.
 *
 * 대적의 진행은 저장하지 않는다: journeyKm 하나에서 전부 파생된다(journeyProgress의
 * next·segProgress). 진행도를 이중으로 들면 반드시 어긋난다 — 코스 progress와 journeyKm이
 * 두 진실이었다가 통일된 전례가 있다(pilgrim.ts:407). 대적은 그 위의 읽기 전용 렌즈다. */
import { ADVERSARIES, type Adversary } from '../data/adversaries'

const BY_KEY = new Map(ADVERSARIES.map((a) => [`${a.journeyId}:${a.episodeId}`, a]))

/** 이 여정 이 자리로 들어가는 구간을 막아선 대적. 없으면 undefined */
export const adversaryOf = (journeyId: string, episodeId: string): Adversary | undefined =>
  BY_KEY.get(`${journeyId}:${episodeId}`)

/** 구간 진행(0~1) → 서사 단계. 문장 셋이 1/3씩 나눠 맡는다 */
export const adversaryPhase = (segProgress: number): 0 | 1 | 2 =>
  segProgress < 1 / 3 ? 0 : segProgress < 2 / 3 ? 1 : 2
