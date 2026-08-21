import { useEffect, useState } from 'react'
import { useNav } from '../store'
import { usePilgrim, journeyKmOf } from '../state/pilgrim'
import { journeyById, journeyProgress, tierOfEpisode, JOURNEY_CHROME, toJourneyKm, toRealKm } from '../data/geo/journeys'
import { journeyPassage, loadJourneyPassages, passageOf, GRACE_NOTE, SCRIPTURE_ATTRIBUTION, type JourneyPassage } from '../data/scripture'
import { STATIONS, type PassageSlug } from '../data/journey'
import { peopleOf } from '../data/people'
import { sceneArt, episodeArt } from '../assets/art'
import { sceneFocus, sceneForEpisode } from '../lib/scene'
import { SectionLabel } from '../components/ui'
import EpisodeFilm from '../components/EpisodeFilm'
import { IconArrow, IconHeld, IconSeal, IconScroll, IconPilgrim } from '../components/icons'

/* 에피소드 상세 = 말씀 읽기.
 * 아직 닿지 않은 자리에서도 본문은 그대로 열린다 — 거리로 열리는 것은 도달 인장뿐이다.
 * verseKrShort는 요약·의역이므로 성경 본문과 시각적으로 확실히 분리한다(PCK 검증 B-5). */
export default function EpisodeDetail() {
  const go = useNav((s) => s.go)
  const journeyId = useNav((s) => s.journeyId)
  const episodeId = useNav((s) => s.episodeId)
  const openJourney = useNav((s) => s.openJourney)
  /* 지도 → 시트 → 읽기 → 뒤로 = 지도로 복귀. 어디서 왔든 온 곳으로 */
  const back = () => {
    if (window.history.length > 1) window.history.back()
    else openJourney(journeyId ?? 'jesus')
  }
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

  const [lang, setLang] = useState<'kr' | 'en'>('kr')
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
  /* 예수 자리는 본문이 passages.json(개역한글·KJV 전 절)에 있다 — 옛 Detail 화면이 하던 일을 여기로 */
  const isJesus = journey.id === 'jesus' && !!(STATIONS as Record<string, unknown>)[ep.id]
  const jp = isJesus ? passageOf(ep.id as PassageSlug) : undefined
  const people = isJesus ? peopleOf(ep.id as PassageSlug) : []

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
        <button onClick={back} className="absolute left-4 top-[max(1rem,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full bg-[#201C15]/85 text-sand-raised transition active:scale-90" aria-label="뒤로">
          <IconArrow size={17} className="rotate-180" />
        </button>
      </div>

      <div className="stagger relative z-10 px-7" style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}>
        {/* 자리 머리 — 도달 여부는 인장으로만 표시하고, 본문 접근은 막지 않는다.
            닿은 자리에는 인장이 찍히는 연출이 한 번 돈다(수난 자리에서는 mood가 끄지만,
            여기는 이미 지나온 자리를 다시 여는 화면이라 조용한 등장만 쓴다). */}
        <div className="flex items-center gap-2" style={{ color: chrome.accent }}>
          {reached ? <IconSeal size={16} className="anim-seal" /> : <IconScroll size={16} />}
          <span className="font-display text-[11.5px] uppercase tracking-[0.18em]">
            {ep.placeLatin} · {reached ? '닿은 자리' : '아직 가는 중'}
          </span>
        </div>
        <h1 className="mt-2 font-serif text-[32px] font-bold leading-[1.12]">{ep.place}</h1>
        <p className="mt-1.5 text-[13px] text-muted">
          {ep.region}
          {tier && <> · {tier.name}</>}
          {/* 읽기 화면의 숫자는 하나뿐 — 남은 거리(축척 해설은 지도·시트의 일) */}
          {!reached && toGo > 0 && (
            <>
              {' · '}
              <span className="font-display text-clay-deep" style={{ fontFeatureSettings: "'lnum' 1" }}>{toRealKm(journey.id, toGo).toFixed(1)}</span>km 남음
            </>
          )}
        </p>

        {ep.confidence && ep.confidence !== 'biblical' && (
          <div className="mt-4 rounded-xl border border-line-strong bg-sand-raised/50 px-4 py-3">
            <p className="text-[12.5px] leading-relaxed text-ink-soft">
              {ep.confidence === 'tradition'
                ? '여기서부터는 성경이 직접 서술하지 않고, 초대교회 전승이 전하는 길입니다.'
                : '전통적으로 이 자리로 비정되는 지점이며, 학문적으로 확정된 위치는 아닙니다.'}
            </p>
          </div>
        )}

        {/* 이 자리의 길 — 시네마틱. 화면을 열면 바로 보이는 첫 블록(본문 위) —
            묵상 아래 묻었더니 있는 줄도 몰랐다. 본문과 같은 규칙으로 도달과 무관하게
            열리고, 탭 전엔 0바이트(poster). 영상이 없는 자리는 블록 자체가 없다. */}
        <EpisodeFilm journeyId={journey.id} episodeId={ep.id} poster={art ?? sceneArt(scene)} />

        {/* 예수 자리 — 개역한글 / KJV 전 절 */}
        {jp && (
          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-[12px] uppercase tracking-[0.18em] text-clay-deep">{jp.refLatin}</p>
              <div className="flex overflow-hidden rounded-lg border border-line-strong">
                {(['kr', 'en'] as const).map((l) => (
                  <button key={l} onClick={() => setLang(l)} className={`min-h-[36px] px-3 text-[11px] uppercase ${lang === l ? 'bg-clay-deep text-sand-raised' : 'text-muted'}`}>
                    {l === 'kr' ? '개역한글' : 'KJV'}
                  </button>
                ))}
              </div>
            </div>
            <div className={`max-w-[34ch] text-ink ${lang === 'kr' ? 'font-serif text-[17px] leading-[2]' : 'font-display text-[15.5px] leading-[1.8]'}`}>
              {(lang === 'kr' ? jp.kr : jp.en).map((line, i) => (
                <span key={line.v}>
                  {i === 0 && lang === 'kr' ? (
                    <span className="versal" style={{ color: chrome.accent }}>{line.text.slice(0, 1)}</span>
                  ) : (
                    <sup className="mr-0.5 align-super font-display text-[10px] text-muted" style={{ fontFeatureSettings: "'lnum' 1" }}>{line.v}</sup>
                  )}
                  {i === 0 && lang === 'kr' ? line.text.slice(1) : line.text}{' '}
                </span>
              ))}
            </div>
            <p className="mt-4 text-[10.5px] tracking-[0.04em] text-muted">{lang === 'kr' ? SCRIPTURE_ATTRIBUTION : 'King James Version · 퍼블릭 도메인'}</p>
          </div>
        )}

        {/* 성경 본문 — 개역한글 원문 그대로 */}
        {!jp && passage && (
          /* 본문은 상자에 가두지 않는다 — 성경이 앱에서 가장 좁은 칼럼이 되면 안 된다 */
          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-[12px] uppercase tracking-[0.18em] text-clay-deep">{passage.ref}</p>
              <span className="text-[10.5px] text-muted">{passage.translation}</span>
            </div>
            <div className="max-w-[34ch] font-serif text-[17px] leading-[2] text-ink">
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

        {/* 본문이 없는 자리에서만 요약을 본문 자리에 둔다(있으면 시트가 이미 보여 준 문장이다) */}
        {!passage && !jp && (
          <div className="mt-6 border-l-2 border-line-strong pl-4">
            <SectionLabel>한 줄 요약 · 의역</SectionLabel>
            <p className="mt-1.5 font-serif text-[16px] leading-[1.8] text-ink">{ep.verseKrShort}</p>
            <p className="mt-1.5 text-[10.5px] text-muted">성경 원문이 아니라 이해를 돕기 위한 요약입니다.</p>
          </div>
        )}

        {/* 읽기의 리듬은 본문 → 묵상 둘이다. 사건·느낌·기도는 접어 둔다 */}
        <div className="mt-8">
          <SectionLabel>묵상</SectionLabel>
          <p className="mt-2 max-w-[34ch] text-[15px] leading-[1.8] text-ink-soft">{ep.reflection}</p>
        </div>

        <details className="mt-6 group">
          <summary className="flex cursor-pointer items-center gap-2 py-1 text-[12.5px] text-muted">
            <span className="text-rubric"><IconHeld size={15} /></span>
            이 자리에 두고 가는 말 <span className="text-[11px]">· 기도로 읽어도, 그냥 문장으로 읽어도 됩니다</span>
          </summary>
          <p className="mt-2 rounded-xl bg-sand-raised/60 px-4 py-3.5 text-[14px] leading-relaxed text-ink">{ep.prayer}</p>
        </details>

        <details className="mt-3">
          <summary className="cursor-pointer py-1 text-[12.5px] text-muted">이곳에서 있었던 일 ▾</summary>
          <p className="mt-2 text-[14px] leading-[1.75] text-ink-soft">{ep.event}</p>
          {ep.feel && <p className="mt-3 text-[13px] leading-relaxed text-muted">달리는 느낌 — {ep.feel}</p>}
        </details>

        {/* 은혜 고지 — 거리가 말씀을 여는 열쇠로 읽히지 않게 */}
        <p className="mt-8 text-[12px] leading-[1.8] text-muted">{GRACE_NOTE}</p>

        {people.length > 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer py-1 text-[12.5px] text-muted">이 자리의 사람들 ▾</summary>
            <div className="mt-2 flex flex-col gap-2">
              {people.map((f) => (
                <div key={f.name} className="flex gap-3 rounded-xl border border-line bg-sand-raised/30 px-4 py-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--color-sand-sunk)', color: chrome.accent }}>
                    <IconPilgrim size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-serif text-[15px] text-ink">{f.name}</p>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{f.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}

        <button onClick={back} className="mt-6 w-full rounded-2xl border border-line py-3.5 text-center font-serif text-[15px] text-ink-soft transition active:scale-[0.99]">
          돌아가기
        </button>
      </div>
    </div>
  )
}
