import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useNav } from '../store'
import { journeyById, journeyProgress, toJourneyKm, toRealKm } from '../data/geo/journeys'
import { journeyKmOf } from '../state/pilgrim'
import RouteMap from '../components/RouteMap'
import { analyzeRun, readingOf } from '../lib/runAnalysis'
import { usePilgrim } from '../state/pilgrim'
import { useRun } from '../state/run'
import { courseById, STATIONS } from '../data/journey'
import { featuredVerse, SCRIPTURE_ATTRIBUTION } from '../data/scripture'
import { fmtDistance, fmtPace, unitLabel } from '../lib/format'
import { toneOf } from '../lib/mood'
import { renderShareCard, shareCardBlob } from '../lib/shareCard'
import { APP_URL, APP_URL_LABEL } from '../config'
import { SummaryTriple, SplitBars, SectionLabel } from '../components/ui'
import { IconShare, IconReached, IconCairn, IconSeal } from '../components/icons'
import { heroArt, sceneArt, episodeArt, stationArt, sealArt, worldArt, extraArt } from '../assets/art'
import { currentTierIndex } from '../lib/quest'
import { sceneForEpisode } from '../lib/scene'
import Celebration from '../components/Celebration'
import BoardWindow from '../components/BoardWindow'
import { adversaryOf } from '../lib/adversary'
import type { Adversary } from '../data/adversaries'
import AdversaryVictory from '../components/AdversaryVictory'

/* 리빌의 한 '순간' — 여정 자리든 예수 코스 자리든 같은 형태로 렌더한다. */
interface Moment {
  key: string
  art: string
  accent: string
  glow?: string
  celebrate: boolean
  topLabel: string
  title: string
  subtitle: string
  /** 여정 자리는 사건 서술, 예수 코스 자리는 성구 */
  body?: string
  verse?: { text: string; ref: string }
  refLine: string
  reflection: string
  prayer: string
  onOpen: () => void
  /** 이 자리로 들어오는 구간을 막아섰던 대적 — 있으면 히어로에서 대치 그림이 걷힌다 */
  adv?: Adversary
}

export default function Reveal() {
  const go = useNav((s) => s.go)
  const openEpisode = useNav((s) => s.openEpisode)
  const openDetail = useNav((s) => s.openDetail)
  const openMap = useNav((s) => s.openMap)
  const units = usePilgrim((s) => s.units)
  const run = useRun()
  const { courseId, distanceKm, elapsedSec, splits, reachedThisRun, prayerFor } = run
  // 여정 쪽 결과 — 이게 없어서 여정을 달려도 리빌엔 예수 코스 문구만 떴다
  const { journeyId, reachedEpisodes, trace } = run
  const miles = run.reachedMilestones
  const traceOff = !usePilgrim.getState().traceRoute
  /* 신호가 나빴는가 — 기준은 개인 기록 후보 조건과 같아야 한다(pilgrim.commitRun).
     다르면 "기록에 안 넣었다"고 말해 놓고 넣거나, 넣어 놓고 말을 안 하게 된다. */
  const { signalAccM, signalRate } = run
  const wasSim = run.simKm / Math.max(1e-9, run.gpsKm + run.simKm) > 0.05
  const poorSignal = !wasSim && ((signalAccM ?? 0) > 15 || (signalRate ?? 1) < 0.5)
  const journey = journeyById(journeyId)
  const journeyPlaces = (reachedEpisodes ?? [])
    .map((id) => journey?.episodes.find((e) => e.id === id)?.place)
    .filter(Boolean) as string[]
  const course = courseById(courseId)!

  const [shown, setShown] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setShown(true), 80)
    return () => window.clearTimeout(id)
  }, [])

  /* 이 화면의 주인공은 **여정**이다.
   * 예전엔 히어로가 heroArt(course.hero), 제목이 예수 코스 자리라, 베드로의 길을 달려도
   * 리빌 전체가 "갈릴리 호숫가"였고 여정 도달은 아래 12px 칩 신세였다.
   * 이번 런에서 여정 자리에 닿았으면 그것이 히어로다. 못 닿았으면 예수 코스 자리를 쓰고,
   * 그것도 없으면 여정의 남은 거리를 말한다. */
  const primaryId = reachedThisRun[reachedThisRun.length - 1]
  const station = primaryId ? STATIONS[primaryId] : undefined
  const tone = toneOf(station?.mood ?? 'everyday')
  const celebrate = tone.celebrate

  /* 이 런에 닿은 **모든** 자리를 순간(Moment)으로 모은다.
   * 예전엔 마지막 하나만 히어로였고 나머지는 12px 칩이었다 — 첫 러닝에 예수 코스 3자리를
   * 밟으면 두 자리는 온전한 순간(그림·성구·묵상·기도)을 못 받았다.
   * 여러 자리에 닿았으면 넘겨 볼 수 있게 페이저로 만든다.
   *
   * 연습(sim) 런에는 순간이 없다(D6). 시계가 만든 도달에 "닿았습니다"와 인장을 주면
   * 진짜 도달의 무게가 사라진다 — commitRun도 같은 판정으로 아무것도 쌓지 않는다. */
  const moments: Moment[] = wasSim ? [] : [
    ...(reachedEpisodes ?? [])
      .map((id) => journey?.episodes.find((e) => e.id === id))
      .filter(Boolean)
      .map((ep) => {
        const e = ep!
        /* 성경 여정 자리에도 톤을 적용한다.
         * 예전엔 celebrate가 무조건 true였다 — 아브라함이 이삭을 결박하는 모리아 산과
         * 모세가 죽는 느보산에도 "닿았습니다"와 축하 인장이 찍혔다. 수난에서 게임 요소를
         * 끄는 것은 기획서의 절대 원칙인데(PLANNING §4.3 · CONTENT-UX §수난),
         * 그 가드가 예수 자리에만 걸려 있고 여정 68자리에는 통째로 비어 있었다. */
        const et = toneOf(e.mood)
        /* 이 자리로 들어오는 구간에 대적이 살았으면(홍해·유라굴로…) 그 순간의 문장은
         * 사건 요약이 아니라 승리 서사다 — 주어는 하나님, 동사는 건넜다/지났다
         * (data/adversaries.ts). 그림은 그대로 자리 그림 — 갈라진 바다가 이미 거기 있다. */
        const adv = adversaryOf(journeyId, e.id)
        return {
          key: `ep-${e.id}`,
          art: episodeArt(journeyId, e.id) ?? sceneArt(sceneForEpisode(e)),
          accent: et.celebrate ? 'var(--color-lapis)' : et.accent,
          celebrate: et.celebrate,
          topLabel: adv
            ? /* 조사(을/를)를 붙이지 않는 표현을 쓴다 — 이름이 데이터에서 오므로 받침을 모른다 */
              `${journey?.name ?? '여정'} · ${adv.name} 너머`
            : et.celebrate ? `${journey?.name ?? '여정'} · 닿았습니다` : `${journey?.name ?? '여정'} · 이 자리를 지나며`,
          title: e.place,
          subtitle: `${e.placeLatin} · ${e.region}`,
          body: adv ? adv.victory : e.event,
          adv,
          refLine: e.passageRef.replace(/\s*\(.*\)$/, ''),
          reflection: e.reflection,
          prayer: e.prayer,
          onOpen: () => openEpisode(journeyId, e.id),
        } as Moment
      }),
    ...reachedThisRun.map((id) => {
      const st = STATIONS[id]
      const sv = featuredVerse(st)
      const t = toneOf(st.mood)
      return {
        key: `st-${id}`,
        art: (stationArt(id) ?? heroArt(course.hero)) as string,
        accent: t.accent,
        glow: t.celebrate ? t.glow : undefined,
        celebrate: t.celebrate,
        topLabel: t.celebrate ? '닿았습니다' : '이 자리를 지나며',
        title: st.place,
        subtitle: st.title,
        verse: { text: sv.text, ref: sv.refLatin },
        refLine: sv.refLatin,
        reflection: st.reflection,
        prayer: st.prayer,
        onOpen: () => openDetail(id, 'reveal'),
      } as Moment
    }),
  ]

  // 최근에 닿은 것(리스트 끝)을 먼저 보여준다 — 방금의 도달이 첫 화면
  const sealReduce = useReducedMotion()
  const [momIdx, setMomIdx] = useState(Math.max(0, moments.length - 1))
  const moment = moments[Math.min(momIdx, moments.length - 1)]

  /* 여정 쪽 남은 거리 — 화면에 쓰는 것은 여정km가 아니라 **내가 실제로 달릴 km**다.
   * 바울은 축척 30배라 "다음까지 210km"는 실제로 7km인데, 여정km를 그대로 보여주면
   * 도달 불가능해 보인다. */
  const jKm = toJourneyKm(journeyId, journeyKmOf(usePilgrim.getState(), journeyId))
  const jProg = journey ? journeyProgress(journey, jKm) : undefined
  const jNext = jProg?.next
  const jToNextRealKm = jProg ? toRealKm(journeyId, jProg.toNextKm) : 0

  /* 완주 — **이 런으로** 여정의 끝을 넘었는가. 출발할 때 총거리 아래였고 지금 끝(done)이면
   * 오늘이 그 날이다. 145km를 걸어 온 사람의 마지막 리빌이 평소와 같으면 안 된다. */
  const realTotal = journey ? toRealKm(journeyId, journey.totalKm) : Infinity
  const completedNow = !wasSim && !!journey && !!jProg?.done && run.journeyStartRealKm < realTotal

  const avgPace = distanceKm > 0 ? elapsedSec / distanceKm : 0
  const analysis = analyzeRun(splits, distanceKm, elapsedSec)

  const leave = () => {
    useRun.getState().reset()
    go('home')
  }

  /* 공유 — 예전엔 텍스트 한 줄만 나갔다(이미지도 URL도 없어서, 받은 사람이 앱을 찾지 못했다).
   * 이제 완성돼 있던 카드 렌더러(shareCard.ts)를 실제로 켜서 이미지 카드를 만들고,
   * 캡션과 카드 하단에 설치 링크를 새겨 넣는다 — 이게 K=0을 벗어나는 최소 조건이다.
   * 프라이버시는 그대로: GPS 경로·좌표·기도 대상은 카드에 절대 넣지 않는다(자리·성구·거리만). */
  const [shareState, setShareState] = useState<'idle' | 'rendering' | 'shared' | 'saved' | 'copied'>('idle')

  // moment.accent는 CSS 변수라 다크 테마에선 밝은 값이 나온다. 카드는 라이트 팔레트로 고정돼
  // 있으므로 라이트 hex로 맞춰 준다(index.css 라이트 값과 일치).
  const lightAccent = (v: string): string =>
    ({
      'var(--color-lapis)': '#2e3f8f',
      'var(--color-clay)': '#c05a30',
      'var(--color-clay-bright)': '#dd7748',
      'var(--color-sun)': '#e0a53f',
      'var(--color-sun-bright)': '#f0c368',
      'var(--color-olive-deep)': '#55603a',
      'var(--color-muted)': '#736349',
    })[v] ?? '#c05a30'

  const share = async () => {
    if (shareState === 'rendering') return
    const distanceLabel = fmtDistance(distanceKm, units)
    const caption = moment
      ? `THE WAY · ${moment.title} · ${distanceLabel}${units}\n여기서 함께 걷기 → ${APP_URL}`
      : `THE WAY · 오늘 ${distanceLabel}${units}를 걸었습니다\n여기서 함께 걷기 → ${APP_URL}`

    const textFallback = async () => {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'THE WAY', text: caption })
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(caption)
        setShareState('copied')
        window.setTimeout(() => setShareState('idle'), 1800)
      }
    }

    // 자리에 못 닿은 날(moment 없음)엔 카드에 담을 그림·자리가 없으므로 텍스트로.
    if (!moment) {
      try { await textFallback() } catch { /* 취소 무시 */ }
      return
    }

    // 여정 자리는 순번(에피소드 index)을 킥커에 쓴다.
    let ordinal: number | undefined
    if (moment.key.startsWith('ep-') && journey) {
      const i = journey.episodes.findIndex((e) => `ep-${e.id}` === moment.key)
      if (i >= 0) ordinal = i + 1
    }

    try {
      setShareState('rendering')
      const blob = await renderShareCard({
        place: moment.title,
        title: moment.subtitle,
        verseText: moment.verse?.text ?? moment.body,
        verseRef: moment.verse?.ref ?? moment.refLine,
        distanceLabel,
        unit: units.toUpperCase(),
        ordinal,
        courseName: journey?.name ?? course.name,
        heroSrc: moment.art,
        accent: lightAccent(moment.accent),
        celebrate: moment.celebrate,
        attribution: SCRIPTURE_ATTRIBUTION,
        url: APP_URL_LABEL,
      })
      const res = await shareCardBlob(blob, `theway-${moment.title}-${distanceLabel}`, caption)
      setShareState(res) // 'shared' | 'saved'
      window.setTimeout(() => setShareState('idle'), 1800)
    } catch {
      // 카드 렌더 실패(캔버스 미지원·아트 로드 실패 등) → 텍스트 공유로 폴백
      setShareState('idle')
      try { await textFallback() } catch { /* 취소 무시 */ }
    }
  }


  return (
    <div className="relative flex flex-1 flex-col overflow-y-auto bg-sand text-ink">
      {/* 장면 — 자리 아트(얼굴 없는 실루엣) + 리빌 페이드 */}
      <div className="relative h-[42%] min-h-[280px] w-full overflow-hidden">
        <img
          key={moment?.key}
          /* 자리에 못 닿은 날의 그림은 **지금 걷는 장의 땅**이다 — 보드와 같은 그림.
             예전 폴백(예수 코스 히어로 6장)은 보드의 결과 다르고, 손이 어색한 인물이 들어 있었다. */
          src={moment?.art ?? (journey ? worldArt(journey.id, currentTierIndex(journey, jKm)) : undefined) ?? heroArt(course.hero)}
          alt=""
          /* alt=""로 둔다 — 두 요소 뒤 h1이 같은 지명을 말하므로 장식이다(예전엔 두 번 읽혔다) */
          className="h-full w-full object-cover transition-all duration-[1400ms] ease-out"
          style={{ transform: shown ? 'scale(1)' : 'scale(1.08)', opacity: shown ? 1 : 0.2, filter: moment?.celebrate === false ? 'saturate(0.72)' : 'none' }}
        />
        {/* 대적을 넘은 자리 — 대치 그림(막아선 바다)이 갈라지며 밑의 승리 그림이 드러난다.
            key=moment.key: 페이저로 되돌아오면 다시 걷힌다(인장 스프링과 같은 규칙). */}
        {moment?.adv && <AdversaryVictory key={moment.key} advId={moment.adv.id} kind={moment.adv.kind} />}
        <div className="pointer-events-none absolute inset-0" style={{ background: moment?.glow ? `radial-gradient(60% 50% at 50% 40%, ${moment.glow}, transparent)` : 'none' }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28" style={{ background: 'linear-gradient(to top, var(--color-sand), transparent)' }} />

        {/* 인장이 찍힌다 — 이 앱에서 유일하게 "해냈다"를 몸으로 말하는 순간.
            열 번 달리면 여덟아홉 번은 자리에 못 닿는다(코드 주석의 실측 78~91%). 그 드문 한 번이
            밋밋하면 다음 한 번을 기다릴 이유가 안 생긴다. 그래서 여기만 팡파레를 허락한다.

            단 수난(lament)에서는 찍지 않는다. 십자가를 보스전으로 만들지 않는다는 것은
            기획서의 절대 원칙이고(PLANNING §4.3 · CONTENT-UX §수난 = 게임 완전 OFF),
            moment.celebrate가 그 판정을 이미 들고 있다. */}
        {/* 빛 조각·파문·금박 — 인장과 같은 판정(celebrate)을 쓴다.
            수난 자리에서는 인장도 이 연출도 함께 꺼진다. */}
        {moment && <Celebration celebrate={moment.celebrate !== false} runKey={moment.key} />}

        {moment && moment.celebrate !== false && (
          <motion.div
            key={moment.key}
            className="pointer-events-none absolute bottom-6 right-6 flex h-[84px] w-[84px] items-center justify-center"
            initial={sealReduce ? false : { opacity: 0, scale: 2.1, rotate: -18 }}
            animate={{ opacity: 1, scale: 1, rotate: -7 }}
            transition={{ delay: sealReduce ? 0 : 0.55, type: 'spring', stiffness: 380, damping: 15 }}
            aria-hidden
          >
            {/* 인장은 recraft로 뽑은 벡터 문양을 쓴다.
                여기는 84px — 문양의 결이 살아나는 **큰 자리**다. 같은 그림을 지도의 20px 노드에
                넣으면 뭉개져서 거기엔 안 쓴다. 그림이 없으면 코드로 그린 인장으로 떨어진다. */}
            {sealArt() ? (
              <img
                src={sealArt()}
                alt=""
                className="h-full w-full"
                style={{ filter: 'drop-shadow(0 8px 18px rgba(0,0,0,.35))' }}
              />
            ) : (
              <span
                className="flex h-[74px] w-[74px] items-center justify-center rounded-full"
                style={{
                  background: 'var(--color-seal)',
                  color: 'var(--color-sand-raised)',
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,.45), inset 0 0 0 2px rgba(255,255,255,.25)',
                }}
              >
                <span className="flex flex-col items-center leading-none">
                  <IconSeal size={26} strokeWidth={1.6} />
                  <span className="mt-1 font-display text-[9px] uppercase tracking-[0.14em]">닿음</span>
                </span>
              </span>
            )}
          </motion.div>
        )}
      </div>

      <div className="relative z-10 flex flex-1 flex-col px-8 pt-4" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
        {moment ? (
          <>
            {/* 여러 자리에 닿았으면 넘겨 본다 — 점으로 몇 개인지, 어디쯤인지 알린다 */}
            {moments.length > 1 && (
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5" role="tablist" aria-label="이번에 닿은 자리">
                  {moments.map((m, i) => (
                    <button
                      key={m.key}
                      onClick={() => setMomIdx(i)}
                      aria-label={`${i + 1}번째 자리 ${m.title}`}
                      aria-selected={i === momIdx}
                      className="h-2 rounded-full transition-all"
                      style={{ width: i === momIdx ? 18 : 8, background: i === momIdx ? moment.accent : 'var(--color-line-strong)' }}
                    />
                  ))}
                </div>
                <span className="font-display text-[11px] text-muted" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                  이번에 닿은 자리 {momIdx + 1}/{moments.length}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2" style={{ color: moment.accent }}>
              <IconSeal size={17} />
              <p className="font-display text-[12px] uppercase tracking-[0.22em]">{moment.topLabel}</p>
            </div>
            <h1 className="mt-2.5 font-serif text-[36px] font-bold leading-[1.1]">{moment.title}</h1>
            <p className="mt-1 font-serif text-[15px] text-ink-soft">{moment.subtitle}</p>

            {moment.verse ? (
              <>
                <p className="mt-6 max-w-[26ch] font-serif text-[18px] leading-[1.72] text-ink">
                  <span className="versal" style={{ color: moment.accent }}>{moment.verse.text.slice(0, 1)}</span>{moment.verse.text.slice(1)}
                </p>
                <button onClick={moment.onOpen} className="mt-2.5 flex items-center gap-1.5 self-start font-display text-[12px] uppercase tracking-[0.22em]" style={{ color: 'var(--color-clay-deep)' }}>
                  {moment.verse.ref} · 전문 보기
                </button>
              </>
            ) : (
              <>
                <p className="mt-6 max-w-[28ch] font-serif text-[17px] leading-[1.72] text-ink">{moment.body}</p>
                <button onClick={moment.onOpen} className="mt-3 flex items-center gap-1.5 self-start font-display text-[12px] uppercase tracking-[0.2em] text-clay-deep">
                  {moment.refLine} · 본문 읽기
                </button>
              </>
            )}

            <p className="mt-6 max-w-[32ch] text-[14px] leading-relaxed text-ink-soft">{moment.reflection}</p>
            {/* 기도 한 줄은 접어 둔다 — 기도로 읽어도, 그냥 문장으로 읽어도 된다 */}
            <details className="mt-3">
              <summary className="cursor-pointer text-[12px] text-muted">이 자리에 두고 가는 말 ▾</summary>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{moment.prayer}</p>
            </details>
          </>
        ) : wasSim ? (
          /* 연습 런 — 과장 없이, 죄책감 없이. 무엇이 기록되고 무엇이 안 되는지 한 번에 말한다. */
          <>
            <SectionLabel>오늘의 길</SectionLabel>
            <h1 className="mt-2.5 font-serif text-[32px] font-bold leading-[1.1]">오늘은 연습이었습니다</h1>
            <p className="mt-4 max-w-[30ch] text-[14px] leading-relaxed text-ink-soft">
              위치 신호 없이 시계로 잰 러닝이라, 여정과 인장은 그대로예요. 지도 위의 길은{' '}
              <span className="text-ink">실제 걸음</span>으로만 나아갑니다 — 다음엔 밖에서 만나요.
            </p>
          </>
        ) : (
          <>
            <SectionLabel>오늘의 길</SectionLabel>
            <h1 className="mt-2.5 font-serif text-[32px] font-bold leading-[1.1]">여기까지 따라왔습니다</h1>
            {/* 남은 거리는 **여정** 기준으로 말한다.
                예전엔 예수 코스의 prog.toNextKm을 썼는데, 기본 코스(갈릴리 5km)는 2회차에
                완주돼서 3회차부터 영원히 "다음 자리까지 0.0km 남았습니다"가 떴다 — 앱이
                고장 난 것처럼 보이는 문장이었다. 여정은 300km짜리라 고갈되지 않는다. */}
            {jNext ? (
              <p className="mt-4 max-w-[30ch] text-[14px] leading-relaxed text-ink-soft">
                다음은 <span className="text-ink">{jNext.place}</span>. 앞으로{' '}
                <span className="font-display text-clay-deep" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                  {fmtDistance(jToNextRealKm, units)}{units}
                </span>{' '}
                남았습니다. 길은 언제나 여기 있어요.
              </p>
            ) : (
              <p className="mt-4 max-w-[30ch] text-[14px] leading-relaxed text-ink-soft">오늘도 길 위에 있었습니다. 길은 언제나 여기 있어요.</p>
            )}
            {/* 차오르는 한 절 — 자리에 못 닿은 날의 **보상**이므로 화면의 두 번째 자리에 둔다(요약 맨 아래가 아니라).
                다음 자리의 말씀이 구간 진행만큼 드러난다. 본문은 원래 늘 열려 있으므로(미리 읽기)
                거리가 여는 열쇠가 아니라 미리 읽는 것이다 — 열 번 중 여덟아홉 번이던 빈손의 날이,
                다음 말씀이 조금 더 가까워진 날이 된다. */}
            {jNext && jProg && distanceKm > 0.05 && (
              <FillingVerse
                place={jNext.place}
                text={jNext.verseKrShort}
                ref_={jNext.passageRef}
                progress={jProg.segProgress}
                onOpen={() => openEpisode(journeyId, jNext.id)}
              />
            )}
          </>
        )}

        {prayerFor && (
          <p className="mt-5 rounded-xl bg-sand-raised/60 px-4 py-3 text-[13px] text-ink-soft">오늘 <span className="text-rubric">{prayerFor}</span>를 품고 {fmtDistance(distanceKm, units)}{units}를 걸었습니다.</p>
        )}

        {/* ── 완주 의식 (D9) ─────────────────────────────────────────────
            여정의 끝을 넘은 바로 그 리빌에서만 한 번 뜬다. 보상은 문장과 날짜다 —
            "이 길을 끝까지 걸었습니다"는 여권(인장 화면)에 날짜로 남는다. */}
        {completedNow && journey && (
          <section
            className="mt-7 overflow-hidden rounded-[24px]"
            style={{ boxShadow: '0 0 0 1.5px var(--color-seal), 0 1px 2px rgba(80,60,30,.15), 0 20px 44px -22px rgba(80,60,30,.6)' }}
          >
            {extraArt('journey-complete') && (
              <div className="relative h-[150px]">
                <img src={extraArt('journey-complete')} alt="" className="h-full w-full object-cover" />
                <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(43,30,12,.5), transparent 55%)' }} />
              </div>
            )}
            <div className="px-6 py-5" style={{ background: 'var(--color-sand-raised)' }}>
              <p className="font-display text-[11px] uppercase tracking-[0.24em]" style={{ color: 'var(--color-seal)' }}>
                {journey.nameLatin}
              </p>
              <h2 className="mt-1.5 font-serif text-[24px] font-bold leading-tight text-ink">이 길을 끝까지 걸었습니다</h2>
              <p className="mt-2.5 text-[13px] leading-relaxed text-ink-soft">
                {journey.episodes[0]?.place}에서 {journey.episodes[journey.episodes.length - 1]?.place}까지 — 자리{' '}
                {journey.episodes.length}곳을 내 걸음 {Math.round(realTotal)}
                {units}로 지났습니다. 여권에 오늘 날짜가 남습니다.
              </p>
              <button
                onClick={() => go('journeys')}
                className="mt-4 w-full rounded-xl py-3 text-center font-serif text-[15px] transition active:scale-[0.99]"
                style={{ background: 'var(--color-seal)', color: '#2a1d12' }}
              >
                다음 길 고르기
              </button>
            </div>
          </section>
        )}

        {/* 길 위에서 오늘 — 보드 위의 말이 오늘 달린 만큼 앞으로 걸어간다.
            자리에 닿지 못한 날(열 번 중 여덟아홉 번)에도 **무언가 움직였다**는 것이 눈에 보여야
            다음 한 번을 기다릴 이유가 생긴다. 거리는 말씀으로 가는 길이다.
            연습 런에는 그리지 않는다 — 여정이 나아가지 않았는데 말이 걸어가면 그림이 거짓말을 한다. */}
        {journey && distanceKm > 0.05 && !wasSim && (
          <section className="mt-7">
            <div className="mb-2.5 flex items-baseline justify-between">
              <SectionLabel>길 위에서 오늘</SectionLabel>
              <span className="text-[11.5px] text-muted">오늘 {fmtDistance(distanceKm, units)}{units}</span>
            </div>
            <BoardWindow
              journey={journey}
              journeyKm={jKm}
              fromKm={Math.max(0, jKm - toJourneyKm(journeyId, distanceKm))}
              height={250}
              onOpen={() => openMap(journeyId)}
              caption={jNext ? `${jNext.place}까지 ${fmtDistance(jToNextRealKm, units)}${units}` : '이 길을 끝까지 걸었습니다'}
            />
          </section>
        )}

        {/* 런 요약 — 항상 보여준다.
            예전엔 celebrate(=mood가 wilderness·lament가 아닐 때)일 때만 렌더해서,
            겟세마네 같은 자리에 닿은 날에는 사용자가 자기 거리·시간·페이스·지도를 통째로 볼 수 없었다.
            축하 연출을 끄는 것과 기록을 감추는 것은 다른 일이다 — celebrate는 히어로 글로우만 제어한다. */}
        <div className="mt-7 rounded-2xl border border-line bg-sand-raised/40 p-5">
            <SummaryTriple distance={fmtDistance(distanceKm, units)} unit={unitLabel(units)} durationSec={elapsedSec} paceSec={avgPace} units={units} />
            {/* 측정 신뢰도 — 이 앱의 원칙("못 잰 것은 못 잰다고 한다")을 유일하게 안 지키던 자리.
                신호가 좋을 때는 아무 말도 하지 않는다. 상시 배지는 소음이고, 문제일 때만 말해야 신호가 된다. */}
            {poorSignal && (
              <p className="mt-3 flex items-start gap-2 rounded-lg bg-sand-sunk/60 px-3 py-2.5 text-[11.5px] leading-relaxed text-muted">
                <IconCairn size={13} className="mt-[1px] shrink-0" />
                <span>
                  오늘은 위치 신호가 약했어요{signalAccM ? ` (오차 약 ${Math.round(signalAccM)}m)` : ''}. 거리와 페이스에 오차가 있을 수 있어
                  개인 기록에는 넣지 않았습니다.
                </span>
              </p>
            )}
            {/* 달린 경로 — 페이스 색으로 칠한 지도. 설정에서 경로 기록을 켠 경우에만.
                꺼져 있으면(기본값) 지도가 왜 없는지 알려 준다 — 안 그러면 "지도가 왜 안 나오지"가 된다. */}
            {trace.length > 1 ? (
              <div className="mt-5 border-t border-line pt-4">
                <p className="mb-3 text-[11px] tracking-[0.1em] text-muted">오늘 달린 길</p>
                <RouteMap points={trace} avgPaceSecPerKm={avgPace} />
              </div>
            ) : traceOff && distanceKm > 0.1 ? (
              <button
                onClick={() => go('profile')}
                className="mt-5 flex w-full items-start gap-2.5 border-t border-line pt-4 text-left"
              >
                <IconCairn size={15} className="mt-[1px] shrink-0 text-muted" />
                <span className="text-[12.5px] leading-relaxed text-muted">
                  달린 길을 지도로 보고 싶으면 <span className="text-clay-deep">설정에서 「경로 기록」을 켜세요</span>.
                  기본은 꺼져 있습니다 — 좌표는 켠 뒤에도 이 기기에만 남습니다.
                </span>
              </button>
            ) : null}

            {/* 예전엔 이 블록 전체가 splits.length > 1 조건이라, 1km를 못 채운 러닝은
                한 문장도 못 받았다("1km를 채우기 전에 멈췄습니다"는 렌더 불가능한 죽은 코드였다). */}
            <div className="mt-5 border-t border-line pt-4">
                {/* 오늘의 러닝을 한 문장으로 — 칭찬도 질책도 아닌 관찰 */}
                <p className="text-[13px] leading-relaxed text-ink-soft">{readingOf(analysis)}</p>
              {/* 스플릿은 접어 둔다 — 리빌의 주장은 자리와 말씀이지 막대그래프가 아니다 */}
              {splits.length > 1 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-[11.5px] tracking-[0.06em] text-muted">1km마다 걸린 시간 ▾</summary>
                  <div className="mt-3">
                    <SplitBars splits={splits} units={units} avgPaceSecPerKm={avgPace} />
                  </div>
                </details>
              )}
                {/* 통계는 표본이 충분할 때만 말한다.
                    예전엔 "페이스 이야기를 하기엔 짧습니다"라고 말한 직후 페이스 통계를 세 개 보여줬다. */}
                {analysis.splitConfident && (
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-muted">
                    {analysis.fastestKm && <span>가장 빠른 구간 {analysis.fastestKm}km · {fmtPace(Math.min(...splits), units)}</span>}
                    {analysis.spreadSec > 0 && <span>가장 빠른·느린 구간 차 {analysis.spreadSec}초</span>}
                    {analysis.slowSegments > 0 && <span>느린 구간 {analysis.slowSegments}개</span>}
                  </div>
                )}
              </div>
            {(reachedThisRun.length > 0 || journeyPlaces.length > 0 || miles.length > 0) && (
              <div className="mt-5 border-t border-line pt-4">
                <div className="flex flex-wrap gap-2">
                  {journeyPlaces.map((place) => (
                    <span key={place} className="flex items-center gap-1.5 rounded-full bg-sand-sunk px-3 py-1.5 text-[12px] text-ink-soft">
                      <IconReached size={14} className="text-olive-deep" />{place}
                    </span>
                  ))}
                  {reachedThisRun.map((id) => (
                    <span key={id} className="flex items-center gap-1.5 rounded-full bg-sand-sunk px-3 py-1.5 text-[12px] text-ink-soft">
                      <IconReached size={14} className="text-olive-deep" />{STATIONS[id].place}
                    </span>
                  ))}
                </div>
                {/* 자리에 못 닿은 날에도 오늘 지나온 것은 남는다.
                    실측으로 3km×주2 기준 러닝의 78.8~91.3%가 자리에 못 닿았고(아브라함은 최장
                    47회 연속), 그 날들엔 화면에 아무것도 남지 않았다. 이정표는 말씀이 아니라
                    "어디를 지나고 있는가"라는 위치 정보라, 본문을 잠그지 않으면서 그 침묵을 메운다. */}
                {miles.length > 0 && (
                  <div className={`${journeyPlaces.length || reachedThisRun.length ? 'mt-3' : ''} flex items-start gap-2 rounded-xl bg-sand-sunk/60 px-3.5 py-3`}>
                    <IconCairn size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--color-lapis)' }} />
                    <p className="text-[12.5px] leading-relaxed text-ink-soft">
                      {miles[miles.length - 1].region}을 지나 <span className="text-ink">{miles[miles.length - 1].to}</span> 쪽으로{' '}
                      <span className="font-display text-ink" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>{miles.length}</span>개의 이정표를 지났습니다.
                    </p>
                  </div>
                )}
                {/* 차오르는 한 절 — 자리에 못 닿은 날의 보상.
                    다음 자리의 말씀이 이정표를 지날 때마다 한 조각씩 드러난다. 본문은 원래 늘 열려
                    있으므로(아래 "미리 읽기") 거리가 여는 열쇠가 아니라 **미리 읽는 것**이다 —
                    열 번 중 여덟아홉 번이던 빈손의 날이, 이제 다음 말씀이 조금 더 가까워진 날이 된다. */}
              </div>
            )}
        </div>

        {/* 수난·광야 자리에서는 숫자를 지우는 대신 톤만 낮춘다 */}
        {!celebrate && (
          <p className="mt-4 text-[13px] leading-relaxed text-muted">오늘은 세지 않아도 됩니다. 다만 이 길을 함께 걸었습니다.</p>
        )}

        <div className="flex-1 min-h-6" />

        <p className="mb-3 mt-6 text-[10.5px] tracking-[0.04em] text-muted">{SCRIPTURE_ATTRIBUTION}</p>
        <div className="flex gap-3">
          <button
            onClick={share}
            disabled={shareState === 'rendering'}
            className="relative flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-line-strong text-ink-soft transition active:scale-95 disabled:opacity-60"
            aria-label={shareState === 'rendering' ? '카드 만드는 중' : '카드로 공유'}
          >
            {shareState === 'rendering' ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-line-strong border-t-clay" aria-hidden />
            ) : (
              <IconShare size={20} />
            )}
            {(shareState === 'saved' || shareState === 'copied') && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] text-sand">
                {shareState === 'saved' ? '이미지로 저장됨' : '복사됨'}
              </span>
            )}
          </button>
          <button onClick={leave} className="flex-1 rounded-2xl bg-clay-deep py-4 text-center font-serif text-[17px] text-sand-raised shadow-[0_1px_2px_rgba(192,90,48,.25),0_16px_36px_-18px_rgba(156,69,34,.55)] transition active:scale-[0.99]">
            계속 걷기
          </button>
        </div>
      </div>
    </div>
  )
}


/* 다음 자리의 말씀이 차오른다 — 구간 진행률만큼 글자가 드러나고, 나머지는 점으로 남는다.
   단어 경계에서 자르고, 최소 한 어절은 늘 보인다. */
function FillingVerse({ place, text, ref_, progress, onOpen }: { place: string; text: string; ref_: string; progress: number; onOpen: () => void }) {
  const words = text.split(' ')
  const shown = Math.max(1, Math.min(words.length, Math.round(words.length * progress)))
  const head = words.slice(0, shown).join(' ')
  const full = shown >= words.length
  return (
    <button onClick={onOpen} className="mt-5 w-full rounded-[22px] px-5 py-4 text-left transition active:scale-[0.99]" style={{ background: 'var(--color-sand-raised)', boxShadow: 'inset 0 0 0 1px var(--color-line), 0 10px 24px -18px rgba(60,40,18,.5)' }}>
      <p className="font-display text-[10.5px] uppercase tracking-[0.2em] text-muted">다음 자리 {place} · 차오르는 한 절</p>
      <p className="mt-2 font-serif text-[15px] leading-[1.75] text-ink">
        {head}
        {!full && (
          /* 뒷부분은 실루엣만 — 잘린 게 아니라 가려져 있다는 것이 보여야 "차오른다"가 읽힌다 */
          <span aria-hidden className="select-none" style={{ filter: 'blur(3.5px)', opacity: 0.35 }}>
            {' '}
            {words.slice(shown).join(' ')}
          </span>
        )}
      </p>
      <p className="mt-2 text-[11.5px] text-muted">{ref_} · 미리 읽기 →</p>
    </button>
  )
}
