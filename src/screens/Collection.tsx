import { useState } from 'react'
import { useNav } from '../store'
import { JOURNEYS, JOURNEY_CHROME, toJourneyKm } from '../data/geo/journeys'
import { usePilgrim, journeyKmOf } from '../state/pilgrim'
import { STATIONS, type PassageSlug } from '../data/journey'
import { featuredVerseById, GRACE_NOTE } from '../data/scripture'
import { toneOf } from '../lib/mood'
import { sceneArt, stationArt, crestArt, episodeArt } from '../assets/art'
import { sceneForStation } from '../lib/scene'
import { SectionLabel } from '../components/ui'
import TabBar from '../components/TabBar'
import { arcIcon, IconScroll, IconSeal } from '../components/icons'

/* 예수님의 사역 길 — 카테고리로 묶지 않고 실제 사역 순서 그대로 한 줄로 잇는다.
 * STATIONS의 선언 순서가 곧 사역 순서다(세례 → 광야 → 부르심 → 팔복 → … → 파송).
 * 자리마다 그 지형의 그림을 붙여야 스탬프가 수집품처럼 보인다. */
const ORDER = Object.keys(STATIONS) as PassageSlug[]

type Mode = 'journeys' | 'path' | 'verses'

export default function Collection() {
  const go = useNav((s) => s.go)
  const openDetail = useNav((s) => s.openDetail)
  const openJourney = useNav((s) => s.openJourney)
  const pilgrim = usePilgrim()
  /* 관리자 모드는 **열람 권한**이지 진행도가 아니다.
   * 예전엔 admin일 때 37자리를 전부 '도달'로 칠했는데, 그러면 앱을 처음 켠 순간
   * 수집이 37/37이고 잠긴 것이 하나도 없어서 대비도 다음 목표도 사라졌다.
   * 접근은 어차피 막혀 있지 않다(성경 본문은 신학적으로 절대 잠그지 않으므로 자리를
   * 눌러 여는 것은 admin과 무관하게 항상 가능하다). admin이 살 수 있는 것은 가짜 100%뿐이었다. */
  const reached = new Set(Object.values(pilgrim.progress).flatMap((p) => p.reached))
  const collected = pilgrim.collectedVerses.filter((id) => reached.has(id))
  const [mode, setMode] = useState<Mode>('journeys')

  /* 여정 자리 — 68개가 여기 하나도 없었다.
   * commitRun이 예수 코스의 r.reached만 collectedVerses에 담았기 때문에,
   * 바울의 28자리를 전부 밟아도 이 화면은 0이었다. */
  const epSet = new Set(pilgrim.collectedEpisodes ?? [])
  const reachedAt = pilgrim.lifetime?.episodeReachedAt ?? {}
  const journeyRows = JOURNEYS.map((j) => {
    const km = toJourneyKm(j.id, journeyKmOf(pilgrim, j.id))
    /* 출발지(cumulativeKm 0)는 그 길을 실제로 달린 뒤에만 도달로 친다.
     * km >= 0 만 보면 한 번도 고르지 않은 길의 시작점 4개가 처음부터 도달로 잡힌다. */
    const ran = journeyKmOf(pilgrim, j.id) > 0
    const done = j.episodes.filter(
      (e) => epSet.has(`${j.id}:${e.id}`) || (e.cumulativeKm > 0 ? km >= e.cumulativeKm : ran),
    )
    return { j, done: done.length, total: j.episodes.length, last: done[done.length - 1], km }
  })
  const epTotal = journeyRows.reduce((a, r) => a + r.total, 0)
  const epDone = journeyRows.reduce((a, r) => a + r.done, 0)

  // 다음에 닿을 자리 = 아직 안 간 첫 자리. 여기가 "지금 할 일"이다.
  const nextIdx = ORDER.findIndex((id) => !reached.has(id))

  return (
    <div className="relative flex flex-1 flex-col">
      <header className="px-7" style={{ paddingTop: 'max(3rem, env(safe-area-inset-top))' }}>
        <SectionLabel>예수님의 사역 길</SectionLabel>
        <h1 className="mt-2 font-serif text-[30px] font-bold leading-tight">닿은 자리</h1>

        <div className="mt-3 flex items-center gap-3">
          <div className="h-[4px] flex-1 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full transition-[width] duration-700"
              style={{ width: `${((reached.size + epDone) / (ORDER.length + epTotal)) * 100}%`, background: 'var(--color-lapis)' }}
            />
          </div>
          <span className="font-display text-[12px] text-ink-soft" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
            {reached.size + epDone}/{ORDER.length + epTotal}
          </span>
        </div>

        <div className="mt-4 inline-flex rounded-xl border border-line-strong p-[3px]">
          {([['journeys', `여정 ${epDone}`], ['path', '예수의 길'], ['verses', `구절 ${collected.length}`]] as const).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`min-h-[44px] rounded-lg px-4 text-[13px] transition ${
                mode === m ? 'bg-clay-deep text-sand-raised' : 'text-muted active:scale-95'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {mode === 'journeys' ? (
        /* 다섯 갈래 길의 자리를 한 화면에. 탭하면 그 여정으로 들어간다. */
        <section className="anim-rise mt-6 flex flex-col gap-3 px-6">
          {journeyRows.map(({ j, done, total, last }) => {
            const chrome = JOURNEY_CHROME[j.id]
            const at = last ? reachedAt[j.id]?.[last.id] : undefined
            return (
              <button
                key={j.id}
                onClick={() => openJourney(j.id)}
                className="flex w-full items-center gap-3.5 rounded-2xl border border-line bg-sand-raised/40 p-3.5 text-left transition active:scale-[0.99]"
              >
                {/* 마지막으로 닿은 자리의 그림. 아직 안 걸은 길은 문장(crest)으로 —
                    "내가 여기까지 왔다"를 보여주는 자리이므로 진행에 따라 그림이 바뀌어야 한다. */}
                {last && episodeArt(j.id, last.id) ? (
                  <img src={episodeArt(j.id, last.id)} alt="" loading="lazy" decoding="async" className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-line" />
                ) : (
                  crestArt(j.id) && (
                    <img src={crestArt(j.id)!} alt="" loading="lazy" className="h-12 w-12 shrink-0 rounded-full object-cover opacity-45" />
                  )
                )}
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-serif text-[15.5px] text-ink">{j.name}</span>
                    <span className="shrink-0 font-display text-[12px] text-muted" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                      {done}/{total}
                    </span>
                  </span>
                  <span className="mt-1.5 block h-[3px] w-full overflow-hidden rounded-full bg-line">
                    <span className="block h-full rounded-full" style={{ width: `${(done / total) * 100}%`, background: chrome.accent }} />
                  </span>
                  <span className="mt-1.5 block truncate text-[11.5px] text-muted">
                    {last
                      ? `마지막으로 닿은 자리 · ${last.place}${at ? ` · ${new Date(at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}` : ''}`
                      : '아직 이 길을 걷지 않았습니다'}
                  </span>
                </span>
                <IconSeal size={16} className={done > 0 ? 'text-sun-deep' : 'text-line-strong'} />
              </button>
            )
          })}
          <p className="mt-1 px-1 text-[11.5px] leading-relaxed text-muted">
            성경 본문은 닿은 자리와 상관없이 언제나 읽을 수 있습니다.
          </p>
        </section>
      ) : mode === 'path' ? (
        /* 한 줄로 이어지는 길 — 라피스 레일 위에 자리들이 순서대로 놓인다 */
        <section className="anim-rise relative mt-6 pl-[46px] pr-5">
          <span
            className="absolute bottom-6 left-[27px] top-6 w-px"
            style={{ background: 'var(--color-lapis)', opacity: 0.75 }}
          />
          <div className="flex flex-col gap-2.5" style={{ paddingBottom: '0.5rem' }}>
            {ORDER.map((id, i) => {
              const st = STATIONS[id]
              const on = reached.has(id)
              const isNext = i === nextIdx
              const tone = toneOf(st.mood)
              const Arc = arcIcon(st.mood === 'lament' ? 'passion' : st.arc)
              const art = stationArt(id) ?? sceneArt(sceneForStation(st))
              return (
                <button
                  key={id}
                  onClick={() => openDetail(id)}
                  style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
                  className={`anim-pop relative flex w-full items-center gap-3 rounded-2xl border pr-3 text-left transition active:scale-[0.99] ${
                    isNext ? 'border-lapis/60 bg-sand-raised' : on ? 'border-line-strong bg-sand-raised' : 'border-line bg-sand-raised/30'
                  }`}
                >
                  {/* 레일 노드 */}
                  <span
                    className="absolute -left-[30.5px] top-1/2 flex h-[22px] w-[22px] -translate-y-1/2 items-center justify-center rounded-full"
                    style={{
                      background: 'var(--color-sand)',
                      color: on ? 'var(--color-sun-deep)' : 'var(--color-lapis)',
                      boxShadow: isNext ? '0 0 0 1.5px var(--color-lapis)' : 'none',
                    }}
                  >
                    {on ? (
                      <IconSeal size={15} />
                    ) : (
                      <span
                        className="rounded-full"
                        style={{
                          width: isNext ? 7 : 5,
                          height: isNext ? 7 : 5,
                          background: isNext ? 'var(--color-lapis)' : 'var(--color-line-strong)',
                        }}
                      />
                    )}
                  </span>

                  {/* 자리 그림 — 도달 전에는 옅게 */}
                  <span className="relative w-[62px] shrink-0 self-stretch overflow-hidden rounded-l-[15px]">
                    <img
                      src={art}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition"
                      style={{ opacity: on ? 1 : 0.42, filter: on ? 'none' : 'saturate(0.5)' }}
                    />
                  </span>

                  <span className="min-w-0 flex-1 py-2.5">
                    <span className="flex items-center gap-1.5">
                      <span style={{ color: on ? tone.accent : 'var(--color-muted)' }}>
                        <Arc size={13} />
                      </span>
                      <span className="font-display text-[10px] uppercase tracking-[0.16em] text-muted">
                        {String(i + 1).padStart(2, '0')} · {st.placeLatin}
                      </span>
                    </span>
                    <span className={`mt-0.5 block font-serif text-[15.5px] leading-tight ${on ? 'text-ink' : 'text-ink-soft'}`}>
                      {st.place}
                    </span>
                    <span className="mt-0.5 block truncate text-[11.5px] text-muted">
                      {on ? st.title : isNext ? '다음 자리' : st.title}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      ) : (
        <section className="anim-rise mt-6 px-6">
          {collected.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="text-muted"><IconScroll size={26} /></span>
              <p className="text-[13.5px] text-muted">아직 모은 구절이 없습니다.</p>
              <p className="max-w-[26ch] text-[12px] leading-relaxed text-muted">
                자리에 닿으면 그 자리의 말씀이 여기 쌓입니다. 아직 못 간 자리의 말씀도 언제든 읽을 수 있습니다.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {collected.slice().reverse().map((id, i) => {
                const v = featuredVerseById(id)
                return (
                  <button
                    key={id}
                    onClick={() => openDetail(id)}
                    style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
                    className="anim-rise py-4 text-left transition active:scale-[0.99]"
                  >
                    <p className="font-serif text-[15px] leading-[1.65] text-ink-soft">
                      <span className="versal">{v.text.slice(0, 1)}</span>
                      {v.text.slice(1)}
                    </p>
                    <p className="mt-2 font-display text-[11px] uppercase tracking-[0.18em] text-clay-deep">
                      {v.refLatin} · {STATIONS[id].place}
                    </p>
                  </button>
                )
              })}
            </div>
          )}
        </section>
      )}

      <p className="px-7 pt-8 text-[12px] leading-[1.8] text-muted">{GRACE_NOTE}</p>

      <div className="px-6 pb-2 pt-6">
        <button onClick={() => go('journeys')} className="w-full rounded-2xl border border-line py-3.5 text-center font-serif text-[15px] text-ink-soft transition active:scale-[0.99]">
          다른 여정 보기
        </button>
      </div>

      {/* 자기 탭을 켠다 — 예전엔 남의 탭(journeys)을 켜서 사용자가 자기 위치를 알 수 없었다 */}
      <TabBar active="collection" />
    </div>
  )
}
