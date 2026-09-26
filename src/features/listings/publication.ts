import type { ListingStatus } from '@/db/schema'
import type { ScamAssessment } from '@/features/safety/scam-detector'

/** Jak dlouho je inzerát zveřejněný, než ho musí prodejce obnovit. */
export const LISTING_LIFETIME_DAYS = 60
const DAY_MS = 24 * 60 * 60 * 1000

/** Vysoké riziko podvodu → inzerát čeká na kontrolu moderátorem, jinak jde rovnou ven. */
export function statusForAssessment(assessment: ScamAssessment): ListingStatus {
  return assessment.level === 'high' ? 'pending_review' : 'active'
}

export function listingExpiryFrom(publishedAt: Date): Date {
  return new Date(publishedAt.getTime() + LISTING_LIFETIME_DAYS * DAY_MS)
}

/**
 * Obnovit (a posunout nahoru) jde až těsně před expirací — jinak by šlo
 * inzeráty neustále „topovat“ a vytlačovat ostatní prodejce.
 */
export const RENEWAL_WINDOW_DAYS = 7

export function canRenewListing(expiresAt: Date, now: Date): boolean {
  return expiresAt.getTime() - now.getTime() <= RENEWAL_WINDOW_DAYS * DAY_MS
}
