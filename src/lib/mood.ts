import type { Mood } from '../data/journey'

/* mood 톤 시스템 — 문서의 6종 프리셋을 색·라벨·메커닉 on/off로.
 * 신학적 강제(취향 아님): lament는 축하/거리목표/배지 UI를 끈다. wilderness는 축하만 억제. */

export interface MoodTone {
  label: string // 한글 톤 이름
  accent: string // CSS var 색(악센트)
  glow: string // 러닝/리빌 라디얼 글로우 rgba
  celebrate: boolean // 축하 연출 허용
  gamified: boolean // 배지·거리목표 등 게임요소 허용
}

export const MOODS: Record<Mood, MoodTone> = {
  everyday: { label: '일상', accent: 'var(--color-clay)', glow: 'rgba(192,90,48,.16)', celebrate: true, gamified: true },
  wilderness: { label: '광야', accent: 'var(--color-olive-deep)', glow: 'rgba(133,124,107,.14)', celebrate: false, gamified: true },
  wonder: { label: '경이', accent: 'var(--color-sun)', glow: 'rgba(236,192,105,.20)', celebrate: true, gamified: true },
  compassion: { label: '긍휼', accent: 'var(--color-clay-bright)', glow: 'rgba(221,119,72,.17)', celebrate: true, gamified: true },
  lament: { label: '애통', accent: 'var(--color-muted)', glow: 'rgba(120,110,95,.10)', celebrate: false, gamified: false },
  joy: { label: '기쁨', accent: 'var(--color-sun-bright)', glow: 'rgba(240,195,104,.24)', celebrate: true, gamified: true },
}

export const toneOf = (mood: Mood): MoodTone => MOODS[mood]
