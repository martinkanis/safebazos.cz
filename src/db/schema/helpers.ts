import { integer, timestamp } from 'drizzle-orm/pg-core'

/** Primární klíč: krátké celé číslo — dobře čitelné v URL (/inzerat/123/...). */
export function identityPrimaryKey() {
  return integer().primaryKey().generatedAlwaysAsIdentity()
}

export function createdAt() {
  return timestamp({ withTimezone: true }).notNull().defaultNow()
}

export function updatedAt() {
  return timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date())
}
