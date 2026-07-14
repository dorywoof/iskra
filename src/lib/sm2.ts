export type Grade = 'again' | 'hard' | 'good' | 'easy'

export interface SchedulingState {
  easeFactor: number
  intervalDays: number
  repetitions: number
  dueAt: number
  lastReviewedAt: number | null
}

export const DAY_MS = 24 * 60 * 60 * 1000

export const MIN_EASE = 1.3

export function freshState(now: number): SchedulingState {
  return {
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    dueAt: now,
    lastReviewedAt: null
  }
}

const gradeQuality: Record<Grade, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5
}

function nextEase(current: number, grade: Grade): number {
  const q = gradeQuality[grade]
  const updated = current + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  return Math.max(MIN_EASE, Number(updated.toFixed(4)))
}

export function schedule(state: SchedulingState, grade: Grade, now: number): SchedulingState {
  if (grade === 'again') {
    return {
      easeFactor: nextEase(state.easeFactor, grade),
      intervalDays: 0,
      repetitions: 0,
      dueAt: now + 10 * 60 * 1000,
      lastReviewedAt: now
    }
  }

  const ease = nextEase(state.easeFactor, grade)
  const repetitions = state.repetitions + 1

  let intervalDays: number
  if (repetitions === 1) {
    intervalDays = grade === 'hard' ? 1 : grade === 'easy' ? 4 : 1
  } else if (repetitions === 2) {
    intervalDays = grade === 'hard' ? 4 : grade === 'easy' ? 8 : 6
  } else {
    const previous = Math.max(1, state.intervalDays)
    const multiplier = grade === 'hard' ? 1.2 : grade === 'easy' ? ease * 1.3 : ease
    intervalDays = Math.round(previous * multiplier)
  }

  intervalDays = Math.max(1, intervalDays)

  return {
    easeFactor: ease,
    intervalDays,
    repetitions,
    dueAt: now + intervalDays * DAY_MS,
    lastReviewedAt: now
  }
}

export function isDue(state: SchedulingState, now: number): boolean {
  return state.dueAt <= now
}

export function previewIntervals(state: SchedulingState, now: number): Record<Grade, string> {
  const format = (next: SchedulingState): string => {
    const delta = next.dueAt - now
    if (delta < DAY_MS) {
      const minutes = Math.round(delta / (60 * 1000))
      if (minutes < 60) return `${Math.max(1, minutes)} мин`
      return `${Math.round(minutes / 60)} ч`
    }
    const days = Math.round(delta / DAY_MS)
    if (days < 30) return `${days} дн`
    if (days < 365) return `${Math.round(days / 30)} мес`
    return `${(days / 365).toFixed(1)} г`
  }

  return {
    again: format(schedule(state, 'again', now)),
    hard: format(schedule(state, 'hard', now)),
    good: format(schedule(state, 'good', now)),
    easy: format(schedule(state, 'easy', now))
  }
}
