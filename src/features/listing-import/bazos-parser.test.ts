import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseBazosListingPage, parseBazosPrice } from './bazos-parser'

const fixture = readFileSync(
  path.join(import.meta.dirname, '__fixtures__/bazos-listing.html'),
  'utf8',
)

describe('parseBazosListingPage', () => {
  const parsed = parseBazosListingPage(fixture, '123456789')

  it('přečte nadpis, popis, cenu a lokalitu', () => {
    expect(parsed).toMatchObject({
      title: 'Horské kolo & přilba – vel. L',
      description:
        'Prodám horské kolo, málo jeté.\n\nOvěřovací kód: SAFEBAZOS-7KQM\nOsobní předání Brno.',
      priceType: 'amount',
      priceAmount: 12500,
      postalCode: '60200',
      city: 'Brno',
      bazosCategory: { subdomain: 'sport', subcategoryName: 'Jízdní kola' },
    })
  })

  it('převezme jen plné fotky tohoto inzerátu, ne náhledy ani fotky jiných inzerátů', () => {
    expect(parsed?.imageUrls).toEqual([
      'https://www.bazos.cz/img/1/456/123456789.jpg?t=1',
      'https://www.bazos.cz/img/2/456/123456789.jpg?t=1',
    ])
  })

  it('stránka bez inzerátu vrací null', () => {
    expect(parseBazosListingPage('<html><body>Inzerát neexistuje</body></html>', '1')).toBeNull()
  })
})

describe('parseBazosPrice', () => {
  it('rozpozná slovní ceny Bazoše', () => {
    expect(parseBazosPrice('Dohodou')).toEqual({ priceType: 'negotiable', priceAmount: null })
    expect(parseBazosPrice('Nabídněte')).toEqual({ priceType: 'offer', priceAmount: null })
    expect(parseBazosPrice('V textu')).toEqual({ priceType: 'in_text', priceAmount: null })
    expect(parseBazosPrice('Zdarma')).toEqual({ priceType: 'free', priceAmount: null })
  })

  it('částku převede na číslo', () => {
    expect(parseBazosPrice('1 250 000 Kč')).toEqual({ priceType: 'amount', priceAmount: 1250000 })
  })
})
