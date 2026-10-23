import { describe, expect, it } from 'vitest'
import { generateVerificationCode, hashVerificationCode, isSameHash } from './verification-code'

const input = { code: '123456', userId: 'user-1', phone: '420777123456', secret: 'tajne-heslo-123' }

describe('generateVerificationCode', () => {
  it('vrací šestimístný číselný kód', () => {
    expect(generateVerificationCode()).toMatch(/^\d{6}$/)
  })
})

describe('hashVerificationCode', () => {
  it('stejný vstup dá stejný hash', () => {
    expect(isSameHash(hashVerificationCode(input), hashVerificationCode(input))).toBe(true)
  })

  it('kód nejde použít pro jiné číslo ani jiného uživatele', () => {
    const original = hashVerificationCode(input)
    expect(isSameHash(original, hashVerificationCode({ ...input, phone: '420777000000' }))).toBe(
      false,
    )
    expect(isSameHash(original, hashVerificationCode({ ...input, userId: 'user-2' }))).toBe(false)
  })
})
