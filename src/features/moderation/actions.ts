'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getDb } from '@/db/client'
import { listingReports, listings, reportReasonEnum, type ListingStatus } from '@/db/schema'
import { formString } from '@/lib/form'
import { createLogger } from '@/lib/logger'
import { requireAdmin } from '@/lib/require-user'
import { getSessionUser } from '@/lib/session'
import type { ReportFormState } from './form-state'

const logger = createLogger('moderation')

const reportInputSchema = z.object({
  reason: z.enum(reportReasonEnum.enumValues, { error: 'Vyberte důvod nahlášení.' }),
  note: z
    .string()
    .trim()
    .max(1000, { error: 'Poznámka může mít nejvýše 1000 znaků.' })
    .transform((note) => note || null),
})

/** Nahlášení inzerátu — i bez přihlášení, ať je hlášení podvodu co nejsnazší. */
export async function reportListing(
  listingId: number,
  _previousState: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const parsed = reportInputSchema.safeParse({
    reason: formString(formData, 'reason'),
    note: formString(formData, 'note'),
  })
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Neplatné hlášení.' }
  }

  const reporter = await getSessionUser()
  const [listing] = await getDb()
    .select({ id: listings.id })
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1)
  if (!listing) return { status: 'error', message: 'Inzerát nebyl nalezen.' }

  await getDb()
    .insert(listingReports)
    .values({ listingId, reporterUserId: reporter?.id ?? null, ...parsed.data })
  logger.info({ listingId, reason: parsed.data.reason }, 'Inzerát nahlášen')
  return { status: 'reported' }
}

async function setListingStatus(listingId: number, status: ListingStatus): Promise<void> {
  const admin = await requireAdmin()
  await getDb().update(listings).set({ status }).where(eq(listings.id, listingId))
  logger.info({ listingId, status, adminUserId: admin.id }, 'Moderátor změnil stav inzerátu')
  revalidatePath('/admin')
}

export async function approveListing(listingId: number): Promise<void> {
  await setListingStatus(listingId, 'active')
}

export async function blockListing(listingId: number): Promise<void> {
  await setListingStatus(listingId, 'blocked')
}

async function closeReport(reportId: number, status: 'resolved' | 'dismissed'): Promise<void> {
  const admin = await requireAdmin()
  await getDb()
    .update(listingReports)
    .set({ status, resolvedByUserId: admin.id, resolvedAt: new Date() })
    .where(and(eq(listingReports.id, reportId), eq(listingReports.status, 'open')))
  revalidatePath('/admin')
}

/** Vyřeší hlášení a zároveň zablokuje nahlášený inzerát. */
export async function resolveReportByBlocking(reportId: number, listingId: number): Promise<void> {
  await blockListing(listingId)
  await closeReport(reportId, 'resolved')
}

export async function dismissReport(reportId: number): Promise<void> {
  await closeReport(reportId, 'dismissed')
}
