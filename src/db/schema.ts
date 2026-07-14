import Dexie from 'dexie'
import type { EntityTable } from 'dexie'

export interface Deck {
  id: number
  title: string
  frontLang: string
  backLang: string
  voice: string
  createdAt: number
  accent: string
}

export interface Card {
  id: number
  deckId: number
  front: string
  back: string
  example: string
  exampleTranslation: string
  note: string
  easeFactor: number
  intervalDays: number
  repetitions: number
  dueAt: number
  lastReviewedAt: number | null
  createdAt: number
}

export interface ReviewLog {
  id: number
  cardId: number
  deckId: number
  grade: string
  reviewedAt: number
  dayKey: string
}

export const db = new Dexie('iskra') as Dexie & {
  decks: EntityTable<Deck, 'id'>
  cards: EntityTable<Card, 'id'>
  reviews: EntityTable<ReviewLog, 'id'>
}

db.version(1).stores({
  decks: '++id, title, createdAt',
  cards: '++id, deckId, dueAt, createdAt',
  reviews: '++id, cardId, deckId, reviewedAt, dayKey'
})
