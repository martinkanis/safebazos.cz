import type { Metadata } from 'next'
import Link from 'next/link'
import { getConversationsForUser } from '@/features/messaging/queries'
import { formatDateTime } from '@/lib/format-date'
import { requireUser } from '@/lib/require-user'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Zprávy' }

export default async function ConversationsPage() {
  const user = await requireUser('/muj-ucet/zpravy')
  const conversations = await getConversationsForUser(user.id)

  if (conversations.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-surface px-4 py-12 text-center text-muted">
        Zatím nemáte žádné zprávy.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
      {conversations.map((conversation) => (
        <li key={conversation.id}>
          <Link
            href={`/muj-ucet/zpravy/${conversation.id}`}
            className="flex items-center gap-4 px-4 py-3 hover:bg-canvas"
          >
            <div className="min-w-0 flex-1">
              <p className={cn('truncate', conversation.unreadCount > 0 && 'font-semibold')}>
                {conversation.listingTitle}
              </p>
              <p className="text-sm text-muted">
                {conversation.isBuying ? 'Prodejce' : 'Zájemce'}: {conversation.counterpartName}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 text-xs text-muted">
              <time dateTime={conversation.lastMessageAt.toISOString()}>
                {formatDateTime(conversation.lastMessageAt)}
              </time>
              {conversation.unreadCount > 0 && (
                <span className="rounded-full bg-danger-600 px-2 py-0.5 font-semibold text-white">
                  {conversation.unreadCount} nové
                </span>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
