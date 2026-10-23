import type { PriceType } from '@/db/schema'
import { htmlToText } from './html-text'

export interface ParsedBazosListing {
  title: string
  description: string
  priceType: PriceType
  priceAmount: number | null
  postalCode: string | null
  city: string | null
  /** Subdoména hlavní kategorie (mobil, auto, …) a název podkategorie z drobečkové navigace. */
  bazosCategory: { subdomain: string; subcategoryName: string } | null
  imageUrls: string[]
}

const TITLE = /<h1 class=nadpisdetail>([\s\S]*?)<\/h1>/i
const DESCRIPTION = /<div class=popisdetail>([\s\S]*?)<\/div>/i
const PRICE = /Cena:<\/td>\s*<td[^>]*>[\s\S]*?<b>([\s\S]*?)<\/b>/i
const LOCATION = /Lokalita:<\/td>[\s\S]*?<a [^>]*>(\d{3}\s?\d{2})<\/a>\s*<a [^>]*>([^<]+)<\/a>/i
const BREADCRUMB = /<div class="drobky">([\s\S]*?)<\/div>/i
const BREADCRUMB_CATEGORY =
  /<a href="https:\/\/([a-z]+)\.bazos\.cz\/">[^<]*<\/a>\s*>\s*<a href="https:\/\/[a-z]+\.bazos\.cz\/[a-z0-9-]+\/">([^<]+)<\/a>/i

const PRICE_TYPE_BY_TEXT: Record<string, PriceType> = {
  dohodou: 'negotiable',
  nabidnete: 'offer',
  zdarma: 'free',
  'v textu': 'in_text',
}

function normalizeLabel(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

/** „12 000 Kč“ → částka, „Dohodou“/„Nabídněte“/… → typ ceny bez částky. */
export function parseBazosPrice(text: string): {
  priceType: PriceType
  priceAmount: number | null
} {
  const label = PRICE_TYPE_BY_TEXT[normalizeLabel(text)]
  if (label) return { priceType: label, priceAmount: null }
  const digits = text.replace(/[^\d]/g, '')
  return digits
    ? { priceType: 'amount', priceAmount: Number(digits) }
    : { priceType: 'negotiable', priceAmount: null }
}

/** Jen plné fotky právě tohoto inzerátu z úložiště Bazoše — nic jiného nestahujeme. */
function extractImageUrls(html: string, listingId: string): string[] {
  const pattern = new RegExp(
    `https://www\\.bazos\\.cz/img/(\\d{1,2})/\\d{3}/${listingId}\\.jpg(?:\\?t=\\d+)?`,
    'g',
  )
  return Array.from(new Set(Array.from(html.matchAll(pattern), (match) => match[0])))
}

/** Vytáhne údaje z HTML stránky inzerátu Bazoš.cz. Při změně struktury stránky vrací null. */
export function parseBazosListingPage(html: string, listingId: string): ParsedBazosListing | null {
  const title = TITLE.exec(html)?.[1]
  const description = DESCRIPTION.exec(html)?.[1]
  if (!title || !description) return null

  const location = LOCATION.exec(html)
  const breadcrumb = BREADCRUMB.exec(html)?.[1] ?? ''
  const category = BREADCRUMB_CATEGORY.exec(breadcrumb)
  const priceText = PRICE.exec(html)?.[1]

  return {
    title: htmlToText(title),
    description: htmlToText(description),
    ...(priceText
      ? parseBazosPrice(htmlToText(priceText))
      : { priceType: 'negotiable', priceAmount: null }),
    postalCode: location?.[1]?.replace(/\s/g, '') ?? null,
    city: location?.[2] ? htmlToText(location[2]) : null,
    bazosCategory:
      category?.[1] && category[2]
        ? { subdomain: category[1], subcategoryName: htmlToText(category[2]) }
        : null,
    imageUrls: extractImageUrls(html, listingId),
  }
}
