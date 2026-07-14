export interface PortableCard {
  front: string
  back: string
  example: string
  exampleTranslation: string
  note: string
}

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function toCsv(cards: PortableCard[]): string {
  const header = ['front', 'back', 'example', 'exampleTranslation', 'note']
  const lines = [header.join(',')]
  for (const card of cards) {
    lines.push(
      [card.front, card.back, card.example, card.exampleTranslation, card.note].map(escapeCsvField).join(',')
    )
  }
  return lines.join('\n')
}

export function parseCsv(text: string): PortableCard[] {
  const rows = splitCsvRows(text)
  if (rows.length === 0) return []
  const header = rows[0].map((h) => h.trim().toLowerCase())
  const frontIndex = header.indexOf('front')
  const backIndex = header.indexOf('back')
  const exampleIndex = header.indexOf('example')
  const exampleTranslationIndex = header.indexOf('exampletranslation')
  const noteIndex = header.indexOf('note')

  const hasHeader = frontIndex !== -1 && backIndex !== -1
  const dataRows = hasHeader ? rows.slice(1) : rows

  return dataRows
    .filter((cols) => cols.some((c) => c.trim() !== ''))
    .map((cols) => {
      if (hasHeader) {
        return {
          front: (cols[frontIndex] ?? '').trim(),
          back: (cols[backIndex] ?? '').trim(),
          example: exampleIndex === -1 ? '' : (cols[exampleIndex] ?? '').trim(),
          exampleTranslation: exampleTranslationIndex === -1 ? '' : (cols[exampleTranslationIndex] ?? '').trim(),
          note: noteIndex === -1 ? '' : (cols[noteIndex] ?? '').trim()
        }
      }
      return {
        front: (cols[0] ?? '').trim(),
        back: (cols[1] ?? '').trim(),
        example: (cols[2] ?? '').trim(),
        exampleTranslation: (cols[3] ?? '').trim(),
        note: (cols[4] ?? '').trim()
      }
    })
    .filter((c) => c.front !== '' && c.back !== '')
}

function splitCsvRows(text: string): string[][] {
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i]
    if (inQuotes) {
      if (char === '"') {
        if (normalized[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }
    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

export function toJson(cards: PortableCard[]): string {
  return JSON.stringify(cards, null, 2)
}

export function parseJson(text: string): PortableCard[] {
  const data = JSON.parse(text)
  if (!Array.isArray(data)) throw new Error('Ожидался массив карточек')
  return data
    .map((item) => ({
      front: String(item.front ?? '').trim(),
      back: String(item.back ?? '').trim(),
      example: String(item.example ?? '').trim(),
      exampleTranslation: String(item.exampleTranslation ?? '').trim(),
      note: String(item.note ?? '').trim()
    }))
    .filter((c) => c.front !== '' && c.back !== '')
}
