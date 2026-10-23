import { describe, expect, it } from 'vitest'
import { parseBazosListingUrl } from './bazos-url'

describe('parseBazosListingUrl', () => {
  it('rozpozná odkaz na inzerát a sestaví čistou adresu', () => {
    expect(
      parseBazosListingUrl(
        'https://mobil.bazos.cz/inzerat/225229221/apple-watch-ultra.php?x=1#foto',
      ),
    ).toEqual({
      listingId: '225229221',
      url: 'https://mobil.bazos.cz/inzerat/225229221/apple-watch-ultra.php',
    })
  })

  it('přijme i odkaz bez slugu a bez subdomény', () => {
    expect(parseBazosListingUrl('http://bazos.cz/inzerat/123456789')?.url).toBe(
      'https://www.bazos.cz/inzerat/123456789/inzerat.php',
    )
  })

  it('odmítne jiné domény a podvržené hostitele', () => {
    expect(parseBazosListingUrl('https://bazos.cz.evil.com/inzerat/123456789/x.php')).toBeNull()
    expect(parseBazosListingUrl('https://evilbazos.cz/inzerat/123456789/x.php')).toBeNull()
    expect(parseBazosListingUrl('https://sbazar.cz/inzerat/123456789')).toBeNull()
  })

  it('odmítne stránky, které nejsou inzerát', () => {
    expect(parseBazosListingUrl('https://mobil.bazos.cz/smartwatch/')).toBeNull()
    expect(parseBazosListingUrl('není odkaz')).toBeNull()
  })
})
