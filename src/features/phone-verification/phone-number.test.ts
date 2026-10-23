import { describe, expect, it } from 'vitest'
import { formatPhoneNumber, normalizePhoneNumber } from './phone-number'

describe('normalizePhoneNumber', () => {
  it('české číslo bez předvolby doplní o 420', () => {
    expect(normalizePhoneNumber('777 123 456')).toBe('420777123456')
  })

  it('přijme předvolbu s + i s 00', () => {
    expect(normalizePhoneNumber('+420 777-123-456')).toBe('420777123456')
    expect(normalizePhoneNumber('00421905123456')).toBe('421905123456')
  })

  it('odmítne zahraniční a neúplná čísla', () => {
    expect(normalizePhoneNumber('+44 7911 123456')).toBeNull()
    expect(normalizePhoneNumber('77712345')).toBeNull()
    expect(normalizePhoneNumber('abc')).toBeNull()
  })
})

describe('formatPhoneNumber', () => {
  it('zformátuje číslo pro zobrazení', () => {
    expect(formatPhoneNumber('420777123456')).toBe('+420 777 123 456')
  })
})
