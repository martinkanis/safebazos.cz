import { SearchX } from 'lucide-react'
import { Pagination } from '@/components/ui/pagination'
import type { ListingFilters } from './listing-filters'
import { ListingRows } from './listing-row'
import { LISTINGS_PAGE_SIZE, searchListings } from './queries'
import { SEARCH_PARAM } from './search-params'

interface ListingResultsProps {
  filters: ListingFilters
  basePath: string
  /** Aktuální query string (bez stránky) — zachová filtry při stránkování. */
  searchParams: URLSearchParams
}

function pageHref(basePath: string, searchParams: URLSearchParams, page: number): string {
  const params = new URLSearchParams(searchParams)
  if (page > 1) params.set(SEARCH_PARAM.page, String(page))
  else params.delete(SEARCH_PARAM.page)
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

export async function ListingResults({ filters, basePath, searchParams }: ListingResultsProps) {
  const { listings, total } = await searchListings(filters)
  const totalPages = Math.ceil(total / LISTINGS_PAGE_SIZE)

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line bg-surface px-4 py-12 text-center">
        <SearchX className="size-8 text-muted" aria-hidden />
        <p className="font-medium">Žádné inzeráty neodpovídají hledání.</p>
        <p className="text-sm text-muted">Zkuste upravit filtr nebo hledat v jiné kategorii.</p>
      </div>
    )
  }

  return (
    <section aria-label="Výsledky">
      <p className="mb-3 text-sm text-muted">
        Nalezeno {total.toLocaleString('cs-CZ')} inzerátů
        {totalPages > 1 && ` · stránka ${filters.page} z ${totalPages}`}
      </p>
      <ListingRows listings={listings} />
      <Pagination
        currentPage={filters.page}
        totalPages={totalPages}
        hrefForPage={(page) => pageHref(basePath, searchParams, page)}
      />
    </section>
  )
}
