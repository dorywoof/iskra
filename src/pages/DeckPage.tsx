import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/schema'
import type { Card } from '../db/schema'
import { addCard, updateCard, deleteCard, deleteDeck, renameDeck, importCards } from '../db/repository'
import { toCsv, toJson, parseCsv, parseJson } from '../lib/porter'
import type { PortableCard } from '../lib/porter'
import { LANGUAGES, voiceForLabel } from '../lib/languages'
import { relativeDue } from '../lib/date'
import { speak, speechAvailable, hasVoiceFor } from '../lib/speech'
import { Modal } from '../components/Modal'
import { Button, Field, Select, TextInput, TextArea, Tag } from '../components/ui'

const emptyCard = { front: '', back: '', example: '', exampleTranslation: '', note: '' }

export function DeckPage() {
  const params = useParams()
  const deckId = Number(params.deckId)
  const navigate = useNavigate()
  const fileInput = useRef<HTMLInputElement>(null)

  const deck = useLiveQuery(() => db.decks.get(deckId), [deckId])
  const cards = useLiveQuery(() => db.cards.where('deckId').equals(deckId).reverse().sortBy('createdAt'), [deckId])

  const [editing, setEditing] = useState<Card | null>(null)
  const [draft, setDraft] = useState(emptyCard)
  const [adding, setAdding] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [deckDraft, setDeckDraft] = useState({ title: '', frontLang: '', backLang: '' })
  const [importText, setImportText] = useState('')
  const [importOpen, setImportOpen] = useState(false)
  const [notice, setNotice] = useState('')

  const now = Date.now()
  const dueCount = useMemo(() => (cards ?? []).filter((c) => c.dueAt <= now).length, [cards, now])

  if (deck === undefined) {
    return <p className="font-body text-lg text-ink-soft">Загрузка…</p>
  }
  if (deck === null) {
    return (
      <div>
        <p className="font-body text-lg text-ink-soft dark:text-cream-soft">Колода не найдена.</p>
        <Link to="/" className="mt-4 inline-block font-grotesk text-sm font-bold uppercase tracking-widest text-spark">
          ← Ко всем колодам
        </Link>
      </div>
    )
  }

  function openAdd() {
    setDraft(emptyCard)
    setEditing(null)
    setAdding(true)
  }

  function openEdit(card: Card) {
    setDraft({
      front: card.front,
      back: card.back,
      example: card.example,
      exampleTranslation: card.exampleTranslation ?? '',
      note: card.note
    })
    setEditing(card)
    setAdding(true)
  }

  async function saveCard() {
    if (!draft.front.trim() || !draft.back.trim()) return
    if (editing) {
      await updateCard(editing.id, {
        front: draft.front.trim(),
        back: draft.back.trim(),
        example: draft.example.trim(),
        exampleTranslation: draft.exampleTranslation.trim(),
        note: draft.note.trim()
      })
    } else {
      await addCard(deckId, draft)
    }
    setAdding(false)
    setEditing(null)
    setDraft(emptyCard)
  }

  function download(name: string, content: string, type: string) {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  function portableCards(): PortableCard[] {
    return (cards ?? []).map((c) => ({
      front: c.front,
      back: c.back,
      example: c.example,
      exampleTranslation: c.exampleTranslation ?? '',
      note: c.note
    }))
  }

  function exportCsv() {
    download(`${deck!.title}.csv`, toCsv(portableCards()), 'text/csv;charset=utf-8')
  }

  function exportJson() {
    download(`${deck!.title}.json`, toJson(portableCards()), 'application/json')
  }

  async function runImport() {
    const text = importText.trim()
    if (!text) return
    let rows: PortableCard[] = []
    try {
      rows = text.startsWith('[') ? parseJson(text) : parseCsv(text)
    } catch {
      setNotice('Не удалось разобрать данные. Проверь формат.')
      return
    }
    const added = await importCards(deckId, rows)
    setImportText('')
    setImportOpen(false)
    setNotice(`Добавлено карточек: ${added}`)
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setImportText(String(reader.result ?? ''))
      setImportOpen(true)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  async function removeDeck() {
    await deleteDeck(deckId)
    navigate('/')
  }

  async function saveDeckSettings() {
    const frontLang = deckDraft.frontLang.trim() || deck!.frontLang
    const backLang = deckDraft.backLang.trim() || deck!.backLang
    await renameDeck(deckId, {
      title: deckDraft.title.trim() || deck!.title,
      frontLang,
      backLang,
      voice: voiceForLabel(frontLang)
    })
    setSettingsOpen(false)
  }

  return (
    <div>
      <Link to="/" className="font-grotesk text-xs font-bold uppercase tracking-widest text-ink-soft hover:text-spark dark:text-cream-soft">
        ← Все колоды
      </Link>

      <div className="mt-3 flex flex-col gap-4 border-b-2 border-ink pb-6 sm:flex-row sm:items-end sm:justify-between dark:border-cream/60">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-block h-6 w-6" style={{ background: deck.accent }} />
            <h1 className="font-display text-3xl font-black uppercase leading-none text-ink sm:text-4xl dark:text-cream">
              {deck.title}
            </h1>
          </div>
          <p className="mt-2 font-grotesk text-xs uppercase tracking-widest text-ink-soft dark:text-cream-soft">
            {deck.frontLang} → {deck.backLang} · {(cards ?? []).length} карт · {dueCount} к повтору
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => navigate(`/review/${deckId}`)}
            disabled={dueCount === 0}
            className={dueCount > 0 ? 'bg-spark text-paper hover:bg-spark-deep dark:bg-spark dark:text-paper' : ''}
          >
            {dueCount > 0 ? `Повторять (${dueCount})` : 'Нет карт к повтору'}
          </Button>
          <Button variant="outline" onClick={openAdd}>
            + Карта
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={() => fileInput.current?.click()}>
          Импорт из файла
        </Button>
        <Button variant="ghost" onClick={() => setImportOpen(true)}>
          Вставить текст
        </Button>
        <Button variant="ghost" onClick={exportCsv}>
          Экспорт CSV
        </Button>
        <Button variant="ghost" onClick={exportJson}>
          Экспорт JSON
        </Button>
        <button
          onClick={() => {
            setDeckDraft({ title: deck.title, frontLang: deck.frontLang, backLang: deck.backLang })
            setSettingsOpen(true)
          }}
          className="ml-auto font-grotesk text-xs font-bold uppercase tracking-widest text-ink-soft hover:text-spark dark:text-cream-soft"
        >
          Настройки
        </button>
        <input ref={fileInput} type="file" accept=".csv,.json,text/csv,application/json" className="hidden" onChange={onFile} />
      </div>

      {notice && (
        <p className="mt-4 border-l-4 border-ochre bg-ochre/10 px-3 py-2 font-grotesk text-sm text-ink dark:text-cream">
          {notice}
        </p>
      )}

      <ul className="mt-6 divide-y divide-ink/15 border-2 border-ink dark:divide-cream/15 dark:border-cream/60">
        {(cards ?? []).length === 0 && (
          <li className="p-6 text-center font-body text-lg text-ink-soft dark:text-cream-soft">
            В колоде пока нет карточек. Добавь первую или импортируй список.
          </li>
        )}
        {(cards ?? []).map((card) => (
          <li key={card.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-3">
                <span className="font-body text-xl font-semibold text-ink dark:text-cream">{card.front}</span>
                <span className="truncate font-body text-lg text-ink-soft dark:text-cream-soft">{card.back}</span>
              </div>
              {card.example && (
                <p className="mt-0.5 truncate font-body text-sm italic text-ink-soft/80 dark:text-cream-soft/80">
                  {card.example}
                </p>
              )}
              {card.exampleTranslation && (
                <p className="truncate font-body text-sm text-ink-soft/70 dark:text-cream-soft/70">
                  {card.exampleTranslation}
                </p>
              )}
            </div>
            <span className="hidden shrink-0 font-grotesk text-[0.65rem] uppercase tracking-widest text-ink-soft sm:block dark:text-cream-soft">
              {card.dueAt <= now ? 'к повтору' : relativeDue(card.dueAt, now)}
            </span>
            {speechAvailable() && (
              <button
                onClick={() => speak(card.front, deck.voice)}
                className="shrink-0 px-2 text-lg text-ink-soft hover:text-spark dark:text-cream-soft"
                aria-label="Озвучить"
              >
                🔊
              </button>
            )}
            <button
              onClick={() => openEdit(card)}
              className="shrink-0 font-grotesk text-xs font-bold uppercase tracking-widest text-ink-soft hover:text-spark dark:text-cream-soft"
            >
              Правка
            </button>
            <button
              onClick={() => deleteCard(card.id)}
              className="shrink-0 font-grotesk text-xs font-bold uppercase tracking-widest text-ink-soft hover:text-spark dark:text-cream-soft"
              aria-label="Удалить"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <Modal open={adding} title={editing ? 'Правка карточки' : 'Новая карточка'} onClose={() => setAdding(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label={deck.frontLang}>
              <TextInput autoFocus value={draft.front} onChange={(e) => setDraft({ ...draft, front: e.target.value })} />
            </Field>
            <Field label={deck.backLang}>
              <TextInput value={draft.back} onChange={(e) => setDraft({ ...draft, back: e.target.value })} />
            </Field>
          </div>
          <Field label={`Пример на «${deck.frontLang}» (необязательно)`}>
            <TextInput value={draft.example} onChange={(e) => setDraft({ ...draft, example: e.target.value })} />
          </Field>
          <Field label={`Перевод примера на «${deck.backLang}» (необязательно)`}>
            <TextInput
              value={draft.exampleTranslation}
              onChange={(e) => setDraft({ ...draft, exampleTranslation: e.target.value })}
            />
          </Field>
          <Field label="Заметка (необязательно)">
            <TextArea rows={2} value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Отмена
            </Button>
            <Button onClick={saveCard} disabled={!draft.front.trim() || !draft.back.trim()}>
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={importOpen} title="Импорт карточек" onClose={() => setImportOpen(false)}>
        <div className="space-y-4">
          <p className="font-body text-base text-ink-soft dark:text-cream-soft">
            Вставь CSV (front,back,example,note) или JSON-массив. Заголовок можно не указывать — тогда порядок колонок такой же.
          </p>
          <TextArea
            rows={8}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={'кот,cat\nсобака,dog'}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Tag>CSV</Tag>
            <Tag>JSON</Tag>
            <div className="ml-auto flex gap-2">
              <Button variant="ghost" onClick={() => setImportOpen(false)}>
                Отмена
              </Button>
              <Button onClick={runImport} disabled={!importText.trim()}>
                Импортировать
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={settingsOpen} title="Настройки колоды" onClose={() => setSettingsOpen(false)}>
        <div className="space-y-4">
          <Field label="Название">
            <TextInput value={deckDraft.title} onChange={(e) => setDeckDraft({ ...deckDraft, title: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Учу язык (лицо)">
              <Select value={deckDraft.frontLang} onChange={(e) => setDeckDraft({ ...deckDraft, frontLang: e.target.value })}>
                {LANGUAGES.map((l) => (
                  <option key={l.label} value={l.label}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Перевод (оборот)">
              <Select value={deckDraft.backLang} onChange={(e) => setDeckDraft({ ...deckDraft, backLang: e.target.value })}>
                {LANGUAGES.map((l) => (
                  <option key={l.label} value={l.label}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <p className="font-grotesk text-xs uppercase tracking-wide text-ink-soft dark:text-cream-soft">
            Озвучка: {deckDraft.frontLang}
            {!hasVoiceFor(voiceForLabel(deckDraft.frontLang)) && ' · голос не найден в системе'}
          </p>
          <div className="flex items-center justify-between border-t border-ink/20 pt-4 dark:border-cream/20">
            <button
              onClick={removeDeck}
              className="font-grotesk text-xs font-bold uppercase tracking-widest text-spark hover:text-spark-deep"
            >
              Удалить колоду
            </button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setSettingsOpen(false)}>
                Отмена
              </Button>
              <Button onClick={saveDeckSettings}>Сохранить</Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
