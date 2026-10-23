import { index, integer, pgTable, smallint, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './auth'
import { paymentStatusEnum, voucherStatusEnum } from './enums'
import { createdAt, identityPrimaryKey } from './helpers'
import { listings } from './listings'

/** Platba za poukázky na topování (Comgate). */
export const payments = pgTable(
  'payments',
  {
    id: identityPrimaryKey(),
    userId: text()
      .notNull()
      .references(() => users.id),
    provider: text().notNull(),
    /** ID transakce u poskytovatele (Comgate transId) — doplní se po založení platby. */
    providerTransactionId: text().unique(),
    voucherCount: smallint().notNull(),
    amountCzk: integer().notNull(),
    status: paymentStatusEnum().notNull().default('pending'),
    paidAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
  },
  (table) => [index().on(table.userId, table.createdAt)],
)

/**
 * Poukázka na jedno topování. Kód je přenosný jako na Bazoši — uplatnit ho
 * může kdokoli, kdo ho zná (třeba obdarovaný).
 */
export const toppingVouchers = pgTable(
  'topping_vouchers',
  {
    id: identityPrimaryKey(),
    code: text().notNull().unique(),
    ownerUserId: text()
      .notNull()
      .references(() => users.id),
    paymentId: integer().references(() => payments.id),
    status: voucherStatusEnum().notNull().default('available'),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    usedOnListingId: integer().references(() => listings.id, { onDelete: 'set null' }),
    usedByUserId: text().references(() => users.id),
    usedAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
  },
  (table) => [index().on(table.ownerUserId, table.status, table.expiresAt)],
)
