import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ListingStatusBadge } from '@/features/listings/listing-status-badge'
import { listingPath } from '@/features/listings/paths'
import {
  approveListing,
  blockListing,
  dismissReport,
  resolveReportByBlocking,
} from '@/features/moderation/actions'
import { getListingsPendingReview, getOpenReports } from '@/features/moderation/queries'
import { REPORT_REASON_LABELS } from '@/features/moderation/report-reasons'
import { ScamSignalList } from '@/features/safety/scam-signal-list'
import { formatDateTime } from '@/lib/format-date'
import { requireAdmin } from '@/lib/require-user'

export const metadata: Metadata = { title: 'Moderace', robots: { index: false, follow: false } }

function EmptyQueue({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-line bg-surface p-6 text-muted">{text}</p>
  )
}

export default async function AdminPage() {
  await requireAdmin()
  const [pendingListings, openReports] = await Promise.all([
    getListingsPendingReview(),
    getOpenReports(),
  ])

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">Moderace</h1>

      <section className="space-y-3" aria-labelledby="pending-heading">
        <h2 id="pending-heading" className="text-lg font-semibold">
          Zadržené inzeráty ({pendingListings.length})
        </h2>
        {pendingListings.length === 0 ? (
          <EmptyQueue text="Žádný inzerát nečeká na kontrolu." />
        ) : (
          <ul className="space-y-3">
            {pendingListings.map((listing) => (
              <li
                key={listing.id}
                className="space-y-3 rounded-xl border border-line bg-surface p-4"
              >
                <div>
                  <Link href={listingPath(listing)} className="font-semibold hover:text-brand-700">
                    {listing.title}
                  </Link>
                  <p className="text-sm text-muted">
                    {listing.ownerName} ({listing.ownerEmail}) · {formatDateTime(listing.createdAt)}
                  </p>
                </div>
                <p className="whitespace-pre-line rounded-lg bg-canvas p-3 text-sm">
                  {listing.description}
                </p>
                <div className="text-sm text-warning-800">
                  <ScamSignalList signals={listing.riskSignals} />
                </div>
                <div className="flex gap-2">
                  <form action={approveListing.bind(null, listing.id)}>
                    <Button type="submit" size="sm">
                      Schválit
                    </Button>
                  </form>
                  <form action={blockListing.bind(null, listing.id)}>
                    <Button type="submit" size="sm" variant="danger">
                      Zablokovat
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3" aria-labelledby="reports-heading">
        <h2 id="reports-heading" className="text-lg font-semibold">
          Nahlášené inzeráty ({openReports.length})
        </h2>
        {openReports.length === 0 ? (
          <EmptyQueue text="Žádná otevřená hlášení." />
        ) : (
          <ul className="space-y-3">
            {openReports.map((report) => (
              <li
                key={report.id}
                className="space-y-2 rounded-xl border border-line bg-surface p-4"
              >
                <p className="text-sm">
                  <span className="font-semibold">{REPORT_REASON_LABELS[report.reason]}</span>
                  <span className="text-muted"> · {formatDateTime(report.createdAt)}</span>
                </p>
                <Link
                  href={listingPath({ id: report.listingId, slug: report.listingSlug })}
                  className="block hover:text-brand-700"
                >
                  {report.listingTitle}
                </Link>
                <ListingStatusBadge status={report.listingStatus} isExpired={false} />
                {report.note && <p className="rounded-lg bg-canvas p-3 text-sm">{report.note}</p>}
                <div className="flex gap-2">
                  <form action={resolveReportByBlocking.bind(null, report.id, report.listingId)}>
                    <Button type="submit" size="sm" variant="danger">
                      Zablokovat inzerát
                    </Button>
                  </form>
                  <form action={dismissReport.bind(null, report.id)}>
                    <Button type="submit" size="sm" variant="secondary">
                      Zamítnout hlášení
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
