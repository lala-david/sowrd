import type { Adversary } from '../data/adversaries'
import { adversaryArt } from '../assets/art'

/* 대치(對峙) 배너 — 막아선 것의 이름과 얼굴.
 *
 * 그림은 정지화가 아니다: kind마다 그 위협의 숨이 붙는다(index.css의 adv-fx-*) —
 * 바다는 일렁이고, 폭풍은 비가 내리치고 이따금 번쩍이고, 등불은 흔들리고,
 * 광야는 아지랑이가 오르고, 기근은 먼지가 흐른다. 전부 CSS라 비용은 0에 가깝고
 * prefers-reduced-motion이면 전역 규칙이 통째로 끈다(움직임 제거).
 *
 * 러닝 화면(다크 고정)과 dev 미리보기가 같이 쓴다. 그림이 없으면 이름만 남는다. */
export default function AdversaryBanner({ adv, className = '' }: { adv: Adversary; className?: string }) {
  const art = adversaryArt(adv.id)
  return (
    <div className={`adv-live relative h-14 overflow-hidden rounded-xl ring-1 ring-line-strong ${className}`}>
      {art && <img src={art} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />}
      <div className={`adv-fx adv-fx-${adv.kind}`} aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      <div className="absolute inset-y-0 left-3 flex flex-col justify-center">
        <p className="font-serif text-[15px] leading-tight text-ink">{adv.name}</p>
        <p className="mt-0.5 text-[10.5px] text-muted">{adv.title}</p>
      </div>
    </div>
  )
}
