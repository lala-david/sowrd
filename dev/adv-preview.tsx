/* 대적 미리보기(dev 전용) — 대치 배너 5종 + 승리 연출.
 * 러닝을 실제로 그 구간까지 몰고 가지 않아도 연출을 눈으로 검증할 수 있어야 한다. */
import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/index.css'
import { ADVERSARIES } from '../src/data/adversaries'
import AdversaryBanner from '../src/components/AdversaryBanner'
import AdversaryVictory from '../src/components/AdversaryVictory'
import { episodeArt } from '../src/assets/art'

function VictoryDemo({ advId }: { advId: string }) {
  const adv = ADVERSARIES.find((a) => a.id === advId)!
  const [run, setRun] = useState(0)
  const base = episodeArt(adv.journeyId, adv.episodeId)
  return (
    <div>
      <div className="relative h-[240px] overflow-hidden rounded-2xl ring-1 ring-line-strong">
        {base && <img src={base} alt="" className="h-full w-full object-cover" />}
        <AdversaryVictory key={run} adv={adv} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-[12px] text-muted">{adv.victory}</p>
        <button onClick={() => setRun((n) => n + 1)} className="shrink-0 rounded-lg px-3 py-1 text-[12px] ring-1 ring-line-strong">
          다시
        </button>
      </div>
    </div>
  )
}

function Preview() {
  return (
    <div data-theme="dark" className="min-h-full bg-sand text-ink" style={{ maxWidth: 420, margin: '0 auto', padding: 16 }}>
      <h2 className="mb-2 text-[13px] font-semibold text-muted">대치 배너 — 살아 있는 그림 5종</h2>
      <div className="grid gap-3">
        {ADVERSARIES.map((a) => (
          <div key={a.id}>
            <AdversaryBanner adv={a} />
            <p className="mt-1 text-[11px] text-muted">{a.kind} · {a.phases[1]}</p>
          </div>
        ))}
      </div>
      <h2 className="mb-2 mt-8 text-[13px] font-semibold text-muted">승리 연출 — 대치가 걷히면 승리가 드러난다</h2>
      <div className="grid gap-6">
        <VictoryDemo advId="red-sea" />
        <VictoryDemo advId="euroclydon" />
        <VictoryDemo advId="council" />
        <VictoryDemo advId="wilderness-40" />
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
)
