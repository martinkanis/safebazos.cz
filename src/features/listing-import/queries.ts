import { and, eq, ne } from 'drizzle-orm'
import { getDb } from '@/db/client'
import { listingImportClaims, type ImportClaimStatus, type ImportedListingDraft } from '@/db/schema'

export const BAZOS_SOURCE = 'bazos'

export interface ImportClaim {
  id: number
  sourceListingId: string
  sourceUrl: string
  verificationCode: string
  status: ImportClaimStatus
  draft: ImportedListingDraft | null
  importedListingId: number | null
}

const claimColumns = {
  id: listingImportClaims.id,
  sourceListingId: listingImportClaims.sourceListingId,
  sourceUrl: listingImportClaims.sourceUrl,
  verificationCode: listingImportClaims.verificationCode,
  status: listingImportClaims.status,
  draft: listingImportClaims.draft,
  importedListingId: listingImportClaims.importedListingId,
}

/** Žádost o převzetí — jen pro jejího autora; null = neexistuje nebo cizí. */
export async function getImportClaim(claimId: number, userId: string): Promise<ImportClaim | null> {
  const [claim] = await getDb()
    .select(claimColumns)
    .from(listingImportClaims)
    .where(and(eq(listingImportClaims.id, claimId), eq(listingImportClaims.userId, userId)))
    .limit(1)
  return claim ?? null
}

/** Rozpracovaná (nepřevzatá) žádost uživatele ke stejnému cizímu inzerátu. */
export async function findOpenClaim(
  userId: string,
  sourceListingId: string,
): Promise<ImportClaim | null> {
  const [claim] = await getDb()
    .select(claimColumns)
    .from(listingImportClaims)
    .where(
      and(
        eq(listingImportClaims.userId, userId),
        eq(listingImportClaims.source, BAZOS_SOURCE),
        eq(listingImportClaims.sourceListingId, sourceListingId),
        ne(listingImportClaims.status, 'imported'),
      ),
    )
    .limit(1)
  return claim ?? null
}

/** Byl už cizí inzerát převzatý (kýmkoli)? */
export async function isAlreadyImported(sourceListingId: string): Promise<boolean> {
  const [claim] = await getDb()
    .select({ id: listingImportClaims.id })
    .from(listingImportClaims)
    .where(
      and(
        eq(listingImportClaims.source, BAZOS_SOURCE),
        eq(listingImportClaims.sourceListingId, sourceListingId),
        eq(listingImportClaims.status, 'imported'),
      ),
    )
    .limit(1)
  return claim !== undefined
}
