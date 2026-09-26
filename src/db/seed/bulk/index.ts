import { closeDb } from '../../client'
import { seedBulkListings } from './generate'

/** CLI: `pnpm db:seed:bulk [počet]` (výchozí 5 000). */
const DEFAULT_LISTING_COUNT = 5000

function log(message: string) {
  process.stdout.write(`${message}\n`)
}

async function main() {
  const total = Number(process.argv[2] ?? DEFAULT_LISTING_COUNT)
  if (!Number.isInteger(total) || total <= 0) {
    throw new Error(`Neplatný počet inzerátů: ${process.argv[2]}`)
  }
  const inserted = await seedBulkListings(total, log)
  if (inserted === 0) log('Hromadná demo data už existují, přeskakuji.')
}

main()
  .catch((error: unknown) => {
    process.stderr.write(
      `Hromadný seed selhal: ${error instanceof Error ? error.stack : String(error)}\n`,
    )
    process.exitCode = 1
  })
  .finally(() => closeDb())
