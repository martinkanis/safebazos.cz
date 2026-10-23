import { describe, expect, it } from 'vitest'
import type { MainCategory } from '@/features/categories/queries'
import { suggestCategoryId } from './bazos-categories'

const tree: MainCategory[] = [
  {
    id: 1,
    slug: 'mobily',
    name: 'Mobily',
    subcategories: [
      { id: 11, slug: 'chytre-hodinky', name: 'Chytré hodinky' },
      { id: 12, slug: 'apple', name: 'Apple iPhone' },
    ],
  },
]

describe('suggestCategoryId', () => {
  it('najde podkategorii se shodným názvem', () => {
    expect(suggestCategoryId(tree, { subdomain: 'mobil', subcategoryName: 'Chytré hodinky' })).toBe(
      11,
    )
  })

  it('bez shody názvu nic nenavrhne', () => {
    expect(suggestCategoryId(tree, { subdomain: 'mobil', subcategoryName: 'Nokia' })).toBeNull()
    expect(
      suggestCategoryId(tree, { subdomain: 'neznama', subcategoryName: 'Chytré hodinky' }),
    ).toBeNull()
  })
})
