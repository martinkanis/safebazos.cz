import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { loadEnv, type Env } from '@/config/env'

/**
 * Úložiště nahraných souborů: S3 (produkce), nebo lokální disk (vývoj),
 * podle toho, zda je nastavené S3_BUCKET. Klíče generuje aplikace;
 * validace klíče brání path traversal při čtení z veřejné /media route.
 */

const STORAGE_KEY_PATTERN = /^[a-z0-9-]+(?:\/[a-z0-9_-]+)*\.webp$/
const CONTENT_TYPE = 'image/webp'

export function isValidStorageKey(key: string): boolean {
  return STORAGE_KEY_PATTERN.test(key)
}

function assertValidKey(key: string): void {
  if (!isValidStorageKey(key)) throw new Error(`Neplatný klíč úložiště: ${key}`)
}

interface ObjectStorage {
  save(key: string, data: Buffer): Promise<void>
  read(key: string): Promise<Buffer | null>
  delete(keys: string[]): Promise<void>
}

function createDiskStorage(rootDir: string): ObjectStorage {
  const resolvePath = (key: string) => path.resolve(rootDir, key)
  return {
    async save(key, data) {
      const filePath = resolvePath(key)
      await mkdir(path.dirname(filePath), { recursive: true })
      await writeFile(filePath, data)
    },
    async read(key) {
      try {
        return await readFile(resolvePath(key))
      } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
        throw error
      }
    },
    async delete(keys) {
      await Promise.all(keys.map((key) => rm(resolvePath(key), { force: true })))
    },
  }
}

function createS3Storage(env: Env, bucket: string): ObjectStorage {
  const client = new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
    credentials:
      env.S3_ACCESS_KEY && env.S3_SECRET_KEY
        ? { accessKeyId: env.S3_ACCESS_KEY, secretAccessKey: env.S3_SECRET_KEY }
        : undefined,
  })
  return {
    async save(key, data) {
      await client.send(
        new PutObjectCommand({ Bucket: bucket, Key: key, Body: data, ContentType: CONTENT_TYPE }),
      )
    },
    async read(key) {
      try {
        const object = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
        const bytes = await object.Body?.transformToByteArray()
        return bytes ? Buffer.from(bytes) : null
      } catch (error) {
        if (error instanceof NoSuchKey) return null
        throw error
      }
    },
    async delete(keys) {
      if (keys.length === 0) return
      await client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: keys.map((key) => ({ Key: key })) },
        }),
      )
    },
  }
}

let storage: ObjectStorage | null = null

function getStorage(): ObjectStorage {
  if (!storage) {
    const env = loadEnv()
    storage = env.S3_BUCKET ? createS3Storage(env, env.S3_BUCKET) : createDiskStorage(env.STORAGE_DIR)
  }
  return storage
}

export async function saveObject(key: string, data: Buffer): Promise<void> {
  assertValidKey(key)
  await getStorage().save(key, data)
}

/** Obsah souboru, nebo null, když neexistuje. */
export async function readObject(key: string): Promise<Buffer | null> {
  assertValidKey(key)
  return getStorage().read(key)
}

export async function deleteObjects(keys: string[]): Promise<void> {
  keys.forEach(assertValidKey)
  await getStorage().delete(keys)
}
