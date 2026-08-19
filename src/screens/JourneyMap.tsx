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

  /* 카드 높이를 길의 모양에서 구한다.
     실좌표를 회전시켜도 종횡비는 안 바꾸므로(그래야 진짜 지도다), 길이 가로로 누우면
     세로 여백이 남는다. 430 고정이었을 때 카드 절반이 빈 종이였다. */
  const mapHeight = (() => {
    const eps = journey.episodes
    if (eps.length < 2) return 300
    const lats = eps.map((e) => e.lat)
    const lngs = eps.map((e) => e.lng)
    const midLat = (Math.min(...lats) + Math.max(...lats)) / 2
    const k = Math.cos((midLat * Math.PI) / 180)
    const raw = lngs.map((lng, i) => [lng * k, -lats[i]] as [number, number])
    const n = raw.length
    const mx = raw.reduce((a, p) => a + p[0], 0) / n
    const my = raw.reduce((a, p) => a + p[1], 0) / n
    let sxx = 0, syy = 0, sxy = 0
    for (const [x, y] of raw) { sxx += (x - mx) ** 2; syy += (y - my) ** 2; sxy += (x - mx) * (y - my) }
    const th = 0.5 * Math.atan2(2 * sxy, sxx - syy)
    const c = Math.cos(-th), sn = Math.sin(-th)
    const rot = raw.map(([x, y]) => [(x - mx) * c - (y - my) * sn, (x - mx) * sn + (y - my) * c])
    const spanX = Math.max(...rot.map((p) => p[0])) - Math.min(...rot.map((p) => p[0]))
    const spanY = Math.max(...rot.map((p) => p[1])) - Math.min(...rot.map((p) => p[1]))
    const ratio = spanX > 1e-9 ? spanY / spanX : 1
    return Math.round(Math.min(440, Math.max(230, 60 + (340 - 60) * ratio + 90)))
  })()

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
          {/* 카드 높이를 **길의 모양**에 맞춘다.
              430으로 고정했더니 길이 가로로 누운 여정에서 위아래가 통째로 비었다(카드 절반이 여백).
              종횡비를 왜곡하지 않는 것이 원칙이므로, 늘릴 수 없으면 카드를 줄이는 쪽이 맞다. */}
          <QuestMap
            stops={questAll(journey, km)}
            segProgress={q.segProgress}
            atStart={q.reachedCount === 0}
            units={pilgrim.units}
            journeyId={journey.id}
            height={mapHeight}
          />
        </button>
        <p className="mt-3 px-2 text-center text-[12px] text-muted">
          {q.next ? `다음 자리 ${q.next.place}` : '이 길을 끝까지 걸었습니다'}
        </p>
      </div>
    </div>
  )
}
