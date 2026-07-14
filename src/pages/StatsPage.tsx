import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/schema'
import { currentStreak, retentionRate, heatmap, heatLevel } from '../lib/stats'
import { dayKey } from '../lib/date'

const heatColors = ['rgba(23,20,15,0.06)', '#e7cfa0', '#d8a24a', '#d8402f', '#b32a1c']
const heatColorsDark = ['rgba(242,235,221,0.07)', '#5a4a2a', '#9a6d17', '#c8912b', '#d8402f']

function useIsDark(): boolean {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
}

export function StatsPage() {
  const reviews = useLiveQuery(() => db.reviews.toArray(), [])
  const cards = useLiveQuery(() => db.cards.toArray(), [])
  const decks = useLiveQuery(() => db.decks.toArray(), [])
  const dark = useIsDark()

  const now = Date.now()

  const stats = useMemo(() => {
    const list = reviews ?? []
    const allCards = cards ?? []
    const today = dayKey(now)
    const reviewedToday = list.filter((r) => r.dayKey === today).length
    const dueToday = allCards.filter((c) => c.dueAt <= now).length
    return {
      streak: currentStreak(list, now),
      retention: retentionRate(list),
      total: allCards.length,
      dueToday,
      reviewedToday,
      totalReviews: list.length
    }
  }, [reviews, cards, now])

  const cells = useMemo(() => heatmap(reviews ?? [], now, 26), [reviews, now])
  const palette = dark ? heatColorsDark : heatColors

  if (reviews === undefined || cards === undefined || decks === undefined) {
    return <p className="font-body text-lg text-ink-soft dark:text-cream-soft">Загрузка…</p>
  }

  const tiles = [
    { label: 'К повтору сегодня', value: stats.dueToday, accent: '#D8402F' },
    { label: 'Серия дней', value: stats.streak, accent: '#C8912B' },
    { label: 'Всего карточек', value: stats.total, accent: '#3B6B4A' },
    { label: 'Удержание', value: `${stats.retention}%`, accent: '#2F5F8A' }
  ]

  return (
    <div>
      <div className="border-b-2 border-ink pb-6 dark:border-cream/60">
        <h1 className="font-display text-3xl font-black uppercase leading-none text-ink sm:text-4xl dark:text-cream">
          Статистика
        </h1>
        <p className="mt-2 font-grotesk text-xs uppercase tracking-widest text-ink-soft dark:text-cream-soft">
          Сегодня повторено: {stats.reviewedToday} · всего повторов: {stats.totalReviews}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="border-2 border-ink bg-paper px-4 py-5 dark:border-cream/60 dark:bg-night-2">
            <div className="h-1 w-8" style={{ background: tile.accent }} />
            <div className="mt-3 font-display text-4xl font-black leading-none text-ink dark:text-cream">{tile.value}</div>
            <div className="mt-2 font-grotesk text-[0.65rem] uppercase tracking-widest text-ink-soft dark:text-cream-soft">
              {tile.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-2 border-ink bg-paper p-5 dark:border-cream/60 dark:bg-night-2">
        <h2 className="font-grotesk text-xs font-bold uppercase tracking-widest text-ink-soft dark:text-cream-soft">
          Активность · 26 недель
        </h2>
        <div className="mt-4 overflow-x-auto">
          <div className="grid grid-flow-col grid-rows-7 gap-1" style={{ width: 'max-content' }}>
            {cells.map((cell) => (
              <div
                key={cell.key}
                title={`${cell.key}: ${cell.count}`}
                className="h-3.5 w-3.5"
                style={{ backgroundColor: palette[heatLevel(cell.count)] }}
              />
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="font-grotesk text-[0.6rem] uppercase tracking-widest text-ink-soft dark:text-cream-soft">
            меньше
          </span>
          {palette.map((color, level) => (
            <div key={level} className="h-3 w-3" style={{ backgroundColor: color }} />
          ))}
          <span className="font-grotesk text-[0.6rem] uppercase tracking-widest text-ink-soft dark:text-cream-soft">
            больше
          </span>
        </div>
      </div>

      {decks.length > 0 && (
        <div className="mt-8">
          <h2 className="font-grotesk text-xs font-bold uppercase tracking-widest text-ink-soft dark:text-cream-soft">
            По колодам
          </h2>
          <ul className="mt-3 border-2 border-ink divide-y divide-ink/15 dark:border-cream/60 dark:divide-cream/15">
            {decks.map((deck) => {
              const deckCards = (cards ?? []).filter((c) => c.deckId === deck.id)
              const due = deckCards.filter((c) => c.dueAt <= now).length
              return (
                <li key={deck.id}>
                  <Link to={`/deck/${deck.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-ink/5 dark:hover:bg-cream/5">
                    <span className="inline-block h-5 w-5 shrink-0" style={{ background: deck.accent }} />
                    <span className="min-w-0 flex-1 truncate font-body text-lg font-semibold text-ink dark:text-cream">
                      {deck.title}
                    </span>
                    <span className="shrink-0 font-grotesk text-xs uppercase tracking-widest text-ink-soft dark:text-cream-soft">
                      {deckCards.length} карт · {due} к повтору
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
