import { z } from 'zod'
import { priceTypeEnum } from '@/db/schema'
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH } from './listing-limits'

const MAX_PRICE_CZK = 100_000_000

const CZECH_OR_SLOVAK_PHONE = /^(?:\+42[01])?\d{9}$/

function stripWhitespace(value: string): string {
  return value.replace(/\s/g, '')
}

/** Validace formuláře inzerátu na hranici systému (server action). */
export const listingInputSchema = z
  .object({
    categoryId: z.coerce.number().int().positive({ error: 'Vyberte kategorii.' }),
    title: z
      .string()
      .trim()
      .min(5, { error: 'Nadpis musí mít alespoň 5 znaků.' })
      .max(TITLE_MAX_LENGTH, { error: `Nadpis může mít nejvýše ${TITLE_MAX_LENGTH} znaků.` }),
    description: z
      .string()
      .trim()
      .min(20, { error: 'Popis musí mít alespoň 20 znaků.' })
      .max(DESCRIPTION_MAX_LENGTH, {
        error: `Popis může mít nejvýše ${DESCRIPTION_MAX_LENGTH} znaků.`,
      }),
    priceType: z.enum(priceTypeEnum.enumValues, { error: 'Vyberte typ ceny.' }),
    priceAmount: z
      .string()
      .transform(stripWhitespace)
      .pipe(
        z.union([
          z.literal('').transform(() => null),
          z.coerce
            .number<string>({ error: 'Cena musí být číslo.' })
            .int({ error: 'Cena musí být v celých korunách.' })
            .min(1, { error: 'Cena musí být kladná.' })
            .max(MAX_PRICE_CZK, { error: 'Cena je příliš vysoká.' }),
        ]),
      ),
    postalCode: z
      .string()
      .transform(stripWhitespace)
      .pipe(z.string().regex(/^\d{5}$/, { error: 'PSČ musí mít 5 číslic.' })),
    city: z
      .string()
      .trim()
      .min(2, { error: 'Vyplňte obec.' })
      .max(80, { error: 'Název obce je příliš dlouhý.' }),
    phone: z
      .string()
      .transform(stripWhitespace)
      .pipe(
        z.union([
          z.literal('').transform(() => null),
          z.string().regex(CZECH_OR_SLOVAK_PHONE, {
            error: 'Telefon zadejte jako 9 číslic, případně s předvolbou +420 / +421.',
          }),
        ]),
      ),
    acceptsSafePayment: z.boolean(),
  })
  .refine((input) => input.priceType !== 'amount' || input.priceAmount !== null, {
    error: 'Vyplňte cenu, nebo zvolte jiný typ ceny.',
    path: ['priceAmount'],
  })
  .transform((input) => ({
    ...input,
    priceAmount: input.priceType === 'amount' ? input.priceAmount : null,
  }))

export type ListingInput = z.infer<typeof listingInputSchema>

/** Chyby validace podle pole — pro zobrazení u formulářových prvků. */
export type ListingFieldErrors = Partial<Record<keyof ListingInput, string>>
