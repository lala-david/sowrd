import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

/* 시네마틱 플레이어 — 자리 영상·전시실 공용.
 *
 * 네이티브 controls를 쓰지 않는다 — 브라우저 기본 컨트롤 바가 양피지 위의 이물질이었다.
 * 대신:
 *   · 화면에 절반 이상 보이면 **자동 재생**(무음·루프 — 살아 있는 그림처럼), 벗어나면 멈춤
 *   · 탭 = 일시정지/재생. 멈춰 있을 때만 재생 단추가 뜬다(motion 스프링 + 숨쉬는 링)
 *   · prefers-reduced-motion이면 자동 재생하지 않는다 — 포스터와 단추만(움직임은 선택)
 * 데이터: preload="metadata" — 보이기 전엔 본편을 받지 않는다. 무음이라 모바일
 * 자동재생 정책에도 안전하다. */
export default function FilmPlayer({
  src,
  poster,
  className = '',
  ratio = '1 / 1',
}: {
  src: string
  poster?: string
  className?: string
  ratio?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    const v = ref.current
    if (!v || reduce) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && e.intersectionRatio >= 0.5) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: [0, 0.5, 1] },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [reduce])

  const toggle = () => {
    const v = ref.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`relative block w-full overflow-hidden rounded-2xl ring-1 ring-line ${className}`}
      style={{ aspectRatio: ratio, background: '#191108' }}
      aria-label={playing ? '영상 일시정지' : '영상 재생'}
    >
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        muted
        loop
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {/* 재생 단추 — 멈춰 있을 때만. 종이 링이 숨쉬고, 점토색 삼각이 그 안에 */}
      <AnimatePresence>
        {!playing && (
          <motion.span
            key="play"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <span
              className="film-play flex h-16 w-16 items-center justify-center rounded-full backdrop-blur-[2px]"
              style={{ background: 'rgba(25,17,8,0.5)', boxShadow: 'inset 0 0 0 2px rgba(255,246,226,0.85), 0 8px 24px -8px rgba(0,0,0,0.5)' }}
            >
              <svg width="22" height="24" viewBox="0 0 22 24" aria-hidden>
                <path d="M3 2.5c0-1.2 1.3-1.9 2.3-1.3l15 9.5c.9.6.9 2 0 2.6l-15 9.5c-1 .6-2.3-.1-2.3-1.3V2.5z" fill="#d0552a" stroke="#fff6e2" strokeWidth="1.2" />
              </svg>
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
