import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'

const CODE_DIGITS = 6

export function generateVerificationCode(): string {
  return String(randomInt(0, 10 ** CODE_DIGITS)).padStart(CODE_DIGITS, '0')
}

/** HMAC kódu vázaný na uživatele a číslo — únik tabulky kódů neprozradí platné kódy. */
export function hashVerificationCode(input: {
  code: string
  userId: string
  phone: string
  secret: string
}): string {
  return createHmac('sha256', input.secret)
    .update(`${input.userId}:${input.phone}:${input.code}`)
    .digest('hex')
}

export function isSameHash(expectedHash: string, actualHash: string): boolean {
  const expected = Buffer.from(expectedHash, 'hex')
  const actual = Buffer.from(actualHash, 'hex')
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}
