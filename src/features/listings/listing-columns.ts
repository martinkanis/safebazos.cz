import { assessScamRisk } from '@/features/safety/scam-detector'
import { normalizeText, slugify } from '@/lib/text'
import type { ListingInput } from './listing-input'
import { statusForAssessment } from './publication'

/**
 * Sloupce inzerátu odvozené z validovaného vstupu: slug, vyhledávací text
 * a výsledek kontroly podvodu (stav + signály).
 */
export function listingColumnsFrom(input: ListingInput) {
  const assessment = assessScamRisk(`${input.title}\n${input.description}`)
  return {
    ...input,
    slug: slugify(input.title),
    cityNormalized: normalizeText(input.city),
    searchText: normalizeText(`${input.title} ${input.description}`),
    status: statusForAssessment(assessment),
    riskLevel: assessment.level,
    riskSignals: assessment.signals,
  }
}
