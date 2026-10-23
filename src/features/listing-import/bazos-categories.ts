import type { MainCategory } from '@/features/categories/queries'
import { normalizeText } from '@/lib/text'

/** Subdomény hlavních kategorií Bazoše → slug naší hlavní kategorie. */
const MAIN_CATEGORY_BY_BAZOS_SUBDOMAIN: Record<string, string> = {
  zvirata: 'zvirata',
  deti: 'deti',
  reality: 'reality',
  prace: 'prace',
  auto: 'auto',
  motorky: 'motorky',
  stroje: 'stroje',
  dum: 'dum-a-zahrada',
  pc: 'pc',
  mobil: 'mobily',
  foto: 'foto',
  elektro: 'elektro',
  sport: 'sport',
  hudba: 'hudba',
  vstupenky: 'vstupenky',
  knihy: 'knihy',
  nabytek: 'nabytek',
  obleceni: 'obleceni',
  sluzby: 'sluzby',
  ostatni: 'ostatni',
}

/**
 * Navrhne naši podkategorii podle kategorie na Bazoši. Shoda názvu podkategorie
 * vyhrává; jinak null a prodejce vybere sám (formulář to stejně vyžaduje).
 */
export function suggestCategoryId(
  categoryTree: MainCategory[],
  bazosCategory: { subdomain: string; subcategoryName: string } | null,
): number | null {
  if (!bazosCategory) return null
  const mainSlug = MAIN_CATEGORY_BY_BAZOS_SUBDOMAIN[bazosCategory.subdomain]
  const main = categoryTree.find((category) => category.slug === mainSlug)
  const wantedName = normalizeText(bazosCategory.subcategoryName)
  const sub = main?.subcategories.find((category) => normalizeText(category.name) === wantedName)
  return sub?.id ?? null
}
