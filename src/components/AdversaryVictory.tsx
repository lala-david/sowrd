import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import type { AdversaryKind } from '../data/adversaries'
import { adversaryArt } from '../assets/art'

/* 승리의 순간 — 대치 그림이 걷히며 그 자리의 그림이 드러난다.
 *
 * 밑그림(승리 — 갈라진 홍해)은 리빌의 히어로 img가 이미 그리고 있다. 이 컴포넌트는
 * 그 **위에** 대치 그림(막아선 바다)을 잠깐 덮었다가 벗겨내는 오버레이만 맡는다:
 *   · 바다(홍해)·위협(닫힌 문): 한가운데가 갈라지며 좌우로 물러난다 — 출 14:21, 행 12:10
 *   · 폭풍(유라굴로): 위로 걷힌다 — 구름이 물러가듯
 *   · 광야·기근: 조용히 옅어진다 — 이 자리들의 mood(wilderness)와 같은 결
 * 애니메이션이 끝나면 DOM에서 사라진다(밑의 인장·축하와 겹치지 않게).
 * reduced-motion이면 갈라짐 없이 짧은 페이드만 남는다(전정 안전 — 이동 금지).
 *
 * 부모(key=moment.key)가 리마운트를 관장한다 — 페이저로 되돌아오면 다시 한 번 걷힌다
 * (인장 스프링도 같은 규칙으로 다시 튄다). */
export default function AdversaryVictory({ advId, kind }: { advId: string; kind: AdversaryKind }) {
  const art = adversaryArt(advId)
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [gone, setGone] = useState(false)
  useEffect(() => {
    // 대치를 잠깐(0.7초) 보여준 뒤 걷어낸다 — 무엇이 막았었는지 모르면 걷히는 것도 없다
    const t1 = setTimeout(() => setOpen(true), reduce ? 60 : 700)
    const t2 = setTimeout(() => setGone(true), reduce ? 900 : 2600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  if (!art || gone) return null

  const parted = kind === 'sea' || kind === 'threat'
  const ease = 'cubic-bezier(0.55, 0, 0.25, 1)'
  const move = reduce ? 'opacity 0.7s ease' : `transform 1.7s ${ease}, opacity 1.7s ease`

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {parted && !reduce ? (
        <>
          {/* 좌우 반쪽 — 반쪽 안에 전체 폭 그림을 넣어 한 장의 cover처럼 이어 보이게 한다 */}
          <div
            className="absolute inset-y-0 left-0 w-1/2 overflow-hidden"
            style={{ transform: open ? 'translateX(-104%)' : 'none', transition: move }}
          >
            <img src={art} alt="" className="absolute left-0 top-0 h-full w-[200%] max-w-none object-cover" />
          </div>
          <div
            className="absolute inset-y-0 right-0 w-1/2 overflow-hidden"
            style={{ transform: open ? 'translateX(104%)' : 'none', transition: move }}
          >
            <img src={art} alt="" className="absolute top-0 h-full w-[200%] max-w-none object-cover" style={{ left: '-100%' }} />
          </div>
          {/* 갈라지는 틈의 빛 — 종이색 한 줄이 벌어지며 사라진다 */}
          {open && <div className="adv-seam absolute inset-y-0 left-1/2 w-[4px] -translate-x-1/2" />}
        </>
      ) : (
        <img
          src={art}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            transform: open && !reduce && kind === 'storm' ? 'translateY(-14%) scale(1.04)' : 'none',
            opacity: open ? 0 : 1,
            transition: move,
          }}
        />
      )}
    </div>
  )
}
