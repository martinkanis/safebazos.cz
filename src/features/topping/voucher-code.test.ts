import { describe, expect, it } from 'vitest'
import { generateVoucherCode, normalizeVoucherCode } from './voucher-code'

describe('generateVoucherCode', () => {
  it('vrací kód ve tvaru SB-XXXX-XXXX bez zaměnitelných znaků', () => {
    const code = generateVoucherCode()
    expect(code).toMatch(/^SB-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/)
  })
})

describe('normalizeVoucherCode', () => {
  it('opraví malá písmena, mezery a chybějící pomlčky', () => {
    expect(normalizeVoucherCode(' sb 7kqm x3pd ')).toBe('SB-7KQM-X3PD')
    expect(normalizeVoucherCode('SB-7KQM-X3PD')).toBe('SB-7KQM-X3PD')
  })
})
