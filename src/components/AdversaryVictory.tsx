import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import type { Adversary } from '../data/adversaries'
import { adversaryArt } from '../assets/art'
import AdvTurbulence, { turbulenceFor } from './AdvTurbulence'

/* 승리의 순간 — 컷 편집 시퀀스. 대치가 걷히며 그 자리의 그림이 드러난다.
 *
 * 컷 1 (0–1.3s): 대치 그림 풀프레임 — kind의 숨(비·일렁임·등불, adv-fx-*)이 붙고
 *   느린 줌이 걸리며, 아래에 대적의 이름이 자막으로 선다. 무엇이 막았는지 먼저 본다.
 * 비트 (1.3s): 폭풍은 마지막 번개가 치고(advFlashOnce), 바다·문은 틈의 빛이 선다.
 * 컷 2 (1.3–3.2s): 걷힘 —
 *   · 바다(홍해)·위협(닫힌 문): 한가운데가 갈라지며 좌우로 물러난다 — 출 14:21, 행 12:10
 *   · 폭풍(유라굴로): 위로 걷힌다 — 구름이 물러가듯
 *   · 광야·기근: 조용히 옅어진다 — 이 자리들의 mood(wilderness)와 같은 결
 * 밑그림(승리 — 갈라진 홍해)은 리빌의 히어로 img가 이미 그리고 있다. 여기는 오버레이만.
 * 끝나면 DOM에서 사라진다(밑의 인장·축하와 겹치지 않게).
 * reduced-motion이면 이동·줌·번개 없이 짧은 페이드만 남는다(전정 안전).
 *
 * 부모(key=moment.key)가 리마운트를 관장한다 — 페이저로 되돌아오면 다시 한 번 걷힌다
 * (인장 스프링도 같은 규칙으로 다시 튄다). */
export default function AdversaryVictory({ adv }: { adv: Adversary }) {
  const art = adversaryArt(adv.id)
  const reduce = useReducedMotion()
  const [phase, setPhase] = useState<'hold' | 'open' | 'gone'>('hold')
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('open'), reduce ? 80 : 1300)
    const t2 = setTimeout(() => setPhase('gone'), reduce ? 1100 : 3800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  if (!art || phase === 'gone') return null

  const open = phase === 'open'
  const parted = (adv.kind === 'sea' || adv.kind === 'threat') && !reduce
  const ease = 'cubic-bezier(0.55, 0, 0.25, 1)'
  const move = reduce ? 'opacity 0.8s ease' : `transform 1.9s ${ease}, opacity 1.9s ease`

  /* 변위 필터 — 대치를 붙잡고 있는 동안 그림 자체가 일렁인다. 걷히기 시작하면 뗀다
     (갈라지는 이동에 왜곡까지 겹치면 소음이고, 필터 없는 쪽이 트랜지션도 가볍다). */
  const warp = reduce || open ? undefined : turbulenceFor(adv.kind)

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <AdvTurbulence />
      {parted ? (
        <>
          {/* 좌우 반쪽 — 반쪽 안에 전체 폭 그림을 넣어 한 장의 cover처럼 이어 보이게 한다 */}
          <div
            className="absolute inset-y-0 left-0 w-1/2 overflow-hidden"
            style={{ transform: open ? 'translateX(-104%)' : 'none', transition: move }}
          >
            <img src={art} alt="" className="absolute left-0 top-0 h-full w-[200%] max-w-none object-cover" style={{ filter: warp }} />
          </div>
          <div
            className="absolute inset-y-0 right-0 w-1/2 overflow-hidden"
            style={{ transform: open ? 'translateX(104%)' : 'none', transition: move }}
          >
            <img src={art} alt="" className="absolute top-0 h-full w-[200%] max-w-none object-cover" style={{ left: '-100%', filter: warp }} />
          </div>
        </>
      ) : (
        <img
          src={art}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover ${reduce ? '' : 'adv-holdimg'}`}
          style={{
            transform: open && !reduce && adv.kind === 'storm' ? 'translateY(-14%) scale(1.1)' : undefined,
            opacity: open ? 0 : 1,
            transition: move,
            filter: warp,
          }}
        />
      )}
      {/* kind의 숨 — 대치를 붙잡고 있는 동안만. 걷히기 시작하면 함께 스러진다 */}
      {!reduce && (
        <div className={`adv-fx adv-fx-${adv.kind}`} style={{ opacity: open ? 0 : 1, transition: 'opacity 0.6s ease' }} />
      )}
      {/* 자막 — 무엇이 막았었는지. 걷히면서 함께 사라진다. 색은 그림 위 고정 잉크 */}
      <div
        className="absolute inset-x-0 bottom-0 px-5 pb-4 pt-10"
        style={{
          background: 'linear-gradient(to top, rgba(12,9,4,0.62), transparent)',
          opacity: open ? 0 : 1,
          transition: 'opacity 0.5s ease',
        }}
      >
        <p className="font-serif text-[17px] leading-tight" style={{ color: '#f0e6d4' }}>{adv.name}</p>
        <p className="mt-0.5 text-[11px]" style={{ color: '#d8c9ae' }}>{adv.title}</p>
      </div>
      {/* 비트 — 폭풍의 마지막 번개 / 갈라지는 틈의 빛 */}
      {open && !reduce && adv.kind === 'storm' && <div className="adv-flash-once absolute inset-0" />}
      {open && parted && <div className="adv-seam absolute inset-y-0 left-1/2 w-[4px] -translate-x-1/2" />}
    </div>
  )
}
