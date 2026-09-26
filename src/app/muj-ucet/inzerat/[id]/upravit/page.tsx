import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Alert } from '@/components/ui/alert'
import { getCategoryTree } from '@/features/categories/queries'
import { updateListing } from '@/features/listings/actions'
import { ListingForm } from '@/features/listings/listing-form'
import { getEditableListing } from '@/features/listings/queries'
import { requireUser } from '@/lib/require-user'

export const metadata: Metadata = { title: 'Upravit inzerát' }

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const listingId = Number((await params).id)
  const user = await requireUser(`/muj-ucet/inzerat/${listingId}/upravit`)
  if (!Number.isSafeInteger(listingId)) notFound()

  const [listing, categoryTree] = await Promise.all([
    getEditableListing(listingId, user.id),
    getCategoryTree(),
  ])
  if (!listing) notFound()
  if (listing.status === 'blocked') {
    return <Alert tone="danger">Zablokovaný inzerát nelze upravovat.</Alert>
  }

  const { id, slug, status, expiresAt, ...initialValues } = listing
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h2 className="text-xl font-bold">Upravit inzerát</h2>
      <ListingForm
        action={updateListing.bind(null, id)}
        categoryTree={categoryTree}
        initialValues={initialValues}
        submitLabel="Uložit změny"
      />
    </div>
  )
}
