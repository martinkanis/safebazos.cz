import { describe, expect, it } from 'vitest'
import { safeReturnPath } from './return-path'

describe('safeReturnPath', () => {
  it('relativní cestu ponechá', () => {
    expect(safeReturnPath('/inzerat/12/kolo')).toBe('/inzerat/12/kolo')
  })

  it('bez hodnoty vrací můj účet', () => {
    expect(safeReturnPath(null)).toBe('/muj-ucet')
  })

  it('odmítne přesměrování na cizí doménu', () => {
    expect(safeReturnPath('https://evil.cz')).toBe('/muj-ucet')
    expect(safeReturnPath('//evil.cz')).toBe('/muj-ucet')
    expect(safeReturnPath('/\\evil.cz')).toBe('/muj-ucet')
  })
})
