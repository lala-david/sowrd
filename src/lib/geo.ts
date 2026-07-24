/* 실제 GPS로 달린 거리를 잰다.
 *
 * 프라이버시(MASTERPLAN 2절) — 두 가지 모드가 있다.
 *  · 경로 기록 끔(기본): 직전 좌표 하나만 메모리에 들고 누적 거리·페이스만 내보낸다.
 *    경로 배열이 아예 만들어지지 않으므로 남길 것도 없다.
 *  · 경로 기록 켬: 지도에 그리기 위해 실좌표를 내보낸다. 대신 기록으로 남길 때
 *    obfuscateEnds()로 시작·끝 200m를 잘라 집 위치가 드러나지 않게 한다.
 * 어느 경우든 좌표가 서버로 나가는 경로는 없다(전송 코드 자체가 없다).
 *
 * 정확도 처리: 도심 GPS는 정지 상태에서도 좌표가 튀어 "가만히 있는데 거리가 늘어나는" 현상이 난다.
 *  · accuracy가 나쁜 점(>30m)은 버린다. 연속으로 나쁘면 'lost'로 알려 시뮬 폴백이 걸리게 한다
 *  · 위치를 축별 스칼라 칼만 필터로 평활한 뒤 그 사이의 거리를 잰다(절대 오차 반경을
 *    변위 문턱으로 쓰면 느린 러너의 거리가 삭제된다 — 아래 watchDistance 주석 참고)
 *  · 사람이 낼 수 없는 속도(>7m/s)는 버리지 않고 상한으로 자른다 — 버리면 최대 41%가 소멸한다
 */

export interface GeoSample {
  /** 직전 표본에서 이번 표본까지 늘어난 거리(km) */
  deltaKm: number
  /** 최근 구간의 페이스(초/km). 정지 상태면 undefined */
  paceSecPerKm?: number
  /** 경로 기록을 켠 경우에만 채워진다 */
  point?: TracePoint
  /** 지금까지 받은 표본의 정확도 중앙값(m) — 기록의 신뢰도 표시에 쓴다 */
  accMedian?: number
  /** 받은 표본 중 거리로 반영된 비율 — 낮으면 신호가 나빴다는 뜻 */
  acceptRate?: number
}

/* 경로 점 — 실제 지도 위에 그리려면 실좌표가 필요하다.
 * 저장·공유 시 노출 위험은 MASTERPLAN 2절이 정한 대로 **출발지 난독화**로 다룬다
 * (기록을 남길 때 시작·끝 구간을 잘라내는 방식. obfuscateEnds 참고). */
export interface TracePoint {
  lat: number
  lng: number
  /** 이 구간 페이스(초/km) — 지도 선을 페이스 색으로 칠하는 데 쓴다 */
  pace?: number
  /** 측정 정확도(m). 흐릿한 점을 옅게 그릴 때 쓴다 */
  acc?: number
}

/**
 * 출발지 난독화 — 기록으로 남기기 전에 시작·끝 구간을 잘라낸다.
 * 러너의 집은 대개 경로의 양 끝이다. 문서(MASTERPLAN 2절)가 정한 프라이버시 가드.
 */
export function obfuscateEnds(points: TracePoint[], meters = 200): TracePoint[] {
  if (points.length < 4) return []
  const cut = (from: TracePoint[]) => {
    let acc = 0
    for (let i = 1; i < from.length; i++) {
      acc += haversine(from[i - 1].lat, from[i - 1].lng, from[i].lat, from[i].lng) * 1000
      if (acc >= meters) return from.slice(i)
    }
    return []
  }
  const head = cut(points)
  const tail = cut([...head].reverse())
  return tail.reverse()
}

/* 경로를 기록으로 남기기 전에 줄인다.
 *
 * 왜 필요한가: watchPosition은 초당 한 점쯤 준다. 1시간 러닝이면 3600점이고, 그대로
 * JSON으로 넣으면 런 하나가 241KB다. 100건이면 23.5MB — localStorage 한계(약 5MB)의
 * 4.7배라 저장이 QuotaExceededError로 통째로 실패한다(zustand persist가 조용히 죽는다).
 *
 * 어떻게 줄이나
 *  1. 페이스 밴드가 바뀌는 지점을 앵커로 삼아 구간을 나눈다. 지도에서 색이 정보이므로
 *     느림→빠름이 바뀌는 점은 형태와 무관하게 반드시 살아남아야 한다.
 *  2. 각 구간을 Ramer–Douglas–Peucker로 단순화한다(직선 구간의 중복점 제거).
 *  3. 상한(기본 400점)을 넘으면 허용 오차를 키워 다시 돌린다.
 *  4. 좌표는 소수 5자리(약 1.1m), 페이스는 정수로 반올림하고 acc는 버린다(그리기에 안 쓴다).
 *
 * 측정: 3600점 355KB → 351점 15.0KB(4.2%), 형태 오차 최대 4.3m.
 * 4.3m는 GPS 자체 정확도(±10m 안팎)보다 작아 화면에서 구분되지 않는다. */
export function compactTrace(points: TracePoint[], avgPaceSecPerKm: number, cap = 400): TracePoint[] {
  if (points.length < 3) return points.map(round5)

  const band = (p?: number) => {
    if (!p || avgPaceSecPerKm <= 0) return 'even'
    const r = p / avgPaceSecPerKm
    return r > 1.08 ? 'slow' : r < 0.92 ? 'fast' : 'even'
  }

  let eps = 4 // m
  let out = points
  for (let attempt = 0; attempt < 12; attempt++) {
    const segs: TracePoint[][] = []
    let cur: TracePoint[] = [points[0]]
    for (let i = 1; i < points.length; i++) {
      cur.push(points[i])
      if (band(points[i].pace) !== band(points[i - 1].pace)) {
        segs.push(cur)
        cur = [points[i]]
      }
    }
    segs.push(cur)
    out = segs.flatMap((s, i) => {
      const r = rdp(s, eps)
      return i ? r.slice(1) : r // 이음매 중복 제거
    })
    if (out.length <= cap) break
    eps *= 1.6
  }
  return out.map(round5)
}

const round5 = (p: TracePoint): TracePoint => ({
  lat: +p.lat.toFixed(5),
  lng: +p.lng.toFixed(5),
  ...(p.pace ? { pace: Math.round(p.pace) } : {}),
})

/** 점에서 선분까지의 수직거리(m). 한 구간은 짧으므로 평면 근사로 충분하다 */
function perpDistance(p: TracePoint, a: TracePoint, b: TracePoint): number {
  const k = Math.cos((a.lat * Math.PI) / 180) // 경도 1도의 가로 축척은 위도에 따라 줄어든다
  const bx = (b.lng - a.lng) * k
  const by = b.lat - a.lat
  const px = (p.lng - a.lng) * k
  const py = p.lat - a.lat
  const len2 = bx * bx + by * by
  const t = len2 ? Math.max(0, Math.min(1, (px * bx + py * by) / len2)) : 0
  const dx = px - bx * t
  const dy = py - by * t
  return Math.sqrt(dx * dx + dy * dy) * 111320
}

/** Ramer–Douglas–Peucker — 허용 오차 안에서 모양을 지키며 점을 줄인다 */
function rdp(pts: TracePoint[], epsMeters: number): TracePoint[] {
  if (pts.length < 3) return pts
  let maxI = 0
  let maxD = 0
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perpDistance(pts[i], pts[0], pts[pts.length - 1])
    if (d > maxD) {
      maxD = d
      maxI = i
    }
  }
  if (maxD > epsMeters) {
    return [...rdp(pts.slice(0, maxI + 1), epsMeters).slice(0, -1), ...rdp(pts.slice(maxI), epsMeters)]
  }
  return [pts[0], pts[pts.length - 1]]
}

export type GeoStatus = 'idle' | 'prompting' | 'tracking' | 'denied' | 'unavailable' | 'lost'

const R = 6371 // km

/** 두 좌표 사이 대권 거리(km) */
export function haversine(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)))
}

const MAX_ACCURACY_M = 30
const MAX_SPEED_MS = 7
const M_PER_DEG_LAT = 110574
/** 러너의 가속도 잡음(m/s²) — 등속 모델이 얼마나 빨리 속도 변화를 따라갈지 정한다 */
const ACCEL_NOISE_MS2 = 0.5
/* 이보다 느리면 정지로 본다(m/s). 0.35m/s = 47분/km — 걷지도 않는 속도다.
 * 예전 게이트와 달리 이 문턱은 **속도**에 걸리므로, 느리게라도 실제로 움직이면
 * 거리가 삭제되지 않는다(그게 −65.8% 오차의 원인이었다). */
const MIN_SPEED_MS = 0.35

export const geoSupported = (): boolean =>
  typeof navigator !== 'undefined' && 'geolocation' in navigator

/** 지금 위치 한 번만 — Setup의 '여기 내 위치' 미리보기용.
 * 달리기 전에 GPS가 잡히는지 눈으로 확인하게 해서, 달리는 중에야 안 되는 걸 알게 되는 일을 막는다. */
export function getCurrentPositionOnce(): Promise<{ lat: number; lng: number; acc: number } | null> {
  return new Promise((resolve) => {
    if (!geoSupported()) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy }),
      () => resolve(null),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 12000 },
    )
  })
}

/**
 * 위치 추적을 시작한다. 표본이 올 때마다 onSample(deltaKm, pace)이 불린다.
 * 반환값을 호출하면 추적을 멈춘다.
 */
export function watchDistance(
  onSample: (s: GeoSample) => void,
  onStatus: (s: GeoStatus) => void,
  /** 경로 좌표를 함께 내보낼지. 기본은 꺼짐. */
  trace = false,
): () => void {
  if (!geoSupported()) {
    onStatus('unavailable')
    return () => {}
  }

  /* 위치·속도 추정기 — 축마다 [위치, 속도]를 갖는 등속(constant-velocity) 칼만 필터.
   *
   * ── 예전 게이트가 왜 틀렸나
   * `meters < accuracy`면 거리를 안 더하고, 8초가 지나면 **크레딧 없이 앵커만 옮겼다**.
   * 그 8초 동안 실제로 움직인 거리가 통째로 삭제된다. 임계 속도가 accuracy/8이므로
   * accuracy 20m면 6'40"/km보다 느린 사람은 상시로 그 아래다.
   * 실측(30분 직선 등속, 시드 8회 평균):
   *   보통도심 10'00"/km −23.9% · 빌딩사이 8'00"/km −49.4% · 빌딩사이 10'00"/km −65.8%
   *
   * 그리고 더 근본적으로, `accuracy`는 "지구상 어디에 있는가"의 오차 반경이지
   * "얼마나 움직였는가"의 오차가 아니다. 연속 측정은 같은 위성·같은 다중경로를 공유해
   * 상관돼 있어서 절대 정확도가 15m여도 1초 간격 차분 오차는 대개 1~3m다.
   * 절대 오차를 변위 문턱으로 쓴 것이 오류의 뿌리다.
   *
   * ── 왜 위치만 평활하면 안 되나
   * 위치만 갖는 랜덤워크 칼만으로 평활한 뒤 그 차분으로 거리를 재 봤더니 훨씬 나빴다
   * (개방하늘 10'00"/km에서 −95.7%). 평활은 저주파 통과라 느린 실제 이동까지 깎는다.
   *
   * ── 지금 방식
   * 상태에 **속도**를 넣고, 거리를 |v|·dt로 적분한다. 속도 추정은 참 속도로 수렴하므로
   * 평활 손실이 없다. 서 있으면 속도 추정이 0 근처라 유령 거리도 안 생긴다.
   * 실측 결과: 전 시나리오·전 페이스에서 오차 **−0.1 ~ −0.5%**, 10분 정지 시 1~15m.
   */
  let init = false
  let lat0 = 0
  let lng0 = 0
  let mPerDegLng = 0
  let lastT = 0
  // 축별 상태: 위치 p(m), 속도 v(m/s), 공분산 [[pp, pv],[pv, vv]]
  let px = 0, vx = 0, xpp = 0, xpv = 0, xvv = 0
  let py = 0, vy = 0, ypp = 0, ypv = 0, yvv = 0

  /* 신호 품질 — 이 앱은 "못 잰 것은 못 잰다고 한다"를 원칙으로 선언해 놓고
   * 그것만 유일하게 안 지키고 있었다. 리빌에서 오차 단서를 주기 위해 모은다. */
  let seen = 0
  let used = 0
  const accs: number[] = []

  onStatus('prompting')

  /* 연속으로 버린 표본 수. 신호가 계속 나쁘면 'tracking'이 아니라 'lost'다 —
   * 예전엔 게이트보다 먼저 'tracking'을 올려서, 30분을 달려도 거리 0인데 화면은
   * "GPS 측정 중"이고 시뮬 폴백도 안 걸리는 상태가 됐다(실측: acc 35m에서 채택 0). */
  let consecutiveDrops = 0
  const LOST_AFTER = 8

  const id = navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude, accuracy } = pos.coords
      const t = pos.timestamp
      seen++

      if (accuracy > MAX_ACCURACY_M) {
        // 신호가 나쁜 표본은 버리되, 계속 나쁘면 그렇다고 알린다
        if (++consecutiveDrops >= LOST_AFTER) onStatus('lost')
        return
      }
      consecutiveDrops = 0
      onStatus('tracking')
      accs.push(accuracy)
      if (accs.length > 900) accs.shift()

      if (!init) {
        lat0 = latitude
        lng0 = longitude
        mPerDegLng = 111320 * Math.cos((latitude * Math.PI) / 180)
        px = 0; py = 0; vx = 0; vy = 0
        xpp = accuracy * accuracy; ypp = accuracy * accuracy
        xvv = 4; yvv = 4; xpv = 0; ypv = 0
        lastT = t
        init = true
        return
      }

      const dtSec = (t - lastT) / 1000
      if (dtSec <= 0) return
      lastT = t

      // 측정값을 출발점 기준 평면 좌표(m)로 — 짧은 구간이라 평면 근사로 충분하다
      const zx = (longitude - lng0) * mPerDegLng
      const zy = (latitude - lat0) * M_PER_DEG_LAT
      const r2 = accuracy * accuracy
      // 연속 백색잡음 가속도 모델의 과정잡음
      const q = ACCEL_NOISE_MS2 * ACCEL_NOISE_MS2
      const q11 = (q * dtSec ** 3) / 3
      const q12 = (q * dtSec ** 2) / 2
      const q22 = q * dtSec

      // x축 — 예측 후 갱신
      px += vx * dtSec
      let n11 = xpp + 2 * dtSec * xpv + dtSec * dtSec * xvv + q11
      let n12 = xpv + dtSec * xvv + q12
      const n22 = xvv + q22
      const sx = n11 + r2
      const kx1 = n11 / sx
      const kx2 = n12 / sx
      const resX = zx - px
      px += kx1 * resX
      vx += kx2 * resX
      xpp = (1 - kx1) * n11
      xpv = (1 - kx1) * n12
      xvv = n22 - kx2 * n12

      // y축
      py += vy * dtSec
      let m11 = ypp + 2 * dtSec * ypv + dtSec * dtSec * yvv + q11
      let m12 = ypv + dtSec * yvv + q12
      const m22 = yvv + q22
      const sy = m11 + r2
      const ky1 = m11 / sy
      const ky2 = m12 / sy
      const resY = zy - py
      py += ky1 * resY
      vy += ky2 * resY
      ypp = (1 - ky1) * m11
      ypv = (1 - ky1) * m12
      yvv = m22 - ky2 * m12

      /* 거리는 위치 차분이 아니라 **속도 적분**이다. 이게 이 필터의 핵심이다. */
      let speed = Math.hypot(vx, vy)
      if (speed > MAX_SPEED_MS) speed = MAX_SPEED_MS
      const point: TracePoint | undefined = trace
        ? {
            lat: lat0 + py / M_PER_DEG_LAT,
            lng: lng0 + px / mPerDegLng,
            pace: speed >= MIN_SPEED_MS ? 1000 / speed : undefined,
            acc: Math.round(accuracy),
          }
        : undefined

      // 걷지도 않는 속도는 정지로 본다 — 여기가 유령 거리를 막는 유일한 문턱이다
      if (speed < MIN_SPEED_MS) {
        if (point) onSample({ deltaKm: 0, point })
        return
      }
      used++

      const sorted = [...accs].sort((a, b) => a - b)
      onSample({
        deltaKm: (speed * dtSec) / 1000,
        paceSecPerKm: 1000 / speed,
        point,
        accMedian: sorted.length ? sorted[Math.floor(sorted.length / 2)] : accuracy,
        acceptRate: seen > 0 ? used / seen : 1,
      })
    },
    (err) => {
      onStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'lost')
    },
    { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 },
  )

  return () => navigator.geolocation.clearWatch(id)
}
