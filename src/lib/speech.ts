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

export function hasVoiceFor(lang: string): boolean {
  return voicesForLang(lang).length > 0
}

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const matches = voicesForLang(lang)
  const exact = matches.find((v) => v.lang.toLowerCase() === lang.toLowerCase())
  return exact ?? matches[0]
}

export function speak(text: string, lang: string): void {
  if (!speechAvailable() || !text.trim()) return
  const synth = window.speechSynthesis
  if (synth.speaking || synth.pending) synth.cancel()
  const utterance = new SpeechSynthesisUtterance(text.trim())
  utterance.lang = lang
  const voice = pickVoice(lang)
  if (voice) utterance.voice = voice
  utterance.rate = 0.9
  utterance.pitch = 1
  const start = () => {
    synth.resume()
    synth.speak(utterance)
  }
  if (loadVoices().length === 0) {
    window.setTimeout(start, 200)
  } else {
    start()
  }
}

export function primeVoices(onReady: () => void): void {
  if (!speechAvailable()) return
  loadVoices()
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices()
    onReady()
  }
}
