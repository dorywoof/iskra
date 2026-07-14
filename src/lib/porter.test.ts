import { describe, it, expect } from 'vitest'
import { toCsv, parseCsv, toJson, parseJson } from './porter'
import type { PortableCard } from './porter'

const sample: PortableCard[] = [
  { front: 'привет', back: 'hello', example: 'Привет, мир!', exampleTranslation: 'Hello, world!', note: 'greeting' },
  { front: 'да, нет', back: 'yes, no', example: 'Он сказал: "да".', exampleTranslation: 'He said: "yes".', note: '' }
]

describe('csv round-trip', () => {
  it('preserves cards including commas and quotes through export and import', () => {
    const csv = toCsv(sample)
    const parsed = parseCsv(csv)
    expect(parsed).toEqual(sample)
  })

  it('quotes fields that contain commas', () => {
    const csv = toCsv(sample)
    expect(csv).toContain('"да, нет"')
    expect(csv).toContain('"Он сказал: ""да""."')
  })

  it('imports headerless two-column data', () => {
    const parsed = parseCsv('кот,cat\nсобака,dog')
    expect(parsed).toHaveLength(2)
    expect(parsed[0]).toEqual({ front: 'кот', back: 'cat', example: '', exampleTranslation: '', note: '' })
  })

  it('skips rows missing a front or back', () => {
    const parsed = parseCsv('front,back\nкот,cat\n,orphan\nlonely,')
    expect(parsed).toHaveLength(1)
    expect(parsed[0].front).toBe('кот')
  })

  it('tolerates windows line endings', () => {
    const parsed = parseCsv('front,back\r\nкот,cat\r\n')
    expect(parsed).toEqual([{ front: 'кот', back: 'cat', example: '', exampleTranslation: '', note: '' }])
  })
})

describe('json round-trip', () => {
  it('preserves cards through export and import', () => {
    const parsed = parseJson(toJson(sample))
    expect(parsed).toEqual(sample)
  })

  it('coerces and trims loose fields', () => {
    const parsed = parseJson('[{"front":"  кот  ","back":"cat"}]')
    expect(parsed).toEqual([{ front: 'кот', back: 'cat', example: '', exampleTranslation: '', note: '' }])
  })

  it('rejects non-array payloads', () => {
    expect(() => parseJson('{"front":"x"}')).toThrow()
  })
})
