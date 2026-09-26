import { describe, expect, it } from 'vitest'
import { hasActiveFilters, parseListingSearchParams } from './search-params'

describe('parseListingSearchParams', () => {
  it('bez parametrů vrací výchozí výpis', () => {
    expect(parseListingSearchParams({})).toEqual({
      query: undefined,
      location: undefined,
      priceMin: undefined,
      priceMax: undefined,
      safePaymentOnly: false,
      sort: 'newest',
      page: 1,
    })
  })

  it('přečte české parametry z adresy', () => {
    const filters = parseListingSearchParams({
      q: ' iphone ',
      lokalita: 'Brno',
      'cena-od': '1 000',
      'cena-do': '15000',
      'bezpecna-platba': '1',
      razeni: 'nejlevnejsi',
      strana: '3',
    })
    expect(filters).toEqual({
      query: 'iphone',
      location: 'Brno',
      priceMin: 1000,
      priceMax: 15000,
      safePaymentOnly: true,
      sort: 'cheapest',
      page: 3,
    })
  })

  it('nevalidní hodnoty ignoruje', () => {
    const filters = parseListingSearchParams({
      'cena-od': 'abc',
      razeni: 'hacker',
      strana: '-5',
    })
    expect(filters.priceMin).toBeUndefined()
    expect(filters.sort).toBe('newest')
    expect(filters.page).toBe(1)
  })

  it('stránkování omezí na rozumné maximum', () => {
    expect(parseListingSearchParams({ strana: '999999' }).page).toBe(500)
  })
})

describe('hasActiveFilters', () => {
  it('stránka 2 bez filtrů není filtrovaný výpis', () => {
    expect(hasActiveFilters(parseListingSearchParams({ strana: '2' }))).toBe(false)
  })

  it('hledaný text je filtr', () => {
    expect(hasActiveFilters(parseListingSearchParams({ q: 'kolo' }))).toBe(true)
  })
})
