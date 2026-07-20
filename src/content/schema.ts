import { z } from 'zod'

/**
 * 콘텐츠 = 데이터 원칙 (GDD §10)
 * 엔진(거의 안 바뀜)과 콘텐츠(계속 바뀜)를 분리한다.
 * 새 에피소드 = 데이터 + (추후) .ink 파일 드롭인. 엔진 수정 0.
 */

/** 미니게임 동사 5종 — 다양성이 지루함을 이긴다 (GDD §7) */
export const VerbSchema = z.enum(['퍼즐', '물류', '리듬', '균형', '추리'])
export type Verb = z.infer<typeof VerbSchema>

export const EpisodeSchema = z.object({
  id: z.string(),
  no: z.number().int().min(1),
  title: z.string(),
  subtitle: z.string(),
  verb: VerbSchema,
  /** 성경 본문 출처 (4정경 복음서만 — 신학 가이드라인) */
  verseRef: z.string(),
  /** 클리어 시 합류하는 동료 id 목록 */
  companions: z.array(z.string()),
  /** 수직 슬라이스: 플레이 가능 여부 */
  playable: z.boolean(),
})
export type Episode = z.infer<typeof EpisodeSchema>

export const CompanionSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  desc: z.string(),
  skill: z.string(),
  /** 카드 오브 색 계열 */
  tone: z.enum(['lamp', 'blue', 'rose', 'green']),
})
export type Companion = z.infer<typeof CompanionSchema>

export const EpisodeListSchema = z.array(EpisodeSchema)
export const CompanionListSchema = z.array(CompanionSchema)
