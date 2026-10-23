import { eq } from 'drizzle-orm'
import type { Transaction } from '@/db/client'
import { listingImportClaims } from '@/db/schema'
import type { StoredImage } from '@/features/listings/images'
import { formString } from '@/lib/form'
import { IMPORT_CONSENT_VERSION } from './consent'
import { getImportClaim, isAlreadyImported } from './queries'

export interface ImportForPublish {
  claimId: number
  keptImages: StoredImage[]
  discardedImages: StoredImage[]
}

export type ImportResolution =
  { isValid: true; importForPublish: ImportForPublish | null } | { isValid: false; message: string }

function keptImageIndexes(formData: FormData): Set<number> {
  return new Set(formData.getAll('keepImportedImage').map((value) => Number(value)))
}

/**
 * Údaje o převzetí z formuláře nového inzerátu. Bez `importClaimId` jde o běžný
 * inzerát (importForPublish = null); jinak musí být žádost ověřená a souhlas potvrzený.
 */
export async function resolveImportForPublish(
  formData: FormData,
  userId: string,
): Promise<ImportResolution> {
  const rawClaimId = formString(formData, 'importClaimId')
  if (!rawClaimId) return { isValid: true, importForPublish: null }

  const claim = await getImportClaim(Number(rawClaimId), userId)
  if (claim?.status !== 'verified' || !claim.draft) {
    return { isValid: false, message: 'Převzetí inzerátu už není platné. Začněte prosím znovu.' }
  }
  if (await isAlreadyImported(claim.sourceListingId)) {
    return { isValid: false, message: 'Tento inzerát už na SafeBazos někdo převzal.' }
  }
  if (formData.get('importConsent') !== 'on') {
    return { isValid: false, message: 'Potvrďte prosím čestné prohlášení o autorství inzerátu.' }
  }

  const keep = keptImageIndexes(formData)
  return {
    isValid: true,
    importForPublish: {
      claimId: claim.id,
      keptImages: claim.draft.images.filter((_, index) => keep.has(index)),
      discardedImages: claim.draft.images.filter((_, index) => !keep.has(index)),
    },
  }
}

export async function markClaimImported(
  tx: Transaction,
  claimId: number,
  listingId: number,
): Promise<void> {
  await tx
    .update(listingImportClaims)
    .set({
      status: 'imported',
      importedListingId: listingId,
      consentedAt: new Date(),
      consentTextVersion: IMPORT_CONSENT_VERSION,
    })
    .where(eq(listingImportClaims.id, claimId))
}
