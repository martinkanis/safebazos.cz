import { Eye, MapPin } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/format-date'
import { formatPostalCode, truncateText } from '@/lib/text'
import { ListingThumbnail } from './listing-thumbnail'
import { listingPath } from './paths'
import { formatListingPrice } from './price'
import type { ListingSummary } from './queries'
import { SafePaymentBadge } from './safe-payment-badge'

const EXCERPT_LENGTH = 180

export function ListingRow({ listing }: { listing: ListingSummary }) {
  const href = listingPath(listing)
  return (
    <article className="relative flex gap-4 rounded-xl border border-line bg-surface p-3 transition-shadow hover:shadow-md sm:p-4">
      <ListingThumbnail
        thumbnailKey={listing.thumbnailKey}
        alt={listing.title}
        className="w-24 shrink-0 sm:w-32"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:gap-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="text-base font-semibold leading-snug">
            <Link href={href} className="after:absolute after:inset-0 hover:text-brand-700">
              {listing.title}
            </Link>
          </h3>
          <p className="hidden text-sm text-muted sm:block">
            {truncateText(listing.description, EXCERPT_LENGTH)}
          </p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <time dateTime={listing.publishedAt.toISOString()}>
              {formatDate(listing.publishedAt)}
            </time>
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {listing.city}, {formatPostalCode(listing.postalCode)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="size-3.5" aria-hidden />
              {listing.viewCount}×
            </span>
          </p>
        </div>
        <div className="flex flex-row items-center gap-2 sm:flex-col sm:items-end sm:justify-between">
          <p className="whitespace-nowrap text-lg font-bold text-ink">
            {formatListingPrice(listing.priceType, listing.priceAmount)}
          </p>
          {listing.acceptsSafePayment && <SafePaymentBadge />}
        </div>
      </div>
    </article>
  )
}

export function ListingRows({ listings }: { listings: ListingSummary[] }) {
  return (
    <div className="space-y-3">
      {listings.map((listing) => (
        <ListingRow key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
