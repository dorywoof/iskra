import { db } from './schema'
import type { Deck, Card } from './schema'
import { freshState, schedule } from '../lib/sm2'
import type { Grade } from '../lib/sm2'
import { dayKey } from '../lib/date'
import { starterDeck, starterCards } from './seed'

const ACCENTS = ['#D8402F', '#C8912B', '#3B6B4A', '#2F5F8A', '#8A3F6B']

export async function ensureSeeded(): Promise<void> {
  const count = await db.decks.count()
  if (count === 0) {
    const now = Date.now()
    const deckId = await db.decks.add({
      title: starterDeck.title,
      frontLang: starterDeck.frontLang,
      backLang: starterDeck.backLang,
      voice: starterDeck.voice,
      accent: starterDeck.accent,
      createdAt: now
    } as Deck)
    await db.cards.bulkAdd(
      starterCards.map((c, index) => {
        const state = freshState(now + index)
        return {
          deckId: deckId as number,
          front: c.front,
          back: c.back,
          example: c.example,
          exampleTranslation: c.exampleTranslation,
          note: c.note,
          easeFactor: state.easeFactor,
          intervalDays: state.intervalDays,
          repetitions: state.repetitions,
          dueAt: state.dueAt,
          lastReviewedAt: state.lastReviewedAt,
          createdAt: now + index
        } as Card
      })
    )
  }
  await backfillStarterTranslations()
}

async function backfillStarterTranslations(): Promise<void> {
  const deck = await db.decks.where('title').equals(starterDeck.title).first()
  if (!deck) return
  const translations = new Map(starterCards.map((c) => [c.front, c.exampleTranslation]))
  const cards = await db.cards.where('deckId').equals(deck.id).toArray()
  for (const card of cards) {
    const fill = translations.get(card.front)
    if (fill && !card.exampleTranslation) {
      await db.cards.update(card.id, { exampleTranslation: fill })
    }
  }
}

export async function createDeck(input: {
  title: string
  frontLang: string
  backLang: string
  voice: string
}): Promise<number> {
  const now = Date.now()
  const existing = await db.decks.count()
  const accent = ACCENTS[existing % ACCENTS.length]
  const id = await db.decks.add({
    title: input.title.trim() || 'Без названия',
    frontLang: input.frontLang.trim() || 'Front',
    backLang: input.backLang.trim() || 'Back',
    voice: input.voice || 'ru-RU',
    accent,
    createdAt: now
  } as Deck)
  return id as number
}

export async function renameDeck(id: number, patch: Partial<Omit<Deck, 'id' | 'createdAt'>>): Promise<void> {
  await db.decks.update(id, patch)
}

export async function deleteDeck(id: number): Promise<void> {
  await db.transaction('rw', db.decks, db.cards, db.reviews, async () => {
    await db.cards.where('deckId').equals(id).delete()
    await db.reviews.where('deckId').equals(id).delete()
    await db.decks.delete(id)
  })
}

export async function addCard(deckId: number, input: {
  front: string
  back: string
  example?: string
  exampleTranslation?: string
  note?: string
}): Promise<number> {
  const now = Date.now()
  const state = freshState(now)
  const id = await db.cards.add({
    deckId,
    front: input.front.trim(),
    back: input.back.trim(),
    example: (input.example ?? '').trim(),
    exampleTranslation: (input.exampleTranslation ?? '').trim(),
    note: (input.note ?? '').trim(),
    easeFactor: state.easeFactor,
    intervalDays: state.intervalDays,
    repetitions: state.repetitions,
    dueAt: state.dueAt,
    lastReviewedAt: state.lastReviewedAt,
    createdAt: now
  } as Card)
  return id as number
}

export async function updateCard(id: number, patch: Partial<Omit<Card, 'id' | 'deckId' | 'createdAt'>>): Promise<void> {
  await db.cards.update(id, patch)
}

export async function deleteCard(id: number): Promise<void> {
  await db.transaction('rw', db.cards, db.reviews, async () => {
    await db.reviews.where('cardId').equals(id).delete()
    await db.cards.delete(id)
  })
}

export async function gradeCard(card: Card, grade: Grade): Promise<void> {
  const now = Date.now()
  const next = schedule(
    {
      easeFactor: card.easeFactor,
      intervalDays: card.intervalDays,
      repetitions: card.repetitions,
      dueAt: card.dueAt,
      lastReviewedAt: card.lastReviewedAt
    },
    grade,
    now
  )
  await db.transaction('rw', db.cards, db.reviews, async () => {
    await db.cards.update(card.id, {
      easeFactor: next.easeFactor,
      intervalDays: next.intervalDays,
      repetitions: next.repetitions,
      dueAt: next.dueAt,
      lastReviewedAt: next.lastReviewedAt
    })
    await db.reviews.add({
      cardId: card.id,
      deckId: card.deckId,
      grade,
      reviewedAt: now,
      dayKey: dayKey(now)
    })
  })
}

export async function dueCards(deckId: number, now: number): Promise<Card[]> {
  const cards = await db.cards.where('deckId').equals(deckId).toArray()
  return cards
    .filter((c) => c.dueAt <= now)
    .sort((a, b) => a.dueAt - b.dueAt)
}

export async function importCards(deckId: number, rows: Array<{
  front: string
  back: string
  example?: string
  exampleTranslation?: string
  note?: string
}>): Promise<number> {
  const now = Date.now()
  const valid = rows.filter((r) => r.front?.trim() && r.back?.trim())
  await db.cards.bulkAdd(
    valid.map((r, index) => {
      const state = freshState(now + index)
      return {
        deckId,
        front: r.front.trim(),
        back: r.back.trim(),
        example: (r.example ?? '').trim(),
        exampleTranslation: (r.exampleTranslation ?? '').trim(),
        note: (r.note ?? '').trim(),
        easeFactor: state.easeFactor,
        intervalDays: state.intervalDays,
        repetitions: state.repetitions,
        dueAt: state.dueAt,
        lastReviewedAt: state.lastReviewedAt,
        createdAt: now + index
      } as Card
    })
  )
  return valid.length
}
