import type { PriceType } from '@/db/schema'

const priceFormatter = new Intl.NumberFormat('cs-CZ', {
  style: 'currency',
  currency: 'CZK',
  maximumFractionDigits: 0,
})

const PRICE_TYPE_LABELS: Record<Exclude<PriceType, 'amount'>, string> = {
  negotiable: 'Dohodou',
  offer: 'Nabídněte',
  free: 'Zdarma',
  in_text: 'V textu',
}

/** Volby typu ceny ve formuláři inzerátu (pořadí = pořadí v selectu). */
export const PRICE_TYPE_OPTIONS: ReadonlyArray<{ value: PriceType; label: string }> = [
  { value: 'amount', label: 'Cena v Kč' },
  { value: 'negotiable', label: PRICE_TYPE_LABELS.negotiable },
  { value: 'offer', label: PRICE_TYPE_LABELS.offer },
  { value: 'free', label: PRICE_TYPE_LABELS.free },
  { value: 'in_text', label: PRICE_TYPE_LABELS.in_text },
]

/** Cena inzerátu pro zobrazení: „12 500 Kč“, „Dohodou“, „Zdarma“… */
export function formatListingPrice(priceType: PriceType, priceAmount: number | null): string {
  if (priceType !== 'amount') return PRICE_TYPE_LABELS[priceType]
  if (priceAmount === null) return PRICE_TYPE_LABELS.negotiable
  return priceFormatter.format(priceAmount)
}
