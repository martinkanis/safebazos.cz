import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  like,
  lte,
  ne,
  sql,
  type SQL,
} from 'drizzle-orm'
import { getDb } from '@/db/client'
import {
  categories,
  listingImages,
  listings,
  users,
  type ListingStatus,
  type PriceType,
  type RiskLevel,
  type ScamSignal,
} from '@/db/schema'
import { normalizeText } from '@/lib/text'
import type { ListingFilters, ListingSort } from './listing-filters'

export const LISTINGS_PAGE_SIZE = 20
const MAX_SEARCH_TERMS = 5
const MIN_SEARCH_TERM_LENGTH = 2

export interface ListingSummary {
  id: number
  slug: string
  title: string
  description: string
  priceType: PriceType
  priceAmount: number | null
  city: string
  postalCode: string
  publishedAt: Date
  viewCount: number
  acceptsSafePayment: boolean
  thumbnailKey: string | null
}

/** Veřejně viditelný inzerát: schválený a neexpirovaný. */
const isPubliclyVisible = and(eq(listings.status, 'active'), gt(listings.expiresAt, sql`now()`))

/**
 * Náhled první fotky. Sloupce vnějšího dotazu musí být kvalifikované ručně —
 * drizzle je u dotazu nad jednou tabulkou vypisuje bez tabulky a "id" by se
 * v poddotazu vyhodnotilo jako listing_images.id.
 */
const firstThumbnailKey = sql<string | null>`(
  select image.thumbnail_key from listing_images as image
  where image.listing_id = "listings"."id"
  order by image.sort_order, image.id limit 1
)`

const listingSummaryColumns = {
  id: listings.id,
  slug: listings.slug,
  title: listings.title,
  description: listings.description,
  priceType: listings.priceType,
  priceAmount: listings.priceAmount,
  city: listings.city,
  postalCode: listings.postalCode,
  publishedAt: listings.publishedAt,
  viewCount: listings.viewCount,
  acceptsSafePayment: listings.acceptsSafePayment,
  thumbnailKey: firstThumbnailKey,
}

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`)
}

function searchTermConditions(query: string): SQL[] {
  const terms = normalizeText(query)
    .split(/\s+/)
    .filter((term) => term.length >= MIN_SEARCH_TERM_LENGTH)
    .slice(0, MAX_SEARCH_TERMS)
  return terms.map((term) => ilike(listings.searchText, `%${escapeLikePattern(term)}%`))
}

/** Lokalita: číslice = prefix PSČ („602“ → Brno-střed), jinak začátek názvu obce. */
function locationCondition(location: string): SQL {
  const digits = location.replace(/\s/g, '')
  if (/^\d{3,5}$/.test(digits)) return like(listings.postalCode, `${digits}%`)
  return like(listings.cityNormalized, `${escapeLikePattern(normalizeText(location.trim()))}%`)
}

function buildFilterConditions(filters: ListingFilters): SQL[] {
  const conditions: SQL[] = []
  if (filters.categoryIds) conditions.push(inArray(listings.categoryId, filters.categoryIds))
  if (filters.query) conditions.push(...searchTermConditions(filters.query))
  if (filters.location?.trim()) conditions.push(locationCondition(filters.location))
  if (filters.safePaymentOnly) conditions.push(eq(listings.acceptsSafePayment, true))

  const hasPriceRange = filters.priceMin !== undefined || filters.priceMax !== undefined
  if (hasPriceRange) conditions.push(eq(listings.priceType, 'amount'))
  if (filters.priceMin !== undefined) conditions.push(gte(listings.priceAmount, filters.priceMin))
  if (filters.priceMax !== undefined) conditions.push(lte(listings.priceAmount, filters.priceMax))
  return conditions
}

function orderByFor(sort: ListingSort): SQL[] {
  switch (sort) {
    case 'cheapest':
      return [sql`${listings.priceAmount} asc nulls last`, desc(listings.publishedAt)]
    case 'priciest':
      return [sql`${listings.priceAmount} desc nulls last`, desc(listings.publishedAt)]
    case 'newest':
      return [desc(listings.publishedAt), desc(listings.id)]
  }
}

export interface ListingSearchResult {
  listings: ListingSummary[]
  total: number
}

export async function searchListings(filters: ListingFilters): Promise<ListingSearchResult> {
  const db = getDb()
  const pageSize = filters.pageSize ?? LISTINGS_PAGE_SIZE
  const where = and(isPubliclyVisible, ...buildFilterConditions(filters))

  const [rows, [totalRow]] = await Promise.all([
    db
      .select(listingSummaryColumns)
      .from(listings)
      .where(where)
      .orderBy(...orderByFor(filters.sort))
      .limit(pageSize)
      .offset((filters.page - 1) * pageSize),
    db.select({ total: count() }).from(listings).where(where),
  ])
  return { listings: rows, total: totalRow?.total ?? 0 }
}

/** Počet veřejných inzerátů v každé hlavní kategorii (klíč = ID hlavní kategorie). */
export async function countListingsByMainCategory(): Promise<Map<number, number>> {
  const rows = await getDb()
    .select({ mainCategoryId: categories.parentId, total: count() })
    .from(listings)
    .innerJoin(categories, eq(categories.id, listings.categoryId))
    .where(isPubliclyVisible)
    .groupBy(categories.parentId)
  return new Map(
    rows.flatMap((row) => (row.mainCategoryId === null ? [] : [[row.mainCategoryId, row.total]])),
  )
}

export interface ListingImage {
  id: number
  storageKey: string
  thumbnailKey: string
  width: number
  height: number
}

export interface SellerProfile {
  id: string
  name: string
  memberSince: Date
  isEmailVerified: boolean
  activeListingCount: number
}

export interface ListingDetail {
  id: number
  slug: string
  ownerUserId: string
  categoryId: number
  title: string
  description: string
  priceType: PriceType
  priceAmount: number | null
  postalCode: string
  city: string
  hasPhone: boolean
  acceptsSafePayment: boolean
  status: ListingStatus
  riskLevel: RiskLevel
  riskSignals: ScamSignal[]
  viewCount: number
  publishedAt: Date
  expiresAt: Date
  images: ListingImage[]
}

function listingImagesFor(listingId: number): Promise<ListingImage[]> {
  return getDb()
    .select({
      id: listingImages.id,
      storageKey: listingImages.storageKey,
      thumbnailKey: listingImages.thumbnailKey,
      width: listingImages.width,
      height: listingImages.height,
    })
    .from(listingImages)
    .where(eq(listingImages.listingId, listingId))
    .orderBy(asc(listingImages.sortOrder), asc(listingImages.id))
}

/** Detail inzerátu bez ohledu na stav — o viditelnosti rozhoduje volající podle diváka. */
export async function getListingDetail(listingId: number): Promise<ListingDetail | null> {
  const [row] = await getDb()
    .select({
      id: listings.id,
      slug: listings.slug,
      ownerUserId: listings.ownerUserId,
      categoryId: listings.categoryId,
      title: listings.title,
      description: listings.description,
      priceType: listings.priceType,
      priceAmount: listings.priceAmount,
      postalCode: listings.postalCode,
      city: listings.city,
      hasPhone: sql<boolean>`${listings.phone} is not null`,
      acceptsSafePayment: listings.acceptsSafePayment,
      status: listings.status,
      riskLevel: listings.riskLevel,
      riskSignals: listings.riskSignals,
      viewCount: listings.viewCount,
      publishedAt: listings.publishedAt,
      expiresAt: listings.expiresAt,
    })
    .from(listings)
    .where(and(eq(listings.id, listingId), ne(listings.status, 'deleted')))
    .limit(1)
  if (!row) return null
  return { ...row, images: await listingImagesFor(listingId) }
}

export async function getSellerProfile(userId: string): Promise<SellerProfile | null> {
  const db = getDb()
  const [[user], [listingCount]] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        memberSince: users.createdAt,
        isEmailVerified: users.emailVerified,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1),
    db
      .select({ total: count() })
      .from(listings)
      .where(and(eq(listings.ownerUserId, userId), isPubliclyVisible)),
  ])
  if (!user) return null
  return { ...user, activeListingCount: listingCount?.total ?? 0 }
}

/** Zvýší počítadlo zobrazení — volá se po odeslání odpovědi (next/server after). */
export async function incrementViewCount(listingId: number): Promise<void> {
  await getDb()
    .update(listings)
    .set({ viewCount: sql`${listings.viewCount} + 1` })
    .where(eq(listings.id, listingId))
}

export interface OwnListing {
  id: number
  slug: string
  title: string
  priceType: PriceType
  priceAmount: number | null
  status: ListingStatus
  viewCount: number
  publishedAt: Date
  expiresAt: Date
  thumbnailKey: string | null
}

export function getOwnListings(userId: string): Promise<OwnListing[]> {
  return getDb()
    .select({
      id: listings.id,
      slug: listings.slug,
      title: listings.title,
      priceType: listings.priceType,
      priceAmount: listings.priceAmount,
      status: listings.status,
      viewCount: listings.viewCount,
      publishedAt: listings.publishedAt,
      expiresAt: listings.expiresAt,
      thumbnailKey: firstThumbnailKey,
    })
    .from(listings)
    .where(and(eq(listings.ownerUserId, userId), ne(listings.status, 'deleted')))
    .orderBy(desc(listings.publishedAt))
}

export interface EditableListing {
  id: number
  slug: string
  status: ListingStatus
  categoryId: number
  title: string
  description: string
  priceType: PriceType
  priceAmount: number | null
  postalCode: string
  city: string
  phone: string | null
  acceptsSafePayment: boolean
  expiresAt: Date
  images: ListingImage[]
}

/** Inzerát k úpravě — jen vlastníkovi; null = neexistuje nebo patří jinému. */
export async function getEditableListing(
  listingId: number,
  userId: string,
): Promise<EditableListing | null> {
  const [row] = await getDb()
    .select({
      id: listings.id,
      slug: listings.slug,
      status: listings.status,
      categoryId: listings.categoryId,
      title: listings.title,
      description: listings.description,
      priceType: listings.priceType,
      priceAmount: listings.priceAmount,
      postalCode: listings.postalCode,
      city: listings.city,
      phone: listings.phone,
      acceptsSafePayment: listings.acceptsSafePayment,
      expiresAt: listings.expiresAt,
    })
    .from(listings)
    .where(
      and(
        eq(listings.id, listingId),
        eq(listings.ownerUserId, userId),
        ne(listings.status, 'deleted'),
      ),
    )
    .limit(1)
  if (!row) return null
  return { ...row, images: await listingImagesFor(listingId) }
}

export interface SitemapListing {
  id: number
  slug: string
  updatedAt: Date
}

export function getSitemapListings(limit: number): Promise<SitemapListing[]> {
  return getDb()
    .select({ id: listings.id, slug: listings.slug, updatedAt: listings.updatedAt })
    .from(listings)
    .where(isPubliclyVisible)
    .orderBy(desc(listings.publishedAt))
    .limit(limit)
}
