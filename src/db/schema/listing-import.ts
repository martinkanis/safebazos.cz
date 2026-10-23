import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { users } from './auth'
import { importClaimStatusEnum, type PriceType } from './enums'
import { createdAt, identityPrimaryKey } from './helpers'
import { listings } from './listings'

/** Data převzatá z cizího inzerátu — předvyplní formulář, než ho prodejce potvrdí. */
export interface ImportedListingDraft {
  title: string
  description: string
  priceType: PriceType
  priceAmount: number | null
  postalCode: string | null
  city: string | null
  suggestedCategoryId: number | null
  images: Array<{ storageKey: string; thumbnailKey: string; width: number; height: number }>
}

/**
 * Žádost o převzetí vlastního inzerátu z jiného bazaru. Vlastnictví se prokazuje
 * ověřovacím kódem, který prodejce vloží do popisu původního inzerátu.
 */
export const listingImportClaims = pgTable(
  'listing_import_claims',
  {
    id: identityPrimaryKey(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    source: text().notNull(),
    sourceListingId: text().notNull(),
    sourceUrl: text().notNull(),
    verificationCode: text().notNull(),
    status: importClaimStatusEnum().notNull().default('pending'),
    draft: jsonb().$type<ImportedListingDraft>(),
    verifiedAt: timestamp({ withTimezone: true }),
    /** Čestné prohlášení o autorství textu a fotek — kdy a v jakém znění bylo potvrzeno. */
    consentedAt: timestamp({ withTimezone: true }),
    consentTextVersion: text(),
    importedListingId: integer().references(() => listings.id, { onDelete: 'set null' }),
    createdAt: createdAt(),
  },
  (table) => [
    index().on(table.userId, table.createdAt),
    // Každý cizí inzerát lze převzít jen jednou — ani jiným účtem.
    uniqueIndex('listing_import_claims_imported_source_unique')
      .on(table.source, table.sourceListingId)
      .where(sql`${table.status} = 'imported'`),
  ],
)
