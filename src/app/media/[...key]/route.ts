import { isValidStorageKey, readObject } from '@/lib/storage'

/** Klíče obsahují UUID a obsah se nikdy nemění → lze cachovat natrvalo. */
const IMMUTABLE_CACHE = 'public, max-age=31536000, immutable'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
): Promise<Response> {
  const key = (await params).key.join('/')
  if (!isValidStorageKey(key)) return new Response('Nenalezeno', { status: 404 })

  const file = await readObject(key)
  if (!file) return new Response('Nenalezeno', { status: 404 })

  return new Response(new Uint8Array(file), {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': IMMUTABLE_CACHE,
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
