import { useState } from 'react'
import { useNav } from '../store'
import { usePilgrim } from '../state/pilgrim'
import { STATIONS, courseById } from '../data/journey'
import { passageOf, SCRIPTURE_ATTRIBUTION } from '../data/scripture'
import { peopleOf } from '../data/people'
import { toneOf } from '../lib/mood'
import { arcIcon, IconArrow, IconHeld, IconPilgrim } from '../components/icons'
import { heroArt, stationArt } from '../assets/art'

export default function Detail() {
  /* 뒤로가기는 하드코딩된 collection이 아니라 **여기를 연 화면**으로 돌아간다. */
  const backTo = useNav((s) => s.from) ?? 'collection'
  const go = useNav((s) => s.go)
  const detailId = useNav((s) => s.detailId)
  const activeCourseId = usePilgrim((s) => s.activeCourseId)
  const [lang, setLang] = useState<'kr' | 'en'>('kr')

  if (!detailId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-[14px] text-muted">자리를 찾을 수 없어요.</p>
        <button onClick={() => go(backTo)} className="rounded-xl bg-clay-deep px-5 py-2.5 text-[14px] text-sand-raised">여권으로</button>
      </div>
    )
  }

  const station = STATIONS[detailId]
  const p = passageOf(detailId)
  const tone = toneOf(station.mood)
  const people = peopleOf(detailId)
  const Arc = arcIcon(station.mood === 'lament' ? 'passion' : station.arc)
  // 자리가 속한 코스의 히어로(대략적 배경)
  const course = courseById(activeCourseId)
  const hero = course?.stations.some((s) => s.id === detailId) ? course.hero : 'pilgrim-trail'

  return (
    <div className="relative flex flex-1 flex-col overflow-y-auto bg-sand text-ink">
      <div className="relative h-[240px] w-full overflow-hidden">
        <img src={stationArt(detailId) ?? heroArt(hero)} alt="" className="h-full w-full object-cover" decoding="async" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24" style={{ background: 'linear-gradient(to top, var(--color-sand), transparent)' }} />
        <button onClick={() => go(backTo)} className="absolute left-4 top-[max(1rem,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full bg-[#201C15]/85 text-sand-raised backdrop-blur-[2px] transition active:scale-90" aria-label="뒤로">
          <IconArrow size={17} className="rotate-180" />
        </button>
      </div>

      <div className="relative z-10 px-8 pt-3" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
        <div className="flex items-center gap-2" style={{ color: tone.accent }}>
          <Arc size={17} />
          <span className="font-display text-[12px] uppercase tracking-[0.2em]">{station.placeLatin} · {tone.label}</span>
        </div>
        <h1 className="mt-2 font-serif text-[34px] font-bold leading-[1.1]">{station.place}</h1>
        <p className="mt-1 font-serif text-[17px] text-ink-soft">{station.title}</p>

        {/* 전문 성구 — 개역한글 원문(전 절) / KJV 전환 */}
        <div className="mt-6 rounded-2xl border border-line bg-sand-raised/40 p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-[12px] uppercase tracking-[0.18em] text-clay-deep">{p.refLatin}</p>
            <div className="flex overflow-hidden rounded-lg border border-line-strong">
              {(['kr', 'en'] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)} className={`min-h-[44px] px-3 text-[11px] uppercase ${lang === l ? 'bg-clay-deep text-sand-raised' : 'text-muted'}`}>{l === 'kr' ? '개역한글' : 'KJV'}</button>
              ))}
            </div>
          </div>
          <div className={`text-ink ${lang === 'kr' ? 'font-serif text-[16px] leading-[1.85]' : 'font-display text-[15px] leading-[1.7]'}`}>
            {(lang === 'kr' ? p.kr : p.en).map((line, i) => (
              <span key={line.v}>
                {i === 0 && lang === 'kr' ? (
                  <span className="versal" style={{ color: tone.accent }}>{line.text.slice(0, 1)}</span>
                ) : (
                  <sup className="mr-0.5 align-super font-display text-[10px] text-muted" style={{ fontFeatureSettings: "'lnum' 1" }}>{line.v}</sup>
                )}
                {i === 0 && lang === 'kr' ? line.text.slice(1) : line.text}{' '}
              </span>
            ))}
          </div>
          <p className="mt-4 text-[10.5px] tracking-[0.04em] text-muted">{lang === 'kr' ? SCRIPTURE_ATTRIBUTION : 'King James Version · Public Domain'}</p>
        </div>

        {/* 묵상 · 기도 */}
        <div className="mt-6">
          <h2 className="font-display text-[12px] uppercase tracking-[0.2em] text-muted">묵상</h2>
          <p className="mt-2 text-[15px] leading-[1.75] text-ink-soft">{station.reflection}</p>
        </div>
        <div className="mt-5 flex gap-3 rounded-xl bg-sand-raised/60 px-4 py-3.5">
          <span className="mt-0.5 text-rubric"><IconHeld size={18} /></span>
          <p className="flex-1 text-[14px] leading-relaxed text-ink">{station.prayer}</p>
        </div>

        {/* 신약 배경 인물 */}
        {people.length > 0 && (
          <div className="mt-7">
            <h2 className="font-display text-[12px] uppercase tracking-[0.2em] text-muted">이 자리의 사람들</h2>
            <div className="mt-3 flex flex-col gap-2.5">
              {people.map((f) => (
                <div key={f.name} className="flex gap-3 rounded-xl border border-line bg-sand-raised/30 px-4 py-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--color-sand-sunk)', color: tone.accent }}>
                    <IconPilgrim size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-serif text-[15px] text-ink">{f.name}</p>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{f.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={() => go(backTo)} className="mt-8 w-full rounded-2xl border border-line py-3.5 text-center font-serif text-[15px] text-ink-soft transition active:scale-[0.99]">
          여권으로 돌아가기
        </button>
      </div>
    </div>
  )
}
