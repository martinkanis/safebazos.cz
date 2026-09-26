import { describe, expect, it } from 'vitest'
import { listingInputSchema } from './listing-input'

const validInput = {
  categoryId: '12',
  title: 'Dětské kolo 20"',
  description: 'Málo jeté dětské kolo, pravidelně servisované, nové pneumatiky.',
  priceType: 'amount',
  priceAmount: '2 500',
  postalCode: '602 00',
  city: 'Brno',
  phone: '777 123 456',
  acceptsSafePayment: true,
}

describe('listingInputSchema', () => {
  it('normalizuje mezery v ceně, PSČ a telefonu', () => {
    const parsed = listingInputSchema.parse(validInput)
    expect(parsed).toMatchObject({
      categoryId: 12,
      priceAmount: 2500,
      postalCode: '60200',
      phone: '777123456',
    })
  })

  it('vyžaduje cenu, když je typ ceny částka', () => {
    const result = listingInputSchema.safeParse({ ...validInput, priceAmount: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.path).toEqual(['priceAmount'])
  })

  it('u ceny dohodou částku zahodí', () => {
    const parsed = listingInputSchema.parse({ ...validInput, priceType: 'negotiable' })
    expect(parsed.priceAmount).toBeNull()
  })

  it('odmítne neplatné PSČ', () => {
    const result = listingInputSchema.safeParse({ ...validInput, postalCode: '1234' })
    expect(result.success).toBe(false)
  })

  it('telefon je nepovinný, ale musí mít platný formát', () => {
    expect(listingInputSchema.parse({ ...validInput, phone: '' }).phone).toBeNull()
    expect(listingInputSchema.parse({ ...validInput, phone: '+420777123456' }).phone).toBe(
      '+420777123456',
    )
    expect(listingInputSchema.safeParse({ ...validInput, phone: '+44 7911 123' }).success).toBe(
      false,
    )
  })
})
