import { type AnyPgColumn, integer, pgTable, smallint, text, unique } from 'drizzle-orm/pg-core'
import { identityPrimaryKey } from './helpers'

/** Dvouúrovňový strom kategorií: hlavní kategorie (parentId = null) → podkategorie. */
export const categories = pgTable(
  'categories',
  {
    id: identityPrimaryKey(),
    parentId: integer().references((): AnyPgColumn => categories.id),
    slug: text().notNull(),
    name: text().notNull(),
    sortOrder: smallint().notNull().default(0),
  },
  (table) => [unique().on(table.parentId, table.slug).nullsNotDistinct()],
)
