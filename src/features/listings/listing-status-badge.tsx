import type { ListingStatus } from '@/db/schema'
import { cn } from '@/lib/utils'

type DisplayedStatus = ListingStatus | 'expired'

const STATUS_STYLES: Record<DisplayedStatus, { label: string; classes: string }> = {
  active: { label: 'Aktivní', classes: 'bg-brand-50 text-brand-800 ring-brand-200' },
  pending_review: {
    label: 'Čeká na kontrolu',
    classes: 'bg-warning-50 text-warning-800 ring-warning-200',
  },
  blocked: { label: 'Zablokovaný', classes: 'bg-danger-50 text-danger-800 ring-danger-200' },
  deleted: { label: 'Smazaný', classes: 'bg-canvas text-muted ring-line' },
  expired: { label: 'Vypršel', classes: 'bg-canvas text-muted ring-line' },
}

interface ListingStatusBadgeProps {
  status: ListingStatus
  isExpired: boolean
}

export function ListingStatusBadge({ status, isExpired }: ListingStatusBadgeProps) {
  const displayed: DisplayedStatus = status === 'active' && isExpired ? 'expired' : status
  const { label, classes } = STATUS_STYLES[displayed]
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium ring-1', classes)}>
      {label}
    </span>
  )
}
