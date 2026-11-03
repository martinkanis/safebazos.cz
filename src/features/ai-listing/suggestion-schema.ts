import { z } from 'zod'

/**
 * Struktura, kterou model vrací (structured outputs). Délky a rozsahy záměrně
 * nevynucujeme ve schématu — omezení hlídá normalizeSuggestion po přijetí.
 */
export const listingSuggestionSchema = z.object({
  isSellableItem: z
    .boolean()
    .describe('false, když fotky neukazují věc k prodeji nebo jde o zakázané zboží'),
  detectedItem: z.string().describe('Co je na fotkách, co nejpřesněji (značka, model)'),
  title: z.string().describe('Nadpis inzerátu, nejvýše 70 znaků'),
  description: z.string().describe('Popis inzerátu v češtině, 3–6 krátkých vět'),
  categoryId: z.number().int().nullable().describe('ID podkategorie ze seznamu, nebo null'),
  suggestedPriceCzk: z
    .number()
    .int()
    .nullable()
    .describe('Obvyklá cena v Kč na českých bazarech, nebo null'),
  priceConfidence: z.enum(['low', 'medium', 'high']),
  missingDetails: z
    .array(z.string())
    .describe('Údaje, které z fotek nejde poznat a prodejce by je měl doplnit'),
})

export type RawListingSuggestion = z.infer<typeof listingSuggestionSchema>
