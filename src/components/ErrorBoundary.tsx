import { Component, type ErrorInfo, type ReactNode } from 'react'

/* 렌더 중 예외가 나도 흰 화면이 되지 않게 한다.
 *
 * 왜 필요한가: 코드베이스에 `courseById(id)!` 같은 논널 단언이 네 곳 있고, 영속된
 * activeCourseId가 가리키는 코스가 사라지면 그 자리에서 던진다. React는 렌더 예외 시
 * 트리 전체를 언마운트하므로 화면이 새하얘지는데, **잘못된 id는 localStorage에 그대로
 * 남아 있어서 앱을 껐다 켜도 똑같이 흰 화면**이다. 사용자에게 복구 수단이 없다.
 *
 * 그래서 여기서 두 가지를 준다: 다시 시도(일시적 오류용)와, 설정만 초기화(진행도·기록은
 * 건드리지 않고 화면 선택 상태만 되돌린다). 기록을 지우는 버튼은 두지 않는다 —
 * 오류 화면에서 가장 위험한 버튼이고, 사용자가 잃을 것은 다시 달려야만 되찾을 수 있다. */
interface Props {
  children: ReactNode
}
interface State {
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = {}

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 개발 중에는 콘솔에 남긴다. 외부로 보내는 코드는 없다(좌표·기록이 섞일 수 있다).
    console.error('[THE WAY] 렌더 오류', error, info.componentStack)
  }

  private reset = () => {
    /* 화면 선택 상태만 되돌린다. 진행도·수집·기도·기록은 그대로 둔다. */
    try {
      const raw = localStorage.getItem('theway-pilgrim-v1')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.state) {
          delete parsed.state.activeCourseId
          delete parsed.state.activeJourneyId
          localStorage.setItem('theway-pilgrim-v1', JSON.stringify(parsed))
        }
      }
    } catch {
      /* 저장소를 못 건드려도 새로고침은 해 본다 */
    }
    location.hash = '#home'
    location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-5 bg-sand px-8 text-center text-ink">
        <span className="font-display text-[15px] tracking-[0.3em] text-clay-deep">THE&nbsp;WAY</span>
        <h1 className="font-serif text-[22px] font-bold leading-snug">화면을 그리다 멈췄어요</h1>
        <p className="max-w-[28ch] text-[13.5px] leading-relaxed text-ink-soft">
          걸어온 거리와 닿은 자리는 그대로 있습니다. 지워지지 않았어요.
        </p>
        <div className="mt-2 flex w-full max-w-[280px] flex-col gap-2.5">
          <button
            onClick={() => location.reload()}
            className="min-h-[48px] rounded-2xl bg-clay-deep px-5 font-serif text-[16px] text-sand-raised transition active:scale-[0.99]"
          >
            다시 시도
          </button>
          <button
            onClick={this.reset}
            className="min-h-[48px] rounded-2xl border border-line-strong px-5 text-[14px] text-ink-soft transition active:scale-[0.99]"
          >
            홈으로 되돌리기
          </button>
        </div>
        <p className="mt-1 max-w-[30ch] text-[11.5px] leading-relaxed text-muted">
          「홈으로 되돌리기」는 지금 보고 있던 길 선택만 초기화합니다. 기록은 건드리지 않습니다.
        </p>
      </div>
    )
  }
}
