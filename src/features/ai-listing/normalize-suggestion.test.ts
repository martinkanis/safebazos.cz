import { describe, expect, it } from 'vitest'
import { normalizeSuggestion } from './normalize-suggestion'
import type { RawListingSuggestion } from './suggestion-schema'

const raw: RawListingSuggestion = {
  isSellableItem: true,
  detectedItem: 'GoPro HERO 11 Black',
  title: '  GoPro HERO 11 Black + 2 baterie  ',
  description: 'Akční kamera GoPro HERO 11 Black.',
  categoryId: 42,
  suggestedPriceCzk: 6500,
  priceConfidence: 'medium',
  missingDetails: ['stáří', ' ', 'stav baterií'],
}

describe('normalizeSuggestion', () => {
  it('ořízne mezery a prázdné chybějící údaje', () => {
    const suggestion = normalizeSuggestion(raw, new Set([42]))
    expect(suggestion.title).toBe('GoPro HERO 11 Black + 2 baterie')
    expect(suggestion.missingDetails).toEqual(['stáří', 'stav baterií'])
  })

  it('neznámou kategorii zahodí', () => {
    expect(normalizeSuggestion(raw, new Set([1, 2])).categoryId).toBeNull()
  })

  it('nesmyslnou cenu zahodí', () => {
    expect(
      normalizeSuggestion({ ...raw, suggestedPriceCzk: 0 }, new Set()).suggestedPriceCzk,
    ).toBeNull()
    expect(
      normalizeSuggestion({ ...raw, suggestedPriceCzk: -5 }, new Set()).suggestedPriceCzk,
    ).toBeNull()
  })

  it('příliš dlouhý nadpis zkrátí na limit inzerátu', () => {
    const suggestion = normalizeSuggestion({ ...raw, title: 'x'.repeat(300) }, new Set())
    expect(suggestion.title.length).toBe(100)
  })
})
