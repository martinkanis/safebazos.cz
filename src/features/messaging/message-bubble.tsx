import { TriangleAlert } from 'lucide-react'
import { maskUntrustedLinks } from '@/features/safety/scam-detector'
import { ScamSignalList } from '@/features/safety/scam-signal-list'
import { formatDateTime } from '@/lib/format-date'
import { cn } from '@/lib/utils'
import type { ConversationMessage } from './queries'

/** Varování ukazujeme příjemci — odesílatel podvodné zprávy ví, co poslal. */
function RiskWarning({ message }: { message: ConversationMessage }) {
  const isHigh = message.riskLevel === 'high'
  return (
    <div
      role="alert"
      className={cn(
        'mb-2 rounded-lg border p-3 text-sm',
        isHigh
          ? 'border-danger-200 bg-danger-50 text-danger-800'
          : 'border-warning-200 bg-warning-50 text-warning-800',
      )}
    >
      <p className="flex items-center gap-1.5 font-semibold">
        <TriangleAlert className="size-4" aria-hidden />
        {isHigh ? 'Pravděpodobný podvod!' : 'Buďte opatrní'}
      </p>
      <ScamSignalList signals={message.riskSignals} />
    </div>
  )
}

export function MessageBubble({ message }: { message: ConversationMessage }) {
  const showWarning = !message.isOwn && message.riskLevel !== 'none'
  return (
    <li className={cn('flex', message.isOwn ? 'justify-end' : 'justify-start')}>
      <div className="max-w-[85%] sm:max-w-[70%]">
        {showWarning && <RiskWarning message={message} />}
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm',
            message.isOwn
              ? 'rounded-br-sm bg-brand-600 text-white'
              : 'rounded-bl-sm border border-line bg-surface',
          )}
        >
          <p className="whitespace-pre-line break-words">{maskUntrustedLinks(message.body)}</p>
        </div>
        <p className={cn('mt-1 text-xs text-muted', message.isOwn && 'text-right')}>
          <time dateTime={message.createdAt.toISOString()}>
            {formatDateTime(message.createdAt)}
          </time>
        </p>
      </div>
    </li>
  )
}
