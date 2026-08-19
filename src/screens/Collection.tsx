import { useNav } from '../store'
import { JOURNEYS, JOURNEY_CHROME, toJourneyKm, journeyProgress, type Journey, type JourneyEpisode } from '../data/geo/journeys'
import { usePilgrim, journeyKmOf, pilgrimTotals } from '../state/pilgrim'
import { GRACE_NOTE } from '../data/scripture'
import { crestArt, episodeArt } from '../assets/art'
import { SectionLabel } from '../components/ui'
import { fmtDistance } from '../lib/format'
import TabBar from '../components/TabBar'
import { IconScroll, IconSeal } from '../components/icons'

/* ── 여권 ──────────────────────────────────────────────────────────────────
 *
 * "내가 달린 km → 받은 말씀"이 한 화면에 읽혀야 한다. 탭을 두지 않는다 — 예전의 세 탭
 * (여정 / 예수의 길 / 구절)에서 '예수의 길'은 정확히 예수 여정의 보드였고(지도가 생긴 지금
 * 완전 중복), '구절'은 탭이 아니라 섹션이어야 할 것이었다(내용이 배타적이지 않다).
 *
 * 순서: 한 줄(달린 km·인장) → 마지막으로 받은 말씀 → 다섯 길 → 받은 말씀 전부.
 * 숫자는 머리의 둘뿐이다. */

interface Received {
  journey: Journey
  ep: JourneyEpisode
  at?: number
}

export default function Collection() {
  const go = useNav((s) => s.go)
  const openEpisode = useNav((s) => s.openEpisode)
  const openJourney = useNav((s) => s.openJourney)
  const pilgrim = usePilgrim()
  const totals = pilgrimTotals(pilgrim)

  const epSet = new Set(pilgrim.collectedEpisodes ?? [])
  const reachedAt = pilgrim.lifetime?.episodeReachedAt ?? {}

  /* 여정별 도달 — 출발지(cumulativeKm 0)는 그 길을 실제로 달린 뒤에만 도달로 친다.
     km >= 0만 보면 한 번도 고르지 않은 길의 시작점이 처음부터 도달로 잡힌다. */
  const rows = JOURNEYS.map((j) => {
    const km = toJourneyKm(j.id, journeyKmOf(pilgrim, j.id))
    const ran = journeyKmOf(pilgrim, j.id) > 0
    const done = j.episodes.filter((e) => epSet.has(`${j.id}:${e.id}`) || (e.cumulativeKm > 0 ? km >= e.cumulativeKm : ran))
    return { j, done, km, prog: journeyProgress(j, km) }
  })
  const epTotal = rows.reduce((a, r) => a + r.j.episodes.length, 0)
  const epDone = rows.reduce((a, r) => a + r.done.length, 0)

  /* 받은 말씀 전부 — 여정 무관, 시간 역순. 날짜가 없는 것(시연·이전 기록)은 뒤로. */
  const received: Received[] = rows
    .flatMap(({ j, done }) => done.map((ep) => ({ journey: j, ep, at: reachedAt[j.id]?.[ep.id] })))
    .sort((a, b) => (b.at ?? 0) - (a.at ?? 0))
  const latest = received[0]

  const fmtDay = (t?: number) => (t ? new Date(t).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }) : undefined)

  return (
    <div className="relative flex flex-1 flex-col">
      <header className="px-7" style={{ paddingTop: 'max(3rem, env(safe-area-inset-top))' }}>
        <SectionLabel>여권</SectionLabel>
        <h1 className="mt-2 font-serif text-[30px] font-bold leading-tight">닿은 자리</h1>
        {epDone > 0 ? (
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
            지금까지 <span className="font-display text-ink-soft" style={{ fontFeatureSettings: "'lnum' 1" }}>{fmtDistance(totals.totalKm, pilgrim.units, 1)}</span>
            {pilgrim.units} 달려 인장 <span className="font-display text-ink-soft" style={{ fontFeatureSettings: "'lnum' 1" }}>{epDone}</span>개를 받았습니다.
          </p>
        ) : (
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
            아직 인장이 없습니다. 첫 <span className="font-display text-ink-soft">3</span>km를 달리면 첫 자리{' '}
            <span className="text-ink-soft">{JOURNEYS[0].episodes[1]?.place}</span>에 닿습니다.
          </p>
        )}
        <div className="mt-3 h-[4px] w-full overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${epTotal ? (epDone / epTotal) * 100 : 0}%`, background: 'var(--color-lapis)' }} />
        </div>
      </header>

      {/* 마지막으로 받은 말씀 — 이 화면의 주인공 한 장 */}
      {latest && (
        <section className="mt-6 px-6">
          <button
            onClick={() => openEpisode(latest.journey.id, latest.ep.id)}
            className="relative flex w-full gap-4 overflow-hidden rounded-[22px] p-4 text-left transition active:scale-[0.99]"
            style={{ background: 'var(--color-sand-raised)', boxShadow: '0 1px 2px rgba(80,60,30,.1), 0 16px 32px -22px rgba(80,60,30,.5)' }}
          >
            <span className="relative block h-[92px] w-[92px] shrink-0 overflow-hidden rounded-[18px]" style={{ boxShadow: '0 0 0 2.5px var(--color-seal)' }}>
              {episodeArt(latest.journey.id, latest.ep.id) && <img src={episodeArt(latest.journey.id, latest.ep.id)} alt="" className="h-full w-full object-cover" />}
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full" style={{ background: 'var(--color-seal)', color: 'var(--color-lapis-surface)', boxShadow: '0 0 0 2px var(--color-sand-raised)' }}>
                <IconSeal size={14} strokeWidth={2} />
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="font-display text-[10.5px] uppercase tracking-[0.2em] text-muted">마지막으로 받은 말씀</span>
              <span className="mt-1 block font-serif text-[17px] font-bold leading-tight text-ink">{latest.ep.place}</span>
              <span className="mt-1.5 line-clamp-2 block font-serif text-[13.5px] leading-[1.65] text-ink-soft">{latest.ep.verseKrShort}</span>
              <span className="mt-1.5 block text-[11px] text-muted">
                {latest.ep.passageRef.replace(/\s*\(.*\)$/, '')}
                {fmtDay(latest.at) ? ` · ${fmtDay(latest.at)}` : ''}
              </span>
            </span>
          </button>
        </section>
      )}

      {/* 다섯 길 — 달린 km가 어디서 무엇이 되었나 */}
      <section className="mt-7 px-6">
        <SectionLabel>다섯 길</SectionLabel>
        <div className="mt-3 flex flex-col gap-2.5">
          {rows.map(({ j, done, prog }) => {
            const chrome = JOURNEY_CHROME[j.id]
            const last = done[done.length - 1]
            const at = last ? reachedAt[j.id]?.[last.id] : undefined
            return (
              <button
                key={j.id}
                onClick={() => openJourney(j.id)}
                className="flex w-full items-center gap-3.5 rounded-2xl border border-line bg-sand-raised/40 p-3.5 text-left transition active:scale-[0.99]"
              >
                {last && episodeArt(j.id, last.id) ? (
                  <img src={episodeArt(j.id, last.id)} alt="" loading="lazy" decoding="async" className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-line" />
                ) : (
                  crestArt(j.id) && <img src={crestArt(j.id)!} alt="" loading="lazy" className="h-12 w-12 shrink-0 rounded-full object-cover opacity-45" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-serif text-[15.5px] text-ink">{j.name}</span>
                    <span className="shrink-0 font-display text-[12px] text-muted" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                      {done.length}/{j.episodes.length}
                    </span>
                  </span>
                  <span className="mt-1.5 block h-[3px] w-full overflow-hidden rounded-full bg-line">
                    <span className="block h-full rounded-full" style={{ width: `${(done.length / j.episodes.length) * 100}%`, background: chrome.accent }} />
                  </span>
                  <span className="mt-1.5 block truncate text-[11.5px] text-muted">
                    {last ? (
                      `마지막으로 닿은 자리 · ${last.place}${fmtDay(at) ? ` · ${fmtDay(at)}` : ''}`
                    ) : prog.next ? (
                      <>
                        첫 자리 <span className="text-ink-soft">{j.episodes[1]?.place ?? j.episodes[0]?.place}</span>까지 3km
                      </>
                    ) : (
                      '이 길을 끝까지 걸었습니다'
                    )}
                  </span>
                </span>
                <IconSeal size={16} className={done.length > 0 ? 'text-sun-deep' : 'text-line-strong'} />
              </button>
            )
          })}
        </div>
      </section>

      {/* 받은 말씀 전부 */}
      <section className="mt-8 px-6">
        <SectionLabel>받은 말씀</SectionLabel>
        {received.length === 0 ? (
          <div className="mt-3 flex flex-col items-center gap-3 py-10 text-center">
            <span className="text-muted">
              <IconScroll size={26} />
            </span>
            <p className="max-w-[26ch] text-[12.5px] leading-relaxed text-muted">자리에 닿으면 그 자리의 말씀이 여기 쌓입니다. 아직 못 간 자리의 말씀도 지도에서 언제든 읽을 수 있습니다.</p>
          </div>
        ) : (
          <div className="mt-2 flex flex-col divide-y divide-line">
            {received.map(({ journey, ep, at }, i) => (
              <button
                key={`${journey.id}:${ep.id}`}
                onClick={() => openEpisode(journey.id, ep.id)}
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                className="anim-rise flex gap-3.5 py-3.5 text-left transition active:scale-[0.99]"
              >
                {episodeArt(journey.id, ep.id) && (
                  <img src={episodeArt(journey.id, ep.id)} alt="" loading="lazy" decoding="async" className="h-[54px] w-[54px] shrink-0 rounded-xl object-cover ring-1 ring-line" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 block font-serif text-[14.5px] leading-[1.6] text-ink-soft">{ep.verseKrShort}</span>
                  <span className="mt-1.5 block truncate font-display text-[10.5px] uppercase tracking-[0.16em] text-clay-deep">
                    {ep.passageRef.replace(/\s*\(.*\)$/, '')} · {ep.place}
                    {fmtDay(at) ? <span className="normal-case tracking-normal text-muted"> · {fmtDay(at)}</span> : null}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <p className="px-7 pt-8 text-[12px] leading-[1.8] text-muted">{GRACE_NOTE}</p>

      <div className="px-6 pb-2 pt-6">
        <button onClick={() => go('journeys')} className="w-full rounded-2xl border border-line py-3.5 text-center font-serif text-[15px] text-ink-soft transition active:scale-[0.99]">
          다른 여정 보기
        </button>
      </div>

      <TabBar active="collection" />
    </div>
  )
}
