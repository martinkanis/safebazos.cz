import { describe, expect, it } from 'vitest'
import { isValidStorageKey } from './storage'

describe('isValidStorageKey', () => {
  it('přijme klíč vygenerovaný aplikací', () => {
    expect(isValidStorageKey('listings/0b7f3c1e-5d2a-4c1b-9f3e-2a1b3c4d5e6f_thumb.webp')).toBe(true)
  })

  it('odmítne pokus o path traversal', () => {
    expect(isValidStorageKey('../.env')).toBe(false)
    expect(isValidStorageKey('listings/../../etc/passwd.webp')).toBe(false)
  })

  it('odmítne jiné přípony než webp', () => {
    expect(isValidStorageKey('listings/soubor.html')).toBe(false)
  })
})
