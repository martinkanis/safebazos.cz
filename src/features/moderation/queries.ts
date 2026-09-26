import { asc, desc, eq } from 'drizzle-orm'
import { getDb } from '@/db/client'
import {
  listingReports,
  listings,
  users,
  type ListingStatus,
  type ReportReason,
  type ScamSignal,
} from '@/db/schema'

export interface PendingListing {
  id: number
  slug: string
  title: string
  description: string
  ownerName: string
  ownerEmail: string
  riskSignals: ScamSignal[]
  createdAt: Date
}

/** Inzeráty zadržené detektorem podvodů, nejstarší první. */
export function getListingsPendingReview(): Promise<PendingListing[]> {
  return getDb()
    .select({
      id: listings.id,
      slug: listings.slug,
      title: listings.title,
      description: listings.description,
      ownerName: users.name,
      ownerEmail: users.email,
      riskSignals: listings.riskSignals,
      createdAt: listings.createdAt,
    })
    .from(listings)
    .innerJoin(users, eq(users.id, listings.ownerUserId))
    .where(eq(listings.status, 'pending_review'))
    .orderBy(asc(listings.createdAt))
}

export interface OpenReport {
  id: number
  reason: ReportReason
  note: string | null
  createdAt: Date
  listingId: number
  listingSlug: string
  listingTitle: string
  listingStatus: ListingStatus
}

export function getOpenReports(): Promise<OpenReport[]> {
  return getDb()
    .select({
      id: listingReports.id,
      reason: listingReports.reason,
      note: listingReports.note,
      createdAt: listingReports.createdAt,
      listingId: listings.id,
      listingSlug: listings.slug,
      listingTitle: listings.title,
      listingStatus: listings.status,
    })
    .from(listingReports)
    .innerJoin(listings, eq(listings.id, listingReports.listingId))
    .where(eq(listingReports.status, 'open'))
    .orderBy(desc(listingReports.createdAt))
}
