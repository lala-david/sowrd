import { usePilgrim, type PilgrimState } from '../state/pilgrim'

/* ── 순례 기록의 생존 — 내보내기/가져오기 (D8) ────────────────────────────
 *
 * 기록은 localStorage 하나에 산다. 폰을 바꾸거나 브라우저 데이터를 지우면
 * 2년 걸은 길이 통째로 사라진다. 그런데 이 앱은 "좌표는 이 기기 밖으로 나가지
 * 않습니다"를 첫 화면에서 약속했으므로, 서버 백업은 답이 아니다.
 * 답은 **파일**이다 — 사용자가 손에 쥐는 JSON 하나. 어디에 둘지는 사용자가 정한다.
 *
 * 형식: { app, schema, exportedAt, state }. schema는 이 파일의 버전이고,
 * state 내부의 모양은 zustand persist(theway-pilgrim-v1)의 partialize와 같다 —
 * 가져올 때 persist의 migrate가 다시 돌 수 있도록 원형 그대로 담는다. */

export const BACKUP_SCHEMA = 1

/** 백업에 담는 키 — persist partialize와 같은 목록이어야 한다(pilgrim.ts) */
const KEYS = [
  'activeCourseId', 'activeJourneyId', 'journeyKm', 'journeyCompletedAt', 'intercessions',
  'units', 'progress', 'collectedVerses', 'collectedEpisodes', 'runs', 'lifetime',
  'lastRunDay', 'admin', 'breathPrayer', 'homeCompact', 'traceRoute', 'textScale',
  'theme', 'avatar', 'voiceCue', 'autoPause', 'seenIntro',
] as const

export function buildBackup(): string {
  const s = usePilgrim.getState() as unknown as Record<string, unknown>
  const state: Record<string, unknown> = {}
  for (const k of KEYS) if (s[k] !== undefined) state[k] = s[k]
  return JSON.stringify({ app: 'the-way', schema: BACKUP_SCHEMA, exportedAt: new Date().toISOString(), state })
}

/** 파일 이름 — 사람이 폴더에서 알아볼 수 있게 날짜를 박는다 */
export function backupFilename(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `theway-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}.json`
}

/** 가져오기 결과 — 실패 이유를 사람 말로 돌려준다(alert는 호출부가) */
export type RestoreResult = { ok: true; runs: number; km: number } | { ok: false; why: string }

export function restoreBackup(text: string): RestoreResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, why: 'JSON 파일이 아니에요' }
  }
  const doc = parsed as { app?: string; schema?: number; state?: Record<string, unknown> }
  if (doc?.app !== 'the-way' || !doc.state) return { ok: false, why: 'THE WAY 백업 파일이 아니에요' }
  if ((doc.schema ?? 0) > BACKUP_SCHEMA) return { ok: false, why: '더 새 버전의 백업이에요 — 앱을 업데이트한 뒤 가져오세요' }

  /* 아는 키만 골라 담는다 — 낯선 키를 그대로 흘려 넣으면 미래의 상태 모양을 오염시킨다 */
  const next: Record<string, unknown> = {}
  for (const k of KEYS) if (doc.state[k] !== undefined) next[k] = doc.state[k]
  /* 핵심 형태만 검사한다 — 전부 검사하려 들면 스키마가 바뀔 때마다 여기가 거짓말을 한다 */
  if (next.journeyKm && typeof next.journeyKm !== 'object') return { ok: false, why: '기록 형식이 손상됐어요' }
  if (next.runs && !Array.isArray(next.runs)) return { ok: false, why: '기록 형식이 손상됐어요' }

  usePilgrim.setState(next as Partial<PilgrimState>)
  const lt = (next.lifetime ?? {}) as { runs?: number; km?: number }
  return { ok: true, runs: lt.runs ?? (Array.isArray(next.runs) ? next.runs.length : 0), km: Math.round((lt.km ?? 0) * 10) / 10 }
}

/** 브라우저 다운로드로 파일을 건넨다 */
export function downloadBackup(): void {
  const blob = new Blob([buildBackup()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = backupFilename()
  a.click()
  URL.revokeObjectURL(url)
}
