import { describe, expect, it } from 'vitest'
import {
  containsVerificationCode,
  generateImportVerificationCode,
  removeVerificationCode,
} from './verification-code'

describe('generateImportVerificationCode', () => {
  it('vrací kód ve tvaru SAFEBAZOS-XXXX', () => {
    expect(generateImportVerificationCode()).toMatch(/^SAFEBAZOS-[A-HJ-NP-Z2-9]{4}$/)
  })
})

describe('containsVerificationCode', () => {
  it('najde kód bez ohledu na velikost písmen a mezeru místo pomlčky', () => {
    expect(containsVerificationCode('kód: safebazos 7kqm', 'SAFEBAZOS-7KQM')).toBe(true)
  })

  it('jiný kód nenajde', () => {
    expect(containsVerificationCode('SAFEBAZOS-AAAA', 'SAFEBAZOS-7KQM')).toBe(false)
  })
})

describe('removeVerificationCode', () => {
  it('smaže řádek, kde zbyl jen popisek', () => {
    expect(
      removeVerificationCode(
        'Prodám kolo.\n\nOvěřovací kód: SAFEBAZOS-7KQM\nPředání Brno.',
        'SAFEBAZOS-7KQM',
      ),
    ).toBe('Prodám kolo.\n\nPředání Brno.')
  })

  it('z řádku s dalším textem odstraní jen kód', () => {
    expect(removeVerificationCode('Předání Brno SAFEBAZOS-7KQM', 'SAFEBAZOS-7KQM')).toBe(
      'Předání Brno',
    )
  })
})
