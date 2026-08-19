import { useMemo } from 'react'
import { useNav } from '../store'
import { usePilgrim, journeyKmOf } from '../state/pilgrim'
import { journeyById, journeyProgress, JOURNEY_CHROME, toJourneyKm, toRealKm, type JourneyEpisode } from '../data/geo/journeys'
import { sceneArt, crestArt } from '../assets/art'
import { SectionLabel } from '../components/ui'
import { episodeArt } from '../assets/art'
import { MILESTONES, milestonesPassed } from '../data/geo/journeys/milestones'
import { IconArrow, IconSeal, IconCairn } from '../components/icons'
import { sceneFocus } from '../lib/scene'
import QuestMap from '../components/QuestMap'
import { questWindow } from '../lib/quest'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']

/* 여정 상세 — 파트(등급)별로 나뉜 자리들이 하나의 라피스 길로 이어진다.
 * 게임처럼 보이되 경쟁이 아니라 "자기 역사"로 읽히게: 순위·비교 없음, 도달 여부만.
 *
 * 해금 정책(PCK 신학 검증 반영): 아직 닿지 않은 자리도 눌러서 말씀을 읽을 수 있다.
 * 달린 거리가 성경을 여는 열쇠가 되면 구조 자체가 공로주의가 된다. 거리로 열리는 것은
 * 도달 인장과 기록일 뿐이다. */
export default function JourneyDetail() {
  const go = useNav((s) => s.go)
  const journeyId = useNav((s) => s.journeyId)
  const openEpisode = useNav((s) => s.openEpisode)
  const pilgrim = usePilgrim()

  const journey = journeyId ? journeyById(journeyId) : undefined

  /* 파트(tier)별로 에피소드를 묶는다.
   * 인덱스는 한 번만 만든다 — 자리마다 findIndex를 돌리면 바울 여정에서 수천 번 비교가 일어난다.
   * 어느 파트에도 안 걸리는 자리는 마지막 묶음에 밀어넣지 않고 별도 묶음으로 드러낸다.
   * (그렇게 밀어넣었더니 홍해 도하가 "약속의 땅" 파트 위에 붙어 순서가 뒤집혔다.) */
  const groups = useMemo(() => {
    if (!journey) return []
    const at = new Map(journey.episodes.map((e, i) => [e.id, i]))
    const byPlace = new Map(journey.episodes.map((e, i) => [e.place, i]))
    const find = (k: string) => at.get(k) ?? byPlace.get(k) ?? -1

    const gs: { name: string; note: string; eps: JourneyEpisode[] }[] = journey.tiers.map((t) => ({
      name: t.name,
      note: t.note,
      eps: [],
    }))
    const rest: JourneyEpisode[] = []
    const bounds = journey.tiers.map((t) => [find(t.fromEpisode), find(t.toEpisode)] as const)

    journey.episodes.forEach((ep, idx) => {
      const i = bounds.findIndex(([a, b]) => a !== -1 && b !== -1 && idx >= a && idx <= b)
      if (i === -1) rest.push(ep)
      else gs[i].eps.push(ep)
    })
    if (rest.length) gs.push({ name: '그 밖의 자리', note: '', eps: rest })
    return gs
  }, [journey])
  if (!journey) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-[14px] text-muted">여정을 찾을 수 없어요.</p>
        <button onClick={() => go('journeys')} className="rounded-xl bg-clay-deep px-5 py-2.5 text-[14px] text-sand-raised">여정 고르기</button>
      </div>
    )
  }

  const chrome = JOURNEY_CHROME[journey.id]
  const km = toJourneyKm(journey.id, journeyKmOf(pilgrim, journey.id))
  const prog = journeyProgress(journey, km)
  const reachedAt = pilgrim.lifetime?.episodeReachedAt?.[journey.id] ?? {}
  const mileTotal = (MILESTONES[journey.id] ?? []).length
  const mileNow = milestonesPassed(journey.id, km)
  const reachedIdx = prog.reachedCount // 이 인덱스 미만이 도달한 자리
  const crest = crestArt(journey.id)


  return (
    <div className="relative flex flex-1 flex-col overflow-y-auto bg-sand text-ink">
      {/* 히어로 — 지역 씬 */}
      <div className="relative h-[210px] w-full overflow-hidden">
        <img src={sceneArt(chrome.scene)} alt="" className="h-full w-full object-cover" style={{ objectPosition: sceneFocus(chrome.scene, 'hero') }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28" style={{ background: 'linear-gradient(to top, var(--color-sand), transparent)' }} />
        <button onClick={() => go('journeys')} className="absolute left-4 top-[max(1rem,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full bg-[#201C15]/85 text-sand-raised transition active:scale-90" aria-label="뒤로">
          <IconArrow size={17} className="rotate-180" />
        </button>
        {crest && <img src={crest} alt="" className="absolute right-5 top-[max(1rem,env(safe-area-inset-top))] h-12 w-12 opacity-90" />}
      </div>

      <div className="relative z-10 px-7">
        <span className="font-display text-[11px] uppercase tracking-[0.2em]" style={{ color: chrome.accent }}>{journey.nameLatin}</span>
        <h1 className="mt-1.5 font-serif text-[28px] font-bold leading-tight">{journey.name}</h1>
        <p className="mt-1 text-[12.5px] text-muted">{journey.who} · {journey.era}</p>

        {/* 이 여정의 지금 구간 — 홈과 같은 지도를 여기서도 본다.
            여정 상세는 자리 **목록**만 있어서 "어디에서 어디로 가는 길인가"가 안 보였다.
            목록은 순서를 말하고 지도는 지리를 말한다. 둘 다 있어야 이 길이 실재한다. */}
        <QuestMap
          className="mt-4"
          stops={questWindow(journey, km)}
          segProgress={prog.segProgress}
          atStart={prog.reachedCount === 0}
          units={pilgrim.units}
          height={200}
        />

        <div className="mt-4 flex items-center gap-3">
          <div className="h-[4px] flex-1 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${prog.pct}%`, background: 'var(--color-lapis)' }} />
          </div>
          <span className="font-display text-[12px] text-ink-soft" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
            {prog.reachedCount}/{prog.total}
          </span>
        </div>
        {/* 자리 사이가 수십~수백 km라 진행바만으로는 몇 주째 아무 변화가 없다.
            이정표는 그 사이를 실제 2.5km 간격으로 채운다. */}
        {mileTotal > 0 && (
          <p className="mt-2 flex items-center gap-1.5 text-[12px] text-muted">
            <IconCairn size={13} style={{ color: 'var(--color-lapis)' }} />
            지나온 이정표 <span className="font-display text-ink-soft" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>{mileNow}</span>
            <span className="text-muted">/ {mileTotal}</span>
          </p>
        )}
        {prog.next && (
          <p className="mt-2 text-[12.5px] text-muted">
            다음 자리 <span className="text-ink-soft">{prog.next.place}</span>까지 여정{' '}
            <span className="font-display text-ink-soft" style={{ fontFeatureSettings: "'lnum' 1" }}>{Math.round(prog.toNextKm).toLocaleString()}</span>km
            {' · '}내가 달릴 거리{' '}
            <span className="font-display text-clay-deep" style={{ fontFeatureSettings: "'lnum' 1" }}>
              {toRealKm(journey.id, prog.toNextKm).toFixed(1)}
            </span>
            km
          </p>
        )}
      </div>

      {/* 파트별 자리 — 하나의 라피스 길로 이어진다 */}
      <div className="mt-7 flex flex-col gap-8 px-7" style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}>
        {groups.map((g, gi) => {
          if (!g.eps.length) return null
          /* 티어를 게임 챕터로 만든다 — 목차가 아니라 도달/진행/완료 상태를 보여준다.
             그 티어의 자리 중 몇 개에 닿았는지, 다 닿았으면 인장, 진행 중이면 %. */
          const tierReached = g.eps.filter((ep) => journey.episodes.indexOf(ep) < reachedIdx).length
          const tierDone = tierReached === g.eps.length
          const tierStarted = tierReached > 0
          const tier = journey.tiers[gi]
          const tierRealKm = tier ? toRealKm(journey.id, tier.km) : 0
          /* 진행바는 자리 수가 아니라 **km 비율**로 채운다.
             아브라함 첫 티어는 우르→하란 142km인데 자리가 우르 하나뿐이라, 자리 수 기반이면
             하란에 닿기 전까지 142km 내내 0%로 멈춰 있었다(가장 긴 구간이 가장 죽어 보였다).
             km 비율이면 이정표를 지날 때마다 조금씩 차오른다. */
          const tierFromKm = tier ? journey.episodes.find((e) => e.id === tier.fromEpisode)?.cumulativeKm ?? 0 : 0
          const tierPct = tier && tier.km > 0
            ? Math.min(100, Math.max(0, ((km - tierFromKm) / tier.km) * 100))
            : 0
          return (
            <section key={g.name}>
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full font-display text-[11px]"
                  style={{
                    background: tierDone ? chrome.accent : tierStarted ? 'transparent' : 'transparent',
                    color: tierDone ? 'var(--color-sand)' : chrome.accent,
                    boxShadow: !tierDone && tierStarted ? `0 0 0 1.5px ${chrome.accent}` : 'none',
                    border: tierDone || tierStarted ? 'none' : '1px solid var(--color-line-strong)',
                  }}
                >
                  {tierDone ? <IconSeal size={13} /> : ROMAN[gi] ?? gi + 1}
                </span>
                <SectionLabel className="flex-1">{g.name}</SectionLabel>
                <span className="shrink-0 font-display text-[11px] text-muted" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                  {tierDone ? '완료' : `${tierReached}/${g.eps.length}`}
                </span>
              </div>
              {/* 티어 진행바 — 이 챕터를 얼마나 지났는지 */}
              <div className="mt-2 ml-[32px] h-[3px] overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{ width: `${tierPct}%`, background: chrome.accent }}
                />
              </div>
              <p className="ml-[32px] mt-1.5 text-[12px] leading-relaxed text-muted">
                {g.note} <span className="whitespace-nowrap text-clay-deep">· 이 구간 약 {tierRealKm.toFixed(0)}km</span>
              </p>

              <div className="relative mt-4 pl-[26px]">
                {/* 세로 라피스 레일 */}
                <span className="absolute bottom-3 left-[11px] top-3 w-px" style={{ background: 'var(--color-lapis)', opacity: 0.75 }} />
                <div className="flex flex-col gap-2.5">
                  {g.eps.map((ep) => {
                    const idx = journey.episodes.indexOf(ep)
                    const on = idx < reachedIdx
                    const isNext = idx === reachedIdx
                    return (
                      <button
                        key={ep.id}
                        onClick={() => openEpisode(journey.id, ep.id)}
                        className={`relative flex w-full gap-3 rounded-2xl border py-3 pl-3 pr-4 text-left transition active:scale-[0.99] ${
                          on ? 'border-line-strong bg-sand-raised' : 'border-line bg-sand-raised/30'
                        }`}
                      >
                        {/* 자리 그림 — 도달 전에는 옅게. 수집물이라는 감각은 그림에서 온다. */}
                        {episodeArt(journey.id, ep.id) && (
                          <span className="h-[54px] w-[54px] shrink-0 self-start overflow-hidden rounded-xl ring-1 ring-line">
                            <img
                              src={episodeArt(journey.id, ep.id)}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover"
                              style={{ opacity: on ? 1 : 0.4, filter: on ? 'none' : 'saturate(0.45)' }}
                            />
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                        {/* 노드 — 도달=금 인장, 다음=라피스 링, 이후=옅은 점 */}
                        <span
                          className="absolute -left-[26.5px] top-1/2 flex h-[22px] w-[22px] -translate-y-1/2 items-center justify-center rounded-full"
                          style={{
                            background: 'var(--color-sand)',
                            color: on ? 'var(--color-sun-deep)' : isNext ? 'var(--color-lapis)' : 'var(--color-muted)',
                            boxShadow: isNext ? '0 0 0 1.5px var(--color-lapis)' : 'none',
                          }}
                        >
                          {on ? <IconSeal size={16} /> : isNext ? <span className="h-[7px] w-[7px] rounded-full" style={{ background: 'var(--color-lapis)' }} /> : <span className="h-[5px] w-[5px] rounded-full" style={{ background: 'var(--color-line-strong)' }} />}
                        </span>

                        <div className="flex items-baseline justify-between gap-3">
                          <p className={`font-serif text-[16px] leading-tight ${on ? 'text-ink' : 'text-ink-soft'}`}>{ep.place}</p>
                          {/* 여정km가 아니라 **내가 달릴 km**를 적는다.
                              바울의 "3,490km"는 실제로 116km다 — 여정km는 위압이지 정보가 아니다. */}
                          <span className="shrink-0 font-display text-[11px] text-muted" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                            {toRealKm(journey.id, ep.cumulativeKm).toFixed(ep.cumulativeKm === 0 ? 0 : 1)}km
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-muted">{ep.event}</p>
                        {/* 언제 여기 닿았는가. 도달 여부가 on/off 불리언이면 수집이 아니라 체크리스트다. */}
                        {on && reachedAt[ep.id] && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-sun-deep">
                            <IconSeal size={11} />
                            {new Date(reachedAt[ep.id]).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}에 닿음
                          </p>
                        )}
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="font-display text-[10.5px] uppercase tracking-[0.14em] text-clay-deep">{ep.passageRef.replace(/\s*\(.*\)$/, '')}</span>
                          {ep.confidence && ep.confidence !== 'biblical' && (
                            <span className="rounded-full border border-line-strong px-1.5 py-[1px] text-[10px] text-muted">
                              {ep.confidence === 'tradition' ? '전승' : '추정'}
                            </span>
                          )}
                        </div>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </section>
          )
        })}

      </div>
    </div>
  )
}
