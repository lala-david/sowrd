/* 음성 안내 — 러닝 중엔 화면을 못 본다. 1km마다, 자리에 닿을 때 한 마디.
 * speechSynthesis가 없거나(구형) 한국어 음성이 없으면 조용히 아무 일도 하지 않는다. */
let primed = false

export function speak(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  try {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ko-KR'
    u.rate = 1
    const ko = window.speechSynthesis.getVoices().find((v) => v.lang?.toLowerCase().startsWith('ko'))
    if (ko) u.voice = ko
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
    primed = true
  } catch {
    /* noop */
  }
}

/** iOS는 사용자 제스처 안에서 한 번은 말을 해야 그 뒤로 들린다 — 시작 버튼에서 빈 발화 한 번 */
export function primeVoice(): void {
  if (primed || typeof window === 'undefined' || !('speechSynthesis' in window)) return
  try {
    const u = new SpeechSynthesisUtterance(' ')
    u.volume = 0
    window.speechSynthesis.speak(u)
    primed = true
  } catch {
    /* noop */
  }
}
