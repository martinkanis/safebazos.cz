'use server'

import { and, count, eq, gt, sql } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getDb } from '@/db/client'
import { listingImportClaims, type ImportedListingDraft } from '@/db/schema'
import { getCategoryTree } from '@/features/categories/queries'
import { storeImageBuffers } from '@/features/listings/images'
import { MAX_IMAGES_PER_LISTING } from '@/features/listings/listing-limits'
import { formString } from '@/lib/form'
import { createLogger } from '@/lib/logger'
import { requireUser } from '@/lib/require-user'
import { suggestCategoryId } from './bazos-categories'
import { fetchBazosImage, fetchBazosListingPage } from './bazos-client'
import { parseBazosListingPage, type ParsedBazosListing } from './bazos-parser'
import { parseBazosListingUrl } from './bazos-url'
import type { ImportFormState } from './form-state'
import { BAZOS_SOURCE, findOpenClaim, getImportClaim, isAlreadyImported } from './queries'
import {
  containsVerificationCode,
  generateImportVerificationCode,
  removeVerificationCode,
} from './verification-code'

const logger = createLogger('listing-import')

/** Každý import = požadavek na cizí server; limit brání zneužití SafeBazos ke stahování Bazoše. */
const MAX_IMPORT_CLAIMS_PER_DAY = 10

async function countTodaysClaims(userId: string): Promise<number> {
  const [row] = await getDb()
    .select({ total: count() })
    .from(listingImportClaims)
    .where(
      and(
        eq(listingImportClaims.userId, userId),
        gt(listingImportClaims.createdAt, sql`now() - interval '1 day'`),
      ),
    )
  return row?.total ?? 0
}

/** Krok 1: odkaz na vlastní inzerát → žádost s ověřovacím kódem. */
export async function startBazosImport(
  _previousState: ImportFormState,
  formData: FormData,
): Promise<ImportFormState> {
  const user = await requireUser('/pridat-inzerat/import')
  const reference = parseBazosListingUrl(formString(formData, 'url'))
  if (!reference) {
    return { status: 'error', message: 'Vložte odkaz na inzerát z Bazoš.cz (…bazos.cz/inzerat/…).' }
  }
  if (await isAlreadyImported(reference.listingId)) {
    return {
      status: 'error',
      message: 'Tento inzerát už na SafeBazos někdo převzal. Pokud je váš, napište nám.',
    }
  }

  const openClaim = await findOpenClaim(user.id, reference.listingId)
  if (openClaim) redirect(`/pridat-inzerat/import/${openClaim.id}`)
  if ((await countTodaysClaims(user.id)) >= MAX_IMPORT_CLAIMS_PER_DAY) {
    return { status: 'error', message: 'Dnes jste už převzali hodně inzerátů. Zkuste to zítra.' }
  }

  const [claim] = await getDb()
    .insert(listingImportClaims)
    .values({
      userId: user.id,
      source: BAZOS_SOURCE,
      sourceListingId: reference.listingId,
      sourceUrl: reference.url,
      verificationCode: generateImportVerificationCode(),
    })
    .returning({ id: listingImportClaims.id })
  if (!claim)
    throw new Error(`Žádost o import inzerátu ${reference.listingId} se nepodařilo založit`)
  redirect(`/pridat-inzerat/import/${claim.id}`)
}

/** Fotky, které se nepodaří stáhnout nebo zpracovat, vynecháme — prodejce je může nahrát sám. */
async function importImages(imageUrls: string[], claimId: number) {
  const buffers: Buffer[] = []
  for (const url of imageUrls.slice(0, MAX_IMAGES_PER_LISTING)) {
    try {
      buffers.push(await fetchBazosImage(url))
    } catch (error) {
      logger.warn({ err: error, claimId, url }, 'Fotku z Bazoše se nepodařilo stáhnout')
    }
  }
  return storeImageBuffers(buffers)
}

async function buildDraft(
  parsed: ParsedBazosListing,
  verificationCode: string,
  claimId: number,
): Promise<ImportedListingDraft> {
  return {
    title: parsed.title,
    description: removeVerificationCode(parsed.description, verificationCode),
    priceType: parsed.priceType,
    priceAmount: parsed.priceAmount,
    postalCode: parsed.postalCode,
    city: parsed.city,
    suggestedCategoryId: suggestCategoryId(await getCategoryTree(), parsed.bazosCategory),
    images: await importImages(parsed.imageUrls, claimId),
  }
}

async function loadSourceListing(sourceUrl: string, sourceListingId: string, claimId: number) {
  try {
    const html = await fetchBazosListingPage(sourceUrl)
    return html ? parseBazosListingPage(html, sourceListingId) : null
  } catch (error) {
    logger.error({ err: error, claimId, sourceUrl }, 'Načtení inzerátu z Bazoše selhalo')
    throw error
  }
}

/** Krok 2: najdeme kód v popisu původního inzerátu a převezmeme jeho data. */
export async function verifyBazosImport(
  claimId: number,
  _previousState: ImportFormState,
  _formData: FormData,
): Promise<ImportFormState> {
  const user = await requireUser(`/pridat-inzerat/import/${claimId}`)
  const claim = await getImportClaim(claimId, user.id)
  if (claim?.status !== 'pending')
    return { status: 'error', message: 'Žádost o převzetí nebyla nalezena.' }

  let parsed: ParsedBazosListing | null
  try {
    parsed = await loadSourceListing(claim.sourceUrl, claim.sourceListingId, claimId)
  } catch {
    return { status: 'error', message: 'Bazoš teď neodpovídá. Zkuste to prosím za chvíli.' }
  }
  if (!parsed) {
    return {
      status: 'error',
      message: 'Inzerát na Bazoši jsme nenašli — není smazaný nebo neaktivní?',
    }
  }
  if (!containsVerificationCode(parsed.description, claim.verificationCode)) {
    return {
      status: 'error',
      message: `Kód ${claim.verificationCode} jsme v popisu inzerátu nenašli. Uložili jste úpravu na Bazoši?`,
    }
  }

  const draft = await buildDraft(parsed, claim.verificationCode, claimId)
  await getDb()
    .update(listingImportClaims)
    .set({ status: 'verified', draft, verifiedAt: new Date() })
    .where(eq(listingImportClaims.id, claimId))
  logger.info(
    { claimId, userId: user.id, images: draft.images.length },
    'Vlastnictví inzerátu ověřeno',
  )
  redirect(`/pridat-inzerat/import/${claimId}`)
}
