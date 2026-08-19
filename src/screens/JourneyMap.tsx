import { useNav } from '../store'
import { usePilgrim, journeyKmOf } from '../state/pilgrim'
import { journeyById, JOURNEYS, toJourneyKm } from '../data/geo/journeys'
import { questAll, questNow } from '../lib/quest'
import QuestMap from '../components/QuestMap'
import { IconArrow } from '../components/icons'

/* ── 지도만 보는 화면 ──────────────────────────────────────────────────────
 *
 * 홈의 지도는 지금 걷는 구간만 크게 보여 준다(자리 여섯). 그건 "다음 한 걸음"을 위한
 * 창이지 그 길 전체가 아니다. 길 전체를 보고 싶을 때가 있다 — 어디서 시작해서 어디로 가는지,
 * 내가 그중 어디쯤인지.
 *
 * 이 화면에는 지도 말고 아무것도 없다. 진행바도, 카운터도, 목록도 없다.
 * 지도를 누르면 지도가 나온다 — 그게 전부다. */
export default function JourneyMap() {
  const go = useNav((s) => s.go)
  const journeyId = useNav((s) => s.journeyId)
  const openJourney = useNav((s) => s.openJourney)
  const pilgrim = usePilgrim()

  const journey = (journeyId ? journeyById(journeyId) : undefined) ?? journeyById(pilgrim.activeJourneyId) ?? JOURNEYS[0]
  const km = toJourneyKm(journey.id, journeyKmOf(pilgrim, journey.id))
  const q = questNow(journey, km)

  return (
    <div className="relative flex flex-1 flex-col">
      <header
        className="flex items-center gap-3 px-5"
        style={{ paddingTop: 'max(2.4rem, env(safe-area-inset-top))' }}
      >
        <button
          onClick={() => go('home')}
          aria-label="뒤로"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted transition active:scale-90"
        >
          <IconArrow size={17} className="rotate-180" />
        </button>
        <p className="min-w-0 flex-1 truncate font-serif text-[18px] font-bold leading-tight text-ink">
          {journey.name}
        </p>
      </header>

      {/* 길 전체. 자리 서른셋이 한 장에 들어가므로 세로로 넉넉히 준다. */}
      <div className="flex flex-1 flex-col justify-center px-4 pb-6 pt-3">
        <button
          onClick={() => openJourney(journey.id)}
          aria-label={`${journey.name} 자리 목록 열기`}
          className="block w-full text-left transition active:scale-[0.995]"
        >
          <QuestMap
            stops={questAll(journey, km)}
            segProgress={q.segProgress}
            atStart={q.reachedCount === 0}
            units={pilgrim.units}
            journeyId={journey.id}
            height={430}
          />
        </button>
        <p className="mt-3 px-2 text-center text-[12px] text-muted">
          {q.next ? `다음 자리 ${q.next.place}` : '이 길을 끝까지 걸었습니다'}
        </p>
      </div>
    </div>
  )
}
