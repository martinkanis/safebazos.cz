import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './auth'
import { reportReasonEnum, reportStatusEnum } from './enums'
import { createdAt, identityPrimaryKey } from './helpers'
import { listings } from './listings'

/** Nahlášení inzerátu uživatelem — fronta pro moderátory. Nahlásit lze i anonymně. */
export const listingReports = pgTable(
  'listing_reports',
  {
    id: identityPrimaryKey(),
    listingId: integer()
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    reporterUserId: text().references(() => users.id, { onDelete: 'set null' }),
    reason: reportReasonEnum().notNull(),
    note: text(),
    status: reportStatusEnum().notNull().default('open'),
    resolvedByUserId: text().references(() => users.id, { onDelete: 'set null' }),
    resolvedAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
  },
  (table) => [index().on(table.status, table.createdAt), index().on(table.listingId)],
)
