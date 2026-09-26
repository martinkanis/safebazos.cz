import { aliasedTable, and, count, desc, eq, isNull, ne, or, sql } from 'drizzle-orm'
import { getDb } from '@/db/client'
import {
  conversations,
  listings,
  messages,
  users,
  type RiskLevel,
  type ScamSignal,
} from '@/db/schema'

const buyers = aliasedTable(users, 'buyers')
const sellers = aliasedTable(users, 'sellers')

function isParticipant(userId: string) {
  return or(eq(conversations.buyerUserId, userId), eq(conversations.sellerUserId, userId))
}

export interface ConversationSummary {
  id: number
  listingId: number
  listingSlug: string
  listingTitle: string
  counterpartName: string
  isBuying: boolean
  lastMessageAt: Date
  unreadCount: number
}

export async function getConversationsForUser(userId: string): Promise<ConversationSummary[]> {
  // Vnější sloupec kvalifikovaný ručně — drizzle by ho vypsal bez tabulky (viz listings/queries.ts).
  const unreadCount = sql<number>`(
    select count(*)::int from messages as message
    where message.conversation_id = "conversations"."id"
      and message.sender_user_id <> ${userId}
      and message.read_at is null
  )`
  const rows = await getDb()
    .select({
      id: conversations.id,
      listingId: listings.id,
      listingSlug: listings.slug,
      listingTitle: listings.title,
      buyerUserId: conversations.buyerUserId,
      buyerName: buyers.name,
      sellerName: sellers.name,
      lastMessageAt: conversations.lastMessageAt,
      unreadCount,
    })
    .from(conversations)
    .innerJoin(listings, eq(listings.id, conversations.listingId))
    .innerJoin(buyers, eq(buyers.id, conversations.buyerUserId))
    .innerJoin(sellers, eq(sellers.id, conversations.sellerUserId))
    .where(isParticipant(userId))
    .orderBy(desc(conversations.lastMessageAt))

  return rows.map((row) => {
    const isBuying = row.buyerUserId === userId
    return {
      id: row.id,
      listingId: row.listingId,
      listingSlug: row.listingSlug,
      listingTitle: row.listingTitle,
      counterpartName: isBuying ? row.sellerName : row.buyerName,
      isBuying,
      lastMessageAt: row.lastMessageAt,
      unreadCount: row.unreadCount,
    }
  })
}

export interface ConversationMessage {
  id: number
  body: string
  isOwn: boolean
  riskLevel: RiskLevel
  riskSignals: ScamSignal[]
  createdAt: Date
}

export interface ConversationThread {
  id: number
  listingId: number
  listingSlug: string
  listingTitle: string
  counterpartName: string
  isBuying: boolean
  messages: ConversationMessage[]
}

/** Vlákno konverzace — jen pro účastníka; null = neexistuje nebo cizí. */
export async function getConversationThread(
  conversationId: number,
  userId: string,
): Promise<ConversationThread | null> {
  const db = getDb()
  const [conversation] = await db
    .select({
      id: conversations.id,
      listingId: listings.id,
      listingSlug: listings.slug,
      listingTitle: listings.title,
      buyerUserId: conversations.buyerUserId,
      buyerName: buyers.name,
      sellerName: sellers.name,
    })
    .from(conversations)
    .innerJoin(listings, eq(listings.id, conversations.listingId))
    .innerJoin(buyers, eq(buyers.id, conversations.buyerUserId))
    .innerJoin(sellers, eq(sellers.id, conversations.sellerUserId))
    .where(and(eq(conversations.id, conversationId), isParticipant(userId)))
    .limit(1)
  if (!conversation) return null

  const messageRows = await db
    .select({
      id: messages.id,
      body: messages.body,
      senderUserId: messages.senderUserId,
      riskLevel: messages.riskLevel,
      riskSignals: messages.riskSignals,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt, messages.id)

  const isBuying = conversation.buyerUserId === userId
  return {
    id: conversation.id,
    listingId: conversation.listingId,
    listingSlug: conversation.listingSlug,
    listingTitle: conversation.listingTitle,
    counterpartName: isBuying ? conversation.sellerName : conversation.buyerName,
    isBuying,
    messages: messageRows.map(({ senderUserId, ...message }) => ({
      ...message,
      isOwn: senderUserId === userId,
    })),
  }
}

/** Existující konverzace kupujícího k inzerátu (pro odkaz „Pokračovat v konverzaci“). */
export async function findBuyerConversationId(
  listingId: number,
  buyerUserId: string,
): Promise<number | null> {
  const [row] = await getDb()
    .select({ id: conversations.id })
    .from(conversations)
    .where(and(eq(conversations.listingId, listingId), eq(conversations.buyerUserId, buyerUserId)))
    .limit(1)
  return row?.id ?? null
}

export async function countUnreadMessages(userId: string): Promise<number> {
  const [row] = await getDb()
    .select({ total: count() })
    .from(messages)
    .innerJoin(conversations, eq(conversations.id, messages.conversationId))
    .where(and(isParticipant(userId), ne(messages.senderUserId, userId), isNull(messages.readAt)))
  return row?.total ?? 0
}

/** Označí zprávy protistrany jako přečtené. */
export async function markConversationRead(conversationId: number, userId: string): Promise<void> {
  await getDb()
    .update(messages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(messages.conversationId, conversationId),
        ne(messages.senderUserId, userId),
        isNull(messages.readAt),
      ),
    )
}
