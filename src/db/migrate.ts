import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { closeDb, getDb } from './client'

const migrationsFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations')

async function main() {
  await migrate(getDb(), { migrationsFolder })
  process.stdout.write('Migrace aplikovány.\n')
}

main()
  .catch((error: unknown) => {
    process.stderr.write(`Migrace selhala: ${String(error)}\n`)
    process.exitCode = 1
  })
  .finally(() => closeDb())
