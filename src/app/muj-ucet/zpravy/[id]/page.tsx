import { ArrowLeft, ShieldCheck } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { after } from 'next/server'
import { listingPath } from '@/features/listings/paths'
import { replyToConversation } from '@/features/messaging/actions'
import { MessageBubble } from '@/features/messaging/message-bubble'
import { getConversationThread, markConversationRead } from '@/features/messaging/queries'
import { ReplyForm } from '@/features/messaging/reply-form'
import { requireUser } from '@/lib/require-user'

export const metadata: Metadata = { title: 'Konverzace' }

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const conversationId = Number((await params).id)
  const user = await requireUser(`/muj-ucet/zpravy/${conversationId}`)
  if (!Number.isSafeInteger(conversationId)) notFound()

  const thread = await getConversationThread(conversationId, user.id)
  if (!thread) notFound()
  after(() => markConversationRead(conversationId, user.id))

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href="/muj-ucet/zpravy"
        className="flex items-center gap-1 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Všechny zprávy
      </Link>
      <div className="rounded-xl border border-line bg-surface p-4">
        <p className="text-sm text-muted">
          {thread.isBuying ? 'Prodejce' : 'Zájemce'}: {thread.counterpartName}
        </p>
        <Link
          href={listingPath({ id: thread.listingId, slug: thread.listingSlug })}
          className="font-semibold hover:text-brand-700"
        >
          {thread.listingTitle}
        </Link>
      </div>
      <p className="flex items-start gap-2 rounded-lg bg-brand-50 p-3 text-xs text-brand-900">
        <ShieldCheck className="size-4 shrink-0" aria-hidden />
        Odkazy na cizí weby ve zprávách skrýváme. SafeBazos ani dopravci po vás nikdy nebudou chtít
        údaje z karty kvůli přijetí platby.
      </p>
      <ol className="space-y-4" aria-label="Zprávy">
        {thread.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </ol>
      <ReplyForm action={replyToConversation.bind(null, thread.id)} />
    </div>
  )
}
