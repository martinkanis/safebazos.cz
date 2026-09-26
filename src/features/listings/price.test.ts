import { describe, expect, it } from 'vitest'
import { formatListingPrice } from './price'

describe('formatListingPrice', () => {
  it('částku formátuje v Kč s mezerami po tisících', () => {
    expect(formatListingPrice('amount', 12500).replace(/\s/g, ' ')).toBe('12 500 Kč')
  })

  it('pro ostatní typy ceny vrací popisek', () => {
    expect(formatListingPrice('free', null)).toBe('Zdarma')
    expect(formatListingPrice('negotiable', null)).toBe('Dohodou')
  })

  it('chybějící částku u typu amount zobrazí jako dohodou', () => {
    expect(formatListingPrice('amount', null)).toBe('Dohodou')
  })
})
