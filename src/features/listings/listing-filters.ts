export const LISTING_SORTS = ['newest', 'cheapest', 'priciest'] as const
export type ListingSort = (typeof LISTING_SORTS)[number]

export interface ListingFilters {
  categoryIds?: number[]
  query?: string
  location?: string
  priceMin?: number
  priceMax?: number
  safePaymentOnly?: boolean
  sort: ListingSort
  page: number
  pageSize?: number
}
