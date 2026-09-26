import path from 'node:path'
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

async function seedDemoData(bulkCount: number): Promise<void> {
  const handcrafted = await seedHandcraftedListings()
  const bulk = await seedBulkListings(bulkCount, (message) => logger.info(message))
  logger.info({ handcrafted, bulk }, 'Demo data připravena')
}

/**
 * Úlohy při startu serveru: migrace, kategorie a admin z ENV (blokující —
 * bez nich web nefunguje), pak volitelně demo data na pozadí.
 */
export async function runStartupTasks(): Promise<void> {
  const env = loadEnv()
  await migrate(getDb(), { migrationsFolder: MIGRATIONS_FOLDER })
  if (await seedCategories()) logger.info('Kategorie vloženy')

  if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
    await ensureAdmin(env.ADMIN_EMAIL, env.ADMIN_PASSWORD)
    logger.info({ email: env.ADMIN_EMAIL }, 'Admin účet synchronizován z ENV')
  } else {
    logger.warn('ADMIN_EMAIL/ADMIN_PASSWORD nejsou nastavené — admin účet se nevytvoří')
  }

  if (env.SEED_DEMO_LISTINGS > 0) {
    // Generování fotek trvá minuty — nesmí blokovat start serveru.
    void seedDemoData(env.SEED_DEMO_LISTINGS).catch((error: unknown) => {
      logger.error({ err: error }, 'Generování demo dat selhalo')
    })
  }
}
