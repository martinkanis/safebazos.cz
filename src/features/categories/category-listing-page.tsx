import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { ListingFilterForm } from '@/features/listings/listing-filter-form'
import { ListingResults } from '@/features/listings/listing-results'
import {
  hasActiveFilters,
  parseListingSearchParams,
  SEARCH_PARAM,
  toUrlSearchParams,
  type RawSearchParams,
} from '@/features/listings/search-params'
import { cn } from '@/lib/utils'
import { categoryPath, type ResolvedCategory } from './queries'

function categoryTitle({ main, sub }: ResolvedCategory): string {
  return sub ? `${sub.name} – ${main.name}` : main.name
}

/**
 * SEO výpisu kategorie: kanonická adresa bez filtrů (stránkování zachová),
 * filtrované kombinace se neindexují, aby Google neprocházel tisíce duplicit.
 */
export function categoryMetadata(
  category: ResolvedCategory,
  rawSearchParams: RawSearchParams,
): Metadata {
  const filters = parseListingSearchParams(rawSearchParams)
  const path = categoryPath(category.main, category.sub)
  const canonical = filters.page > 1 ? `${path}?${SEARCH_PARAM.page}=${filters.page}` : path
  const title = `${categoryTitle(category)} – bazar a inzerce zdarma`
  const pageSuffix = filters.page > 1 ? ` (strana ${filters.page})` : ''
  return {
    title: `${title}${pageSuffix}`,
    description: `Inzeráty v kategorii ${categoryTitle(category)}. Prodávejte a nakupujte bezpečně — s ochranou proti podvodům a platbou přes úschovu.`,
    alternates: { canonical },
    robots: hasActiveFilters(filters) ? { index: false, follow: true } : undefined,
    openGraph: { title, url: canonical },
  }
}

interface CategoryListingPageProps {
  category: ResolvedCategory
  rawSearchParams: RawSearchParams
}

export function CategoryListingPage({ category, rawSearchParams }: CategoryListingPageProps) {
  const { main, sub } = category
  const filters = parseListingSearchParams(rawSearchParams)
  const path = categoryPath(main, sub)
  const categoryIds = sub ? [sub.id] : main.subcategories.map((subcategory) => subcategory.id)
  const breadcrumbs = [
    { name: main.name, href: categoryPath(main) },
    ...(sub ? [{ name: sub.name, href: path }] : []),
  ]

  return (
    <div className="space-y-5">
      <Breadcrumbs items={breadcrumbs} />
      <h1 className="text-2xl font-bold">{sub ? `${main.name}: ${sub.name}` : main.name}</h1>

      <nav aria-label={`Podkategorie ${main.name}`}>
        <ul className="flex flex-wrap gap-2">
          {main.subcategories.map((subcategory) => (
            <li key={subcategory.id}>
              <Link
                href={categoryPath(main, subcategory)}
                aria-current={subcategory.id === sub?.id ? 'page' : undefined}
                className={cn(
                  'inline-block rounded-full border px-3 py-1 text-sm',
                  subcategory.id === sub?.id
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-line bg-surface hover:border-brand-600 hover:text-brand-700',
                )}
              >
                {subcategory.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <ListingFilterForm action={path} filters={filters} />
      <ListingResults
        filters={{ ...filters, categoryIds }}
        basePath={path}
        searchParams={toUrlSearchParams(rawSearchParams)}
      />
    </div>
  )
}
