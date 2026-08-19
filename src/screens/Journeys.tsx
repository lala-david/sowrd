import { useNav } from '../store'
import { usePilgrim, journeyKmOf } from '../state/pilgrim'
import { JOURNEYS, JOURNEY_CHROME, journeyProgress, toJourneyKm, toRealKm } from '../data/geo/journeys'
import { sceneArt, crestArt, terrainArt } from '../assets/art'
import { sceneFocus } from '../lib/scene'
import { SectionLabel } from '../components/ui'
import TabBar from '../components/TabBar'
import { IconArrow, IconSeal } from '../components/icons'
import { questNow } from '../lib/quest'

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
 * 예수님 사역 길도 이제 같은 목록의 같은 카드다(geo/journeys/jesus.ts가 좌표와 서사를 조인한다). */
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
        {/* 예수님의 사역 길은 이제 JOURNEYS의 첫 항목이다(geo/journeys/jesus.ts).
            예전엔 여기에 별도 카드가 하드코딩돼 있었다 — 진행도도 없고("37자리 · 약 3,020km"라는
            고정 문구뿐), 누르면 수집 화면으로 새는, 다른 네 여정과 규칙이 다른 카드였다.
            같은 목록의 같은 카드가 되면서 진행·다음 자리·인장이 전부 붙는다. */}
        {JOURNEYS.map((j) => {
          const chrome = JOURNEY_CHROME[j.id]
          const km = toJourneyKm(j.id, journeyKmOf(pilgrim, j.id))
          const prog = journeyProgress(j, km)
          const crest = crestArt(j.id)
          const chapter = questNow(j, km).chapter
          const active = j.id === pilgrim.activeJourneyId
          return (
            <button
              key={j.id}
              onClick={() => { setActiveJourney(j.id); openJourney(j.id) }}
              className="relative w-full overflow-hidden rounded-3xl border border-line-strong text-left transition active:scale-[0.99]"
            >
              {/* 그 길의 그림 — recraft 컷페이퍼 벡터. 없으면 지역 씬으로 폴백한다.
                  예전엔 다섯 카드가 씬 8종을 돌려 써서 아브라함과 바울이 같은 새벽길이었다.
                  카드는 132px로 **큰 자리**라 생성 아트의 결이 살아난다(20px 노드와 다르다). */}
              {/* 카드 그림은 **그 땅**이지 물건이 아니다.
                  전에는 여정 상징 오브젝트(배·성벽·두루마리)를 깔았는데, 카드가 가로로 길어
                  object-cover가 물건을 반으로 잘랐다 — 뱃머리만 남은 배, 절반만 남은 성벽.
                  누끼를 딴다고 해결될 문제가 아니라 **자를 수 없는 그림을 자르고 있던 것**이었다.
                  지도에 쓰는 지형 그림은 가장자리까지 지형이라 어디를 잘라도 자연스럽다.
                  덤으로 카드와 그 여정의 지도가 같은 땅을 보여 준다.

                  그림은 **배경**이고 카드 높이는 **글**이 정한다.
                  예전엔 반대였다: 그림이 높이 132px를 정하고 글 영역이 absolute였는데,
                  라틴명이 두 줄이 되는 여정(THE JOURNEY OF PETER)에서 글이 카드보다 길어져
                  위아래가 통째로 잘렸다 — "지금 걷는 길" 칩이 반만 보이고 장 이름이 사라졌다.
                  글을 흐름에 두면 카드가 글에 맞춰 자란다. 잘릴 것이 없어진다. */}
              <img
                src={terrainArt(j.id) ?? sceneArt(chrome.scene)}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: terrainArt(j.id) ? 'center 45%' : sceneFocus(chrome.scene, 'card') }}
              />
              <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(to right, var(--color-sand) 0%, var(--color-sand) 44%, transparent 82%)' }} />

              <div className="relative flex min-h-[132px] w-[64%] flex-col justify-center px-5 py-4">
                <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                  <span className="font-display text-[10.5px] uppercase tracking-[0.2em]" style={{ color: chrome.accent }}>
                    {j.nameLatin}
                  </span>
                  {/* 지금 걷는 길 — 예전엔 목록에서 어느 길을 걷고 있는지 알 수 없었다.
                      카드 위에 절대배치했더니 제목을 덮어서, 라틴명 옆 칩으로 내렸다. */}
                  {active && (
                    <span
                      className="rounded-full px-2 py-[3px] text-[11px] leading-none"
                      style={{ background: 'var(--color-clay-deep)', color: 'var(--color-sand-raised)' }}
                    >
                      지금 걷는 길
                    </span>
                  )}
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

                {/* 지금 어느 장을 걷는 중인지 — 목록에서도 진행이 이야기로 읽히게 */}
                {chapter && (
                  <p className="mt-1.5 flex items-center gap-1 text-[10.5px] text-muted">
                    <span className="font-display">{chapter.index}장</span> · {chapter.name}
                  </p>
                )}
              </div>

              {crest && <Crest src={crest} />}
              {/* 인장 — **실제로 걸은** 길에만 붙는다.
                  reachedCount로 판정했더니 모든 카드에 인장이 찍혔다: 어느 여정이든 첫 자리가
                  누적 0km라 한 걸음도 안 뛴 사람도 reachedCount가 1이기 때문이다.
                  표가 전부에게 붙으면 표가 아니다. 달린 거리로 판정한다. */}
              {km > 0 && (
                <span
                  className="absolute right-3.5 top-3.5 flex h-7 w-7 items-center justify-center rounded-full"
                  style={{ background: 'var(--color-seal)', color: 'var(--color-lapis-surface)' }}
                  aria-hidden
                >
                  <IconSeal size={15} strokeWidth={1.8} />
                </span>
              )}
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
