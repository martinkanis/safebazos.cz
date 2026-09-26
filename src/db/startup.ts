import path from 'node:path'
import { sql } from 'drizzle-orm'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { loadEnv } from '@/config/env'
import { createLogger } from '@/lib/logger'
import { ensureAdmin, seedCategories } from './bootstrap'
import { getDb } from './client'
import { seedBulkListings } from './seed/bulk/generate'
import { seedHandcraftedListings } from './seed/demo'

const logger = createLogger('startup')

/** Migrace se kopírují do image vedle serveru (viz Dockerfile), cwd = kořen aplikace. */
const MIGRATIONS_FOLDER = path.join(process.cwd(), 'src/db/migrations')

/** Libovolné, ale pevné číslo zámku — serializuje start mezi procesy a replikami. */
const STARTUP_LOCK_KEY = 7_302_265

/**
 * Souběžný první start mohl založit sekvenci migrační tabulky bez tabulky samotné;
 * drizzle pak při každém startu padá na „duplicate key … _id_seq“. Osiřelou sekvenci uklidíme.
 */
async function removeOrphanedMigrationSequence(): Promise<void> {
  await getDb().execute(sql`
    DO $$ BEGIN
      IF to_regclass('drizzle.__drizzle_migrations') IS NULL THEN
        DROP SEQUENCE IF EXISTS drizzle.__drizzle_migrations_id_seq;
      END IF;
    END $$;
  `)
}

async function withStartupLock(task: () => Promise<void>): Promise<void> {
  const client = await getDb().$client.connect()
  try {
    await client.query('select pg_advisory_lock($1)', [STARTUP_LOCK_KEY])
    await task()
  } finally {
    await client.query('select pg_advisory_unlock($1)', [STARTUP_LOCK_KEY])
    client.release()
  }
}

async function seedDemoData(bulkCount: number): Promise<void> {
  const handcrafted = await seedHandcraftedListings()
  const bulk = await seedBulkListings(bulkCount, (message) => logger.info(message))
  logger.info({ handcrafted, bulk }, 'Demo data připravena')
}

/**
 * Úlohy při startu serveru: migrace, kategorie a admin z ENV (blokující —
 * bez nich web nefunguje), pak volitelně demo data na pozadí.
 */
async function runStartupTasks(): Promise<void> {
  const env = loadEnv()
  await withStartupLock(async () => {
    await removeOrphanedMigrationSequence()
    await migrate(getDb(), { migrationsFolder: MIGRATIONS_FOLDER })
    if (await seedCategories()) logger.info('Kategorie vloženy')

    if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
      await ensureAdmin(env.ADMIN_EMAIL, env.ADMIN_PASSWORD)
      logger.info({ email: env.ADMIN_EMAIL }, 'Admin účet synchronizován z ENV')
    } else {
      logger.warn('ADMIN_EMAIL/ADMIN_PASSWORD nejsou nastavené — admin účet se nevytvoří')
    }
  })

  if (env.SEED_DEMO_LISTINGS > 0) {
    // Generování fotek trvá minuty — nesmí blokovat start serveru.
    void seedDemoData(env.SEED_DEMO_LISTINGS).catch((error: unknown) => {
      logger.error({ err: error }, 'Generování demo dat selhalo')
    })
  }
}

const globalForStartup = globalThis as typeof globalThis & {
  safebazosStartup?: Promise<void> | null
}

/**
 * Next po selhání register() volá hook znovu u dalších požadavků, i souběžně.
 * Proběhne proto nejvýš jeden běh najednou; po chybě se další požadavek pokusí znovu.
 */
export function ensureStartupTasks(): Promise<void> {
  globalForStartup.safebazosStartup ??= runStartupTasks().catch((error: unknown) => {
    globalForStartup.safebazosStartup = null
    logger.error({ err: error }, 'Startovní úlohy selhaly')
    throw error
  })
  return globalForStartup.safebazosStartup
}
