import { useEffect, useState } from 'react'
import { useNav } from '../store'
import { usePilgrim, journeyKmOf } from '../state/pilgrim'
import { useRun, RUN_MODES, type RunMode } from '../state/run'

import { journeyById, JOURNEYS, toJourneyKm } from '../data/geo/journeys'
import { questNow } from '../lib/quest'
import { fmtDistance, fmtDuration } from '../lib/format'
import { toneOf } from '../lib/mood'
import { arcIcon, IconArrow, IconHeld, IconStep } from '../components/icons'
import { SectionLabel } from '../components/ui'
import { ROMAN } from '../lib/board'
import { PRAYER_NOTE } from '../data/prayer'
import { getCurrentPositionOnce, geoBlockedReason, type TracePoint } from '../lib/geo'
import LiveMap from '../components/LiveMap'

export default function Setup() {
  const go = useNav((s) => s.go)
  const { activeCourseId, units, intercessions } = usePilgrim()
  const pilgrim = usePilgrim()
  const configure = useRun((s) => s.configure)
  /* 이 화면은 이제 **여정**을 말한다.
   *
   * 예전엔 예수 코스(courseById(activeCourseId))를 헤드라인으로 썼다. 그래서 홈이
   * "베드로의 길"이라 말한 직후 이 화면이 "갈릴리의 기적"이라 말했다 — 같은 앱의 두 화면이
   * 서로 다른 길을 걷고 있다고 한 셈이다. 진행을 여정 하나로 통일했으니 표시도 여정으로 맞춘다.
   * 코스는 아래 '오늘 목표 거리' 한 줄로만 남는다(세션의 거리 프리셋). */
  const journey = journeyById(pilgrim.activeJourneyId) ?? JOURNEYS[0]
  const jKm = toJourneyKm(journey.id, journeyKmOf(pilgrim, journey.id))
  const q = questNow(journey, jKm)

  const [mode, setMode] = useState<RunMode>('guided')
  /* 기본 목표는 '다음 자리까지' — 목표 거리가 곧 자리에 닿는 거리가 되게 */
  const [goalKm, setGoalKm] = useState(() => Math.max(2, Math.min(42, Math.ceil(q.toRealKm || 5))))
  const [goalMin, setGoalMin] = useState(30)
  // 오늘 품고 달릴 사람 — 여기서 바로 고른다(예전엔 Profile로 나갔다 와야 했다)
  const [carryId, setCarryId] = useState<string | null>(null)
  const carry = intercessions.find((i) => i.id === carryId)

  /* 달리기 전 GPS 미리보기 — 여기서 내 위치가 뜨면 "GPS 준비됨"을 눈으로 확인한다.
   * 달리는 중에야 위치가 안 잡히는 걸 아는 일을 막는다. 이 좌표는 화면 표시에만 쓰고 저장하지 않는다. */
  const [here, setHere] = useState<TracePoint | null>(null)
  /* 권한 팝업은 사용자가 **누른 뒤**에 뜬다. 예전엔 화면이 열리자마자 위치를 물어서,
     "왜 묻는지" 문구보다 OS 팝업이 먼저 떴다(전문가 검토 지적). 이미 허용된 상태면
     조용히 미리 확인한다 — 팝업이 안 뜨니까. */
  const [gpsState, setGpsState] = useState<'idle' | 'checking' | 'ready' | 'failed'>('idle')
  const checkGps = () => {
    setGpsState('checking')
    getCurrentPositionOnce().then((pos) => {
      if (pos) { setHere({ lat: pos.lat, lng: pos.lng }); setGpsState('ready') }
      else setGpsState('failed')
    })
  }
  useEffect(() => {
    let alive = true
    const perms = typeof navigator !== 'undefined' ? navigator.permissions : undefined
    if (!perms?.query) return
    perms
      .query({ name: 'geolocation' as PermissionName })
      .then((st) => {
        if (alive && st.state === 'granted') checkGps()
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  const next = q.next
  /* 여정 자리에는 arc(사건의 성격)가 없고 mood만 있다. mood에서 아이콘을 고른다 —
   * 수난은 반드시 십자가여야 하고(축하 아이콘이 붙으면 안 된다), 나머지는 결에 맞춰 고른다. */
  const NextIcon = next
    ? arcIcon(
        { lament: 'passion', wonder: 'miracle', compassion: 'miracle', joy: 'rise', wilderness: 'call', everyday: 'teach' }[
          next.mood
        ] ?? 'teach',
      )
    : IconStep
  const tone = next ? toneOf(next.mood) : toneOf('everyday')

  const begin = () => {
    configure({
      mode, courseId: activeCourseId, journeyId: pilgrim.activeJourneyId,
      goalKm: mode === 'goalDistance' ? goalKm : undefined,
      goalSec: mode === 'goalTime' ? goalMin * 60 : undefined,
      prayerFor: carry?.alias,
    })
    go('run')
  }

  return (
    <div className="relative flex flex-1 flex-col px-6" style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
      {/* 라벨이 '여정'인데 실제 목적지는 home이었다 — 라벨과 동작이 어긋나면 라벨이 거짓말이 된다. */}
      <button onClick={() => go('home')} className="tap mb-5 flex items-center gap-2 text-[13px] text-muted transition active:scale-95">
        <IconArrow size={16} className="rotate-180" /> 오늘
      </button>

      <SectionLabel>오늘 걸을 길</SectionLabel>
      <h1 className="mt-2 font-serif text-[30px] font-bold leading-tight">{journey.name}</h1>
      <p className="mt-1 text-[13px] text-muted">
        {q.chapter ? `${ROMAN[q.chapter.index - 1] ?? q.chapter.index} · ${q.chapter.name}` : journey.who}
      </p>

      {/* 모드 세그먼트 */}
      <div className="mt-6 grid grid-cols-2 gap-2">
        {RUN_MODES.map((m) => {
          const on = m.id === mode
          return (
            <button key={m.id} onClick={() => setMode(m.id)} className={`rounded-xl border px-4 py-3 text-left transition active:scale-[0.98] ${on ? 'border-clay/50 bg-sand-raised shadow-[0_10px_24px_-18px_rgba(156,69,34,.6)]' : 'border-line bg-sand-raised/30'}`}>
              <div className={`font-serif text-[15px] ${on ? 'text-ink' : 'text-ink-soft'}`}>{m.label}</div>
              <div className="mt-0.5 text-[11.5px] text-muted">{m.hint}</div>
            </button>
          )
        })}
      </div>

      {/* 목표 스테퍼 / 자리 프리뷰 */}
      <div className="mt-5 rounded-2xl border border-line bg-sand-raised/40 p-5">
        {mode === 'goalDistance' && (
          <Stepper label="목표 거리" value={`${goalKm}`} unit={units} onDec={() => setGoalKm((v) => Math.max(1, v - 1))} onInc={() => setGoalKm((v) => Math.min(50, v + 1))} />
        )}
        {mode === 'goalTime' && (
          <Stepper label="목표 시간" value={fmtDuration(goalMin * 60)} unit="" onDec={() => setGoalMin((v) => Math.max(5, v - 5))} onInc={() => setGoalMin((v) => Math.min(240, v + 5))} />
        )}
        {(mode === 'guided' || mode === 'free') && (
          next ? (
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'var(--color-sand-sunk)', color: tone.accent }}>
                <NextIcon size={24} />
              </span>
              <div className="min-w-0">
                <p className="text-[11.5px] tracking-[0.1em] text-muted">이번 길에서 닿을 자리</p>
                <p className="mt-0.5 font-serif text-[17px] leading-tight text-ink">{next.place} · {next.event}</p>
                <p className="mt-0.5 text-[12px] text-clay-deep" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>{fmtDistance(q.toRealKm, units)}{units} 앞</p>
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-ink-soft">이 순례길의 모든 자리에 닿았습니다. 다시 걸으며 그 길을 회상해요.</p>
          )
        )}
      </div>

      {/* 오늘 품고 달릴 사람 — Setup을 떠나지 않고 바로 고른다 */}
      <div className="mt-4">
        <div className="flex items-center gap-2 px-1 text-muted">
          <IconHeld size={16} className="text-rubric" />
          <span className="text-[12.5px]">오늘 품고 달릴 사람 <span className="text-muted">(선택)</span></span>
        </div>
        {intercessions.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {intercessions.map((ic) => {
              const on = ic.id === carryId
              return (
                <button
                  key={ic.id}
                  onClick={() => setCarryId(on ? null : ic.id)}
                  aria-pressed={on}
                  className={`min-h-[38px] rounded-full border px-3.5 text-[13px] transition active:scale-95 ${
                    on ? 'border-clay-deep bg-clay-deep text-sand-raised' : 'border-line-strong text-ink-soft'
                  }`}
                >
                  {ic.alias}
                </button>
              )
            })}
            <button onClick={() => go('profile')} className="min-h-[38px] rounded-full border border-dashed border-line-strong px-3.5 text-[13px] text-muted transition active:scale-95">
              + 더하기
            </button>
          </div>
        ) : (
          <button onClick={() => go('profile')} className="mt-2.5 flex w-full items-center gap-2 rounded-xl border border-dashed border-line-strong bg-sand-raised/20 px-4 py-3 text-left text-[13px] text-muted transition active:scale-[0.99]">
            <IconHeld size={16} className="text-rubric" /> 품고 달릴 사람 등록하기
          </button>
        )}
        {carry && <p className="mt-2 px-1 text-[11.5px] leading-relaxed text-muted">{PRAYER_NOTE}</p>}
      </div>

      {/* GPS 미리보기 — 내 위치 확인 */}
      <div className="mt-4">
        <div className="flex items-center gap-2 px-1 text-muted">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: gpsState === 'ready' ? 'var(--color-olive)' : gpsState === 'failed' ? 'var(--color-rubric)' : 'var(--color-sun)', animation: gpsState === 'checking' ? 'glow 1.6s ease-in-out infinite' : 'none' }}
          />
          <span className="text-[12.5px]">
            {gpsState === 'ready' ? 'GPS 준비됨 · 지금 여기 있어요' : gpsState === 'failed' ? '위치를 못 잡았어요' : gpsState === 'checking' ? '위치 확인 중…' : '달리기 전에 위치가 잡히는지 볼 수 있어요'}
          </span>
          {gpsState !== 'checking' && gpsState !== 'ready' && (
            <button onClick={checkGps} className="ml-auto rounded-full border border-line-strong px-3 py-1.5 text-[12px] text-ink-soft transition active:scale-95">
              {gpsState === 'failed' ? '다시 확인' : '내 위치 확인'}
            </button>
          )}
        </div>
        {gpsState === 'ready' && here ? (
          <div className="mt-2.5">
            <LiveMap points={[here]} avgPaceSecPerKm={0} height={150} />
          </div>
        ) : gpsState === 'failed' ? (
          <p className="mt-2 px-1 text-[11.5px] leading-relaxed text-muted">
            {geoBlockedReason() === 'insecure'
              ? '지금 주소(http)에서는 브라우저가 위치를 열어 주지 않아요. 홈 화면에 설치한 앱이나 https 주소로 열면 잡힙니다.'
              : '권한을 허용했는지 확인해 주세요 — 아이폰: 설정 → 개인정보 보호 → 위치 서비스 → Safari · 안드로이드: 사이트 설정 → 위치. 실내라면 창가나 밖으로 나가면 잡힙니다. 그래도 달릴 수는 있지만 지도와 정확한 거리는 안 나옵니다.'}
          </p>
        ) : null}
      </div>

      {/* 위치 권한 안내는 START보다 **먼저** 읽혀야 한다 */}
      <p className="mt-2 px-1 text-[11px] leading-relaxed text-muted">시작하면 위치 권한을 묻습니다. 달린 거리를 재는 데만 쓰고, 위치나 경로는 저장하지도 밖으로 보내지도 않습니다.</p>

      <div className="flex-1 min-h-6" />

      {/* START */}
      <button onClick={begin} className="mx-auto flex h-[132px] w-[132px] flex-col items-center justify-center rounded-full bg-clay-deep text-sand-raised shadow-[0_2px_4px_rgba(192,90,48,.3),0_26px_48px_-16px_rgba(156,69,34,.7)] transition active:scale-95">
        <IconStep size={34} strokeWidth={1.6} />
        <span className="mt-2 font-serif text-[17px]">달리기 시작</span>
      </button>
      <p className="mt-4 text-center text-[12px] text-muted">마치면 오늘의 자리에서 말씀을 함께 읽습니다</p>
    </div>
  )
}

function Stepper({ label, value, unit, onDec, onInc }: { label: string; value: string; unit: string; onDec: () => void; onInc: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <button onClick={onDec} className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong text-ink-soft text-[22px] leading-none transition active:scale-90">−</button>
      <div className="flex flex-col items-center">
        <span className="text-[11.5px] tracking-[0.1em] text-muted">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="font-display text-[38px] font-medium leading-none text-ink" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>{value}</span>
          {unit && <span className="font-display text-[14px] text-muted">{unit}</span>}
        </div>
      </div>
      <button onClick={onInc} className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong text-ink-soft text-[22px] leading-none transition active:scale-90">+</button>
    </div>
  )
}
