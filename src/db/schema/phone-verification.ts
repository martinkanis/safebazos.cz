import { index, pgTable, smallint, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './auth'
import { createdAt, identityPrimaryKey } from './helpers'

/** Jednorázové SMS kódy pro ověření telefonu. Ukládáme jen HMAC kódu, ne kód samotný. */
export const phoneVerificationCodes = pgTable(
  'phone_verification_codes',
  {
    id: identityPrimaryKey(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    phone: text().notNull(),
    codeHash: text().notNull(),
    failedAttempts: smallint().notNull().default(0),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    consumedAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
  },
  (table) => [index().on(table.userId, table.createdAt)],
)
