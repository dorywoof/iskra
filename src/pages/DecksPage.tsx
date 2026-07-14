import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/schema'
import { createDeck } from '../db/repository'
import { LANGUAGES, voiceForLabel } from '../lib/languages'
import { Modal } from '../components/Modal'
import { Button, Field, Select, TextInput, Tag } from '../components/ui'

export function DecksPage() {
  const decks = useLiveQuery(() => db.decks.orderBy('createdAt').toArray(), [])
  const cards = useLiveQuery(() => db.cards.toArray(), [])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', frontLang: 'Русский', backLang: 'Türkçe' })

  const now = Date.now()
  const stats = useMemo(() => {
    const map = new Map<number, { total: number; due: number }>()
    for (const card of cards ?? []) {
      const entry = map.get(card.deckId) ?? { total: 0, due: 0 }
      entry.total++
      if (card.dueAt <= now) entry.due++
      map.set(card.deckId, entry)
    }
    return map
  }, [cards, now])

  async function submit() {
    if (!form.title.trim()) return
    await createDeck({
      title: form.title,
      frontLang: form.frontLang,
      backLang: form.backLang,
      voice: voiceForLabel(form.frontLang)
    })
    setForm({ title: '', frontLang: 'Русский', backLang: 'Türkçe' })
    setCreating(false)
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 border-b-2 border-ink pb-6 sm:flex-row sm:items-end sm:justify-between dark:border-cream/60">
        <div>
          <p className="font-grotesk text-xs font-bold uppercase tracking-[0.3em] text-spark">Твои колоды</p>
          <h1 className="mt-1 font-display text-3xl font-black uppercase leading-tight text-ink break-words sm:text-5xl dark:text-cream">
            Учи по искре
          </h1>
          <p className="mt-3 max-w-md font-body text-lg text-ink-soft dark:text-cream-soft">
            Каждый день понемногу. Алгоритм сам решит, какое слово пора повторить.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>+ Новая колода</Button>
      </div>

      {decks && decks.length === 0 && (
        <p className="font-body text-lg text-ink-soft dark:text-cream-soft">Пока нет ни одной колоды. Создай первую.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {(decks ?? []).map((deck) => {
          const stat = stats.get(deck.id) ?? { total: 0, due: 0 }
          return (
            <Link
              key={deck.id}
              to={`/deck/${deck.id}`}
              className="group relative block border-2 border-ink bg-paper-2/40 p-5 transition-transform hover:-translate-y-1 dark:border-cream/60 dark:bg-night-2"
            >
              <div className="absolute left-0 top-0 h-full w-2" style={{ background: deck.accent }} />
              <div className="flex items-start justify-between gap-3 pl-3">
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-bold uppercase leading-tight text-ink break-words sm:text-xl dark:text-cream">
                    {deck.title}
                  </h2>
                  <p className="mt-1 font-grotesk text-xs uppercase tracking-widest text-ink-soft dark:text-cream-soft">
                    {deck.frontLang} → {deck.backLang}
                  </p>
                </div>
                {stat.due > 0 ? (
                  <span className="shrink-0 bg-spark px-2.5 py-1 font-grotesk text-sm font-black text-paper">
                    {stat.due}
                  </span>
                ) : (
                  <Tag>готово</Tag>
                )}
              </div>
              <div className="mt-4 flex items-center gap-2 pl-3">
                <Tag>{stat.total} карт</Tag>
                {stat.due > 0 && <Tag>{stat.due} к повтору</Tag>}
              </div>
            </Link>
          )
        })}
      </div>

      <Modal open={creating} title="Новая колода" onClose={() => setCreating(false)}>
        <div className="space-y-4">
          <Field label="Название">
            <TextInput
              autoFocus
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Например: Глаголы движения"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Учу язык (лицо)">
              <Select value={form.frontLang} onChange={(e) => setForm({ ...form, frontLang: e.target.value })}>
                {LANGUAGES.map((l) => (
                  <option key={l.label} value={l.label}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Перевод (оборот)">
              <Select value={form.backLang} onChange={(e) => setForm({ ...form, backLang: e.target.value })}>
                {LANGUAGES.map((l) => (
                  <option key={l.label} value={l.label}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <p className="font-grotesk text-xs uppercase tracking-wide text-ink-soft dark:text-cream-soft">
            Озвучка: {form.frontLang}
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Отмена
            </Button>
            <Button onClick={submit} disabled={!form.title.trim()}>
              Создать
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
