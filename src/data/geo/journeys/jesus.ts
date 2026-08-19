import geo from '../jesus-journey.json'
import { STATIONS, JESUS_ORDER, type PassageSlug } from '../../journey'
import { passageOf } from '../../scripture'
import { haversine } from '../../../lib/geo'
import type { Journey, JourneyEpisode, JourneyTier } from './index'

/* ── 예수님의 사역 길을 여정 모델로 ────────────────────────────────────────
 *
 * 이 앱에는 진행 시스템이 **두 개** 있었다.
 *   A. 예수 코스 (`journey.ts`) — 자리 37, 거리별 코스 7종. Setup·Run·Reveal·수집이 쓴다.
 *   B. 성경 여정 (`geo/journeys/*`) — 실좌표·실측 km. 홈 히어로·여정 화면이 쓴다.
 * 그런데 B의 목록(JOURNEYS)에 **예수가 없었다.** `JOURNEY_CHROME.jesus`와
 * `JOURNEY_SCALE.jesus`는 이미 자리를 비워 두고 있는데 정작 여정 자체가 없어서,
 * 홈은 기본값 '베드로의 길'을 말하고 Setup은 '갈릴리의 기적'(예수 코스)을 말했다.
 * 같은 앱의 두 화면이 서로 다른 길을 걷고 있다고 말한 셈이다.
 * `DECISIONS.md`는 출시 범위를 **예수 단일 여정**으로 못박았는데도 그랬다.
 *
 * 왜 한 줄로 안 끝났나: `jesus-journey.json`은 Journey 타입이 아니다. 좌표만 있다
 * (id·lat·lng·siteName·modernLocation·confidence × 37). 서사는 `journey.ts`의 STATIONS에
 * 따로 있다(place·title·teaser·reflection·prayer·mood). 두 데이터를 id로 조인하고,
 * 누적 거리는 좌표에서 직접 계산해야 Journey 하나가 나온다. 이 파일이 그 조인이다.
 *
 * 순서는 `JESUS_ORDER`(34자리)를 따른다 — 37자리 중 사도행전 3자리(오순절·베드로 설교·사울)는
 * 초대교회 사건이라 베드로/바울 여정으로 갔다(journey.ts 주석 참고). */

/* 장(章) 구분 — 각 장이 시작되는 자리의 id.
 *
 * 처음엔 STATIONS의 arc로 묶었는데, JESUS_ORDER에서 arc가 연속이 아니라 장이 11개로 쪼개졌다
 * ("은혜의 비유"가 세 번, "갈릴리의 이적"이 두 번 나왔다). arc는 사건의 성격이지 시간 순서의
 * 마디가 아니기 때문이다. 순서의 마디는 `journey.ts`의 JESUS_ORDER가 주석으로 이미 나눠 두었다 —
 * 그 구분을 정본으로 삼는다. 경계 자리 id로 잡으므로 중간 자리가 빠져도 장이 안 무너진다. */
const CHAPTERS: { at: PassageSlug; name: string; note: string }[] = [
  { at: 'baptism', name: '부르심', note: '요단강의 물에서 갈릴리 해변까지 — 길이 시작되는 자리들입니다.' },
  { at: 'beat-1', name: '산 위의 말씀', note: '팔복에서 반석 위의 집까지, 산에서 내려온 말씀을 따라 걷습니다.' },
  { at: 'sower', name: '갈릴리의 이적', note: '씨 뿌리는 자에서 변화산까지 — 호숫가를 도는 사역의 한복판입니다.' },
  { at: 'lost-sheep', name: '은혜의 비유', note: '잃은 양에서 베다니까지, 돌아온 자를 맞는 이야기들입니다.' },
  { at: 'entry', name: '예루살렘의 한 주', note: '입성에서 십자가까지. 이 구간에서는 축하를 켜지 않습니다.' },
  { at: 'empty-tomb', name: '빈 무덤', note: '무덤이 비고, 길이 다시 열립니다.' },
  { at: 'commission', name: '보내심', note: '이 길은 여기서 끝나지 않고 우리에게로 이어집니다.' },
]

/* 사역 지리의 경계(레반트).
 *
 * `ends-earth`의 좌표는 **로마**(41.9, 12.5)다 — 데이터에도 confidence: 'symbolic',
 * siteName: "로마 (상징적 '땅 끝')"이라고 적혀 있다. 이걸 waypoint로 넣으면 갈릴리에서
 * 2,379km를 한 번에 건너뛰는 구간이 생긴다(축척 10배 기준 실제 238km). 자리 33개를 773km로
 * 걸어온 사람에게 마지막 한 자리가 그 세 배가 되는 셈이라, 진행이 거기서 그냥 멈춘다.
 * 게다가 지도 창에 로마가 들어오는 순간 팔레스타인 전체가 점 하나로 뭉갠다.
 *
 * 그래서 사역 지리 밖의 상징 좌표는 **지도의 자리로 세우지 않는다.** 콘텐츠가 사라지는 게
 * 아니다 — 그 자리는 예수 코스(journey.ts)에 성구·그림·묵상과 함께 그대로 있고, 거기서는
 * 거리가 아니라 이야기의 마지막 장으로 읽힌다. 지도는 그분이 실제로 걸으신 땅만 그린다. */
const MINISTRY_BOUNDS = { minLat: 28.5, maxLat: 34.5, minLng: 33.0, maxLng: 37.5 }

interface GeoStation {
  id: string
  lat: number
  lng: number
  siteName: string
  modernLocation: string
  confidence?: string
}

const COORDS = new Map((geo.stations as GeoStation[]).map((s) => [s.id, s]))

const inMinistryLand = (s: GeoStation) =>
  s.lat >= MINISTRY_BOUNDS.minLat &&
  s.lat <= MINISTRY_BOUNDS.maxLat &&
  s.lng >= MINISTRY_BOUNDS.minLng &&
  s.lng <= MINISTRY_BOUNDS.maxLng

/** 좌표가 있고, 사역 지리 안에 있는 자리만 — 좌표가 없으면 지도에 세울 수 없다 */
const ORDER: PassageSlug[] = JESUS_ORDER.filter((id) => {
  const c = COORDS.get(id)
  return !!c && inMinistryLand(c)
})

const round = (n: number) => Math.round(n * 100) / 100

const episodes: JourneyEpisode[] = (() => {
  let cum = 0
  return ORDER.map((id, i) => {
    const st = STATIONS[id]
    const c = COORDS.get(id)!
    const prev = i > 0 ? COORDS.get(ORDER[i - 1])! : undefined
    const seg = prev ? haversine(prev.lat, prev.lng, c.lat, c.lng) : 0
    cum += seg
    const p = passageOf(st.passage)
    const line = p.kr.find((l) => l.v === st.verse) ?? p.kr[0]
    return {
      id,
      order: i + 1,
      place: st.place,
      placeLatin: st.placeLatin,
      region: c.modernLocation || c.siteName,
      lat: c.lat,
      lng: c.lng,
      cumulativeKm: round(cum),
      segmentKm: round(seg),
      event: st.title,
      passageRef: p.ref,
      verseKrShort: line.text,
      reflection: st.reflection,
      prayer: st.prayer,
      feel: st.teaser,
      confidence: c.confidence,
      /* 예수 자리는 mood를 원래부터 들고 있다 — moods.ts로 따로 채울 필요가 없는 유일한 여정.
         수난 구간이 여기서 그대로 'lament'로 넘어가 축하가 꺼진다. */
      mood: st.mood,
    }
  })
})()

/** 경계 자리에서 장을 끊는다 */
const tiers: JourneyTier[] = (() => {
  // 실제로 남은 자리들 중에서 각 장이 시작되는 위치
  const starts = CHAPTERS.map((c) => ({ ...c, idx: ORDER.indexOf(c.at) })).filter((c) => c.idx >= 0)
  return starts.map((c, n) => {
    const from = episodes[c.idx]
    const endIdx = (starts[n + 1]?.idx ?? ORDER.length) - 1
    const to = episodes[endIdx]
    return {
      id: `t${n + 1}`,
      name: c.name,
      fromEpisode: from.id,
      toEpisode: to.id,
      km: round(to.cumulativeKm - (c.idx > 0 ? episodes[c.idx - 1].cumulativeKm : 0)),
      note: c.note,
    }
  })
})()

/* 이정표는 pace.ts의 buildMilestones가 걸음을 고른 뒤 런타임에 만든다(모든 여정 공통). */

export const JESUS_JOURNEY: Journey = {
  id: 'jesus',
  name: '예수님의 사역 길',
  nameLatin: 'Via Christi',
  who: '예수 그리스도',
  era: '주후 27~30년경',
  totalKm: round(episodes[episodes.length - 1]?.cumulativeKm ?? 0),
  theologyNote:
    '거리는 말씀을 여는 열쇠가 아닙니다. 이 길을 얼마나 걸었든 하나님의 사랑과 구원은 걸음으로 얻지도, 멈춤으로 잃지도 않습니다(엡 2:8-9). 자리는 순례의 자리이지 등급이 아닙니다.',
  tiers,
  episodes,
  sources: ['전통적 성지 동정 + 고고학 근거 (jesus-journey.json)', '개역한글 · 퍼블릭 도메인 판본'],
}
