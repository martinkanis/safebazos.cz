import { count } from 'drizzle-orm'
import { getCategoryTree } from '@/features/categories/queries'
import { listingColumnsFrom } from '@/features/listings/listing-columns'
import { listingExpiryFrom } from '@/features/listings/publication'
import { ensureCredentialUser } from '../bootstrap'
import { getDb } from '../client'
import { listings } from '../schema'
import { DEMO_LISTINGS, DEMO_SELLERS } from './demo-listings'

const DAY_MS = 24 * 60 * 60 * 1000
export const DEMO_SELLER_PASSWORD = 'demo-heslo-123'

async function categoryIdsByPath(): Promise<Map<string, number>> {
  const tree = await getCategoryTree()
  return new Map(
    tree.flatMap((main) => main.subcategories.map((sub) => [`${main.slug}/${sub.slug}`, sub.id])),
  )
}

/** Ručně napsané ukázkové inzeráty (včetně jednoho zadrženého pro moderaci). Vrací počet vložených. */
export async function seedHandcraftedListings(): Promise<number> {
  const db = getDb()
  const [existing] = await db.select({ total: count() }).from(listings)
  if ((existing?.total ?? 0) > 0) return 0

  const categoryIdByPath = await categoryIdsByPath()
  const sellerIds = await Promise.all(
    DEMO_SELLERS.map((seller) =>
      ensureCredentialUser({ ...seller, password: DEMO_SELLER_PASSWORD }),
    ),
  )
  const now = Date.now()
  for (const demo of DEMO_LISTINGS) {
    const categoryId = categoryIdByPath.get(demo.category)
    const ownerUserId = sellerIds[demo.sellerIndex]
    if (!categoryId || !ownerUserId) {
      throw new Error(`Demo inzerát „${demo.title}“ má neplatnou kategorii nebo prodejce`)
    }
    const publishedAt = new Date(now - demo.daysAgo * DAY_MS)
    await db.insert(listings).values({
      ...listingColumnsFrom({
        categoryId,
        title: demo.title,
        description: demo.description,
        priceType: demo.priceType,
        priceAmount: demo.priceAmount ?? null,
        postalCode: demo.postalCode,
        city: demo.city,
        phone: demo.phone ?? null,
        acceptsSafePayment: demo.acceptsSafePayment,
      }),
      ownerUserId,
      publishedAt,
      expiresAt: listingExpiryFrom(publishedAt),
    })
  }
  return DEMO_LISTINGS.length
}
