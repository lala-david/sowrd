import { useEffect } from 'react'
import { useReducedMotion } from 'motion/react'

/* 대적 그림을 실제로 일렁이게 하는 SVG 변위 필터.
 *
 * 지금까지의 연출(오버레이 그라데이션의 명멸)은 그림 "위"의 숨이었다. 이 필터는
 * 그림 "자체"를 굴절시킨다 — feTurbulence 노이즈로 feDisplacementMap을 밀면
 * 바다 그림의 픽셀이 물결치고, 광야 그림의 공기가 아지랑이로 왜곡된다.
 * 영상 파일 없이 영상의 질감을 내는 가장 싼 길이다(추가 에셋 0).
 *
 * 구현 노트:
 *  · defs는 문서에 **한 벌만** DOM으로 주입한다(마운트 참조 카운트). JSX로 각 배너가
 *    렌더하면 같은 id의 defs가 5벌 생긴다.
 *  · 애니메이션은 SMIL이 아니라 setInterval(24fps)로 baseFrequency를 민다 —
 *    SMIL의 필터 속성 애니메이션은 WebKit에서 신뢰할 수 없다(추측에 기대지 않는다).
 *  · reduced-motion이면 아무것도 안 한다 — 왜곡은 '움직임'이다(전정 안전).
 *
 * 쓰는 쪽: <img style={{ filter: turbulenceFor(kind) }}>. 문(위협)은 돌이라 흔들지
 * 않는다 — 거기서 움직이는 것은 등불뿐이다. */

let refs = 0
let timer: ReturnType<typeof setInterval> | undefined
let host: SVGSVGElement | undefined

const DEFS =
  '<defs>' +
  '<filter id="adv-water" x="-5%" y="-5%" width="110%" height="110%">' +
  '<feTurbulence id="adv-water-noise" type="fractalNoise" baseFrequency="0.012 0.05" numOctaves="2" seed="7" result="n"/>' +
  '<feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G"/>' +
  '</filter>' +
  '<filter id="adv-heat" x="-5%" y="-5%" width="110%" height="110%">' +
  '<feTurbulence id="adv-heat-noise" type="fractalNoise" baseFrequency="0.008 0.09" numOctaves="2" seed="3" result="n"/>' +
  '<feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/>' +
  '</filter>' +
  '</defs>'

function start() {
  host = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  host.setAttribute('width', '0')
  host.setAttribute('height', '0')
  host.setAttribute('aria-hidden', 'true')
  host.style.position = 'absolute'
  host.innerHTML = DEFS
  document.body.appendChild(host)
  const t0 = performance.now()
  timer = setInterval(() => {
    const s = (performance.now() - t0) / 1000
    const water = document.getElementById('adv-water-noise')
    const heat = document.getElementById('adv-heat-noise')
    if (water) water.setAttribute('baseFrequency', `${0.012 + 0.004 * Math.sin(s * 0.7)} ${0.05 + 0.012 * Math.sin(s * 0.9 + 1)}`)
    if (heat) heat.setAttribute('baseFrequency', `${0.008 + 0.002 * Math.sin(s * 0.5)} ${0.09 + 0.02 * Math.sin(s * 1.1)}`)
  }, 42)
}

function stop() {
  if (timer) clearInterval(timer)
  timer = undefined
  host?.remove()
  host = undefined
}

export default function AdvTurbulence() {
  const reduce = useReducedMotion()
  useEffect(() => {
    if (reduce) return
    refs++
    if (refs === 1) start()
    return () => {
      refs--
      if (refs === 0) stop()
    }
  }, [reduce])
  return null
}

/** kind → 그림에 걸 변위 필터 */
export const turbulenceFor = (kind: string): string | undefined =>
  kind === 'sea' || kind === 'storm' ? 'url(#adv-water)' : kind === 'wilderness' || kind === 'famine' ? 'url(#adv-heat)' : undefined
