export interface Language {
  label: string
  voice: string
}

export const LANGUAGES: Language[] = [
  { label: 'Русский', voice: 'ru-RU' },
  { label: 'Türkçe', voice: 'tr-TR' },
  { label: 'English', voice: 'en-US' },
  { label: 'Deutsch', voice: 'de-DE' },
  { label: 'Français', voice: 'fr-FR' },
  { label: 'Español', voice: 'es-ES' },
  { label: 'Italiano', voice: 'it-IT' },
  { label: 'Українська', voice: 'uk-UA' },
  { label: '中文', voice: 'zh-CN' },
  { label: '日本語', voice: 'ja-JP' },
  { label: '한국어', voice: 'ko-KR' },
  { label: 'العربية', voice: 'ar-SA' }
]

export function voiceForLabel(label: string): string {
  const match = LANGUAGES.find((l) => l.label === label)
  return match ? match.voice : 'en-US'
}
