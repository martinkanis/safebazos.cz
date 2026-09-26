import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { users } from './auth'
import { listingStatusEnum, priceTypeEnum, riskLevelEnum, scamSignalEnum } from './enums'
import { createdAt, identityPrimaryKey, updatedAt } from './helpers'
import { categories } from './taxonomy'

export const listings = pgTable(
  'listings',
  {
    id: identityPrimaryKey(),
    slug: text().notNull(),
    ownerUserId: text()
      .notNull()
      .references(() => users.id),
    /** Vždy podkategorie (list stromu). */
    categoryId: integer()
      .notNull()
      .references(() => categories.id),

    title: varchar({ length: 100 }).notNull(),
    description: text().notNull(),
    priceType: priceTypeEnum().notNull(),
    /** Cena v celých Kč — vyplněná jen pro priceType = 'amount'. */
    priceAmount: integer(),
    postalCode: varchar({ length: 5 }).notNull(),
    city: text().notNull(),
    /** Obec bez diakritiky, malými písmeny — pro filtr lokality („plzen“ najde „Plzeň“). */
    cityNormalized: text().notNull(),
    phone: text(),

    /** Prodejce nabízí platbu přes úschovu (SafeDeal) — zatím jen deklarace, bez platební integrace. */
    acceptsSafePayment: boolean().notNull().default(false),

    status: listingStatusEnum().notNull().default('active'),
    riskLevel: riskLevelEnum().notNull().default('none'),
    riskSignals: scamSignalEnum().array().notNull().default(sql`'{}'`),

    /** Normalizovaný text (malá písmena, bez diakritiky) pro trigramové vyhledávání. */
    searchText: text().notNull(),
    viewCount: integer().notNull().default(0),

    publishedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index().on(table.categoryId, table.status, table.publishedAt.desc()),
    index().on(table.status, table.publishedAt.desc()),
    index().on(table.ownerUserId),
    index().on(table.postalCode),
    index().on(table.cityNormalized),
    index('listings_search_text_trgm_idx').using('gin', sql`${table.searchText} gin_trgm_ops`),
  ],
)

export const listingImages = pgTable(
  'listing_images',
  {
    id: identityPrimaryKey(),
    listingId: integer()
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    storageKey: text().notNull(),
    thumbnailKey: text().notNull(),
    width: smallint().notNull(),
    height: smallint().notNull(),
    sortOrder: smallint().notNull().default(0),
    createdAt: createdAt(),
  },
  (table) => [index().on(table.listingId, table.sortOrder)],
)
