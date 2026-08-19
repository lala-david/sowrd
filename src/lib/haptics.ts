/* 햅틱 어휘 — BUILD-SPECS C절. 러닝 중에는 화면을 볼 수 없으므로 진동이 곧 인터페이스다.
 *
 * 원칙
 *  · arrival이 시그니처다. 다른 어떤 이벤트도 이만큼 길게 울리지 않는다.
 *  · 에러 진동은 off-route 하나뿐. 진동으로 사용자를 나무라지 않는다.
 *  · iOS 사파리에는 Vibration API가 없다. 조용히 실패하게 두고(no-op), 소리·시각 신호로 보완한다.
 *  · prefers-reduced-motion을 존중한다 — 전정기관 민감 사용자에게 긴 진동은 모션과 같은 부담이다.
 */
export type Haptic =
  | 'split' // km 경계
  | 'approach' // 다음 자리 ~250m
  | 'arrival' // ★ 자리 도달 — 시그니처
  | 'pause'
  | 'resume'
  | 'prayer' // 중보 시작
  | 'tap' // 보드의 자리를 누름 — 아주 짧게
  | 'offRoute' // 유일한 에러 진동
  | 'episodeComplete'

const PATTERNS: Record<Haptic, number[]> = {
  split: [120, 60, 120],
  approach: [40, 40, 40, 40, 40, 40, 200],
  arrival: [300, 120, 300, 120, 500],
  pause: [200, 100, 60],
  resume: [60, 100, 200],
  prayer: [500],
  tap: [14],
  offRoute: [80, 80, 80, 80, 80, 80],
  episodeComplete: [200, 80, 200, 80, 200, 80, 600],
}

const reducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** 진동을 울린다. 미지원(iOS)·reduce-motion이면 아무 일도 하지 않는다. */
export function haptic(kind: Haptic): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  if (reducedMotion()) return
  try {
    navigator.vibrate(PATTERNS[kind])
  } catch {
    /* 사용자 제스처 없이 호출되면 브라우저가 막는다 — 무시 */
  }
}

/** 진동 지원 여부(설정 화면에서 안내용) */
export const hapticsSupported = (): boolean =>
  typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
