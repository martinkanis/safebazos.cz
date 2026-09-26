import { asc, isNull } from 'drizzle-orm'
import { cache } from 'react'
import { getDb } from '@/db/client'
import { categories } from '@/db/schema'

export interface Subcategory {
  id: number
  slug: string
  name: string
}

export interface MainCategory {
  id: number
  slug: string
  name: string
  subcategories: Subcategory[]
}

/** Celý strom kategorií seřazený podle sortOrder (per-request cache). */
export const getCategoryTree = cache(async (): Promise<MainCategory[]> => {
  const rows = await getDb()
    .select({
      id: categories.id,
      parentId: categories.parentId,
      slug: categories.slug,
      name: categories.name,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name))

  const mainCategories = rows
    .filter((row) => row.parentId === null)
    .map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      subcategories: [] as Subcategory[],
    }))
  const mainById = new Map(mainCategories.map((category) => [category.id, category]))

  for (const row of rows) {
    if (row.parentId === null) continue
    mainById.get(row.parentId)?.subcategories.push({ id: row.id, slug: row.slug, name: row.name })
  }
  return mainCategories
})

export interface ResolvedCategory {
  main: MainCategory
  sub: Subcategory | null
}

/** Najde kategorii podle slugů z URL; null = neexistuje (→ 404). */
export async function resolveCategory(
  mainSlug: string,
  subSlug?: string,
): Promise<ResolvedCategory | null> {
  const main = (await getCategoryTree()).find((category) => category.slug === mainSlug)
  if (!main) return null
  if (subSlug === undefined) return { main, sub: null }
  const sub = main.subcategories.find((category) => category.slug === subSlug)
  return sub ? { main, sub } : null
}

export interface SubcategoryWithParent {
  main: MainCategory
  sub: Subcategory
}

/** Najde podkategorii (a její hlavní kategorii) podle ID. */
export async function findSubcategoryById(id: number): Promise<SubcategoryWithParent | null> {
  for (const main of await getCategoryTree()) {
    const sub = main.subcategories.find((category) => category.id === id)
    if (sub) return { main, sub }
  }
  return null
}

export function categoryPath(main: { slug: string }, sub?: { slug: string } | null): string {
  return sub ? `/${main.slug}/${sub.slug}` : `/${main.slug}`
}

export async function hasMainCategories(): Promise<boolean> {
  const [row] = await getDb()
    .select({ id: categories.id })
    .from(categories)
    .where(isNull(categories.parentId))
    .limit(1)
  return row !== undefined
}
