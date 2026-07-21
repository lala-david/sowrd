import { useNav } from '../store'

/* THE REVEAL — 멈추면 열리는 장면. §7.10-11 사건 해금 · 묵상. tone: wonder(물 위) */
function RevealScene() {
  return (
    <svg viewBox="0 0 440 300" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FBF3E0" />
          <stop offset="0.55" stopColor="#F6ECD6" />
          <stop offset="1" stopColor="#EFE5CB" />
        </linearGradient>
        <radialGradient id="halo" cx="0.5" cy="0.4" r="0.5">
          <stop offset="0" stopColor="#F6D98A" stopOpacity="0.9" />
          <stop offset="0.42" stopColor="#E7C878" stopOpacity="0.4" />
          <stop offset="1" stopColor="#E7C878" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C4C8DB" />
          <stop offset="1" stopColor="#969CC0" />
        </linearGradient>
      </defs>
      <rect width="440" height="300" fill="url(#sky)" />
      <circle cx="220" cy="122" r="160" fill="url(#halo)" />
      <circle cx="220" cy="112" r="28" fill="#F7E6B4" />
      <rect y="198" width="440" height="102" fill="url(#water)" />
      <rect x="205" y="198" width="30" height="102" fill="#F7E6B4" opacity="0.32" />
      {/* faceless figure walking on water toward the light */}
      <g transform="translate(214,166)" fill="#2A2216">
        <ellipse cx="0" cy="0" rx="6.2" ry="7.2" />
        <path d="M-7,10 C-9,30 -5,46 0,52 C5,46 9,30 7,10 C4,15 -4,15 -7,10 Z" />
      </g>
      <ellipse cx="214" cy="220" rx="26" ry="6" fill="none" stroke="#2E3F8F" strokeOpacity="0.28" strokeWidth="1.2" />
      <ellipse cx="214" cy="226" rx="42" ry="8" fill="none" stroke="#2E3F8F" strokeOpacity="0.14" strokeWidth="1" />
    </svg>
  )
}

export default function Reveal() {
  const go = useNav((s) => s.go)
  return (
    <div className="relative flex flex-1 flex-col bg-paper text-ink">
      <div className="relative h-[46%] w-full overflow-hidden">
        <RevealScene />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24" style={{ background: 'linear-gradient(to top, var(--color-paper), transparent)' }} />
      </div>

      <div className="relative z-10 flex flex-1 flex-col px-8 pt-6" style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}>
        <p className="font-display text-[12px] uppercase tracking-[0.24em] text-gold-deep">여덟 번째 자리 · 닿았습니다</p>
        <h1 className="mt-2.5 font-serif text-[38px] font-bold leading-[1.1]">갈릴리 호숫가</h1>

        <p className="mt-6 max-w-[24ch] font-serif text-[19px] leading-[1.7] text-ink">
          <span className="versal">안</span>심하라, 나니 두려워 말라.
        </p>
        <p className="mt-2.5 font-display text-[12px] uppercase tracking-[0.22em] text-gold-deep">Matthew&nbsp;14:27</p>

        <p className="mt-6 max-w-[30ch] text-[14px] leading-relaxed text-ink-soft">무엇이 당신을 가라앉게 합니까? 다음 걸음에서 그 하나를 내려놓아 보세요.</p>

        <div className="flex-1" />

        <button onClick={() => go('home')} className="w-full rounded-2xl bg-lapis py-4 text-center font-serif text-[17px] text-paper-raised shadow-[0_1px_2px_rgba(38,53,115,.2),0_16px_36px_-18px_rgba(38,53,115,.5)] transition active:scale-[0.99]">
          계속 걷기
        </button>
      </div>
    </div>
  )
}
