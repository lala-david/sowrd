import { useEffect, useState } from 'react'
import { IconShare, IconStep, IconChevron } from './icons'

/* 홈 화면에 추가 유도 — 공유 카드의 설치 링크로 들어온 사람이 "앱"으로 남을 경로.
 *
 * 왜 필요한가: 공유물에 URL을 넣어도(shareCard) 받은 사람이 브라우저 탭으로만 쓰면
 * 다시 안 온다. 홈 화면에 추가돼야 아이콘·오프라인·(설치형에서) 알림이 살아난다.
 * 이게 바이럴 고리의 마지막 고리(수신자 → 설치)를 잇는다.
 *
 * 철학(반-다크패턴): 조르지 않는다. 설치 가능할 때만, 접을 수 있게, 한 번 닫으면 2주 쉰다.
 *  · 안드로이드/데스크톱 크롬: beforeinstallprompt를 가로채 네이티브 설치를 띄운다.
 *  · iOS 사파리: 그 이벤트가 없다 — 공유 → "홈 화면에 추가" 방법을 조용히 안내한다.
 *  · 이미 설치(standalone)됐으면 아무것도 그리지 않는다. */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const SNOOZE_KEY = 'theway.install.snoozeUntil'
const snoozed = () => Date.now() < Number(localStorage.getItem(SNOOZE_KEY) || 0)
const snooze = (days: number) => localStorage.setItem(SNOOZE_KEY, String(Date.now() + days * 864e5))

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true

function detectIOSSafari(): boolean {
  const ua = navigator.userAgent
  const iOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  // iOS에선 사파리만 홈 화면 추가가 된다. 크롬/파폭 등(crios/fxios)은 제외.
  const safari = /safari/i.test(ua) && !/crios|fxios|edgios|android/i.test(ua)
  return iOS && safari
}

export default function InstallPrompt() {
  const [mode, setMode] = useState<'hidden' | 'android' | 'ios'>('hidden')
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [showHow, setShowHow] = useState(false)

  useEffect(() => {
    if (isStandalone() || snoozed()) return

    const onPrompt = (e: Event) => {
      e.preventDefault() // 크롬 기본 미니 인포바를 막고 우리가 원할 때 띄운다
      setDeferred(e as BeforeInstallPromptEvent)
      setMode('android')
    }
    window.addEventListener('beforeinstallprompt', onPrompt)

    // 설치 완료되면 즉시 감춘다
    const onInstalled = () => { setMode('hidden'); snooze(3650) }
    window.addEventListener('appinstalled', onInstalled)

    // iOS 사파리는 beforeinstallprompt가 없다 — 잠깐 뒤 수동 안내를 띄운다(첫 화면을 가리지 않게).
    let t: number | undefined
    if (detectIOSSafari()) t = window.setTimeout(() => setMode((m) => (m === 'hidden' ? 'ios' : m)), 1200)

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      if (t) window.clearTimeout(t)
    }
  }, [])

  if (mode === 'hidden') return null

  const dismiss = () => { snooze(14); setMode('hidden') }

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    setDeferred(null)
    // 수락이면 appinstalled가 감춘다. 거절이면 2주 쉰다.
    if (outcome === 'dismissed') dismiss()
    else setMode('hidden')
  }

  return (
    <div className="anim-rise mx-6 mt-4 rounded-2xl border border-line-strong/60 bg-sand-raised px-4 py-3.5 shadow-[0_1px_2px_rgba(44,33,24,.05),0_16px_34px_-24px_rgba(156,69,34,.4)]">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay-deep text-sand-raised">
          <IconStep size={17} strokeWidth={1.7} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-[14.5px] font-bold leading-snug text-ink">홈 화면에 THE WAY 더하기</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
            {mode === 'android'
              ? '아이콘 하나로 열고, 신호 없는 길에서도 오프라인으로 걷습니다.'
              : '사파리 공유 버튼을 열고 「홈 화면에 추가」를 누르면 됩니다.'}
          </p>

          {mode === 'ios' && showHow && (
            <div className="mt-2.5 flex flex-col gap-2 rounded-xl bg-sand-sunk/70 px-3 py-2.5 text-[12px] text-ink-soft">
              <span className="flex items-center gap-2">
                <IconShare size={15} className="shrink-0 text-clay-deep" />
                아래 도구 막대의 <span className="text-ink">공유</span> 버튼을 누르고
              </span>
              <span className="flex items-center gap-2">
                <span className="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[4px] border border-current text-[13px] leading-none text-clay-deep">+</span>
                목록에서 <span className="text-ink">「홈 화면에 추가」</span>를 선택하세요.
              </span>
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            {mode === 'android' ? (
              <button
                onClick={install}
                className="rounded-full bg-clay-deep px-4 py-2 text-[12.5px] text-sand-raised transition active:scale-95"
              >
                추가하기
              </button>
            ) : (
              <button
                onClick={() => setShowHow((s) => !s)}
                className="flex items-center gap-1 rounded-full bg-clay-deep px-4 py-2 text-[12.5px] text-sand-raised transition active:scale-95"
              >
                {showHow ? '접기' : '방법 보기'}
                <IconChevron size={12} className={showHow ? '-rotate-90' : 'rotate-90'} />
              </button>
            )}
            <button onClick={dismiss} className="tap px-3 py-2 text-[12.5px] text-muted transition active:scale-95">
              나중에
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
