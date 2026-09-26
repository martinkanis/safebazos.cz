import { Alert } from '@/components/ui/alert'
import { ScamSignalList } from '@/features/safety/scam-signal-list'
import type { ListingDetail } from './queries'

/** Hodnota parametru ?stav= po uložení formuláře. */
export type SavedState = 'novy' | 'upraveno'

interface ListingStatusNoticeProps {
  listing: ListingDetail
  isExpired: boolean
  savedState: SavedState | null
}

/** Stav inzerátu pro vlastníka a moderátora (ostatní neveřejné inzeráty vůbec neuvidí). */
export function ListingStatusNotice({ listing, isExpired, savedState }: ListingStatusNoticeProps) {
  if (listing.status === 'pending_review') {
    return (
      <Alert tone="warning" title="Inzerát čeká na kontrolu moderátorem">
        <p>Automatická kontrola v textu našla vzorce typické pro podvody:</p>
        <ScamSignalList signals={listing.riskSignals} />
        <p>Pokud jde o omyl, upravte text nebo počkejte na schválení.</p>
      </Alert>
    )
  }
  if (listing.status === 'blocked') {
    return (
      <Alert tone="danger" title="Inzerát byl zablokován">
        Porušoval pravidla SafeBazos a není veřejně vidět.
      </Alert>
    )
  }
  if (isExpired) {
    return (
      <Alert tone="warning" title="Inzerát vypršel">
        Není veřejně vidět. Obnovit ho můžete v sekci Můj účet.
      </Alert>
    )
  }
  if (savedState) {
    return (
      <Alert tone="success">
        {savedState === 'novy' ? 'Inzerát byl zveřejněn.' : 'Změny byly uloženy.'}
      </Alert>
    )
  }
  return null
}
