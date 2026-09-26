import { Eye, Pencil, RefreshCw, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Button, ButtonLink } from '@/components/ui/button'
import { ConfirmSubmitButton } from '@/components/ui/confirm-submit-button'
import { formatDate } from '@/lib/format-date'
import { deleteListing, renewListing } from './actions'
import { ListingStatusBadge } from './listing-status-badge'
import { ListingThumbnail } from './listing-thumbnail'
import { listingPath } from './paths'
import { formatListingPrice } from './price'
import { canRenewListing } from './publication'
import type { OwnListing } from './queries'

export function OwnListingItem({ listing, now }: { listing: OwnListing; now: Date }) {
  const isExpired = listing.expiresAt <= now
  const isRenewable = listing.status === 'active' && canRenewListing(listing.expiresAt, now)

  return (
    <li className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center">
      <ListingThumbnail
        thumbnailKey={listing.thumbnailKey}
        alt=""
        className="hidden w-20 sm:block"
      />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={listingPath(listing)} className="font-semibold hover:text-brand-700">
            {listing.title}
          </Link>
          <ListingStatusBadge status={listing.status} isExpired={isExpired} />
        </div>
        <p className="flex flex-wrap gap-x-4 text-sm text-muted">
          <span className="font-medium text-ink">
            {formatListingPrice(listing.priceType, listing.priceAmount)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="size-3.5" aria-hidden />
            {listing.viewCount}×
          </span>
          <span>
            {isExpired ? 'Vypršel' : 'Vyprší'} {formatDate(listing.expiresAt)}
          </span>
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {listing.status !== 'blocked' && (
          <ButtonLink
            href={`/muj-ucet/inzerat/${listing.id}/upravit`}
            variant="secondary"
            size="sm"
          >
            <Pencil className="size-3.5" aria-hidden />
            Upravit
          </ButtonLink>
        )}
        {isRenewable && (
          <form action={renewListing.bind(null, listing.id)}>
            <Button type="submit" variant="secondary" size="sm">
              <RefreshCw className="size-3.5" aria-hidden />
              Obnovit
            </Button>
          </form>
        )}
        <form action={deleteListing.bind(null, listing.id)}>
          <ConfirmSubmitButton
            confirmMessage={`Opravdu smazat inzerát „${listing.title}“?`}
            variant="ghost"
            size="sm"
          >
            <Trash2 className="size-3.5" aria-hidden />
            Smazat
          </ConfirmSubmitButton>
        </form>
      </div>
    </li>
  )
}
