import { randomUUID } from 'node:crypto'
import { hashPassword } from 'better-auth/crypto'
import { count, eq } from 'drizzle-orm'
import { loadEnv } from '@/config/env'
import { listingColumnsFrom } from '@/features/listings/listing-columns'
import { listingExpiryFrom } from '@/features/listings/publication'
import { closeDb, getDb } from '../client'
import { accounts, categories, listings, users } from '../schema'
import { CATEGORY_SEEDS } from './categories'
import { DEMO_LISTINGS, DEMO_SELLERS } from './demo-listings'

const DAY_MS = 24 * 60 * 60 * 1000
const DEMO_SELLER_PASSWORD = 'demo-heslo-123'

function log(message: string) {
  process.stdout.write(`${message}\n`)
}

async function seedCategories(): Promise<Map<string, number>> {
  const db = getDb()
  const [existing] = await db.select({ total: count() }).from(categories)
  if ((existing?.total ?? 0) === 0) {
    for (const [mainIndex, main] of CATEGORY_SEEDS.entries()) {
      const [mainRow] = await db
        .insert(categories)
        .values({ slug: main.slug, name: main.name, sortOrder: mainIndex })
        .returning({ id: categories.id })
      if (!mainRow) throw new Error(`Kategorii ${main.slug} se nepodařilo vložit`)
      await db.insert(categories).values(
        main.subcategories.map(([slug, name], subIndex) => ({
          parentId: mainRow.id,
          slug,
          name,
          sortOrder: subIndex,
        })),
      )
    }
    log(`Kategorie: vloženo ${CATEGORY_SEEDS.length} hlavních.`)
  }

  const rows = await db
    .select({ id: categories.id, slug: categories.slug, parentId: categories.parentId })
    .from(categories)
  const mainSlugById = new Map(rows.filter((row) => !row.parentId).map((row) => [row.id, row.slug]))
  return new Map(
    rows
      .filter((row) => row.parentId !== null)
      .map((row) => [`${mainSlugById.get(row.parentId ?? 0)}/${row.slug}`, row.id]),
  )
}

/** Vytvoří ověřený účet s heslem (bez e-mailu), nebo vrátí ID existujícího. */
async function ensureUser(input: { name: string; email: string; password: string; role?: string }) {
  const db = getDb()
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1)
  if (existing) return existing.id

  const userId = randomUUID()
  await db.insert(users).values({
    id: userId,
    name: input.name,
    email: input.email,
    emailVerified: true,
    role: input.role ?? 'user',
  })
  await db.insert(accounts).values({
    id: randomUUID(),
    accountId: userId,
    providerId: 'credential',
    userId,
    password: await hashPassword(input.password),
  })
  return userId
}

async function seedAdmin() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = loadEnv()
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    log('Admin: ADMIN_EMAIL/ADMIN_PASSWORD nejsou nastavené, přeskakuji.')
    return
  }
  await ensureUser({
    name: 'Moderátor',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
  })
  log(`Admin: ${ADMIN_EMAIL}`)
}

async function seedDemoListings(categoryIdByPath: Map<string, number>) {
  const db = getDb()
  const [existing] = await db.select({ total: count() }).from(listings)
  if ((existing?.total ?? 0) > 0) {
    log('Demo inzeráty: už existují, přeskakuji.')
    return
  }

  const sellerIds = await Promise.all(
    DEMO_SELLERS.map((seller) => ensureUser({ ...seller, password: DEMO_SELLER_PASSWORD })),
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
  log(`Demo inzeráty: vloženo ${DEMO_LISTINGS.length} (prodejci, heslo: ${DEMO_SELLER_PASSWORD}).`)
}

async function main() {
  const categoryIdByPath = await seedCategories()
  await seedAdmin()
  await seedDemoListings(categoryIdByPath)
}

main()
  .catch((error: unknown) => {
    process.stderr.write(`Seed selhal: ${error instanceof Error ? error.stack : String(error)}\n`)
    process.exitCode = 1
  })
  .finally(() => closeDb())
