import { index, integer, pgTable, smallint, text } from 'drizzle-orm/pg-core'
import { users } from './auth'
import { aiSuggestionStatusEnum } from './enums'
import { createdAt, identityPrimaryKey } from './helpers'

/** Každé volání AI pro návrh inzerátu — pro denní limit uživatele a sledování nákladů. */
export const aiListingSuggestions = pgTable(
  'ai_listing_suggestions',
  {
    id: identityPrimaryKey(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    model: text().notNull(),
    status: aiSuggestionStatusEnum().notNull(),
    photoCount: smallint().notNull(),
    inputTokens: integer().notNull().default(0),
    cacheReadTokens: integer().notNull().default(0),
    outputTokens: integer().notNull().default(0),
    createdAt: createdAt(),
  },
  (table) => [index().on(table.userId, table.createdAt)],
)
