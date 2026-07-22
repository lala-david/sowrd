import { create } from 'zustand'
import type { PassageSlug } from '../data/journey'
import { courseById, STATIONS } from '../data/journey'
import { paceSecPerKm } from '../lib/format'
import { usePilgrim, progressFor, type RunRecord } from './pilgrim'

/* ── 러닝 세션(트랜지언트, 미영속) ───────────────────────────────────────
 * 프로토타입: 실제 GPS 대신 시뮬레이션으로 거리를 누적한다.
 * tick(dt, paceSecPerKm)이 유일한 거리 소스 — 실 GPS 연동 시 이 지점만 교체.
 * cumulative = 코스 시작 누적거리 + 이번 세션 거리 → 자리 통과 판정. */

export type RunStatus = 'idle' | 'running' | 'paused' | 'finished'
export type RunMode = 'free' | 'goalDistance' | 'goalTime' | 'guided'

export const RUN_MODES: { id: RunMode; label: string; hint: string }[] = [
  { id: 'guided', label: '순례 구간', hint: '다음 자리를 향해' },
  { id: 'free', label: '자유 러닝', hint: '거리만 담아' },
  { id: 'goalDistance', label: '목표 거리', hint: '정한 만큼' },
  { id: 'goalTime', label: '목표 시간', hint: '정한 동안' },
]

interface RunState {
  status: RunStatus
  mode: RunMode
  courseId: string
  startKm: number // 코스 시작 시점의 누적거리
  distanceKm: number // 이번 세션 거리
  elapsedSec: number
  goalKm?: number
  goalSec?: number
  prayerFor?: string
  reachedThisRun: PassageSlug[]
  lastReached?: PassageSlug // 방금 통과한 자리(플래시용)
  flashAt: number // 플래시 타임스탬프
  splits: number[] // km 경계별 누적초 → 구간초
  _lastKmMark: number
  _splitStartSec: number
  // actions
  configure: (opts: { mode: RunMode; courseId: string; goalKm?: number; goalSec?: number; prayerFor?: string }) => void
  start: () => void
  tick: (dtSec: number, curPaceSecPerKm: number) => void
  pause: () => void
  resume: () => void
  clearFlash: () => void
  finish: () => RunRecord | undefined
  reset: () => void
}

export const useRun = create<RunState>((set, get) => ({
  status: 'idle',
  mode: 'guided',
  courseId: 'galilee',
  startKm: 0,
  distanceKm: 0,
  elapsedSec: 0,
  reachedThisRun: [],
  flashAt: 0,
  splits: [],
  _lastKmMark: 0,
  _splitStartSec: 0,

  configure: ({ mode, courseId, goalKm, goalSec, prayerFor }) => {
    const startKm = progressFor(usePilgrim.getState(), courseId).cumulativeKm
    set({
      status: 'idle', mode, courseId, goalKm, goalSec, prayerFor,
      startKm, distanceKm: 0, elapsedSec: 0, reachedThisRun: [], lastReached: undefined,
      flashAt: 0, splits: [], _lastKmMark: 0, _splitStartSec: 0,
    })
  },

  start: () => set({ status: 'running' }),

  tick: (dtSec, curPaceSecPerKm) => {
    const st = get()
    if (st.status !== 'running') return
    const dKm = curPaceSecPerKm > 0 ? dtSec / curPaceSecPerKm : 0
    const distanceKm = st.distanceKm + dKm
    const elapsedSec = st.elapsedSec + dtSec

    // km 경계 스플릿 기록
    let { _lastKmMark, _splitStartSec, splits } = st
    if (Math.floor(distanceKm) > _lastKmMark) {
      _lastKmMark = Math.floor(distanceKm)
      splits = [...splits, Math.round(elapsedSec - _splitStartSec)]
      _splitStartSec = elapsedSec
    }

    // 자리 통과 판정
    const course = courseById(st.courseId)
    const cumulative = st.startKm + distanceKm
    const already = new Set([...progressFor(usePilgrim.getState(), st.courseId).reached, ...st.reachedThisRun])
    let reachedThisRun = st.reachedThisRun
    let lastReached = st.lastReached
    let flashAt = st.flashAt
    if (course) {
      for (const cs of course.stations) {
        if (cumulative >= cs.at && !already.has(cs.id)) {
          reachedThisRun = [...reachedThisRun, cs.id]
          lastReached = cs.id
          flashAt = elapsedSec
          already.add(cs.id)
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try { navigator.vibrate([40, 60, 120]) } catch { /* noop */ }
          }
        }
      }
    }

    // 목표 도달 시 자동 종료 준비(finished는 사용자가 멈출 때)
    set({ distanceKm, elapsedSec, splits, _lastKmMark, _splitStartSec, reachedThisRun, lastReached, flashAt })
  },

  pause: () => set({ status: 'paused' }),
  resume: () => set({ status: 'running' }),
  clearFlash: () => set({ flashAt: 0 }),

  finish: () => {
    const st = get()
    if (st.distanceKm <= 0) {
      set({ status: 'finished' })
      return undefined
    }
    const course = courseById(st.courseId)
    const endedAt = Date.now()
    const avg = paceSecPerKm(st.distanceKm, st.elapsedSec)
    const primaryMood = st.lastReached ? STATIONS[st.lastReached].mood : 'everyday'
    const record: RunRecord = {
      id: 'run-' + endedAt,
      courseId: st.courseId,
      courseName: course?.name ?? '순례',
      startedAt: endedAt - st.elapsedSec * 1000,
      endedAt,
      distanceKm: st.distanceKm,
      durationSec: Math.round(st.elapsedSec),
      avgPaceSecPerKm: avg,
      splits: st.splits.length ? st.splits : [Math.round(st.elapsedSec)],
      reached: st.reachedThisRun,
      prayerFor: st.prayerFor,
      mood: primaryMood,
    }
    usePilgrim.getState().commitRun(record)
    set({ status: 'finished' })
    return record
  },

  reset: () => set({
    status: 'idle', distanceKm: 0, elapsedSec: 0, reachedThisRun: [], lastReached: undefined,
    flashAt: 0, splits: [], _lastKmMark: 0, _splitStartSec: 0,
  }),
}))
