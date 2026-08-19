import geo from '../jesus-journey.json'
import { STATIONS, JESUS_ORDER, type PassageSlug } from '../../journey'
import { passageOf } from '../../scripture'
import { haversine } from '../../../lib/geo'
import type { Journey, JourneyEpisode, JourneyTier } from './index'
import type { Milestone } from './milestones'

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

/* ── 이정표 ────────────────────────────────────────────────────────────────
 *
 * 다른 네 여정은 `scripts/gen-milestones.mjs`가 JSON에서 뽑아 milestones.ts에 구워 둔다.
 * 그런데 예수 여정은 JSON이 아니라 **이 파일이 조인해서 만드는 것**이라 스크립트가 읽을
 * 소스가 없다. 그래서 예수 여정만 이정표가 0개였고, 홈의 "이정표 n/N" 칩이 통째로 사라졌다 —
 * 자리 사이가 29km씩 벌어지는 여정에서 그 사이를 메울 것이 하나도 없다는 뜻이다.
 *
 * 스크립트에 조인 로직을 복사해 넣을 수도 있었지만, 그러면 누적거리를 계산하는 곳이 둘이 되고
 * 언젠가 반드시 어긋난다. 같은 규칙을 여기서 런타임에 적용한다 — 33자리라 비용은 없고,
 * 무엇보다 거리의 진실이 한 군데에만 남는다. 규칙은 스크립트와 동일하다:
 *   · 구간이 실제 2.5km를 넘을 때만, 실제 2km 간격으로
 *   · 좌표는 두 자리 사이 대권(great circle) 보간 — 지도 위의 실제 지점 */
const MILE_REAL_KM = 2.0
const MIN_SEG_REAL_KM = 2.5
/** geo/journeys/index.ts의 JOURNEY_SCALE.jesus와 같아야 한다 */
const JESUS_SCALE = 3

const rad = (d: number) => (d * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI

/** 대권 보간 — 두 좌표 사이를 f(0~1) 비율로 */
function slerp(aLat: number, aLng: number, bLat: number, bLng: number, f: number): [number, number] {
  const p1 = rad(aLat)
  const l1 = rad(aLng)
  const p2 = rad(bLat)
  const l2 = rad(bLng)
  const D =
    2 *
    Math.asin(
      Math.sqrt(Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin((l2 - l1) / 2) ** 2),
    )
  if (D === 0) return [aLat, aLng]
  const A = Math.sin((1 - f) * D) / Math.sin(D)
  const B = Math.sin(f * D) / Math.sin(D)
  const x = A * Math.cos(p1) * Math.cos(l1) + B * Math.cos(p2) * Math.cos(l2)
  const y = A * Math.cos(p1) * Math.sin(l1) + B * Math.cos(p2) * Math.sin(l2)
  const z = A * Math.sin(p1) + B * Math.sin(p2)
  return [
    +deg(Math.atan2(z, Math.hypot(x, y))).toFixed(4),
    +deg(Math.atan2(y, x)).toFixed(4),
  ]
}

export const JESUS_MILESTONES: Milestone[] = (() => {
  const list: Milestone[] = []
  for (let i = 1; i < episodes.length; i++) {
    const a = episodes[i - 1]
    const b = episodes[i]
    const segJourneyKm = b.cumulativeKm - a.cumulativeKm
    const segRealKm = segJourneyKm / JESUS_SCALE
    if (segRealKm <= MIN_SEG_REAL_KM) continue
    const n = Math.max(1, Math.round(segRealKm / MILE_REAL_KM) - 1) // 양 끝은 자리이므로 내부만
    for (let k = 1; k <= n; k++) {
      const f = k / (n + 1)
      const [lat, lng] = slerp(a.lat, a.lng, b.lat, b.lng, f)
      list.push({
        id: `jesus-m${String(list.length + 1).padStart(3, '0')}`,
        cumulativeKm: +(a.cumulativeKm + segJourneyKm * f).toFixed(1),
        lat,
        lng,
        from: a.place,
        to: b.place,
        region: a.region,
        // 예수님의 사역은 전부 육로다. 갈릴리 호수를 건너신 장면이 있으나 자리와 자리 사이의
        // 이동 수단을 이 데이터가 구분하지 않으므로, 단정하지 않고 육로로 둔다.
        leg: 'land',
        step: k,
        of: n,
      })
    }
  }
  return list
})()

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
