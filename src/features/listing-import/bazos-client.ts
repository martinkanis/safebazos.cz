import { MAX_UPLOAD_BYTES } from '@/features/listings/listing-limits'

/**
 * Jednorázové načtení stránky inzerátu na žádost jeho vlastníka (ne crawler).
 * Identifikujeme se pravdivě a stahujeme jen stránku a fotky daného inzerátu.
 */
const USER_AGENT =
  'SafeBazosImport/1.0 (+https://safebazos.cz/bezpecnost; import na zadost vlastnika)'
const FETCH_TIMEOUT_MS = 10_000
const MAX_PAGE_BYTES = 2 * 1024 * 1024
const BAZOS_IMAGE_URL = /^https:\/\/www\.bazos\.cz\/img\/\d{1,2}\/\d{3}\/\d+\.jpg(?:\?t=\d+)?$/

function isBazosHost(url: string): boolean {
  const hostname = new URL(url).hostname
  return hostname === 'bazos.cz' || hostname.endsWith('.bazos.cz')
}

async function fetchFromBazos(url: string): Promise<Response> {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  // Přesměrování smí vést jen zase na Bazoš (jiná subdoména), nikam jinam.
  if (!isBazosHost(response.url)) {
    throw new Error(`Bazoš přesměroval mimo svou doménu: ${response.url}`)
  }
  return response
}

/** HTML stránky inzerátu, nebo null, když inzerát neexistuje. */
export async function fetchBazosListingPage(url: string): Promise<string | null> {
  const response = await fetchFromBazos(url)
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Bazoš vrátil HTTP ${response.status} pro ${url}`)
  const html = await response.text()
  if (html.length > MAX_PAGE_BYTES) throw new Error(`Stránka ${url} je nečekaně velká`)
  return html
}

export async function fetchBazosImage(url: string): Promise<Buffer> {
  if (!BAZOS_IMAGE_URL.test(url)) throw new Error(`Nepovolená adresa fotky: ${url}`)
  const response = await fetchFromBazos(url)
  if (!response.ok) throw new Error(`Fotku ${url} se nepodařilo stáhnout (HTTP ${response.status})`)
  const image = Buffer.from(await response.arrayBuffer())
  if (image.length > MAX_UPLOAD_BYTES) throw new Error(`Fotka ${url} je větší než limit`)
  return image
}
