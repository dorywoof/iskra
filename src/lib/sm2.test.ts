import { describe, it, expect } from 'vitest'
import { freshState, schedule, isDue, previewIntervals, DAY_MS, MIN_EASE } from './sm2'

const NOW = 1_700_000_000_000

describe('freshState', () => {
  it('starts due immediately with default ease', () => {
    const s = freshState(NOW)
    expect(s.easeFactor).toBe(2.5)
    expect(s.repetitions).toBe(0)
    expect(s.intervalDays).toBe(0)
    expect(isDue(s, NOW)).toBe(true)
  })
})

describe('schedule with "again"', () => {
  it('resets repetitions and reschedules within the same day', () => {
    const s = schedule(freshState(NOW), 'again', NOW)
    expect(s.repetitions).toBe(0)
    expect(s.intervalDays).toBe(0)
    expect(s.dueAt).toBeGreaterThan(NOW)
    expect(s.dueAt - NOW).toBeLessThan(DAY_MS)
  })

  it('never drops ease below the floor', () => {
    let s = freshState(NOW)
    for (let i = 0; i < 20; i++) {
      s = schedule(s, 'again', NOW)
    }
    expect(s.easeFactor).toBeGreaterThanOrEqual(MIN_EASE)
  })
})

describe('schedule growth on repeated "good"', () => {
  it('produces strictly increasing intervals across successful reviews', () => {
    let s = freshState(NOW)
    let now = NOW
    const intervals: number[] = []
    for (let i = 0; i < 5; i++) {
      s = schedule(s, 'good', now)
      intervals.push(s.intervalDays)
      now = s.dueAt
    }
    expect(intervals[0]).toBe(1)
    expect(intervals[1]).toBe(6)
    for (let i = 2; i < intervals.length; i++) {
      expect(intervals[i]).toBeGreaterThan(intervals[i - 1])
    }
  })

  it('raises ease factor when graded easy', () => {
    const s = schedule(freshState(NOW), 'easy', NOW)
    expect(s.easeFactor).toBeGreaterThan(2.5)
  })

  it('lowers ease factor when graded hard', () => {
    const s = schedule(freshState(NOW), 'hard', NOW)
    expect(s.easeFactor).toBeLessThan(2.5)
  })
})

describe('easy outpaces good outpaces hard', () => {
  it('orders the third-review intervals by grade', () => {
    let base = freshState(NOW)
    base = schedule(base, 'good', NOW)
    base = schedule(base, 'good', base.dueAt)
    const at = base.dueAt
    const hard = schedule(base, 'hard', at)
    const good = schedule(base, 'good', at)
    const easy = schedule(base, 'easy', at)
    expect(hard.intervalDays).toBeLessThan(good.intervalDays)
    expect(good.intervalDays).toBeLessThan(easy.intervalDays)
  })
})

describe('isDue', () => {
  it('is false before the due date and true at or after it', () => {
    const s = schedule(freshState(NOW), 'good', NOW)
    expect(isDue(s, NOW)).toBe(false)
    expect(isDue(s, s.dueAt)).toBe(true)
    expect(isDue(s, s.dueAt + 1)).toBe(true)
  })
})

describe('previewIntervals', () => {
  it('gives a label for every grade with easy the longest', () => {
    const preview = previewIntervals(freshState(NOW), NOW)
    expect(preview.again).toMatch(/мин|ч/)
    expect(preview.good).toContain('дн')
    expect(Object.keys(preview)).toEqual(['again', 'hard', 'good', 'easy'])
  })
})
