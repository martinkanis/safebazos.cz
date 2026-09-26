import { randomUUID } from 'node:crypto'
import { hashPassword } from 'better-auth/crypto'
import { count, like } from 'drizzle-orm'
import type { PriceType } from '@/db/schema'
import { getCategoryTree } from '@/features/categories/queries'
import { listingColumnsFrom } from '@/features/listings/listing-columns'
import type { ListingInput } from '@/features/listings/listing-input'
import { listingExpiryFrom, LISTING_LIFETIME_DAYS } from '@/features/listings/publication'
import { getDb } from '../../client'
import { accounts, listingImages, listings, users } from '../../schema'
import { CATALOG, type MainCategoryCatalog, type SubcategoryCatalog } from './catalog'
import { generateListingImages } from './images'
import { FEMALE_FIRST_NAMES, MALE_FIRST_NAMES, PLACES, SURNAMES } from './places'
import { DEMO_SELLER_PASSWORD } from '../demo'
import { SeededRandom } from './random'

/**
 * Hromadná demo data: inzeráty rovnoměrně po kategoriích, s generovanými
 * ilustračními obrázky. Spouští CLI (bulk/index.ts) i start serveru (SEED_DEMO_LISTINGS).
 */

const SELLER_COUNT = 200
const SELLER_EMAIL_DOMAIN = 'demo.safebazos.test'
const CHUNK_SIZE = 100
const RANDOM_SEED = 20260926
const DAY_MS = 24 * 60 * 60 * 1000
/** Nejstarší inzerát bude pár dní před expirací, ať jde vyzkoušet i „Obnovit“. */
const MAX_AGE_DAYS = LISTING_LIFETIME_DAYS - 3

const NON_GOODS_CATEGORIES = new Set(['prace', 'sluzby', 'reality'])

const random = new SeededRandom(RANDOM_SEED)

interface CategorySlot {
  categoryId: number
  mainSlug: string
  mainIndex: number
  main: MainCategoryCatalog
  sub: SubcategoryCatalog
}

/** Rozdělí počet rovnoměrně mezi hlavní kategorie a v nich mezi podkategorie. */
async function planCategorySlots(total: number): Promise<CategorySlot[]> {
  const tree = await getCategoryTree()
  if (tree.length === 0) throw new Error('Chybí kategorie — spusťte nejdřív pnpm db:seed')

  const slots: CategorySlot[] = []
  tree.forEach((mainCategory, mainIndex) => {
    const mainCatalog = CATALOG[mainCategory.slug]
    if (!mainCatalog) throw new Error(`Katalog nemá kategorii ${mainCategory.slug}`)
    const perMain = Math.floor(total / tree.length) + (mainIndex < total % tree.length ? 1 : 0)
    for (let index = 0; index < perMain; index++) {
      const sub = mainCategory.subcategories[index % mainCategory.subcategories.length]
      const subCatalog = sub && mainCatalog.subcategories[sub.slug]
      if (!sub || !subCatalog) {
        throw new Error(`Katalog nemá podkategorii ${mainCategory.slug}/${sub?.slug ?? '?'}`)
      }
      slots.push({
        categoryId: sub.id,
        mainSlug: mainCategory.slug,
        mainIndex,
        main: mainCatalog,
        sub: subCatalog,
      })
    }
  })
  return slots
}

async function createSellers(): Promise<string[]> {
  const passwordHash = await hashPassword(DEMO_SELLER_PASSWORD)
  const now = Date.now()
  const sellers = Array.from({ length: SELLER_COUNT }, (_, index) => {
    const isFemale = random.chance(0.5)
    const firstName = random.pick(isFemale ? FEMALE_FIRST_NAMES : MALE_FIRST_NAMES)
    const [maleSurname, femaleSurname] = random.pick(SURNAMES)
    return {
      id: randomUUID(),
      name: `${firstName} ${isFemale ? femaleSurname : maleSurname}`,
      email: `prodejce-${index + 1}@${SELLER_EMAIL_DOMAIN}`,
      emailVerified: true,
      createdAt: new Date(now - random.integer(60, 900) * DAY_MS),
    }
  })
  await getDb().insert(users).values(sellers)
  await getDb()
    .insert(accounts)
    .values(
      sellers.map((seller) => ({
        id: randomUUID(),
        accountId: seller.id,
        providerId: 'credential',
        userId: seller.id,
        password: passwordHash,
      })),
    )
  return sellers.map((seller) => seller.id)
}

/** Cena zaokrouhlená na „bazarově“ hezké číslo podle řádu. */
function roundPrice(price: number): number {
  const step = price < 1000 ? 50 : price < 20_000 ? 100 : price < 200_000 ? 1000 : 10_000
  return Math.max(step, Math.round(price / step) * step)
}

function generatePrice(slot: CategorySlot): { priceType: PriceType; priceAmount: number | null } {
  if (!slot.sub.priceRange) {
    const priceType = random.weighted<PriceType>([
      ['negotiable', 5],
      ['in_text', 3],
      ['offer', 1],
    ])
    return { priceType, priceAmount: null }
  }
  const priceType = random.weighted<PriceType>([
    ['amount', 88],
    ['negotiable', 6],
    ['offer', 4],
    ['in_text', 2],
  ])
  if (priceType !== 'amount') return { priceType, priceAmount: null }
  // Logaritmické rozložení: levných věcí je víc než drahých, jako na skutečném bazaru.
  const [min, max] = slot.sub.priceRange
  const logPrice = Math.log(min) + random.next() * (Math.log(max) - Math.log(min))
  return { priceType, priceAmount: roundPrice(Math.exp(logPrice)) }
}

function generatePhone(): string | null {
  if (!random.chance(0.4)) return null
  const prefix = random.pick([
    '601',
    '602',
    '603',
    '604',
    '605',
    '606',
    '607',
    '608',
    '720',
    '721',
    '724',
    '731',
    '736',
    '739',
    '773',
    '775',
    '777',
    '792',
  ])
  return `${prefix}${String(random.integer(0, 999_999)).padStart(6, '0')}`
}

function generateListingInput(slot: CategorySlot): ListingInput {
  const item = random.pick(slot.sub.items)
  const hook = random.chance(0.45) ? ` – ${random.pick(slot.main.titleHooks)}` : ''
  const isGoods = !NON_GOODS_CATEGORIES.has(slot.mainSlug)
  const intro = isGoods ? `${random.pick(['Prodám', 'Nabízím', 'Prodávám'])} ${item}.` : `${item}.`
  const sentences = slot.main.sentenceGroups.map((group) => random.pick(group))
  const [city, postalCode] = random.weighted(PLACES.map((place) => [place, place[2]] as const))
  const { priceType, priceAmount } = generatePrice(slot)

  return {
    categoryId: slot.categoryId,
    title: `${item}${hook}`.slice(0, 100),
    description: [intro, ...sentences].join(' '),
    priceType,
    priceAmount,
    postalCode,
    city,
    phone: generatePhone(),
    acceptsSafePayment: random.chance(isGoods ? 0.6 : 0.1),
  }
}

function imageCountFor(slot: CategorySlot): number {
  if (!NON_GOODS_CATEGORIES.has(slot.mainSlug) || slot.mainSlug === 'reality') {
    return random.weighted([
      [0, 8],
      [1, 35],
      [2, 35],
      [3, 22],
    ])
  }
  return random.weighted([
    [0, 60],
    [1, 40],
  ])
}

async function insertChunk(slots: CategorySlot[], sellerIds: string[]) {
  const now = Date.now()
  const prepared = await Promise.all(
    slots.map(async (slot) => {
      // Všechny náhodné volby před prvním await — souběh by jinak rozházel pořadí a data by nebyla opakovatelná.
      const input = generateListingInput(slot)
      const hue = (slot.mainIndex * 18 + random.integer(-15, 15) + 360) % 360
      const publishedAt = new Date(now - random.next() * MAX_AGE_DAYS * DAY_MS)
      const values = {
        ...listingColumnsFrom(input),
        ownerUserId: random.pick(sellerIds),
        viewCount: Math.floor(random.next() ** 2 * 600),
        publishedAt,
        expiresAt: listingExpiryFrom(publishedAt),
      }
      const images = await generateListingImages(slot.sub.icon, hue, imageCountFor(slot), random)
      return { values, images }
    }),
  )

  await getDb().transaction(async (tx) => {
    for (const listing of prepared) {
      const [created] = await tx
        .insert(listings)
        .values(listing.values)
        .returning({ id: listings.id })
      if (!created) throw new Error('Vložení demo inzerátu nevrátilo ID')
      if (listing.images.length === 0) continue
      await tx
        .insert(listingImages)
        .values(
          listing.images.map((image, index) => ({
            ...image,
            listingId: created.id,
            sortOrder: index,
          })),
        )
    }
  })
}

export type ProgressReporter = (message: string) => void

/** Vloží `total` demo inzerátů. Vrací počet vložených (0 = data už existují). */
export async function seedBulkListings(total: number, report: ProgressReporter): Promise<number> {
  const [existing] = await getDb()
    .select({ total: count() })
    .from(users)
    .where(like(users.email, `%@${SELLER_EMAIL_DOMAIN}`))
  if ((existing?.total ?? 0) > 0) return 0

  const slots = await planCategorySlots(total)
  const sellerIds = await createSellers()
  report(`Prodejci: ${sellerIds.length} (heslo: ${DEMO_SELLER_PASSWORD})`)

  const startedAt = Date.now()
  for (let offset = 0; offset < slots.length; offset += CHUNK_SIZE) {
    await insertChunk(slots.slice(offset, offset + CHUNK_SIZE), sellerIds)
    const done = Math.min(offset + CHUNK_SIZE, slots.length)
    report(`Inzeráty: ${done}/${slots.length} (${Math.round((Date.now() - startedAt) / 1000)} s)`)
  }
  return slots.length
}
