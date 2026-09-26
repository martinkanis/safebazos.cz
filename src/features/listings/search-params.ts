import { LISTING_SORTS, type ListingFilters, type ListingSort } from './listing-filters'

/** Parametry URL výpisu inzerátů — česky, protože jsou vidět v adrese a ve výsledcích Googlu. */
export const SEARCH_PARAM = {
  query: 'q',
  location: 'lokalita',
  priceMin: 'cena-od',
  priceMax: 'cena-do',
  safePaymentOnly: 'bezpecna-platba',
  sort: 'razeni',
  page: 'strana',
} as const

const SORT_PARAM_VALUES: Record<ListingSort, string> = {
  newest: 'nejnovejsi',
  cheapest: 'nejlevnejsi',
  priciest: 'nejdrazsi',
}

export const SORT_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: SORT_PARAM_VALUES.newest, label: 'Nejnovější' },
  { value: SORT_PARAM_VALUES.cheapest, label: 'Nejlevnější' },
  { value: SORT_PARAM_VALUES.priciest, label: 'Nejdražší' },
]

const MAX_PAGE = 500

export type RawSearchParams = Record<string, string | string[] | undefined>

function firstValue(params: RawSearchParams, name: string): string | undefined {
  const value = params[name]
  const single = Array.isArray(value) ? value[0] : value
  return single?.trim() || undefined
}

function parseNonNegativeInteger(value: string | undefined): number | undefined {
  if (value === undefined) return undefined
  const parsed = Number(value.replace(/\s/g, ''))
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : undefined
}

function parseSort(value: string | undefined): ListingSort {
  const match = LISTING_SORTS.find((sort) => SORT_PARAM_VALUES[sort] === value)
  return match ?? 'newest'
}

function parsePage(value: string | undefined): number {
  const page = parseNonNegativeInteger(value)
  return page && page >= 1 ? Math.min(page, MAX_PAGE) : 1
}

/** Filtry výpisu z URL. Nevalidní hodnoty tiše ignoruje — adresu může kdokoli upravit ručně. */
export function parseListingSearchParams(
  params: RawSearchParams,
): Omit<ListingFilters, 'categoryIds'> {
  return {
    query: firstValue(params, SEARCH_PARAM.query),
    location: firstValue(params, SEARCH_PARAM.location),
    priceMin: parseNonNegativeInteger(firstValue(params, SEARCH_PARAM.priceMin)),
    priceMax: parseNonNegativeInteger(firstValue(params, SEARCH_PARAM.priceMax)),
    safePaymentOnly: firstValue(params, SEARCH_PARAM.safePaymentOnly) === '1',
    sort: parseSort(firstValue(params, SEARCH_PARAM.sort)),
    page: parsePage(firstValue(params, SEARCH_PARAM.page)),
  }
}

export function sortParamValue(sort: ListingSort): string {
  return SORT_PARAM_VALUES[sort]
}

/** Jde o čistý výpis kategorie (bez filtrů)? Jen takové stránky indexujeme. */
export function hasActiveFilters(filters: Omit<ListingFilters, 'categoryIds'>): boolean {
  return Boolean(
    filters.query ||
    filters.location ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    filters.safePaymentOnly ||
    filters.sort !== 'newest',
  )
}

/** Syrové parametry z Next.js → URLSearchParams (vícenásobné hodnoty zachová). */
export function toUrlSearchParams(params: RawSearchParams): URLSearchParams {
  const searchParams = new URLSearchParams()
  for (const [name, value] of Object.entries(params)) {
    for (const single of Array.isArray(value) ? value : [value]) {
      if (single !== undefined) searchParams.append(name, single)
    }
  }
  return searchParams
}
