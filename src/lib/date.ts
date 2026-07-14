export function dayKey(timestamp: number): string {
  const d = new Date(timestamp)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function startOfDay(timestamp: number): number {
  const d = new Date(timestamp)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function addDays(timestamp: number, days: number): number {
  return timestamp + days * 24 * 60 * 60 * 1000
}

export function daysBetween(a: number, b: number): number {
  return Math.round((startOfDay(b) - startOfDay(a)) / (24 * 60 * 60 * 1000))
}

export function relativeDue(dueAt: number, now: number): string {
  const diff = dueAt - now
  if (diff <= 0) return 'сейчас'
  const days = Math.ceil(diff / (24 * 60 * 60 * 1000))
  if (days === 1) return 'завтра'
  if (days < 30) return `через ${days} дн`
  if (days < 365) return `через ${Math.round(days / 30)} мес`
  return `через ${(days / 365).toFixed(1)} г`
}
