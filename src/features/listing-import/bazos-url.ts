export interface BazosListingReference {
  listingId: string
  /** Adresa sestavená jen z ověřených částí — nikdy nestahujeme URL od uživatele tak, jak je. */
  url: string
}

const BAZOS_HOST = /^(?:([a-z]+)\.)?bazos\.cz$/
const LISTING_PATH = /^\/inzerat\/(\d{5,12})(?:\/([a-z0-9-]+)\.php)?/

/** Rozpozná odkaz na inzerát Bazoš.cz; cokoli jiného (jiná doména, jiná stránka) vrací null. */
export function parseBazosListingUrl(input: string): BazosListingReference | null {
  let parsed: URL
  try {
    parsed = new URL(input.trim())
  } catch {
    return null
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null

  const host = BAZOS_HOST.exec(parsed.hostname.toLowerCase())
  const path = LISTING_PATH.exec(parsed.pathname)
  if (!host || !path?.[1]) return null

  const subdomain = host[1] ?? 'www'
  const slug = path[2] ?? 'inzerat'
  return {
    listingId: path[1],
    url: `https://${subdomain}.bazos.cz/inzerat/${path[1]}/${slug}.php`,
  }
}
