export function speechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

let cachedVoices: SpeechSynthesisVoice[] = []

function loadVoices(): SpeechSynthesisVoice[] {
  if (!speechAvailable()) return []
  const voices = window.speechSynthesis.getVoices()
  if (voices.length > 0) cachedVoices = voices
  return cachedVoices
}

export function voicesForLang(lang: string): SpeechSynthesisVoice[] {
  const prefix = lang.split('-')[0].toLowerCase()
  return loadVoices().filter((v) => v.lang.toLowerCase().startsWith(prefix))
}

export function speak(text: string, lang: string): void {
  if (!speechAvailable() || !text.trim()) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  const match = voicesForLang(lang)[0]
  if (match) utterance.voice = match
  utterance.rate = 0.92
  window.speechSynthesis.speak(utterance)
}

export function primeVoices(onReady: () => void): void {
  if (!speechAvailable()) return
  loadVoices()
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices()
    onReady()
  }
}
