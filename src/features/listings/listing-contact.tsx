import { MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { ButtonLink } from '@/components/ui/button'
import { sendMessageToSeller } from '@/features/messaging/actions'
import { ContactSellerForm } from '@/features/messaging/contact-seller-form'
import { findBuyerConversationId } from '@/features/messaging/queries'
import type { SessionUser } from '@/lib/session'
import { listingPath } from './paths'
import { PhoneReveal } from './phone-reveal'
import type { ListingDetail } from './queries'

interface ListingContactProps {
  listing: ListingDetail
  viewer: SessionUser | null
}

async function MessageSection({ listing, viewer }: ListingContactProps) {
  if (!viewer) {
    const loginHref = `/prihlaseni?zpet=${encodeURIComponent(listingPath(listing))}`
    return (
      <div className="space-y-2 text-sm">
        <ButtonLink href={loginHref} className="w-full">
          <MessageCircle className="size-4" aria-hidden />
          Přihlásit se a napsat prodejci
        </ButtonLink>
        <p className="text-muted">
          Zprávy posílají jen ověřené účty — chrání to prodejce před podvodníky.
        </p>
      </div>
    )
  }
  if (viewer.id === listing.ownerUserId) {
    return <p className="text-sm text-muted">Toto je váš inzerát.</p>
  }

  const conversationId = await findBuyerConversationId(listing.id, viewer.id)
  if (conversationId) {
    return (
      <ButtonLink href={`/muj-ucet/zpravy/${conversationId}`} className="w-full">
        <MessageCircle className="size-4" aria-hidden />
        Pokračovat v konverzaci
      </ButtonLink>
    )
  }
  return <ContactSellerForm action={sendMessageToSeller.bind(null, listing.id)} />
}

export function ListingContact({ listing, viewer }: ListingContactProps) {
  return (
    <div className="space-y-3">
      <MessageSection listing={listing} viewer={viewer} />
      {listing.hasPhone && <PhoneReveal listingId={listing.id} />}
      <p className="text-xs text-muted">
        Domluva přes zprávy SafeBazos je bezpečnější — podezřelé odkazy v nich skrýváme.{' '}
        <Link href="/bezpecnost" className="underline">
          Proč?
        </Link>
      </p>
    </div>
  )
}
