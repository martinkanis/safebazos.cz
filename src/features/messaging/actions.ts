'use server'

import { and, count, eq, gt, or, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { after } from 'next/server'
import { loadEnv } from '@/config/env'
import { getDb } from '@/db/client'
import { conversations, listings, messages, users } from '@/db/schema'
import { assessScamRisk } from '@/features/safety/scam-detector'
import { formString } from '@/lib/form'
import { createLogger } from '@/lib/logger'
import { sendEmail } from '@/lib/mailer'
import { requireUser } from '@/lib/require-user'
import type { MessageFormState } from './form-state'
import { messageBodySchema } from './message-input'

const logger = createLogger('messaging')

/** Limit proti rozesílání hromadných podvodných zpráv z jednoho účtu. */
const MAX_MESSAGES_PER_HOUR = 30

async function hasReachedHourlyMessageLimit(userId: string): Promise<boolean> {
  const [row] = await getDb()
    .select({ total: count() })
    .from(messages)
    .where(
      and(
        eq(messages.senderUserId, userId),
        gt(messages.createdAt, sql`now() - interval '1 hour'`),
      ),
    )
  return (row?.total ?? 0) >= MAX_MESSAGES_PER_HOUR
}

/**
 * E-mail jen oznamuje novou zprávu, obsah neobsahuje — případný podvodný
 * odkaz tak nikdy neopustí platformu, kde ho umíme skrýt a označit.
 */
async function notifyRecipient(
  recipientUserId: string,
  conversationId: number,
  listingTitle: string,
) {
  try {
    const [recipient] = await getDb()
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, recipientUserId))
      .limit(1)
    if (!recipient) return
    await sendEmail({
      to: recipient.email,
      subject: `Nová zpráva k inzerátu „${listingTitle}“`,
      text: `Dobrý den ${recipient.name},\n\nmáte novou zprávu na SafeBazos:\n${loadEnv().APP_URL}/muj-ucet/zpravy/${conversationId}\n\nNikdy neotevírejte odkazy na „přijetí platby“ a nezadávejte údaje z karty.`,
    })
  } catch (error) {
    logger.error({ err: error, conversationId }, 'Oznámení o nové zprávě se nepodařilo odeslat')
  }
}

async function insertMessage(conversationId: number, senderUserId: string, body: string) {
  const assessment = assessScamRisk(body)
  await getDb().transaction(async (tx) => {
    await tx.insert(messages).values({
      conversationId,
      senderUserId,
      body,
      riskLevel: assessment.level,
      riskSignals: assessment.signals,
    })
    await tx
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversationId))
  })
  if (assessment.level !== 'none') {
    logger.info(
      { conversationId, senderUserId, signals: assessment.signals },
      'Zpráva s rizikovými signály',
    )
  }
}

/** První zpráva kupujícího prodejci — založí konverzaci (nebo použije existující). */
export async function sendMessageToSeller(
  listingId: number,
  _previousState: MessageFormState,
  formData: FormData,
): Promise<MessageFormState> {
  const user = await requireUser()
  const body = messageBodySchema.safeParse(formString(formData, 'body'))
  if (!body.success) return { status: 'error', message: body.error.issues[0]?.message ?? '' }

  const [listing] = await getDb()
    .select({ id: listings.id, title: listings.title, ownerUserId: listings.ownerUserId })
    .from(listings)
    .where(and(eq(listings.id, listingId), eq(listings.status, 'active')))
    .limit(1)
  if (!listing) return { status: 'error', message: 'Inzerát už není aktivní.' }
  if (listing.ownerUserId === user.id) {
    return { status: 'error', message: 'Na vlastní inzerát nelze odpovědět.' }
  }
  if (await hasReachedHourlyMessageLimit(user.id)) {
    return { status: 'error', message: 'Odeslali jste příliš mnoho zpráv. Zkuste to za hodinu.' }
  }

  const [conversation] = await getDb()
    .insert(conversations)
    .values({ listingId, buyerUserId: user.id, sellerUserId: listing.ownerUserId })
    .onConflictDoUpdate({
      target: [conversations.listingId, conversations.buyerUserId],
      set: { lastMessageAt: new Date() },
    })
    .returning({ id: conversations.id })
  if (!conversation) throw new Error(`Konverzaci k inzerátu ${listingId} se nepodařilo založit`)

  await insertMessage(conversation.id, user.id, body.data)
  after(() => notifyRecipient(listing.ownerUserId, conversation.id, listing.title))
  redirect(`/muj-ucet/zpravy/${conversation.id}`)
}

export async function replyToConversation(
  conversationId: number,
  _previousState: MessageFormState,
  formData: FormData,
): Promise<MessageFormState> {
  const user = await requireUser()
  const body = messageBodySchema.safeParse(formString(formData, 'body'))
  if (!body.success) return { status: 'error', message: body.error.issues[0]?.message ?? '' }

  const [conversation] = await getDb()
    .select({
      buyerUserId: conversations.buyerUserId,
      sellerUserId: conversations.sellerUserId,
      listingTitle: listings.title,
    })
    .from(conversations)
    .innerJoin(listings, eq(listings.id, conversations.listingId))
    .where(
      and(
        eq(conversations.id, conversationId),
        or(eq(conversations.buyerUserId, user.id), eq(conversations.sellerUserId, user.id)),
      ),
    )
    .limit(1)
  if (!conversation) return { status: 'error', message: 'Konverzace nebyla nalezena.' }
  if (await hasReachedHourlyMessageLimit(user.id)) {
    return { status: 'error', message: 'Odeslali jste příliš mnoho zpráv. Zkuste to za hodinu.' }
  }

  await insertMessage(conversationId, user.id, body.data)
  const recipientUserId =
    conversation.buyerUserId === user.id ? conversation.sellerUserId : conversation.buyerUserId
  after(() => notifyRecipient(recipientUserId, conversationId, conversation.listingTitle))
  revalidatePath(`/muj-ucet/zpravy/${conversationId}`)
  return { status: 'sent' }
}
