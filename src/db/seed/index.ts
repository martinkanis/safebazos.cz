import { loadEnv } from '@/config/env'
import { ensureAdmin, seedCategories } from '../bootstrap'
import { closeDb } from '../client'
import { DEMO_SELLER_PASSWORD, seedHandcraftedListings } from './demo'

/** CLI: `pnpm db:seed` — kategorie, admin z ENV a ručně psané demo inzeráty. */

function log(message: string) {
  process.stdout.write(`${message}\n`)
}

async function main() {
  if (await seedCategories()) log('Kategorie: vloženy.')

  const { ADMIN_EMAIL, ADMIN_PASSWORD } = loadEnv()
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    await ensureAdmin(ADMIN_EMAIL, ADMIN_PASSWORD)
    log(`Admin: ${ADMIN_EMAIL}`)
  } else {
    log('Admin: ADMIN_EMAIL/ADMIN_PASSWORD nejsou nastavené, přeskakuji.')
  }

  const inserted = await seedHandcraftedListings()
  log(
    inserted > 0
      ? `Demo inzeráty: vloženo ${inserted} (prodejci, heslo: ${DEMO_SELLER_PASSWORD}).`
      : 'Demo inzeráty: už existují, přeskakuji.',
  )
}

main()
  .catch((error: unknown) => {
    process.stderr.write(`Seed selhal: ${error instanceof Error ? error.stack : String(error)}\n`)
    process.exitCode = 1
  })
  .finally(() => closeDb())
