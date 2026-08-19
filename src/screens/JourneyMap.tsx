import { useState } from 'react'
import { useNav } from '../store'
import { usePilgrim, journeyKmOf } from '../state/pilgrim'
import { journeyById, JOURNEYS, toJourneyKm, toRealKm, journeyProgress } from '../data/geo/journeys'
import { questChapterStops, questAll, currentTierIndex, questNow, stopStateAt } from '../lib/quest'
import QuestMap from '../components/QuestMap'
import { IconArrow, IconSeal, IconLocked, IconCompass } from '../components/icons'

/* ── 지도 화면 ─────────────────────────────────────────────────────────────
 *
 * 펼친 지도는 **두 가지 축척**으로 본다. 게임의 지도가 그렇다 — 월드맵과 지역맵.
 *
 *   전체 지도(월드맵) — 이 길이 어디서 어디까지인지 한 장에. 자리는 점이고,
 *     장이 시작되는 자리에만 번호 표식이 선다. 표식을 누르면 그 장으로 들어간다.
 *   장 지도          — 자리가 크고 하나하나가 퀘스트 입구다. 누르면 그 자리의 말씀이 열린다.
 *
 * 전체를 장과 같은 규칙으로 그려 봤고, 안 됐다: 예수님의 사역 길은 자리 33개가 갈릴리·유대의
 * 좁은 지역에서 수십 번 겹쳐 지나가서, 종횡비를 지키는 한(지켜야 한다 — 그게 이 제품의
 * 근거다) 메달리온을 아무리 줄여도 금 동전 한 덩어리가 됐다. 그래서 월드맵은 **자리의
 * 지도가 아니라 구역의 지도**로 그린다. 자세한 것은 QuestMap의 world 모드.
 *
 * 열자마자 보이는 것은 **내가 선 장**이다 — 이 앱을 여는 이유가 "내가 어디쯤 왔나"이므로,
 * 첫 화면이 대답해야 할 것은 전체 조망이 아니라 지금 서 있는 자리다.
 *
 * 홈의 지도와도 이렇게 갈린다:
 *   홈   — 지금 구간 여섯 자리. 지도 전체가 버튼 하나(작은 창에 버튼을 겹치면 오탭만 는다)
 */
export default function JourneyMap() {
  const go = useNav((s) => s.go)
  const journeyId = useNav((s) => s.journeyId)
  const openJourney = useNav((s) => s.openJourney)
  const openEpisode = useNav((s) => s.openEpisode)
  const pilgrim = usePilgrim()

  const journey =
    (journeyId ? journeyById(journeyId) : undefined) ?? journeyById(pilgrim.activeJourneyId) ?? JOURNEYS[0]
  const km = toJourneyKm(journey.id, journeyKmOf(pilgrim, journey.id))
  const q = questNow(journey, km)
  const prog = journeyProgress(journey, km)

  /* 보기는 둘이다.
   *   'all' — 여정 전체(월드맵). 이 길이 어디서 어디까지인지 한눈에.
   *   숫자   — 그 장 하나. 자리가 크고 하나씩 누를 수 있다.
   * 열자마자 내가 선 장에서 시작한다 — 처음 보이는 것은 "지금 내가 선 자리"여야 한다.
   * 전체는 한 번 눌러서 본다(예수님의 사역 길처럼 자리가 서른셋인 여정에서는 전체가
   * 빽빽해질 수밖에 없다 — 지리가 그렇기 때문이다. 그래서 기본값이 아니라 선택지다). */
  const [tab, setTab] = useState<number | 'all'>(() => currentTierIndex(journey, km))
  const showAll = tab === 'all'
  const tierIndex = showAll ? -1 : (tab as number)
  const tier = showAll ? undefined : journey.tiers[tierIndex]
  const stops = showAll ? questAll(journey, km) : questChapterStops(journey, km, tierIndex)


  /* 그 장이 통째로 봉인됐는가 — 첫 자리에도 아직 못 닿았으면 미리보기다.
     본문은 언제나 열리므로(신학 요구사항) 자리를 누르는 것은 막지 않는다. */
  const chapterLocked = stops.length ? stopStateAt(stops[0].index, prog.reachedCount) === 'sealed' : true
  const chapterDone = stops.length ? stops[stops.length - 1].index < prog.reachedCount - 1 : false

  return (
    <div className="relative flex flex-1 flex-col">
      <header className="flex items-center gap-3 px-5" style={{ paddingTop: 'max(2.4rem, env(safe-area-inset-top))' }}>
        <button
          onClick={() => go('home')}
          aria-label="뒤로"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted transition active:scale-90"
        >
          <IconArrow size={17} className="rotate-180" />
        </button>
        <p className="min-w-0 flex-1 truncate font-serif text-[18px] font-bold leading-tight text-ink">{journey.name}</p>
      </header>

      {/* 보기 고르기 — 전체 월드맵 하나 + 장 하나씩.
          걸어온 장에는 인장이, 아직 못 간 장에는 자물쇠가 붙는다 */}
      <div className="mt-3 flex gap-2 overflow-x-auto px-5 pb-1" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => setTab('all')}
          aria-current={showAll ? 'true' : undefined}
          className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12.5px] transition active:scale-95 ${
            showAll ? 'border-clay-deep bg-clay-deep text-sand-raised' : 'border-line text-ink-soft'
          }`}
        >
          <IconCompass size={13} />
          전체 지도
        </button>
        {journey.tiers.map((t, i) => {
          const on = i === tab
          const first = questChapterStops(journey, km, i)[0]
          const locked = first ? stopStateAt(first.index, prog.reachedCount) === 'sealed' : true
          return (
            <button
              key={t.id}
              onClick={() => setTab(i)}
              aria-current={on ? 'true' : undefined}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12.5px] transition active:scale-95 ${
                on ? 'border-clay-deep bg-clay-deep text-sand-raised' : 'border-line text-ink-soft'
              }`}
            >
              {locked ? <IconLocked size={12} /> : <IconSeal size={12} />}
              {i + 1}장 · {t.name}
            </button>
          )
        })}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-6 pt-3">
        {/* 장을 바꾸면 지도가 새로 그려져야 한다 — key로 다시 마운트해 경로 드로우를 재생한다 */}
        <QuestMap
          key={`${journey.id}-${String(tab)}`}
          stops={stops}
          segProgress={q.segProgress}
          atStart={prog.reachedCount === 0}
          units={pilgrim.units}
          journeyId={journey.id}
          height={340}
          world={showAll}
          onSelectStop={showAll ? undefined : (id) => openEpisode(journey.id, id)}
        />

        {/* 전체 보기일 때는 여정 전체를 요약한다 */}
        {showAll && (
          <div className="stagger mt-4 px-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-serif text-[16px] font-bold leading-tight text-ink">{journey.name} 전체</p>
              <span className="shrink-0 text-[11.5px] text-muted">
                자리 {prog.reachedCount}/{prog.total}
              </span>
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              {journey.who} · {journey.era} · 장 {journey.tiers.length}개
            </p>
            {/* 어디서 어디까지인가 — 지도 위에 이름표를 얹으면 인장을 덮으므로 글로 말한다 */}
            <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
              <span className="font-serif text-ink">{journey.episodes[0]?.place}</span>
              {'에서 '}
              <span className="font-serif text-ink">{journey.episodes[journey.episodes.length - 1]?.place}</span>
              {'까지'}
            </p>
            {q.next && (
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
                지금 <span className="font-serif text-ink">{q.current?.place ?? '길의 첫머리'}</span>
                {' · 다음은 '}
                <span className="font-serif text-ink">{q.next.place}</span>
                {'까지 '}
                <span className="font-display text-clay-deep" style={{ fontFeatureSettings: "'lnum' 1" }}>
                  {q.toRealKm < 10 ? q.toRealKm.toFixed(1) : Math.round(q.toRealKm)}
                </span>
                {pilgrim.units}
              </p>
            )}
            <p className="mt-2 text-[12px] text-muted">
              끝까지 내가 달릴 거리{' '}
              <span className="font-display text-clay-deep" style={{ fontFeatureSettings: "'lnum' 1" }}>
                {Math.round(toRealKm(journey.id, journey.totalKm)).toLocaleString()}
              </span>
              {pilgrim.units}
            </p>

          </div>
        )}

        {/* 이 장이 무엇인가 — 지도 아래 한 문단. 장마다 다른 이야기가 붙는다 */}
        {tier && (
          <div className="stagger mt-4 px-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-serif text-[16px] font-bold leading-tight text-ink">
                {tierIndex + 1}장 · {tier.name}
              </p>
              <span className="shrink-0 text-[11.5px] text-muted">
                {chapterDone ? '다 걸었습니다' : chapterLocked ? '아직 봉인' : '걷는 중'}
              </span>
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{tier.note}</p>
            <p className="mt-2 text-[12px] text-muted">
              자리 {stops.length}곳 · 이 장에 내가 달릴 거리{' '}
              <span className="font-display text-clay-deep" style={{ fontFeatureSettings: "'lnum' 1" }}>
                {toRealKm(journey.id, tier.km).toFixed(1)}
              </span>
              {pilgrim.units}
            </p>

          </div>
        )}

        <button
          onClick={() => openJourney(journey.id)}
          className="mx-auto mt-5 rounded-full border border-line px-4 py-2 text-[12.5px] text-ink-soft transition active:scale-95"
        >
          자리 목록으로 보기
        </button>
      </div>
    </div>
  )
}
