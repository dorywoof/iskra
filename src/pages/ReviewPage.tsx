import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { db } from '../db/schema'
import type { Card, Deck } from '../db/schema'
import { dueCards, gradeCard } from '../db/repository'
import { previewIntervals } from '../lib/sm2'
import type { Grade } from '../lib/sm2'
import { speak, speechAvailable } from '../lib/speech'
import { voiceForLabel } from '../lib/languages'

const gradeMeta: Array<{ grade: Grade; key: string; label: string; color: string }> = [
  { grade: 'again', key: '1', label: 'Снова', color: '#D8402F' },
  { grade: 'hard', key: '2', label: 'Трудно', color: '#C8912B' },
  { grade: 'good', key: '3', label: 'Хорошо', color: '#3B6B4A' },
  { grade: 'easy', key: '4', label: 'Легко', color: '#2F5F8A' }
]

type Phase = 'loading' | 'reviewing' | 'done' | 'missing'

export function ReviewPage() {
  const params = useParams()
  const deckId = Number(params.deckId)
  const navigate = useNavigate()

  const [deck, setDeck] = useState<Deck | null>(null)
  const [queue, setQueue] = useState<Card[]>([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [phase, setPhase] = useState<Phase>('loading')
  const [tally, setTally] = useState({ again: 0, hard: 0, good: 0, easy: 0 })
  const [startCount, setStartCount] = useState(0)

  useEffect(() => {
    let alive = true
    async function load() {
      const found = await db.decks.get(deckId)
      if (!alive) return
      if (!found) {
        setPhase('missing')
        return
      }
      const cards = await dueCards(deckId, Date.now())
      if (!alive) return
      setDeck(found)
      setQueue(cards)
      setStartCount(cards.length)
      setPhase(cards.length === 0 ? 'done' : 'reviewing')
    }
    load()
    return () => {
      alive = false
    }
  }, [deckId])

  const current = queue[index]

  const previews = useMemo(() => {
    if (!current) return null
    return previewIntervals(
      {
        easeFactor: current.easeFactor,
        intervalDays: current.intervalDays,
        repetitions: current.repetitions,
        dueAt: current.dueAt,
        lastReviewedAt: current.lastReviewedAt
      },
      Date.now()
    )
  }, [current])

  const grade = useCallback(
    async (g: Grade) => {
      if (!current) return
      await gradeCard(current, g)
      setTally((t) => ({ ...t, [g]: t[g] + 1 }))
      setFlipped(false)
      if (index + 1 >= queue.length) {
        setPhase('done')
      } else {
        setIndex((i) => i + 1)
      }
    },
    [current, index, queue.length]
  )

  useEffect(() => {
    if (phase !== 'reviewing') return
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space') {
        e.preventDefault()
        setFlipped((f) => !f)
        return
      }
      if (!flipped) return
      const hit = gradeMeta.find((m) => m.key === e.key)
      if (hit) {
        e.preventDefault()
        grade(hit.grade)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, flipped, grade])

  if (phase === 'loading') {
    return (
      <div className="grain flex min-h-full items-center justify-center">
        <span className="font-display text-lg font-bold uppercase tracking-widest text-spark">Загрузка…</span>
      </div>
    )
  }

  if (phase === 'missing') {
    return (
      <div className="grain flex min-h-full flex-col items-center justify-center gap-4">
        <p className="font-body text-xl text-ink-soft dark:text-cream-soft">Колода не найдена.</p>
        <Link to="/" className="font-grotesk text-sm font-bold uppercase tracking-widest text-spark">
          ← Ко всем колодам
        </Link>
      </div>
    )
  }

  if (phase === 'done') {
    const reviewed = tally.again + tally.hard + tally.good + tally.easy
    return (
      <div className="grain flex min-h-full flex-col items-center justify-center px-6">
        <div className="w-full max-w-md border-2 border-ink bg-paper animate-spark-in dark:border-cream dark:bg-night-2">
          <div className="border-b-2 border-ink bg-spark px-6 py-4 dark:border-cream">
            <h1 className="font-display text-xl font-black uppercase tracking-tight text-paper">Сессия окончена</h1>
          </div>
          <div className="p-6">
            {reviewed === 0 ? (
              <p className="font-body text-lg text-ink-soft dark:text-cream-soft">
                Сейчас нет карточек к повтору. Возвращайся позже — интервалы подскажут когда.
              </p>
            ) : (
              <>
                <p className="font-display text-5xl font-black text-ink dark:text-cream">{reviewed}</p>
                <p className="mt-1 font-grotesk text-xs uppercase tracking-widest text-ink-soft dark:text-cream-soft">
                  карточек повторено
                </p>
                <div className="mt-5 grid grid-cols-4 gap-2">
                  {gradeMeta.map((m) => (
                    <div key={m.grade} className="border-2 border-ink px-2 py-2 text-center dark:border-cream/60">
                      <div className="font-display text-2xl font-black" style={{ color: m.color }}>
                        {tally[m.grade]}
                      </div>
                      <div className="font-grotesk text-[0.6rem] uppercase tracking-widest text-ink-soft dark:text-cream-soft">
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <Link
                to={`/deck/${deckId}`}
                className="border-2 border-ink px-4 py-2 font-grotesk text-sm font-bold uppercase tracking-wider text-ink hover:bg-ink hover:text-paper dark:border-cream dark:text-cream dark:hover:bg-cream dark:hover:text-night"
              >
                К колоде
              </Link>
              <Link
                to="/"
                className="bg-ink px-4 py-2 font-grotesk text-sm font-bold uppercase tracking-wider text-paper hover:bg-spark dark:bg-cream dark:text-night dark:hover:bg-spark dark:hover:text-paper"
              >
                Все колоды
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const progress = startCount === 0 ? 0 : Math.round((index / startCount) * 100)

  return (
    <div className="grain flex min-h-full flex-col">
      <header className="flex items-center justify-between gap-4 border-b-2 border-ink px-4 py-3 sm:px-6 dark:border-cream/70">
        <button
          onClick={() => navigate(`/deck/${deckId}`)}
          className="font-grotesk text-xs font-bold uppercase tracking-widest text-ink-soft hover:text-spark dark:text-cream-soft"
        >
          ✕ Выйти
        </button>
        <span className="font-grotesk text-xs font-bold uppercase tracking-widest text-ink-soft dark:text-cream-soft">
          {index + 1} / {startCount}
        </span>
      </header>

      <div className="h-1.5 w-full bg-ink/10 dark:bg-cream/10">
        <div className="h-full bg-spark transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-xl">
          <button
            onClick={() => setFlipped((f) => !f)}
            className="block w-full border-2 border-ink bg-paper px-6 py-14 text-center animate-spark-in dark:border-cream dark:bg-night-2"
          >
            <span className="font-grotesk text-[0.65rem] uppercase tracking-widest text-ink-soft dark:text-cream-soft">
              {deck?.frontLang}
            </span>
            <p className="mt-3 font-display text-4xl font-black leading-tight text-ink sm:text-5xl dark:text-cream">
              {current?.front}
            </p>

            {flipped && (
              <div className="mt-8 border-t-2 border-dashed border-ink/40 pt-6 dark:border-cream/40">
                <span className="font-grotesk text-[0.65rem] uppercase tracking-widest text-ink-soft dark:text-cream-soft">
                  {deck?.backLang}
                </span>
                <p className="mt-2 font-body text-3xl font-semibold text-spark dark:text-spark">{current?.back}</p>
                {current?.example && (
                  <p className="mt-5 font-body text-lg italic text-ink dark:text-cream">{current.example}</p>
                )}
                {current?.exampleTranslation && (
                  <p className="mt-1 font-body text-base text-ink-soft dark:text-cream-soft">
                    {current.exampleTranslation}
                  </p>
                )}
                {current?.note && (
                  <p className="mt-3 font-grotesk text-xs uppercase tracking-wide text-ochre-deep dark:text-ochre">
                    {current.note}
                  </p>
                )}
              </div>
            )}
          </button>

          {speechAvailable() && deck && (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => speak(current?.front ?? '', deck.voice)}
                className="border-2 border-ink px-3 py-1.5 font-grotesk text-xs font-bold uppercase tracking-widest text-ink hover:bg-ink hover:text-paper dark:border-cream/70 dark:text-cream dark:hover:bg-cream dark:hover:text-night"
              >
                🔊 {deck.frontLang}
              </button>
              {flipped && current?.back && (
                <button
                  onClick={() => speak(current.back, voiceForLabel(deck.backLang))}
                  className="border-2 border-ink px-3 py-1.5 font-grotesk text-xs font-bold uppercase tracking-widest text-ink hover:bg-ink hover:text-paper dark:border-cream/70 dark:text-cream dark:hover:bg-cream dark:hover:text-night"
                >
                  🔊 {deck.backLang}
                </button>
              )}
            </div>
          )}

          <div className="mt-8">
            {!flipped ? (
              <button
                onClick={() => setFlipped(true)}
                className="w-full bg-ink py-4 font-grotesk text-sm font-bold uppercase tracking-widest text-paper hover:bg-spark dark:bg-cream dark:text-night dark:hover:bg-spark dark:hover:text-paper"
              >
                Показать ответ · Пробел
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {gradeMeta.map((m) => (
                  <button
                    key={m.grade}
                    onClick={() => grade(m.grade)}
                    className="border-2 py-3 font-grotesk text-sm font-bold uppercase tracking-wider text-paper transition-transform hover:-translate-y-0.5"
                    style={{ backgroundColor: m.color, borderColor: m.color }}
                  >
                    <span className="block">{m.label}</span>
                    <span className="mt-0.5 block text-[0.65rem] font-normal opacity-90">
                      {m.key} · {previews?.[m.grade]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
