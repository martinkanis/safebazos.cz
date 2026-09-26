import { randomUUID } from 'node:crypto'
import { hashPassword } from 'better-auth/crypto'
import { and, count, eq } from 'drizzle-orm'
import { getDb } from './client'
import { accounts, categories, users } from './schema'
import { CATEGORY_SEEDS } from './seed/categories'

/** Základní data, bez kterých web nefunguje — idempotentní, bezpečné spouštět při každém startu. */

export async function seedCategories(): Promise<boolean> {
  const db = getDb()
  const [existing] = await db.select({ total: count() }).from(categories)
  if ((existing?.total ?? 0) > 0) return false

  await db.transaction(async (tx) => {
    for (const [mainIndex, main] of CATEGORY_SEEDS.entries()) {
      const [mainRow] = await tx
        .insert(categories)
        .values({ slug: main.slug, name: main.name, sortOrder: mainIndex })
        .returning({ id: categories.id })
      if (!mainRow) throw new Error(`Kategorii ${main.slug} se nepodařilo vložit`)
      await tx.insert(categories).values(
        main.subcategories.map(([slug, name], subIndex) => ({
          parentId: mainRow.id,
          slug,
          name,
          sortOrder: subIndex,
        })),
      )
    }
  })
  return true
}

export interface CredentialUserInput {
  name: string
  email: string
  password: string
  role?: string
}

/** Vytvoří ověřený účet s heslem (bez e-mailu), nebo vrátí ID existujícího. */
export async function ensureCredentialUser(input: CredentialUserInput): Promise<string> {
  const db = getDb()
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1)
  if (existing) return existing.id

  const userId = randomUUID()
  await db.insert(users).values({
    id: userId,
    name: input.name,
    email: input.email,
    emailVerified: true,
    role: input.role ?? 'user',
  })
  await db.insert(accounts).values({
    id: randomUUID(),
    accountId: userId,
    providerId: 'credential',
    userId,
    password: await hashPassword(input.password),
  })
  return userId
}

/**
 * Admin účet z ADMIN_EMAIL / ADMIN_PASSWORD. Proměnné prostředí jsou zdroj
 * pravdy: změna hesla v ENV se při dalším startu propíše i do účtu.
 */
export async function ensureAdmin(email: string, password: string): Promise<void> {
  const userId = await ensureCredentialUser({ name: 'Moderátor', email, password, role: 'admin' })
  const db = getDb()
  await db
    .update(users)
    .set({ role: 'admin', emailVerified: true, banned: false })
    .where(eq(users.id, userId))
  await db
    .update(accounts)
    .set({ password: await hashPassword(password) })
    .where(and(eq(accounts.userId, userId), eq(accounts.providerId, 'credential')))
}
