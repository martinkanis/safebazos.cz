import type { MetadataRoute } from 'next'
import { loadEnv } from '@/config/env'
import { categoryPath, getCategoryTree } from '@/features/categories/queries'
import { listingPath } from '@/features/listings/paths'
import { getSitemapListings } from '@/features/listings/queries'

/** Limit jednoho sitemap souboru dle specifikace je 50 000 URL. */
const MAX_SITEMAP_LISTINGS = 45_000

// Sitemap čte živá data z DB — nesmí se předgenerovat při buildu.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = loadEnv().APP_URL
  const [categoryTree, listings] = await Promise.all([
    getCategoryTree(),
    getSitemapListings(MAX_SITEMAP_LISTINGS),
  ])

  const staticPages: MetadataRoute.Sitemap = ['/', '/bezpecnost', '/bezpecna-platba'].map(
    (path) => ({ url: `${appUrl}${path}`, changeFrequency: 'daily' }),
  )
  const categoryPages: MetadataRoute.Sitemap = categoryTree.flatMap((main) => [
    { url: `${appUrl}${categoryPath(main)}`, changeFrequency: 'hourly' as const },
    ...main.subcategories.map((sub) => ({
      url: `${appUrl}${categoryPath(main, sub)}`,
      changeFrequency: 'hourly' as const,
    })),
  ])
  const listingPages: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${appUrl}${listingPath(listing)}`,
    lastModified: listing.updatedAt,
  }))

  return [...staticPages, ...categoryPages, ...listingPages]
}
