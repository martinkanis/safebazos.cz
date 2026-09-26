import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { loadEnv } from '@/config/env'

/**
 * Úložiště nahraných souborů na lokálním disku. Klíče generuje aplikace;
 * validace klíče brání path traversal při čtení z veřejné /media route.
 * TODO: pro produkci s více instancemi nahradit S3-kompatibilním úložištěm.
 */

const STORAGE_KEY_PATTERN = /^[a-z0-9-]+(?:\/[a-z0-9_-]+)*\.webp$/

export function isValidStorageKey(key: string): boolean {
  return STORAGE_KEY_PATTERN.test(key)
}

function resolveStoragePath(key: string): string {
  if (!isValidStorageKey(key)) {
    throw new Error(`Neplatný klíč úložiště: ${key}`)
  }
  return path.resolve(loadEnv().STORAGE_DIR, key)
}

export async function saveObject(key: string, data: Buffer): Promise<void> {
  const filePath = resolveStoragePath(key)
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, data)
}

/** Obsah souboru, nebo null, když neexistuje. */
export async function readObject(key: string): Promise<Buffer | null> {
  try {
    return await readFile(resolveStoragePath(key))
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}

export async function deleteObjects(keys: string[]): Promise<void> {
  await Promise.all(keys.map((key) => rm(resolveStoragePath(key), { force: true })))
}
