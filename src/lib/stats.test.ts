import { describe, it, expect } from 'vitest'
import { currentStreak, retentionRate, heatmap, heatLevel, reviewsByDay } from './stats'
import { dayKey } from './date'
import type { ReviewLog } from '../db/schema'

const DAY = 24 * 60 * 60 * 1000
const NOW = new Date(2026, 5, 15, 12, 0, 0).getTime()

function review(reviewedAt: number, grade: string): ReviewLog {
  return { id: 0, cardId: 1, deckId: 1, grade, reviewedAt, dayKey: dayKey(reviewedAt) }
}

describe('reviewsByDay', () => {
  it('groups counts per calendar day', () => {
    const map = reviewsByDay([review(NOW, 'good'), review(NOW - 60_000, 'again'), review(NOW - DAY, 'good')])
    expect(map.get(dayKey(NOW))).toBe(2)
    expect(map.get(dayKey(NOW - DAY))).toBe(1)
  })
})

describe('currentStreak', () => {
  it('counts consecutive days ending today', () => {
    const reviews = [review(NOW, 'good'), review(NOW - DAY, 'good'), review(NOW - 2 * DAY, 'good')]
    expect(currentStreak(reviews, NOW)).toBe(3)
  })

  it('still counts a streak that ran up to yesterday', () => {
    const reviews = [review(NOW - DAY, 'good'), review(NOW - 2 * DAY, 'good')]
    expect(currentStreak(reviews, NOW)).toBe(2)
  })

  it('breaks the streak when a day is skipped', () => {
    const reviews = [review(NOW, 'good'), review(NOW - 2 * DAY, 'good')]
    expect(currentStreak(reviews, NOW)).toBe(1)
  })

  it('is zero with no reviews', () => {
    expect(currentStreak([], NOW)).toBe(0)
  })
})

describe('retentionRate', () => {
  it('is the percentage of good and easy grades', () => {
    const reviews = [review(NOW, 'good'), review(NOW, 'easy'), review(NOW, 'again'), review(NOW, 'hard')]
    expect(retentionRate(reviews)).toBe(50)
  })

  it('is zero with no reviews', () => {
    expect(retentionRate([])).toBe(0)
  })
})

describe('heatmap', () => {
  it('returns one cell per day for the window with counts filled in', () => {
    const cells = heatmap([review(NOW, 'good'), review(NOW, 'good')], NOW, 2)
    expect(cells).toHaveLength(14)
    expect(cells[cells.length - 1].count).toBe(2)
    expect(cells[0].count).toBe(0)
  })
})

describe('heatLevel', () => {
  it('maps counts to intensity buckets', () => {
    expect(heatLevel(0)).toBe(0)
    expect(heatLevel(3)).toBe(1)
    expect(heatLevel(10)).toBe(2)
    expect(heatLevel(20)).toBe(3)
    expect(heatLevel(40)).toBe(4)
  })
})
