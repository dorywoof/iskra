import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { DecksPage } from './pages/DecksPage'
import { DeckPage } from './pages/DeckPage'
import { ReviewPage } from './pages/ReviewPage'
import { StatsPage } from './pages/StatsPage'
import { ensureSeeded } from './db/repository'
import { primeVoices } from './lib/speech'

export function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    ensureSeeded().then(() => {
      if (alive) setReady(true)
    })
    primeVoices(() => undefined)
    return () => {
      alive = false
    }
  }, [])

  if (!ready) {
    return (
      <div className="grain flex min-h-full items-center justify-center">
        <span className="font-display text-lg font-bold uppercase tracking-widest text-spark">Искра…</span>
      </div>
    )
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DecksPage />} />
        <Route path="deck/:deckId" element={<DeckPage />} />
        <Route path="stats" element={<StatsPage />} />
      </Route>
      <Route path="review/:deckId" element={<ReviewPage />} />
    </Routes>
  )
}
