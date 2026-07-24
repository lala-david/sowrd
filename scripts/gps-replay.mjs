/* GPS 필터 재생 하네스 — 실기 로그 없이 할 수 있는 최선의 검증.
 *
 * 합성 직선 궤적은 필터가 "쉬운" 조건만 본다. 실제 러닝에는 정지(신호등)·터널(신호 상실)·
 * 도심 협곡의 큰 튐·곡선 경로가 섞인다. 그런 '현실적으로 지저분한' 궤적을 만들어
 * geo.ts의 실제 필터 로직(등속 칼만)을 그대로 돌려 거리 오차를 잰다.
 *
 * geo.ts의 필터 상수·수식을 복제하지 않고, 파일에서 직접 읽어와 검증한다면 이상적이지만
 * ESM import가 브라우저 전용 API(navigator)에 묶여 있어, 여기서는 동일 알고리즘을
 * 명시적으로 옮겨 적고 상수를 geo.ts와 맞춘다(변경 시 함께 고칠 것 — 주석으로 링크).
 *
 *   node scripts/gps-replay.mjs
 */
const R = 6371000
const MAX_ACCURACY_M = 30
const MAX_SPEED_MS = 7
const ACCEL_NOISE_MS2 = 0.5
const MIN_SPEED_MS = 0.35
const M_PER_DEG_LAT = 110574

const hav = (aLat, aLng, bLat, bLng) => {
  const r = (d) => (d * Math.PI) / 180
  const dLat = r(bLat - aLat), dLng = r(bLng - aLng)
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(r(aLat)) * Math.cos(r(bLat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)))
}
const gauss = () => { let s = 0; for (let i = 0; i < 12; i++) s += Math.random(); return s - 6 }

/* geo.ts watchDistance의 등속 칼만을 그대로 옮긴 것 */
function replay(samples) {
  let init = false, lat0 = 0, lng0 = 0, mPerDegLng = 0, lastT = 0
  let px = 0, vx = 0, xpp = 0, xpv = 0, xvv = 0
  let py = 0, vy = 0, ypp = 0, ypv = 0, yvv = 0
  let km = 0, seen = 0, used = 0
  for (const s of samples) {
    seen++
    if (s.acc > MAX_ACCURACY_M) continue
    if (!init) {
      lat0 = s.lat; lng0 = s.lng; mPerDegLng = 111320 * Math.cos((s.lat * Math.PI) / 180)
      px = 0; py = 0; vx = 0; vy = 0; xpp = s.acc ** 2; ypp = s.acc ** 2; xvv = 4; yvv = 4; xpv = 0; ypv = 0
      lastT = s.t; init = true; continue
    }
    const dt = (s.t - lastT) / 1000
    if (dt <= 0) continue
    lastT = s.t
    const zx = (s.lng - lng0) * mPerDegLng, zy = (s.lat - lat0) * M_PER_DEG_LAT
    const r2 = s.acc ** 2, q = ACCEL_NOISE_MS2 ** 2
    const q11 = (q * dt ** 3) / 3, q12 = (q * dt ** 2) / 2, q22 = q * dt
    px += vx * dt
    let n11 = xpp + 2 * dt * xpv + dt * dt * xvv + q11, n12 = xpv + dt * xvv + q12
    const n22 = xvv + q22, sx = n11 + r2, kx1 = n11 / sx, kx2 = n12 / sx, rx = zx - px
    px += kx1 * rx; vx += kx2 * rx; xpp = (1 - kx1) * n11; xpv = (1 - kx1) * n12; xvv = n22 - kx2 * n12
    py += vy * dt
    let m11 = ypp + 2 * dt * ypv + dt * dt * yvv + q11, m12 = ypv + dt * yvv + q12
    const m22 = yvv + q22, sy = m11 + r2, ky1 = m11 / sy, ky2 = m12 / sy, ry = zy - py
    py += ky1 * ry; vy += ky2 * ry; ypp = (1 - ky1) * m11; ypv = (1 - ky1) * m12; yvv = m22 - ky2 * m12
    let sp = Math.hypot(vx, vy)
    if (sp > MAX_SPEED_MS) sp = MAX_SPEED_MS
    if (sp < MIN_SPEED_MS) continue
    used++; km += (sp * dt) / 1000
  }
  return { km, used, seen }
}

/* 현실적으로 지저분한 궤적 생성기.
 * segs: [{type, ...}] 를 이어 붙여 하나의 1Hz 샘플열을 만든다. */
function build(segs, acc, jit) {
  const out = []
  let t = 0, lat = 37.5665, lng = 126.978, truth = 0
  const mLat = M_PER_DEG_LAT, mLng = 111320 * Math.cos(lat * Math.PI / 180)
  const push = (extraAcc = 0) => out.push({ lat: lat + gauss() * jit / mLat, lng: lng + gauss() * jit / mLng, t: t * 1000, acc: Math.max(3, acc + extraAcc + gauss() * acc * 0.2) })
  for (const seg of segs) {
    if (seg.type === 'run') { // paceSec/km 등속
      const v = 1000 / seg.pace
      for (let i = 0; i < seg.sec; i++) { const hd = seg.dir ?? 0; lat += v * Math.cos(hd) / mLat; lng += v * Math.sin(hd) / mLng; truth += v; t++; push() }
    } else if (seg.type === 'stop') { // 정지(신호등)
      for (let i = 0; i < seg.sec; i++) { t++; push() }
    } else if (seg.type === 'tunnel') { // 신호 상실 — acc 폭증
      const v = 1000 / (seg.pace ?? 360)
      for (let i = 0; i < seg.sec; i++) { lat += v / mLat; truth += v; t++; push(80) } // acc>30 → 버려짐
    }
  }
  return { samples: out, truthKm: truth / 1000 }
}

console.log('시나리오                        실제거리   측정거리(오차)   채택률')
const scen = [
  ['개방 5km + 신호등 6회', [
    { type: 'run', pace: 330, sec: 300 }, { type: 'stop', sec: 40 },
    { type: 'run', pace: 340, sec: 300 }, { type: 'stop', sec: 30 },
    { type: 'run', pace: 350, sec: 300 }, { type: 'stop', sec: 45 },
    { type: 'run', pace: 345, sec: 300 }, { type: 'stop', sec: 30 },
    { type: 'run', pace: 355, sec: 300 }, { type: 'stop', sec: 35 },
    { type: 'run', pace: 360, sec: 200 },
  ], 8, 1.2],
  ['도심 곡선 + 정지', [
    { type: 'run', pace: 360, sec: 200, dir: 0 }, { type: 'run', pace: 360, sec: 200, dir: 1.2 },
    { type: 'stop', sec: 60 }, { type: 'run', pace: 380, sec: 200, dir: 2.4 },
    { type: 'run', pace: 380, sec: 200, dir: 0.6 },
  ], 15, 2.5],
  ['터널 2분(신호 상실)', [
    { type: 'run', pace: 340, sec: 300 }, { type: 'tunnel', pace: 340, sec: 120 },
    { type: 'run', pace: 340, sec: 300 },
  ], 10, 2],
  ['느린 조깅 9분/km + 신호등', [
    { type: 'run', pace: 540, sec: 400 }, { type: 'stop', sec: 40 },
    { type: 'run', pace: 560, sec: 400 }, { type: 'stop', sec: 30 },
    { type: 'run', pace: 550, sec: 400 },
  ], 18, 3],
]
for (const [name, segs, acc, jit] of scen) {
  let sum = 0, T = 0, uu = 0, ss = 0, N = 12
  for (let k = 0; k < N; k++) {
    const { samples, truthKm } = build(segs, acc, jit)
    const r = replay(samples); sum += r.km; T += truthKm; uu += r.used; ss += r.seen
  }
  const t = T / N, e = (sum / N - t) / t * 100
  console.log(name.padEnd(30), t.toFixed(2).padStart(6) + 'km', (sum / N).toFixed(2) + `km (${e > 0 ? '+' : ''}${e.toFixed(1)}%)`.padEnd(16), (uu / ss * 100).toFixed(0) + '%')
}
console.log('\n주: 정지 구간은 truth에 안 들어가므로(실제로 안 움직임) 정지 시 유령거리가 있으면 +오차로 나타난다.')
console.log('   터널 구간은 truth에 포함되지만 신호가 없어 측정 불가 → 그만큼 −오차(정직한 손실).')
