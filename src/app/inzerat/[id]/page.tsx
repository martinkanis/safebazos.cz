import { notFound, permanentRedirect } from 'next/navigation'
import { listingPath } from '@/features/listings/paths'
import { getListingDetail } from '@/features/listings/queries'

/**
 * /inzerat/123 bez slugu → trvalé přesměrování na kanonickou adresu.
 * Jen u aktivních inzerátů, aby přesměrování neprozradilo název skrytého inzerátu.
 */
export default async function ListingShortLinkPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = Number((await params).id)
  const listing = Number.isSafeInteger(id) && id > 0 ? await getListingDetail(id) : null
  if (listing?.status !== 'active') notFound()
  permanentRedirect(listingPath(listing))
}
