import { useEffect, useState } from 'react'
import { useNav } from '../store'
import { usePilgrim, journeyKmOf } from '../state/pilgrim'
import { journeyById, journeyProgress, tierOfEpisode, JOURNEY_CHROME, toJourneyKm, toRealKm } from '../data/geo/journeys'
import { journeyPassage, loadJourneyPassages, GRACE_NOTE, SCRIPTURE_ATTRIBUTION, type JourneyPassage } from '../data/scripture'
import { sceneArt, episodeArt } from '../assets/art'
import { sceneFocus, sceneForEpisode } from '../lib/scene'
import { SectionLabel } from '../components/ui'
import { IconArrow, IconHeld, IconSeal, IconScroll } from '../components/icons'

/* 에피소드 상세 = 말씀 읽기.
 * 아직 닿지 않은 자리에서도 본문은 그대로 열린다 — 거리로 열리는 것은 도달 인장뿐이다.
 * verseKrShort는 요약·의역이므로 성경 본문과 시각적으로 확실히 분리한다(PCK 검증 B-5). */
export default function EpisodeDetail() {
  const go = useNav((s) => s.go)
  const journeyId = useNav((s) => s.journeyId)
  const episodeId = useNav((s) => s.episodeId)
  const openJourney = useNav((s) => s.openJourney)
  const pilgrim = usePilgrim()

  /* 본문은 이 화면에서만 쓰므로 여기 들어올 때 받아온다(초기 번들에서 분리). */
  const [passage, setPassage] = useState<JourneyPassage | undefined>(() =>
    journeyId && episodeId ? journeyPassage(journeyId, episodeId) : undefined,
  )
  useEffect(() => {
    if (!journeyId || !episodeId) return
    let alive = true
    loadJourneyPassages().then(() => {
      if (alive) setPassage(journeyPassage(journeyId, episodeId))
    })
    return () => {
      alive = false
    }
  }, [journeyId, episodeId])

  const journey = journeyId ? journeyById(journeyId) : undefined
  const ep = journey?.episodes.find((e) => e.id === episodeId)

  if (!journey || !ep) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-[14px] text-muted">자리를 찾을 수 없어요.</p>
        <button onClick={() => go('journeys')} className="rounded-xl bg-clay-deep px-5 py-2.5 text-[14px] text-sand-raised">여정 고르기</button>
      </div>
    )
  }

  const chrome = JOURNEY_CHROME[journey.id]
  // 자리마다 지형이 다르다 — 여정 하나에 그림 하나면 바울의 28자리가 전부 같은 배경이 된다.
  const scene = sceneForEpisode(ep)
  /* 그 자리 고유의 그림이 있으면 그것을 쓴다. 없으면 지역 씬으로 폴백.
     예전엔 68자리가 씬 8종을 돌려 써서 바울의 해안 도시가 전부 같은 그림이었다. */
  const art = episodeArt(journey.id, ep.id)
  const km = toJourneyKm(journey.id, journeyKmOf(pilgrim, journey.id))
  const prog = journeyProgress(journey, km)
  const reached = journey.episodes.indexOf(ep) < prog.reachedCount
  const tier = tierOfEpisode(journey, ep)
  const toGo = Math.max(0, ep.cumulativeKm - km)

  return (
    <div className="relative flex flex-1 flex-col overflow-y-auto bg-sand text-ink">
      <div className="relative h-[200px] w-full overflow-hidden">
        <img
          src={art ?? sceneArt(scene)}
          alt=""
          className="h-full w-full object-cover"
          style={{ objectPosition: art ? 'center' : sceneFocus(scene, 'hero') }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28" style={{ background: 'linear-gradient(to top, var(--color-sand), transparent)' }} />
        <button onClick={() => openJourney(journey.id)} className="absolute left-4 top-[max(1rem,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full bg-[#201C15]/85 text-sand-raised transition active:scale-90" aria-label="뒤로">
          <IconArrow size={17} className="rotate-180" />
        </button>
      </div>

      <div className="relative z-10 px-7" style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}>
        {/* 자리 머리 — 도달 여부는 인장으로만 표시하고, 본문 접근은 막지 않는다 */}
        <div className="flex items-center gap-2" style={{ color: chrome.accent }}>
          {reached ? <IconSeal size={16} /> : <IconScroll size={16} />}
          <span className="font-display text-[11.5px] uppercase tracking-[0.18em]">
            {ep.placeLatin} · {reached ? '닿은 자리' : '아직 가는 중'}
          </span>
        </div>
        <h1 className="mt-2 font-serif text-[32px] font-bold leading-[1.12]">{ep.place}</h1>
        <p className="mt-1.5 text-[13px] text-muted">
          {ep.region} · 누적 <span className="font-display" style={{ fontFeatureSettings: "'lnum' 1" }}>{ep.cumulativeKm.toLocaleString()}</span>km
          {tier && <> · {tier.name}</>}
        </p>

        {/* 여정 위 거리와 내가 실제로 달릴 거리를 함께 보여준다 — 축척을 숨기지 않는다 */}
        {!reached && toGo > 0 && (
          <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
            여기까지 여정으로{' '}
            <span className="font-display text-ink-soft" style={{ fontFeatureSettings: "'lnum' 1" }}>{Math.round(toGo).toLocaleString()}</span>km,
            내가 달릴 거리로{' '}
            <span className="font-display text-clay-deep" style={{ fontFeatureSettings: "'lnum' 1" }}>{toRealKm(journey.id, toGo).toFixed(1)}</span>km
            남았습니다. 도달하면 이 자리의 인장이 찍힙니다.
          </p>
        )}

        {ep.confidence && ep.confidence !== 'biblical' && (
          <div className="mt-4 rounded-xl border border-line-strong bg-sand-raised/50 px-4 py-3">
            <p className="text-[12.5px] leading-relaxed text-ink-soft">
              {ep.confidence === 'tradition'
                ? '여기서부터는 성경이 직접 서술하지 않고, 초대교회 전승이 전하는 길입니다.'
                : '전통적으로 이 자리로 비정되는 지점이며, 학문적으로 확정된 위치는 아닙니다.'}
            </p>
          </div>
        )}

        {/* 성경 본문 — 개역한글 원문 그대로 */}
        {passage && (
          <div className="mt-6 rounded-2xl border border-line bg-sand-raised/40 p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-[12px] uppercase tracking-[0.18em] text-clay-deep">{passage.ref}</p>
              <span className="rounded-md border border-line-strong px-2 py-[2px] text-[10.5px] text-muted">{passage.translation}</span>
            </div>
            <div className="font-serif text-[16px] leading-[1.85] text-ink">
              {passage.verses.map((line, i) => (
                <span key={`${line.chapter}:${line.v}`}>
                  {i === 0 ? (
                    <span className="versal" style={{ color: chrome.accent }}>{line.text.slice(0, 1)}</span>
                  ) : (
                    <sup className="mr-0.5 align-super font-display text-[10px] text-muted" style={{ fontFeatureSettings: "'lnum' 1" }}>{line.v}</sup>
                  )}
                  {i === 0 ? line.text.slice(1) : line.text}{' '}
                </span>
              ))}
            </div>
            <p className="mt-4 text-[10.5px] tracking-[0.04em] text-muted">{SCRIPTURE_ATTRIBUTION}</p>
          </div>
        )}

        {/* 요약은 본문이 아니다 — 라벨로 분명히 갈라 둔다 */}
        <div className="mt-5 border-l-2 border-line-strong pl-4">
          <SectionLabel>한 줄 요약 · 의역</SectionLabel>
          <p className="mt-1.5 text-[14px] leading-[1.7] text-ink-soft">{ep.verseKrShort}</p>
          <p className="mt-1.5 text-[10.5px] text-muted">성경 원문이 아니라 이해를 돕기 위한 요약입니다.</p>
        </div>

        <div className="mt-7">
          <SectionLabel>이곳에서 있었던 일</SectionLabel>
          <p className="mt-2 text-[14.5px] leading-[1.75] text-ink-soft">{ep.event}</p>
        </div>

        <div className="mt-6">
          <SectionLabel>묵상</SectionLabel>
          <p className="mt-2 text-[15px] leading-[1.75] text-ink-soft">{ep.reflection}</p>
        </div>

        <div className="mt-5 flex gap-3 rounded-xl bg-sand-raised/60 px-4 py-3.5">
          <span className="mt-0.5 text-rubric"><IconHeld size={18} /></span>
          <p className="flex-1 text-[14px] leading-relaxed text-ink">{ep.prayer}</p>
        </div>

        {ep.feel && (
          <div className="mt-5 rounded-xl border border-line px-4 py-3.5">
            <SectionLabel>달리는 느낌</SectionLabel>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">{ep.feel}</p>
          </div>
        )}

        {/* 은혜 고지 — 거리가 말씀을 여는 열쇠로 읽히지 않게 */}
        <p className="mt-8 text-[12px] leading-[1.8] text-muted">{GRACE_NOTE}</p>

        <button onClick={() => openJourney(journey.id)} className="mt-6 w-full rounded-2xl border border-line py-3.5 text-center font-serif text-[15px] text-ink-soft transition active:scale-[0.99]">
          여정으로 돌아가기
        </button>
      </div>
    </div>
  )
}
