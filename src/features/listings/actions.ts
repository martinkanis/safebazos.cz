'use server'

import { and, count, eq, gt, inArray, max, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { z } from 'zod'
import { getDb } from '@/db/client'
import { listingImages, listings } from '@/db/schema'
import { findSubcategoryById } from '@/features/categories/queries'
import { formFiles, formString } from '@/lib/form'
import { createLogger } from '@/lib/logger'
import { requireUser } from '@/lib/require-user'
import { deleteObjects } from '@/lib/storage'
import type { ListingFormState } from './form-state'
import { storeListingImages, validateImageFiles, type StoredImage } from './images'
import { listingColumnsFrom } from './listing-columns'
import { listingInputSchema, type ListingFieldErrors, type ListingInput } from './listing-input'
import { listingPath } from './paths'
import { canRenewListing, listingExpiryFrom } from './publication'
import { getEditableListing } from './queries'

const logger = createLogger('listings')

/** Ochrana proti spamu a hromadnému zakládání podvodných inzerátů. */
const MAX_NEW_LISTINGS_PER_DAY = 20

function formError(message: string, fieldErrors: ListingFieldErrors = {}): ListingFormState {
  return { status: 'error', message, fieldErrors }
}

function validationError(error: z.ZodError): ListingFormState {
  const fieldErrors: ListingFieldErrors = {}
  for (const issue of error.issues) {
    const field = issue.path[0] as keyof ListingInput | undefined
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message
  }
  return formError('Formulář obsahuje chyby, opravte prosím zvýrazněná pole.', fieldErrors)
}

function parseListingForm(formData: FormData) {
  return listingInputSchema.safeParse({
    categoryId: formString(formData, 'categoryId'),
    title: formString(formData, 'title'),
    description: formString(formData, 'description'),
    priceType: formString(formData, 'priceType'),
    priceAmount: formString(formData, 'priceAmount'),
    postalCode: formString(formData, 'postalCode'),
    city: formString(formData, 'city'),
    phone: formString(formData, 'phone'),
    acceptsSafePayment: formData.get('acceptsSafePayment') === 'on',
  })
}

async function hasReachedDailyListingLimit(userId: string): Promise<boolean> {
  const [row] = await getDb()
    .select({ total: count() })
    .from(listings)
    .where(
      and(eq(listings.ownerUserId, userId), gt(listings.createdAt, sql`now() - interval '1 day'`)),
    )
  return (row?.total ?? 0) >= MAX_NEW_LISTINGS_PER_DAY
}

async function storeImagesOrError(
  files: File[],
): Promise<{ images: StoredImage[] } | { error: ListingFormState }> {
  try {
    return { images: await storeListingImages(files) }
  } catch (error) {
    logger.warn(
      { err: error, fileNames: files.map((file) => file.name) },
      'Zpracování fotek selhalo',
    )
    return {
      error: formError('Některou z fotek se nepodařilo zpracovat. Zkuste jiný soubor (JPG, PNG).'),
    }
  }
}

export async function createListing(
  _previousState: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const user = await requireUser('/pridat-inzerat')
  const parsed = parseListingForm(formData)
  if (!parsed.success) return validationError(parsed.error)
  const input = parsed.data

  if (!(await findSubcategoryById(input.categoryId))) {
    return formError('Vyberte prosím konkrétní podkategorii.', {
      categoryId: 'Neplatná kategorie.',
    })
  }
  if (await hasReachedDailyListingLimit(user.id)) {
    return formError(
      `Za posledních 24 hodin jste přidali ${MAX_NEW_LISTINGS_PER_DAY} inzerátů, víc zatím nejde. Zkuste to prosím později.`,
    )
  }

  const files = formFiles(formData, 'images')
  const imageError = validateImageFiles(files, 0)
  if (imageError) return formError(imageError)
  const stored = await storeImagesOrError(files)
  if ('error' in stored) return stored.error

  const publishedAt = new Date()
  const columns = listingColumnsFrom(input)
  const listingId = await getDb().transaction(async (tx) => {
    const [created] = await tx
      .insert(listings)
      .values({
        ...columns,
        ownerUserId: user.id,
        publishedAt,
        expiresAt: listingExpiryFrom(publishedAt),
      })
      .returning({ id: listings.id })
    if (!created) throw new Error(`Vložení inzerátu uživatele ${user.id} nevrátilo ID`)
    if (stored.images.length > 0) {
      await tx
        .insert(listingImages)
        .values(
          stored.images.map((image, index) => ({
            ...image,
            listingId: created.id,
            sortOrder: index,
          })),
        )
    }
    return created.id
  })

  logger.info({ listingId, userId: user.id, status: columns.status }, 'Inzerát vytvořen')
  redirect(`${listingPath({ id: listingId, slug: columns.slug })}?stav=novy`)
}

function parseImageIds(formData: FormData, name: string): number[] {
  return formData
    .getAll(name)
    .map((value) => Number(value))
    .filter((id) => Number.isInteger(id) && id > 0)
}

export async function updateListing(
  listingId: number,
  _previousState: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const user = await requireUser(`/muj-ucet/inzerat/${listingId}/upravit`)
  const existing = await getEditableListing(listingId, user.id)
  if (!existing) return formError('Inzerát nebyl nalezen.')
  if (existing.status === 'blocked') return formError('Zablokovaný inzerát nelze upravovat.')

  const parsed = parseListingForm(formData)
  if (!parsed.success) return validationError(parsed.error)
  const input = parsed.data
  if (!(await findSubcategoryById(input.categoryId))) {
    return formError('Vyberte prosím konkrétní podkategorii.', {
      categoryId: 'Neplatná kategorie.',
    })
  }

  const ownImageIds = new Set(existing.images.map((image) => image.id))
  const removedImages = existing.images.filter((image) =>
    parseImageIds(formData, 'removeImageIds').includes(image.id),
  )
  const files = formFiles(formData, 'images')
  const imageError = validateImageFiles(files, ownImageIds.size - removedImages.length)
  if (imageError) return formError(imageError)
  const stored = await storeImagesOrError(files)
  if ('error' in stored) return stored.error

  const columns = listingColumnsFrom(input)
  await getDb().transaction(async (tx) => {
    await tx.update(listings).set(columns).where(eq(listings.id, listingId))
    if (removedImages.length > 0) {
      await tx.delete(listingImages).where(
        inArray(
          listingImages.id,
          removedImages.map((image) => image.id),
        ),
      )
    }
    if (stored.images.length > 0) {
      const [lastImage] = await tx
        .select({ sortOrder: max(listingImages.sortOrder) })
        .from(listingImages)
        .where(eq(listingImages.listingId, listingId))
      const firstSortOrder = (lastImage?.sortOrder ?? -1) + 1
      await tx.insert(listingImages).values(
        stored.images.map((image, index) => ({
          ...image,
          listingId,
          sortOrder: firstSortOrder + index,
        })),
      )
    }
  })
  await deleteObjects(removedImages.flatMap((image) => [image.storageKey, image.thumbnailKey]))

  logger.info({ listingId, userId: user.id, status: columns.status }, 'Inzerát upraven')
  redirect(`${listingPath({ id: listingId, slug: columns.slug })}?stav=upraveno`)
}

/** Měkké smazání — záznam zůstává pro moderaci a případné řešení sporů. */
export async function deleteListing(listingId: number): Promise<void> {
  const user = await requireUser('/muj-ucet')
  await getDb()
    .update(listings)
    .set({ status: 'deleted' })
    .where(and(eq(listings.id, listingId), eq(listings.ownerUserId, user.id)))
  logger.info({ listingId, userId: user.id }, 'Inzerát smazán')
  revalidatePath('/muj-ucet')
}

export async function renewListing(listingId: number): Promise<void> {
  const user = await requireUser('/muj-ucet')
  const listing = await getEditableListing(listingId, user.id)
  const now = new Date()
  if (listing?.status !== 'active' || !canRenewListing(listing.expiresAt, now)) return

  await getDb()
    .update(listings)
    .set({ publishedAt: now, expiresAt: listingExpiryFrom(now) })
    .where(eq(listings.id, listingId))
  revalidatePath('/muj-ucet')
}

/**
 * Telefon se neposílá v HTML stránky — načte se až na kliknutí, aby ho
 * nešlo hromadně stáhnout roboty (sběr čísel pro podvodné SMS).
 */
export async function revealListingPhone(listingId: number): Promise<string | null> {
  const [row] = await getDb()
    .select({ phone: listings.phone })
    .from(listings)
    .where(
      and(
        eq(listings.id, listingId),
        eq(listings.status, 'active'),
        gt(listings.expiresAt, sql`now()`),
      ),
    )
    .limit(1)
  return row?.phone ?? null
}
