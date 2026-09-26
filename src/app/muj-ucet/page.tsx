import { Plus } from 'lucide-react'
import type { Metadata } from 'next'
import { ButtonLink } from '@/components/ui/button'
import { OwnListingItem } from '@/features/listings/own-listing-item'
import { getOwnListings } from '@/features/listings/queries'
import { requireUser } from '@/lib/require-user'

export const metadata: Metadata = { title: 'Moje inzeráty' }

export default async function MyListingsPage() {
  const user = await requireUser('/muj-ucet')
  const listings = await getOwnListings(user.id)
  const now = new Date()

  if (listings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-surface px-4 py-12 text-center">
        <p className="font-medium">Zatím nemáte žádný inzerát.</p>
        <ButtonLink href="/pridat-inzerat" className="mt-4">
          <Plus className="size-4" aria-hidden />
          Přidat první inzerát
        </ButtonLink>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {listings.map((listing) => (
        <OwnListingItem key={listing.id} listing={listing} now={now} />
      ))}
    </ul>
  )
}
