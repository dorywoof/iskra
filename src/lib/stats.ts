import { dayKey, startOfDay } from './date'
import type { ReviewLog } from '../db/schema'

export interface HeatCell {
  key: string
  timestamp: number
  count: number
}

export function reviewsByDay(reviews: ReviewLog[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const review of reviews) {
    map.set(review.dayKey, (map.get(review.dayKey) ?? 0) + 1)
  }
  return map
}

export function currentStreak(reviews: ReviewLog[], now: number): number {
  if (reviews.length === 0) return 0
  const days = reviewsByDay(reviews)
  let streak = 0
  let cursor = startOfDay(now)
  const todayKey = dayKey(now)

  if (!days.has(todayKey)) {
    cursor -= 24 * 60 * 60 * 1000
  }

  while (days.has(dayKey(cursor))) {
    streak++
    cursor -= 24 * 60 * 60 * 1000
  }
  return streak
}

export function retentionRate(reviews: ReviewLog[]): number {
  if (reviews.length === 0) return 0
  const remembered = reviews.filter((r) => r.grade === 'good' || r.grade === 'easy').length
  return Math.round((remembered / reviews.length) * 100)
}

export function heatmap(reviews: ReviewLog[], now: number, weeks: number): HeatCell[] {
  const days = reviewsByDay(reviews)
  const cells: HeatCell[] = []
  const totalDays = weeks * 7
  const end = startOfDay(now)
  for (let i = totalDays - 1; i >= 0; i--) {
    const timestamp = end - i * 24 * 60 * 60 * 1000
    const key = dayKey(timestamp)
    cells.push({ key, timestamp, count: days.get(key) ?? 0 })
  }
  return cells
}

export function heatLevel(count: number): number {
  if (count === 0) return 0
  if (count < 5) return 1
  if (count < 12) return 2
  if (count < 25) return 3
  return 4
}
