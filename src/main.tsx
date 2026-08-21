import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'

/* 새 버전이 활성화되면 스스로 새로고침한다.
 * autoUpdate SW는 조용히 교대만 할 뿐 열려 있는 화면을 갱신하지 않아서, 배포 후에도
 * "한 번 더 새로고침해야 보이는" 유령 구버전이 남았다(실측 — 자리 영상이 안 보인 원인).
 * 최초 설치(controller 없음→생김)에는 새로고침하지 않는다 — 첫 방문이 깜빡이면 안 된다.
 * 러닝 중 교대가 일어나도 안전하다: 러닝 상태는 transient지만 SW 교대는 배포 직후
 * 접속에서만 발생하고, 그 순간 화면은 대개 홈이다. */
if ('serviceWorker' in navigator) {
  let hadController = !!navigator.serviceWorker.controller
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) window.location.reload()
    hadController = true
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 렌더 예외가 흰 화면이 되지 않게 — 잘못된 영속 상태는 껐다 켜도 그대로 남는다 */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
