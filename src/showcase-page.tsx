/* 대적 전시실 — 배포되는 단독 페이지(/showcase.html).
 *
 * 러닝 없이도 대적의 대치(살아 있는 배너)와 승리(걷힘 시퀀스)를 볼 수 있다.
 * 앱 IA에는 연결하지 않는다 — 홈에 입구를 내면 "달려서 만나는 것"의 무게가 빠진다.
 * 링크를 아는 사람(개발·공유·소개)에게만 열리는 전시실이다.
 * 어휘는 순례(D3): 화면 어디에도 게임 어휘를 쓰지 않는다. */
import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ADVERSARIES, type Adversary } from './data/adversaries'
import AdversaryBanner from './components/AdversaryBanner'
import AdversaryVictory from './components/AdversaryVictory'
import { episodeArt } from './assets/art'
import { journeyById } from './data/geo/journeys'

function VictoryStage({ adv }: { adv: Adversary }) {
  const [run, setRun] = useState(0)
  /* 자동 재생 — 전시실은 손대지 않아도 살아 있어야 한다. 8초마다 다시 걷힌다.
     reduced-motion이면 연출 자체가 페이드로 줄므로 그대로 둔다. */
  useEffect(() => {
    const id = setInterval(() => setRun((n) => n + 1), 8000)
    return () => clearInterval(id)
  }, [])
  const base = episodeArt(adv.journeyId, adv.episodeId)
  return (
    <div className="relative mt-3 overflow-hidden rounded-2xl ring-1 ring-line-strong" style={{ aspectRatio: '4 / 3' }}>
      {base && <img src={base} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />}
      <AdversaryVictory key={run} adv={adv} />
      <button
        onClick={() => setRun((n) => n + 1)}
        className="absolute bottom-3 right-3 rounded-xl px-3 py-1.5 text-[12px] backdrop-blur-sm transition active:scale-95"
        style={{ background: 'rgba(25,17,8,0.55)', color: '#f0e6d4', boxShadow: 'inset 0 0 0 1px rgba(240,230,212,0.25)' }}
      >
        다시 보기
      </button>
    </div>
  )
}

function Card({ adv }: { adv: Adversary }) {
  const journey = journeyById(adv.journeyId)
  return (
    <section className="mt-10 first:mt-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{journey?.name ?? adv.journeyId}</p>
      <div className="mt-2">
        <AdversaryBanner adv={adv} />
      </div>
      {/* 대치 중 러닝 화면에 뜨는 그 사건의 본문 */}
      <p className="mt-3 font-serif text-[13.5px] leading-[1.75] text-ink-soft">“{adv.verseKr}”</p>
      <p className="mt-1 text-[11px] text-muted">{adv.verseRef}</p>
      <VictoryStage adv={adv} />
      <p className="mt-2.5 font-serif text-[14px] leading-relaxed text-ink">{adv.victory}</p>
    </section>
  )
}

function Showcase() {
  return (
    <div className="min-h-full bg-sand text-ink">
      <div className="mx-auto max-w-[440px] px-6 pb-16 pt-10">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted">THE WAY</p>
        <h1 className="mt-1 font-serif text-[24px] leading-tight">대적 — 길을 막아서는 것들</h1>
        <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
          여정마다 하나, 성경이 이름 붙인 대적이 길을 막아섭니다. 달리는 동안 화면에는
          막아선 것의 얼굴이 살아 있고, 그 자리에 닿는 날 — 막았던 것이 걷히며 그 자리의
          그림이 열립니다. 승리의 주어는 러너가 아닙니다.
        </p>
        {ADVERSARIES.map((a) => (
          <Card key={a.id} adv={a} />
        ))}
        <a
          href="./"
          className="mt-12 block rounded-2xl py-3.5 text-center font-serif text-[15px] transition active:scale-[0.98]"
          style={{ background: 'var(--color-clay-deep)', color: 'var(--color-sand-raised)' }}
        >
          길을 나서기 — THE WAY 열기
        </a>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Showcase />
  </StrictMode>,
)
