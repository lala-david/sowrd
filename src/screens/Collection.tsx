import { useNav } from '../store'
import { usePilgrim } from '../state/pilgrim'
import { COURSES, STATIONS, type PassageSlug } from '../data/journey'
import { featuredVerseById } from '../data/scripture'
import { toneOf } from '../lib/mood'
import { SectionLabel } from '../components/ui'
import TabBar from '../components/TabBar'
import { arcIcon, IconLocked, IconScroll } from '../components/icons'

// 여권에 담기는 자리 = 어느 코스에든 등장하는 유니크 자리(코스 순서 유지)
const OBTAINABLE: PassageSlug[] = Array.from(new Set(COURSES.flatMap((c) => c.stations.map((s) => s.id))))

export default function Collection() {
  const go = useNav((s) => s.go)
  const openDetail = useNav((s) => s.openDetail)
  const pilgrim = usePilgrim()
  const reached = new Set(Object.values(pilgrim.progress).flatMap((p) => p.reached))
  const collected = pilgrim.collectedVerses.filter((id) => reached.has(id))

  return (
    <div className="relative flex flex-1 flex-col">
      <header className="px-7" style={{ paddingTop: 'max(3rem, env(safe-area-inset-top))' }}>
        <SectionLabel>여정 여권</SectionLabel>
        <h1 className="mt-2 font-serif text-[30px] font-bold leading-tight">닿은 자리</h1>
        <div className="mt-3 flex items-center gap-5 text-[13px] text-muted">
          <span><span className="font-display text-[17px] text-clay" style={{ fontFeatureSettings: "'lnum' 1" }}>{reached.size}</span> 자리</span>
          <span className="h-3 w-px bg-line" />
          <span><span className="font-display text-[17px] text-clay" style={{ fontFeatureSettings: "'lnum' 1" }}>{collected.length}</span> 구절</span>
          <span className="h-3 w-px bg-line" />
          <span className="text-muted"><span className="font-display text-[17px]" style={{ fontFeatureSettings: "'lnum' 1" }}>{OBTAINABLE.length - reached.size}</span> 봉인</span>
        </div>
      </header>

      {/* 스탬프 그리드 — 음각 인장 */}
      <div className="mt-6 grid grid-cols-3 gap-3 px-5">
        {OBTAINABLE.map((id) => {
          const st = STATIONS[id]
          const on = reached.has(id)
          const tone = toneOf(st.mood)
          const Arc = arcIcon(st.mood === 'lament' ? 'passion' : st.arc)
          return (
            <button
              key={id}
              disabled={!on}
              onClick={() => on && openDetail(id)}
              className={`flex aspect-[0.86] flex-col items-center justify-center rounded-2xl border px-2 text-center transition ${on ? 'border-line-strong bg-sand-raised active:scale-[0.97]' : 'border-line bg-sand-sunk/40'}`}
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full border"
                style={{
                  borderColor: on ? tone.accent : 'var(--color-line-strong)',
                  color: on ? tone.accent : 'var(--color-muted)',
                  boxShadow: on ? `inset 0 0 0 3px var(--color-sand), inset 0 0 12px -6px ${tone.accent}` : 'none',
                  opacity: on ? 1 : 0.5,
                }}
              >
                {on ? <Arc size={24} /> : <IconLocked size={20} />}
              </span>
              <p className={`mt-2 font-serif text-[12.5px] leading-tight ${on ? 'text-ink' : 'text-muted'}`}>{on ? st.place : '봉인'}</p>
              {on && <p className="mt-0.5 text-[10px] text-muted">{st.title}</p>}
            </button>
          )
        })}
      </div>

      {/* 수집한 구절 */}
      {collected.length > 0 && (
        <div className="mt-9 px-6">
          <div className="mb-3 flex items-center gap-2 text-muted">
            <IconScroll size={16} />
            <SectionLabel>수집한 구절</SectionLabel>
          </div>
          <div className="flex flex-col divide-y divide-line">
            {collected.slice().reverse().map((id) => {
              const v = featuredVerseById(id)
              return (
                <div key={id} className="py-3.5">
                  <p className="font-serif text-[15px] leading-[1.6] text-ink-soft">{v.text}</p>
                  <p className="mt-1.5 font-display text-[11px] uppercase tracking-[0.18em] text-clay-deep">{v.refLatin} · {STATIONS[id].place}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="px-6 pt-8 pb-2">
        <button onClick={() => go('courses')} className="w-full rounded-2xl border border-line py-3.5 text-center font-serif text-[15px] text-ink-soft transition active:scale-[0.99]">
          다른 순례길 보기
        </button>
      </div>

      <TabBar active="collection" />
    </div>
  )
}
