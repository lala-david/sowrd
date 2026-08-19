import { useNav } from '../store'
import { usePilgrim, journeyKmOf, daysThisWeek, pilgrimTotals } from '../state/pilgrim'
import { useRun } from '../state/run'
import { STATIONS, JESUS_ORDER, type PassageSlug } from '../data/journey'
import { featuredVerse } from '../data/scripture'
import TabBar from '../components/TabBar'
import InstallPrompt from '../components/InstallPrompt'
import BoardWindow from '../components/BoardWindow'
import { IconHeld, IconChevron, IconArrow, IconScroll, IconSeal } from '../components/icons'
import { SectionLabel } from '../components/ui'
import { crestArt, stationArt } from '../assets/art'
import { JOURNEYS, journeyById, journeyProgress, toJourneyKm } from '../data/geo/journeys'
import { questNow, questCall } from '../lib/quest'
import { MILESTONES } from '../data/geo/journeys/milestones'
import { toRealKm } from '../data/geo/journeys'

/* 홈 — 화면 하나, 질문 하나: **오늘 어디로 달릴까?**
 *
 * 예전엔 홈이 둘이었다(Home / SimpleHome). 심플 모드는 홈만 갈아끼우는 게 아니라
 * 탭바에서 여정 탭까지 감췄고, 에피소드는 여정 안에만 있으므로 **에피소드로 들어갈 길이
 * 통째로 막혔다**. 모드를 없앤다. 처음부터 전부 보이고, 간단히 보고 싶으면 그 자리에서 접는다.
 *
 * 그리고 이번에 히어로를 갈았다. 예전 홈의 주인공은 **정적 씬 일러스트 한 장**이었다.
 * 예쁘지만 아무 말도 하지 않는 그림이라, 이 앱을 여는 유일한 이유("내가 그 길 어디쯤 와 있나")가
 * 홈에 없었다 — MASTERPLAN이 P0로 못박은 "홈이 살아있는 여정 지도"가 정작 홈에 없었던 셈이다.
 * 지금 히어로는 실좌표로 그린 여정 지도다. 닿은 자리엔 인장이, 다음 자리엔 봉인이 있다.
 *
 * 위계는 하나다:
 *   ① 내가 선 자리 — 지도 (달릴 이유)
 *   ② 바로 달리기 (행동, **한 번의 탭**)
 *   ③ 오늘의 말씀 (묵상)
 *   ④ 길 바꾸기 · 품은 사람 (전환)
 * 간단히 보기를 켜면 ③④가 접히고 ①②만 남는다 — 감추는 것은 화면이지 기능이 아니다.
 */

const ORDER: PassageSlug[] = JESUS_ORDER
/* 아직 한 번도 안 달린 사람에게는 수난·광야 자리를 뽑지 않는다.
 * 날짜로만 고르다 보니 앱을 처음 켠 날 첫 화면이 겟세마네 체포 장면인 일이 실제로 있었다. */
const GENTLE = ORDER.filter((id) => !['lament', 'wilderness'].includes(STATIONS[id].mood))

function verseOfToday(firstDays: boolean) {
  const d = new Date()
  const dayIndex = Math.floor(
    (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 86400000,
  )
  const pool = firstDays ? GENTLE : ORDER
  const id = pool[dayIndex % pool.length]
  return { id, station: STATIONS[id], verse: featuredVerse(STATIONS[id]) }
}

export default function Home() {
  const go = useNav((s) => s.go)
  const openDetail = useNav((s) => s.openDetail)
  const openMap = useNav((s) => s.openMap)
  const configure = useRun((s) => s.configure)
  const pilgrim = usePilgrim()
  const { units, intercessions, activeJourneyId, activeCourseId, homeCompact, setHomeCompact } = pilgrim

  const totals = pilgrimTotals(pilgrim)
  const journey = journeyById(activeJourneyId) ?? JOURNEYS[0]
  const jKm = toJourneyKm(journey.id, journeyKmOf(pilgrim, journey.id))
  const q = questNow(journey, jKm)
  const nextMile = (MILESTONES[journey.id] ?? []).find((m) => m.cumulativeKm > jKm)
  const nextMileRealKm = nextMile ? toRealKm(journey.id, nextMile.cumulativeKm - jKm) : undefined

  const today = verseOfToday(totals.totalRuns === 0)
  const week = daysThisWeek(pilgrim)

  /* 한 번의 탭으로 출발한다.
   * 예전에는 홈 → Setup(모드 4종 + GPS 확인 + 품은 사람) → 다시 "달리기 시작"이었다.
   * 매번 설정 화면을 통과해야 하면 그 행위는 의식이 아니라 서류가 된다. 기본값으로 바로 뛰고,
   * 고르고 싶은 사람만 아래 작은 링크로 들어간다(모드·목표·품은 사람은 거기 그대로 있다). */
  const runNow = () => {
    configure({ mode: 'guided', courseId: activeCourseId, journeyId: activeJourneyId })
    go('run')
  }

  const d = new Date()
  const wd = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]

  return (
    <>
      <header
        className="relative z-10 flex items-baseline justify-between px-7"
        style={{ paddingTop: 'max(2.6rem, env(safe-area-inset-top))' }}
      >
        <span className="font-display text-[17px] font-medium tracking-[0.34em] text-clay-deep">THE&nbsp;WAY</span>
        {/* 연속일 대신 이번 주 달린 날 — 스트릭은 월·수·금 러너를 매주 0으로 되돌린다 */}
        <span className="font-display text-[12px] text-muted" style={{ fontFeatureSettings: "'lnum' 1" }}>
          이번 주 {week}일 · {wd}
        </span>
      </header>

      <div className="stagger relative z-10 flex flex-1 flex-col">
        {/* ① 내가 선 자리 — 이 화면의 주인공. 탭하면 그 여정의 자리 목록으로 들어간다. */}
        <section className="px-5 pt-4">
          <h1 className="sr-only">오늘의 길</h1>

          {/* 지도 위에 한 줄. 예전엔 여기가 세 줄이었다 —
              라틴명(THE JOURNEY OF PETER) · 장 · 그리고 지도 아래 다시 여정 이름 + 자리 8/14 + 진행바.
              같은 말을 네 번 한 셈이다. 이름과 지금 걷는 장, 그 둘만 남긴다. */}
          <div className="mb-2.5 flex items-baseline justify-between gap-3 px-1.5">
            <p className="font-serif text-[19px] font-bold leading-tight text-ink">{journey.name}</p>
            {q.chapter && <span className="shrink-0 text-[12px] text-muted">{q.chapter.name}</span>}
          </div>

          {/* 지도를 누르면 지도가 나온다 — 예전엔 자리 목록으로 갔다.
              목록이 나쁜 게 아니라, 지도를 눌렀는데 목록이 나오면 그건 지도가 아니라 버튼이다. */}
          <BoardWindow
            journey={journey}
            journeyKm={jKm}
            height={312}
            onOpen={() => openMap(journey.id)}
            caption={questCall(q, units, totals.totalRuns === 0, nextMileRealKm)}
          />
        </section>

        {/* ② 바로 달리기 — 오늘의 부름을 버튼 안에 넣는다. 왜 달리는지가 버튼에 적혀 있어야 한다. */}
        <div className="px-5 pt-5">
          <button
            onClick={runNow}
            className="flex w-full items-center justify-between rounded-[22px] py-4 pl-6 pr-4 text-left shadow-[0_1px_2px_rgba(192,90,48,.25),0_18px_40px_-18px_rgba(156,69,34,.6)] transition active:scale-[0.99]"
            style={{ background: 'var(--color-clay-deep)', color: 'var(--color-sand-raised)' }}
          >
            {/* 부제를 뺐다. "예루살렘 공회까지 4.1km"는 바로 위 지도의 배지가 이미
                그 자리에 붙여서 말하고 있다 — 같은 숫자를 두 번 말하면 둘 다 약해진다. */}
            <span className="min-w-0">
              <span className="block font-serif text-[20px] leading-tight">바로 달리기</span>
            </span>
            {/* 탭바 FAB(IconStep)와 같은 아이콘을 두 번 쓰지 않는다 — 여기는 화살표 하나 */}
            <IconArrow size={20} className="ml-3 shrink-0 opacity-90" />
          </button>

          {/* 이정표 카운터(14 / 142)는 뺐다. 홈에 숫자가 스물한 개였다.
              이정표는 여정 상세에 그대로 있고, 거기가 그것을 볼 자리다. */}
          <div className="mt-2.5 flex justify-end px-1.5">
            <button
              onClick={() => go('setup')}
              className="tap text-[12px] text-muted underline-offset-4 transition active:scale-95 hover:underline"
            >
              고르고 시작하기
            </button>
          </div>
        </div>

        {/* 홈 화면에 추가 — 설치 가능할 때만, 조용히. 이미 설치됐으면 아무것도 안 그린다.
            공유 카드로 들어온 사람이 "앱"으로 남는 유일한 경로다. */}
        <InstallPrompt />

        {/* ③ 오늘의 말씀 — 달리지 않는 날에도 이 앱에 올 이유.
            성경 본문은 거리와 무관하게 항상 열린다(신학적 요구사항). */}
        {!homeCompact && (
          <section className="mt-7 px-6">
            <div className="flex items-baseline justify-between">
              <SectionLabel>오늘의 말씀</SectionLabel>
              <span className="font-display text-[10.5px] uppercase tracking-[0.18em] text-clay-deep">
                {today.verse.refLatin}
              </span>
            </div>
            <button
              onClick={() => openDetail(today.id, 'home')}
              className="mt-3 flex w-full gap-4 text-left transition active:scale-[0.99]"
            >
              {stationArt(today.id) && (
                <span className="h-[76px] w-[62px] shrink-0 overflow-hidden rounded-xl ring-1 ring-line">
                  <img src={stationArt(today.id)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="line-clamp-3 block font-serif text-[15.5px] leading-[1.7] text-ink-soft">
                  {today.verse.text}
                </span>
                <span className="mt-1.5 flex items-center gap-1 text-[11.5px] text-muted">
                  <IconScroll size={12} /> {today.station.place} · 전문 보기
                </span>
              </span>
            </button>
          </section>
        )}

        {/* ④ 길 바꾸기 — 다섯 갈래를 항상 볼 수 있게. 지금 걷는 길은 테두리로 표시한다.
            예전엔 어느 길을 걷고 있는지가 스트립에 전혀 표시되지 않았다. */}
        {!homeCompact && (
          <section className="mt-8">
            <div className="flex items-baseline justify-between px-7">
              <SectionLabel>길 바꾸기</SectionLabel>
              <button
                onClick={() => go('journeys')}
                className="tap flex items-center gap-1 text-[12px] text-muted transition active:scale-95"
              >
                전체 <IconChevron size={13} />
              </button>
            </div>
            {/* 가로 스크롤을 없애고 다섯 칸 그리드로 바꿨다.
                스크롤 컨테이너였을 때 마지막 문장("사도 베드로")이 오른쪽에서 잘려 보였다 —
                flex 스크롤 컨테이너에서는 컨테이너의 padding-right가 무시되는 고전적인 문제라
                마지막 항목이 끝까지 스크롤되지 않는다(360px·큰 글자에서 108px 잘렸다).
                다섯 개는 어차피 한 화면에 들어간다. 스크롤 자체를 없애는 쪽이 간단하다. */}
            <div className="mt-3.5 grid grid-cols-5 gap-1 px-5 pb-1">
              {JOURNEYS.map((j) => {
                const p = journeyProgress(j, toJourneyKm(j.id, journeyKmOf(pilgrim, j.id)))
                const crest = crestArt(j.id)
                const on = j.id === activeJourneyId
                return (
                  <button
                    key={j.id}
                    /* 라벨이 "길 바꾸기"인데 실제로는 길을 안 바꾸고 있었다 —
                       상세 화면만 열고 activeJourneyId는 그대로였다. 라벨과 동작이 어긋나면
                       라벨이 거짓말이 된다. 이제 정말 그 길로 갈아타고, 그 길의 지도를 보여준다. */
                    /* 둘러보는 것과 갈아타는 것을 가른다 — 지도를 열기만 하고, 전환은 지도에서 확정한다 */
                    onClick={() => openMap(j.id)}
                    aria-current={on ? 'true' : undefined}
                    className="flex min-w-0 flex-col items-center gap-1.5 transition active:scale-95"
                  >
                    <span className="relative flex h-[48px] w-[48px] items-center justify-center">
                      <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90" aria-hidden>
                        <circle cx="24" cy="24" r="22" fill="none" stroke="var(--color-line)" strokeWidth="2" />
                        <circle
                          cx="24" cy="24" r="22" fill="none" stroke="var(--color-seal)" strokeWidth="2" strokeLinecap="round"
                          strokeDasharray={`${(p.pct / 100) * 138} 138`}
                        />
                      </svg>
                      {crest && (
                        <span
                          className="flex h-[38px] w-[38px] overflow-hidden rounded-full"
                          style={{ boxShadow: on ? '0 0 0 2px var(--color-clay)' : 'none' }}
                        >
                          <img src={crest} alt="" className="h-full w-full scale-[1.06] object-cover" loading="lazy" decoding="async" />
                        </span>
                      )}
                      {/* 실제로 걸어 본 길에만 인장을 단다.
                          reachedCount로 판정하면 전부 붙는다 — 어느 여정이든 첫 자리가 누적 0km라
                          한 걸음도 안 뛴 사람도 1이 된다. 표가 전부에게 붙으면 표가 아니다. */}
                      {journeyKmOf(pilgrim, j.id) > 0 && (
                        <span
                          className="absolute -right-0.5 -top-0.5 flex h-[16px] w-[16px] items-center justify-center rounded-full"
                          style={{ background: 'var(--color-seal)', color: 'var(--color-sand-raised)' }}
                        >
                          <IconSeal size={10} strokeWidth={2} />
                        </span>
                      )}
                    </span>
                    {/* n/N 숫자는 뺐다 — 문장 둘레의 링이 이미 같은 진행을 그리고 있다.
                        다섯 개가 나란히 있으면 숫자 열 개가 한 줄에 서는 셈이었다. */}
                    <span className={`line-clamp-2 min-h-[28px] w-full break-keep text-center text-[11px] leading-[1.25] ${on ? 'text-clay-deep' : 'text-ink-soft'}`}>
                      {({ jesus: '예수의 길', abraham: '아브라함', exodus: '출애굽', paul: '바울', peter: '베드로' } as Record<string, string>)[j.id] ?? j.who}
                      {on && <span className="sr-only"> (지금 걷는 길)</span>}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        <div className="min-h-5 flex-1" />

        {/* ⑤ 품은 사람 + 간단히 보기.
            "간단히"는 모드가 아니라 이 화면의 표시 설정이다 — 탭바와 기능은 그대로다. */}
        <div className="relative z-10 mt-4 px-6">
          {!homeCompact && (
            <button
              onClick={() => go('profile')}
              className="flex w-full items-center gap-3 border-t border-line py-3.5 text-left transition active:scale-[0.99]"
            >
              <span className="text-rubric">
                <IconHeld size={18} />
              </span>
              <span className="flex-1 text-[13.5px] text-ink-soft">
                {intercessions.length > 0
                  ? `품고 달리는 사람 · ${intercessions.slice(0, 2).map((i) => i.alias).join(', ')}${intercessions.length > 2 ? ` 외 ${intercessions.length - 2}` : ''}`
                  : '품고 달릴 사람 더하기'}
              </span>
              <IconChevron size={15} className="text-muted" />
            </button>
          )}
          <button
            onClick={() => setHomeCompact(!homeCompact)}
            aria-pressed={homeCompact}
            className="flex min-h-[44px] w-full items-center justify-center gap-1.5 border-t border-line text-[12px] text-muted transition active:scale-[0.99]"
          >
            {homeCompact ? '자세히 보기' : '간단히 보기'}
            <IconChevron size={12} className={homeCompact ? '-rotate-90' : 'rotate-90'} />
          </button>
        </div>
      </div>

      <TabBar active="home" />
    </>
  )
}
