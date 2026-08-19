import { useReducedMotion } from 'motion/react'

/* ── 자리에 닿는 순간 ──────────────────────────────────────────────────────
 *
 * 이 앱에서 팡파레가 허락된 유일한 지점이다.
 *
 * 왜 예외를 두는가: 코드 주석에 이미 적혀 있던 실측대로, 열 번 달리면 여덟아홉 번은
 * 자리에 닿지 못한다(78~91%). 드물게 오는 그 한 번이 밋밋하면 다음 한 번을 기다릴 이유가
 * 생기지 않는다. "느린 숨"(DESIGN-PHILOSOPHY ④)은 화면 전체의 기본 레지스터이지,
 * 도달의 순간까지 조용해야 한다는 뜻은 아니다.
 *
 * 무엇을 하지 않는가:
 *   · 컨페티(종이가루) 없음 — 이 제품의 언어가 아니다. 대신 **빛 조각**이 떠오른다.
 *   · 소리 없음 — 러닝 직후이고, 오디오는 4단계 확장 사항이다.
 *   · 점수·등급 없음 — 축하하는 것은 "닿았다"이지 성취도가 아니다(신학 금지선).
 *
 * 언제 꺼지는가:
 *   · mood가 lament인 자리(수난) — 호출부가 celebrate=false로 넘긴다.
 *     십자가를 보스전으로 만들지 않는다는 것은 기획서의 절대 원칙이다(PLANNING §4.3).
 *   · prefers-reduced-motion — 전정기관 장애의 유발 요인은 움직임이다. 통째로 렌더하지 않는다.
 */

/** 결정론적 배치 — 리렌더마다 빛 조각이 다른 데서 떠오르면 같은 장면이 아니게 된다 */
const rnd = (i: number, salt = 1) => {
  const x = Math.sin(i * 91.3 * salt + 47.11) * 21793.19
  return x - Math.floor(x)
}

export default function Celebration({
  /** 이 자리를 축하해도 되는가 — 수난 자리에서는 false */
  celebrate,
  /** 자리가 바뀌면 연출을 다시 재생하려고 쓰는 키 */
  runKey,
}: {
  celebrate: boolean
  runKey: string
}) {
  const reduce = useReducedMotion()
  if (!celebrate || reduce) return null

  const motes = Array.from({ length: 14 }, (_, i) => ({
    left: 8 + rnd(i) * 84, // %
    bottom: rnd(i, 3) * 26, // %
    size: 3 + rnd(i, 5) * 4,
    delay: 0.5 + rnd(i, 7) * 1.1,
    dur: 2.2 + rnd(i, 11) * 1.4,
    gold: rnd(i, 13) > 0.35,
  }))

  return (
    <div key={runKey} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* 파문 — 자리에서 한 겹 퍼진다. 두 겹을 시차로 겹쳐 물결처럼 */}
      {[0, 0.34].map((delay, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-1/2 h-[300px] w-[300px] rounded-full"
          style={{
            marginLeft: -150,
            marginTop: -150,
            border: '1.5px solid var(--color-seal-bright)',
            animation: `ripple-out 1500ms cubic-bezier(0.16,1,0.3,1) ${0.42 + delay}s both`,
          }}
        />
      ))}

      {/* 금박이 한 번 스쳐 지나간다 — 인장이 찍히는 순간과 겹친다 */}
      <span
        className="absolute inset-y-0 left-0 w-1/3"
        style={{
          background:
            'linear-gradient(100deg, transparent, color-mix(in srgb, var(--color-seal-bright) 55%, transparent), transparent)',
          animation: 'gild-sweep 1400ms ease-out 0.5s both',
        }}
      />

      {/* 빛 조각이 떠오른다 */}
      {motes.map((m, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${m.left}%`,
            bottom: `${m.bottom}%`,
            width: m.size,
            height: m.size,
            background: m.gold ? 'var(--color-seal-bright)' : 'var(--color-joy)',
            boxShadow: `0 0 ${m.size * 2.4}px ${m.gold ? 'rgba(255,216,104,.85)' : 'rgba(255,106,48,.7)'}`,
            animation: `mote-rise ${m.dur.toFixed(2)}s cubic-bezier(0.22,1,0.36,1) ${m.delay.toFixed(2)}s both`,
          }}
        />
      ))}
    </div>
  )
}
