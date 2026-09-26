import type { Metadata } from 'next'
import { ListingFilterForm } from '@/features/listings/listing-filter-form'
import { ListingResults } from '@/features/listings/listing-results'
import {
  parseListingSearchParams,
  toUrlSearchParams,
  type RawSearchParams,
} from '@/features/listings/search-params'

interface SearchPageProps {
  searchParams: Promise<RawSearchParams>
}

/** Výsledky vyhledávání se neindexují — nekonečně mnoho kombinací, nulová unikátní hodnota. */
export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { query } = parseListingSearchParams(await searchParams)
  return {
    title: query ? `Hledání „${query}“` : 'Hledání',
    robots: { index: false, follow: true },
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const rawSearchParams = await searchParams
  const filters = parseListingSearchParams(rawSearchParams)
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">
        {filters.query ? `Hledání „${filters.query}“` : 'Všechny inzeráty'}
      </h1>
      <ListingFilterForm action="/hledat" filters={filters} />
      <ListingResults
        filters={filters}
        basePath="/hledat"
        searchParams={toUrlSearchParams(rawSearchParams)}
      />
    </div>
  )
}
