import type { SVGProps } from 'react'

/* THE WAY 커스텀 아이콘 — 손으로 그린 하우스 스타일(순례 모티프).
 * 문서 규칙: UI 아이콘은 AI 생성 금지, 라이브러리/직접 제작만. lucide 기본룩 회피.
 * 전부 stroke=currentColor, 24x24, round join. size/strokeWidth 조절 가능. */

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number
  strokeWidth?: number
}

function Svg({ size = 22, strokeWidth = 1.75, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden {...rest}
    >
      {children}
    </svg>
  )
}

/* 여정 — 구불구불한 순례길 + 자리 노드 */
export const IconPath = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20.5C7 20.5 7.5 13.5 11 12.5C14.5 11.5 14 5.5 19.5 4" />
    <circle cx="4" cy="20.5" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="11.4" cy="12.4" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="19.5" cy="4" r="1.6" />
  </Svg>
)

/* 수집 — 순례 인장(왁스 씰) + 리본 */
export const IconSeal = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="9.5" r="5.5" />
    <path d="M12 6.5L13 8.7L15.3 9L13.6 10.7L14 13L12 11.8L10 13L10.4 10.7L8.7 9L11 8.7Z" />
    <path d="M9 14.3L7.7 21L12 18.2L16.3 21L15 14.3" />
  </Svg>
)

/* 등불 — 러닝(THE LAMP) / 쉼터. 기름 등잔 + 불꽃 */
export const IconLamp = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 15.5C4.5 17.7 6.3 18.5 9 18.5H14.5C18 18.5 19.5 17 19.5 15C19.5 13.4 18.2 12.8 16.5 12.8H7C5.3 12.8 4.5 13.9 4.5 15.5Z" />
    <path d="M16.5 12.8C18.6 12 19 9.8 17.6 8.4C17.9 10 16.9 10.9 16.5 12.8Z" fill="currentColor" stroke="none" />
    <path d="M8 18.5L7 21M15 18.5L16 21" />
  </Svg>
)

/* 순례자 — 얼굴 없는 실루엣 + 지팡이(문서: faceless 기본값) */
export const IconPilgrim = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10.5" cy="5" r="2.3" />
    <path d="M6 20.5L10.5 8.5L15 20.5" />
    <path d="M18.5 3.5V20.5" />
  </Svg>
)

/* 품은 사람 — 빛을 감싼 두 손(중보기도) */
export const IconHeld = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="9" r="2.4" />
    <path d="M12 4.6V2.4M8.9 6.1L7.6 4.6M15.1 6.1L16.4 4.6" />
    <path d="M4.5 20.5C4.5 15 8 13.5 12 14.2M19.5 20.5C19.5 15 16 13.5 12 14.2" />
  </Svg>
)

/* 발자국 — 러닝 시작 */
export const IconStep = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9.5 3.5C7.4 3.5 6.7 8 7.4 11C7.9 13.2 9.2 13.8 10.4 13.2C11.8 12.5 11.9 9.5 11.6 7C11.3 4.6 11 3.5 9.5 3.5Z" />
    <path d="M15.3 14.5C13.9 14.6 13.6 17 14 18.9C14.3 20.3 15.2 20.7 16 20.3C16.9 19.8 17.1 18 16.9 16.6C16.7 15.2 16.3 14.4 15.3 14.5Z" />
  </Svg>
)

/* 돌무지(cairn) — 멈추기 / 자리 표석 */
export const IconCairn = (p: IconProps) => (
  <Svg {...p}>
    <ellipse cx="12" cy="18.5" rx="6" ry="2.4" />
    <ellipse cx="12" cy="13" rx="4.4" ry="2.1" />
    <ellipse cx="12" cy="8.2" rx="3" ry="1.8" />
    <ellipse cx="12" cy="4.4" rx="1.7" ry="1.4" />
  </Svg>
)

/* 두루마리 — 성구 */
export const IconScroll = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 4.5H17.5C18.3 4.5 19 5.2 19 6V18C19 19.4 17.9 20.5 16.5 20.5H7" />
    <path d="M7 4.5C5.6 4.5 4.5 5.6 4.5 7C4.5 8.4 5.6 9.5 7 9.5H8.5V6C8.5 5.2 7.8 4.5 7 4.5Z" />
    <path d="M11 9.5H16M11 13H16M11 16.5H14" />
  </Svg>
)

/* 불씨 — 순례 연속(스트릭) */
export const IconEmber = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3C13 6.5 16.5 7.5 16.5 12.5C16.5 15.8 14.5 18.5 12 18.5C9.5 18.5 7.5 15.8 7.5 12.5C7.5 10 9 9 9.5 7.5C10 9 11 9 12 8.5" />
    <path d="M12 18.5V21" />
  </Svg>
)

/* 물결 — 갈릴리/물 위 자리 */
export const IconWaves = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 8C5 6 7 6 9 8C11 10 13 10 15 8C17 6 19 6 21 8" />
    <path d="M3 13C5 11 7 11 9 13C11 15 13 15 15 13C17 11 19 11 21 13" />
    <path d="M3 18C5 16 7 16 9 18C11 20 13 20 15 18C17 16 19 16 21 18" />
  </Svg>
)

/* 산 — 산상수훈/변화산 자리 */
export const IconPeak = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 19.5L9 7L12.5 13L15 9L21 19.5Z" />
    <path d="M7.5 10L9 7L10.5 10" />
  </Svg>
)

/* 십자가 — 수난 자리(절제) */
export const IconCross = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5V20.5M7.5 8.5H16.5" />
  </Svg>
)

/* 화살 / 셰브론 */
export const IconArrow = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 12H19M13 6L19.5 12L13 18" />
  </Svg>
)
export const IconChevron = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 5.5L15.5 12L9 18.5" />
  </Svg>
)
export const IconChevronDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5.5 9L12 15.5L18.5 9" />
  </Svg>
)

/* 잠김 — 아직 안 열린 자리 */
export const IconLocked = (p: IconProps) => (
  <Svg {...p}>
    <rect x="5.5" y="10.5" width="13" height="9.5" rx="2" />
    <path d="M8.5 10.5V7.5C8.5 5.6 10 4 12 4C14 4 15.5 5.6 15.5 7.5V10.5" />
    <circle cx="12" cy="15" r="1.1" fill="currentColor" stroke="none" />
  </Svg>
)

/* 체크 — 닿은 자리 */
export const IconReached = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8 12.2L11 15L16 9" />
  </Svg>
)

/* 나침반 — 코스 선택 */
export const IconCompass = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M15.5 8.5L13 13L8.5 15.5L11 11Z" />
  </Svg>
)

/* 공유 */
export const IconShare = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 15V4M8.5 7L12 3.5L15.5 7" />
    <path d="M6 11H5.5C4.7 11 4 11.7 4 12.5V19C4 19.8 4.7 20.5 5.5 20.5H18.5C19.3 20.5 20 19.8 20 19V12.5C20 11.7 19.3 11 18.5 11H18" />
  </Svg>
)

/* 설정 */
export const IconSettings = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.5V5M12 19V21.5M21.5 12H19M5 12H2.5M18.7 5.3L17 7M7 17L5.3 18.7M18.7 18.7L17 17M7 7L5.3 5.3" />
  </Svg>
)

/* arc(자리 성격) → 대표 아이콘 */
export function arcIcon(arc: string) {
  switch (arc) {
    case 'miracle': return IconWaves
    case 'teach': return IconPeak
    case 'parable': return IconScroll
    case 'passion': return IconCross
    case 'rise': return IconEmber
    case 'send': return IconPath
    default: return IconPilgrim
  }
}

/* ── 기능 글리프 ────────────────────────────────────────────────────────────
 * 돌무지·인장·두루마리·등불처럼 이 앱만의 은유는 위쪽 커스텀 세트가 맡고,
 * 아래는 뜻이 이미 굳어진 순수 기능 아이콘이다(BUILD-SPECS B절의 iconify 폴백 방침).
 * 24 그리드·currentColor·round로 맞춰 한 세트로 보이게 정규화했다. */

/** 일시정지 — 러닝 화면에서 등불 아이콘을 쓰고 있었다(의미 불일치) */
export const IconPause = (p: IconProps) => (
  <Svg {...p}>
    <rect x="6" y="4" width="4" height="16" rx="1.2" />
    <rect x="14" y="4" width="4" height="16" rx="1.2" />
  </Svg>
)

/** 다시 시작 */
export const IconPlay = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 5.2a1.4 1.4 0 0 1 2.1-1.2l9.2 6.8a1.4 1.4 0 0 1 0 2.4L9.1 20a1.4 1.4 0 0 1-2.1-1.2Z" />
  </Svg>
)

/** 오디오 가이드런 */
export const IconHeadphones = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 14h2.2A1.8 1.8 0 0 1 8 15.8v3.4A1.8 1.8 0 0 1 6.2 21H5.5A1.5 1.5 0 0 1 4 19.5V13a8 8 0 0 1 16 0v6.5a1.5 1.5 0 0 1-1.5 1.5h-.7a1.8 1.8 0 0 1-1.8-1.8v-3.4A1.8 1.8 0 0 1 17.8 14H20" />
  </Svg>
)

/** 시간 — 러닝 지표 */
export const IconTime = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="13.5" r="7.5" />
    <path d="M9.8 2.8h4.4M12 9.6v4l2.4 2.4" />
  </Svg>
)

/** 스플릿(구간 기록) */
export const IconSplits = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 20.5v-5.2M12 20.5V4M19 20.5V9.6" />
  </Svg>
)

/** 카라반 — 함께 걷는 사람들 */
export const IconCaravan = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="7.2" r="3.4" />
    <path d="M2.6 20.6v-1.8A3.8 3.8 0 0 1 6.4 15h5.2a3.8 3.8 0 0 1 3.8 3.8v1.8" />
    <path d="M16.4 3.6a3.6 3.6 0 0 1 0 7M19 15.4a3.6 3.6 0 0 1 2.6 3.4v1.8" />
  </Svg>
)

/** 전례력 시즌 */
export const IconSeason = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.4" y="4.6" width="17.2" height="16" rx="2.2" />
    <path d="M8 2.8v3.6M16 2.8v3.6M3.4 10.2h17.2" />
  </Svg>
)
