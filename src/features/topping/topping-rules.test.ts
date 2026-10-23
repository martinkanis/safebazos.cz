import { describe, expect, it } from 'vitest'
import {
  isTopped,
  maxToppingsFor,
  shiftDaysForTopping,
  sortTimeFor,
  totalShiftDays,
  voucherExpiryFrom,
} from './topping-rules'

describe('shiftDaysForTopping', () => {
  it('posouvá o 7, 6, 5, 4, 3, 2 a pak o 1 den jako Bazoš', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 21].map(shiftDaysForTopping)).toEqual([
      7, 6, 5, 4, 3, 2, 1, 1, 1,
    ])
  })
})

describe('totalShiftDays', () => {
  it('odpovídá součtům z nápovědy Bazoše', () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7].map(totalShiftDays)).toEqual([0, 7, 13, 18, 22, 25, 27, 28])
  })

  it('po 21 topováních je posun 42 dní', () => {
    expect(totalShiftDays(21)).toBe(42)
  })
})

describe('sortTimeFor', () => {
  it('posune čas vložení o celkový posun', () => {
    const publishedAt = new Date('2026-09-01T10:00:00Z')
    expect(sortTimeFor(publishedAt, 2).toISOString()).toBe('2026-09-14T10:00:00.000Z')
  })
})

describe('maxToppingsFor', () => {
  it('ve službách povolí 7 topování, jinde 21', () => {
    expect(maxToppingsFor('sluzby')).toBe(7)
    expect(maxToppingsFor('auto')).toBe(21)
  })
})

describe('isTopped', () => {
  it('štítek má jen topovaný inzerát', () => {
    expect(isTopped(0)).toBe(false)
    expect(isTopped(1)).toBe(true)
  })
})

describe('voucherExpiryFrom', () => {
  it('poukázka platí 6 měsíců', () => {
    expect(voucherExpiryFrom(new Date('2026-09-26T12:00:00Z')).toISOString()).toBe(
      '2027-03-26T12:00:00.000Z',
    )
  })
})
