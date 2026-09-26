import { describe, expect, it } from 'vitest'
import { formatPostalCode, normalizeText, slugify, truncateText } from './text'

describe('normalizeText', () => {
  it('odstraní diakritiku a převede na malá písmena', () => {
    expect(normalizeText('Škoda Octávia ŘÍJEN')).toBe('skoda octavia rijen')
  })
})

describe('slugify', () => {
  it('vytvoří SEO slug z názvu inzerátu', () => {
    expect(slugify('Prodám kolo Author 29" — TOP stav!')).toBe('prodam-kolo-author-29-top-stav')
  })

  it('pro text bez písmen vrátí náhradní slug', () => {
    expect(slugify('!!!')).toBe('inzerat')
  })

  it('omezí délku a neskončí pomlčkou', () => {
    const slug = slugify('a '.repeat(100))
    expect(slug.length).toBeLessThanOrEqual(80)
    expect(slug.endsWith('-')).toBe(false)
  })
})

describe('truncateText', () => {
  it('krátký text nechá beze změny', () => {
    expect(truncateText('Krátký popis', 50)).toBe('Krátký popis')
  })

  it('dlouhý text zkrátí po celých slovech', () => {
    expect(truncateText('Prodám velmi zachovalou sedačku', 20)).toBe('Prodám velmi…')
  })
})

describe('formatPostalCode', () => {
  it('vloží mezeru za třetí číslici', () => {
    expect(formatPostalCode('60200')).toBe('602 00')
  })
})
