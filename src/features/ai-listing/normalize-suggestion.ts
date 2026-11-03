import { TITLE_MAX_LENGTH, DESCRIPTION_MAX_LENGTH } from '@/features/listings/listing-limits'
import type { RawListingSuggestion } from './suggestion-schema'

const MAX_SUGGESTED_PRICE_CZK = 100_000_000
const MAX_MISSING_DETAILS = 6

export interface ListingSuggestion {
  detectedItem: string
  title: string
  description: string
  categoryId: number | null
  suggestedPriceCzk: number | null
  priceConfidence: RawListingSuggestion['priceConfidence']
  missingDetails: string[]
}

function clip(text: string, maxLength: number): string {
  const trimmed = text.trim()
  return trimmed.length <= maxLength ? trimmed : trimmed.slice(0, maxLength).trimEnd()
}

function isPlausiblePrice(price: number | null): price is number {
  return price !== null && Number.isInteger(price) && price >= 1 && price <= MAX_SUGGESTED_PRICE_CZK
}

/**
 * Výstup modelu je nedůvěryhodný vstup: oříznout délky, kategorii přijmout jen
 * ze známých podkategorií, nesmyslnou cenu zahodit.
 */
export function normalizeSuggestion(
  raw: RawListingSuggestion,
  knownSubcategoryIds: ReadonlySet<number>,
): ListingSuggestion {
  return {
    detectedItem: clip(raw.detectedItem, TITLE_MAX_LENGTH),
    title: clip(raw.title, TITLE_MAX_LENGTH),
    description: clip(raw.description, DESCRIPTION_MAX_LENGTH),
    categoryId:
      raw.categoryId !== null && knownSubcategoryIds.has(raw.categoryId) ? raw.categoryId : null,
    suggestedPriceCzk: isPlausiblePrice(raw.suggestedPriceCzk) ? raw.suggestedPriceCzk : null,
    priceConfidence: raw.priceConfidence,
    missingDetails: raw.missingDetails
      .map((detail) => detail.trim())
      .filter(Boolean)
      .slice(0, MAX_MISSING_DETAILS),
  }
}
