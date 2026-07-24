import { useNav } from '../store'
import { usePilgrim, journeyKmOf } from '../state/pilgrim'
import { JOURNEYS, JOURNEY_CHROME, journeyProgress, toJourneyKm, toRealKm } from '../data/geo/journeys'
import { sceneArt, crestArt } from '../assets/art'
import { sceneFocus } from '../lib/scene'
import { SectionLabel } from '../components/ui'
import TabBar from '../components/TabBar'
import { IconArrow } from '../components/icons'

/* 문장은 recraft가 불투명 배경째로 뱉으므로 원형으로 잘라 인장처럼 앉힌다.
 * 사각형 그대로 두면 씬 위에 흰 상자가 떠 보인다. */
function Crest({ src }: { src: string }) {
  return (
    <span className="absolute right-4 top-1/2 flex h-14 w-14 -translate-y-1/2 overflow-hidden rounded-full ring-1 ring-line-strong">
      <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full scale-[1.06] object-cover" />
    </span>
  )
}

/* 여정 선택 — 월드맵. 한 화면에 다 몰지 않고, 여정을 고르는 것부터 시작한다.
 * 카드 = 지역 씬(래스터 배경) + 문장(벡터 엠블럼) + 진행 링.
 * 예수님 사역 길은 기존 journey.ts/코스 구조가 구동하므로 별도 카드로 둔다. */
export default function Journeys() {
  const openJourney = useNav((s) => s.openJourney)
  const go = useNav((s) => s.go)
  const pilgrim = usePilgrim()
  const setActiveJourney = usePilgrim((s) => s.setActiveJourney)

  return (
    <div className="relative flex flex-1 flex-col">
      <header className="px-7" style={{ paddingTop: 'max(3rem, env(safe-area-inset-top))' }}>
        <SectionLabel>여정을 고르다</SectionLabel>
        <h1 className="mt-2 font-serif text-[30px] font-bold leading-tight">어느 길을 달릴까</h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
          달린 거리만큼 그 사람이 걸었던 실제 길이 이어집니다.
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-3.5 px-5 pb-4">
        {/* 예수님의 사역 길 — 기존 코스 구조 */}
        <button
          onClick={() => go('collection')}
          className="relative w-full overflow-hidden rounded-3xl border border-line-strong text-left transition active:scale-[0.99]"
        >
          <img src={sceneArt('sea')} alt="" loading="lazy" decoding="async" className="h-[132px] w-full object-cover" style={{ objectPosition: sceneFocus('sea', 'card') }} />
          <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(to right, var(--color-sand) 0%, var(--color-sand) 44%, transparent 82%)' }} />
          <div className="absolute inset-y-0 left-0 flex w-[62%] flex-col justify-center px-5">
            <span className="font-display text-[10.5px] uppercase tracking-[0.2em] text-clay-deep">Via Christi</span>
            <p className="mt-1 font-serif text-[20px] font-bold leading-tight text-ink">예수님의 사역 길</p>
            <p className="mt-1 text-[11.5px] text-muted">37자리 · 약 3,020km</p>
          </div>
          {crestArt('jesus') && <Crest src={crestArt('jesus')!} />}
        </button>

        {JOURNEYS.map((j) => {
          const chrome = JOURNEY_CHROME[j.id]
          const km = toJourneyKm(j.id, journeyKmOf(pilgrim, j.id))
          const prog = journeyProgress(j, km)
          const crest = crestArt(j.id)
          return (
            <button
              key={j.id}
              onClick={() => { setActiveJourney(j.id); openJourney(j.id) }}
              className="relative w-full overflow-hidden rounded-3xl border border-line-strong text-left transition active:scale-[0.99]"
            >
              <img src={sceneArt(chrome.scene)} alt="" loading="lazy" decoding="async" className="h-[132px] w-full object-cover" style={{ objectPosition: sceneFocus(chrome.scene, 'card') }} />
              <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(to right, var(--color-sand) 0%, var(--color-sand) 44%, transparent 82%)' }} />

              <div className="absolute inset-y-0 left-0 flex w-[62%] flex-col justify-center px-5">
                <span className="font-display text-[10.5px] uppercase tracking-[0.2em]" style={{ color: chrome.accent }}>
                  {j.nameLatin}
                </span>
                <p className="mt-1 font-serif text-[20px] font-bold leading-tight text-ink">{j.name}</p>
                {/* 여정 거리(바울 3,490km)가 아니라 **내가 실제로 달릴 거리**를 적는다.
                    3,490은 정보가 아니라 위압이고, 실제로는 333km면 끝나는 길이다.
                    그 아래 "다음 자리까지"가 있어야 여정 고르기가 취향이 아니라 판단이 된다. */}
                <p className="mt-1 text-[11.5px] text-muted">
                  {j.episodes.length}자리 · 내가 달릴 {Math.round(toRealKm(j.id, j.totalKm)).toLocaleString()}km
                </p>
                {prog.next && (
                  <p className="mt-0.5 text-[11px] text-muted">
                    다음 <span className="text-ink-soft">{prog.next.place}</span>까지{' '}
                    <span className="font-display text-clay-deep" style={{ fontFeatureSettings: "'lnum' 1" }}>
                      {toRealKm(j.id, prog.toNextKm).toFixed(1)}
                    </span>
                    km
                  </p>
                )}
                {/* 진행 — 라피스(the Way). 화면에서 유일한 찬 색 */}
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="h-[3px] w-[86px] overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${prog.pct}%`, background: 'var(--color-lapis)' }} />
                  </div>
                  <span className="font-display text-[10.5px] text-muted" style={{ fontFeatureSettings: "'lnum' 1" }}>
                    {prog.reachedCount}/{prog.total}
                  </span>
                </div>
              </div>

              {crest && <Crest src={crest} />}
            </button>
          )
        })}
      </div>

      <div className="px-6 pb-2">
        <button onClick={() => go('courses')} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-line py-3.5 font-serif text-[15px] text-ink-soft transition active:scale-[0.99]">
          실제 순례길 보기 <IconArrow size={15} />
        </button>
      </div>

      <TabBar active="journeys" />
    </div>
  )
}
