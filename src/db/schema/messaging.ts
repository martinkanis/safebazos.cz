import { sql } from 'drizzle-orm'
import { index, integer, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { users } from './auth'
import { riskLevelEnum, scamSignalEnum } from './enums'
import { createdAt, identityPrimaryKey } from './helpers'
import { listings } from './listings'

/**
 * Konverzace kupujícího s prodejcem nad jedním inzerátem. Komunikace běží přes
 * platformu, aby šly zprávy kontrolovat na podvodné vzorce a e-maily zůstaly skryté.
 */
export const conversations = pgTable(
  'conversations',
  {
    id: identityPrimaryKey(),
    listingId: integer()
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    buyerUserId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sellerUserId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    lastMessageAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    createdAt: createdAt(),
  },
  (table) => [
    unique().on(table.listingId, table.buyerUserId),
    index().on(table.buyerUserId, table.lastMessageAt.desc()),
    index().on(table.sellerUserId, table.lastMessageAt.desc()),
  ],
)

export const messages = pgTable(
  'messages',
  {
    id: identityPrimaryKey(),
    conversationId: integer()
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    senderUserId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    body: text().notNull(),
    riskLevel: riskLevelEnum().notNull().default('none'),
    riskSignals: scamSignalEnum().array().notNull().default(sql`'{}'`),
    readAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
  },
  (table) => [
    index().on(table.conversationId, table.createdAt),
    index().on(table.senderUserId, table.createdAt),
  ],
)
