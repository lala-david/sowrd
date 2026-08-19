import { useNav } from '../store'
import { usePilgrim, journeyKmOf } from '../state/pilgrim'
import { JOURNEYS, JOURNEY_CHROME, journeyProgress, toJourneyKm, toRealKm } from '../data/geo/journeys'
import { worldArt, journeyFigure, crestArt } from '../assets/art'
import { SectionLabel } from '../components/ui'
import TabBar from '../components/TabBar'
import { IconArrow, IconSeal } from '../components/icons'
import { questNow } from '../lib/quest'
import { currentTierIndex } from '../lib/quest'
import { ROMAN } from '../lib/board'

/* ── 여정 고르기 = 월드 고르기 ───────────────────────────────────────────────
 * 다섯 장의 땅. 카드마다 **지금 걷고 있는 장의 패널**이 깔린다 — 같은 여정이라도 장이
 * 바뀌면 카드의 풍경이 바뀐다. 주인공 토큰이 오른쪽에 서 있고, 아래에 지금 어디까지
 * 왔는지 한 줄. 누르면 그 길의 지도(월드)가 열린다. */
export default function Journeys() {
  const openMap = useNav((s) => s.openMap)
  const openJourney = useNav((s) => s.openJourney)
  const go = useNav((s) => s.go)
  const pilgrim = usePilgrim()
  const setActiveJourney = usePilgrim((s) => s.setActiveJourney)

  return (
    <div className="relative flex flex-1 flex-col">
      <header className="px-7" style={{ paddingTop: 'max(3rem, env(safe-area-inset-top))' }}>
        <SectionLabel>여정을 고르다</SectionLabel>
        <h1 className="mt-2 font-serif text-[30px] font-bold leading-tight">어느 길을 달릴까</h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted">달린 거리만큼 그 사람이 걸었던 길이 이어집니다. 닿은 자리마다 말씀이 남습니다.</p>
      </header>

      <div className="mt-6 flex flex-col gap-4 px-5 pb-4">
        {JOURNEYS.map((j) => {
          const chrome = JOURNEY_CHROME[j.id]
          const km = toJourneyKm(j.id, journeyKmOf(pilgrim, j.id))
          const prog = journeyProgress(j, km)
          const q = questNow(j, km)
          const tierIdx = currentTierIndex(j, km)
          const art = worldArt(j.id, tierIdx)
          const figure = journeyFigure(j.id) ?? crestArt(j.id)
          const active = j.id === pilgrim.activeJourneyId
          const walked = journeyKmOf(pilgrim, j.id) > 0
          return (
            <button
              key={j.id}
              onClick={() => {
                setActiveJourney(j.id)
                openMap(j.id)
              }}
              className="relative w-full overflow-hidden rounded-[26px] text-left transition active:scale-[0.99]"
              style={{
                height: 176,
                boxShadow: active
                  ? '0 0 0 2.5px var(--color-seal), 0 18px 36px -20px rgba(60,40,18,.6)'
                  : '0 1px 2px rgba(80,60,30,.12), 0 18px 36px -22px rgba(60,40,18,.55)',
              }}
            >
              {art && (
                <img src={art} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: 'center 38%' }} />
              )}
              {/* 글이 앉을 자리만 어둡게 — 그림은 오른쪽에서 숨 쉰다 */}
              <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(100deg, rgba(28,18,8,.72) 0%, rgba(28,18,8,.46) 40%, rgba(28,18,8,.06) 66%, rgba(28,18,8,0) 100%)' }} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20" style={{ background: 'linear-gradient(to top, rgba(28,18,8,.6), transparent)' }} />

              <div className="relative flex h-full flex-col justify-between p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-display text-[10.5px] uppercase tracking-[0.22em]" style={{ color: '#ffd868' }}>
                        {j.nameLatin}
                      </span>
                      {active && (
                        <span className="rounded-full px-2 py-[3px] text-[10.5px] leading-none" style={{ background: 'var(--color-seal)', color: '#2a1d12' }}>
                          지금 걷는 길
                        </span>
                      )}
                    </span>
                    <p className="mt-1 font-serif text-[22px] font-bold leading-tight" style={{ color: '#fff6e4' }}>
                      {j.name}
                    </p>
                    <p className="mt-0.5 text-[11.5px]" style={{ color: 'rgba(255,240,214,.78)' }}>
                      {j.who} · {j.era}
                    </p>
                  </div>
                  {figure && (
                    <span
                      className="relative flex h-[58px] w-[58px] shrink-0 overflow-hidden rounded-full"
                      style={{ background: '#fbf1dc', boxShadow: `0 0 0 2px #5a3a12, 0 0 0 4px ${walked ? 'var(--color-seal)' : 'rgba(251,241,220,.85)'}, 0 8px 16px rgba(0,0,0,.35)` }}
                    >
                      <img src={figure} alt="" className="h-full w-full scale-[1.1] object-cover" />
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-[12px]" style={{ color: 'rgba(255,240,214,.9)' }}>
                    {q.chapter && (
                      <span>
                        <span className="font-display">{ROMAN[q.chapter.index - 1] ?? q.chapter.index}</span> · {q.chapter.name}
                        {' · '}
                      </span>
                    )}
                    {prog.next ? (
                      <>
                        다음 <span className="font-serif" style={{ color: '#fff6e4' }}>{prog.next.place}</span>까지{' '}
                        <span className="font-display" style={{ color: '#ffd868', fontFeatureSettings: "'lnum' 1" }}>
                          {toRealKm(j.id, prog.toNextKm).toFixed(1)}
                        </span>
                        km
                      </>
                    ) : (
                      '이 길을 끝까지 걸었습니다'
                    )}
                  </p>
                  <div className="mt-2 flex items-center gap-2.5">
                    <div className="h-[4px] flex-1 overflow-hidden rounded-full" style={{ background: 'rgba(255,240,214,.25)' }}>
                      <div className="h-full rounded-full" style={{ width: `${prog.pct}%`, background: 'var(--color-seal-bright)' }} />
                    </div>
                    <span className="flex items-center gap-1 font-display text-[11px]" style={{ color: 'rgba(255,240,214,.9)', fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                      {walked && <IconSeal size={11} style={{ color: '#ffd868' }} />}
                      {prog.reachedCount}/{prog.total} · 내가 달릴 {Math.round(toRealKm(j.id, j.totalKm)).toLocaleString()}km
                    </span>
                  </div>
                </div>
              </div>
              <span className="sr-only">{chrome.scene}</span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-2 px-6 pb-2">
        <button
          onClick={() => openJourney(pilgrim.activeJourneyId)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-line py-3.5 font-serif text-[15px] text-ink-soft transition active:scale-[0.99]"
        >
          지금 걷는 길의 자리 목록 <IconArrow size={15} />
        </button>
        <button onClick={() => go('courses')} className="flex w-full items-center justify-center gap-2 py-2 text-[12.5px] text-muted transition active:scale-[0.99]">
          실제 순례길 보기 <IconArrow size={13} />
        </button>
      </div>

      <TabBar active="journeys" />
    </div>
  )
}
