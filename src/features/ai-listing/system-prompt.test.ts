import { describe, expect, it } from 'vitest'
import type { MainCategory } from '@/features/categories/queries'
import { buildSystemPrompt } from './system-prompt'

const tree: MainCategory[] = [
  {
    id: 1,
    slug: 'foto',
    name: 'Foto',
    subcategories: [{ id: 11, slug: 'video', name: 'Video a kamery' }],
  },
]

describe('buildSystemPrompt', () => {
  it('obsahuje podkategorie s ID, ze kterých model vybírá', () => {
    expect(buildSystemPrompt(tree)).toContain('11: Foto > Video a kamery')
  })

  it('je deterministický — stejný strom dá stejný prompt (podmínka cache)', () => {
    expect(buildSystemPrompt(tree)).toBe(buildSystemPrompt(tree))
  })
})
