const COMBINING_DIACRITICS = /[̀-ͯ]/g

/** Malá písmena bez diakritiky — „Škoda Octávia“ → „skoda octavia“. */
export function normalizeText(text: string): string {
  return text.normalize('NFD').replace(COMBINING_DIACRITICS, '').toLowerCase()
}

const MAX_SLUG_LENGTH = 80

/** URL-friendly slug pro SEO adresy: „Kolo Author 29"“ → „kolo-author-29“. */
export function slugify(text: string): string {
  const slug = normalizeText(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/, '')
  return slug || 'inzerat'
}

/** Zkrátí text na maximální délku po celých slovech a přidá výpustku. */
export function truncateText(text: string, maxLength: number): string {
  const singleLine = text.replace(/\s+/g, ' ').trim()
  if (singleLine.length <= maxLength) return singleLine
  const cut = singleLine.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`
}

/** PSČ v obvyklém zápisu: „60200“ → „602 00“. */
export function formatPostalCode(postalCode: string): string {
  return /^\d{5}$/.test(postalCode)
    ? `${postalCode.slice(0, 3)} ${postalCode.slice(3)}`
    : postalCode
}
