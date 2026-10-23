const CZECH_PREFIX = '420'
const SLOVAK_PREFIX = '421'
const NATIONAL_NUMBER_LENGTH = 9

/**
 * Normalizuje české/slovenské mobilní číslo do mezinárodního tvaru bez +
 * („777 123 456“ → „420777123456“). Jiné formáty vrací jako null.
 */
export function normalizePhoneNumber(input: string): string | null {
  const digits = input.replace(/[\s()-]/g, '').replace(/^(\+|00)/, '')
  if (/^\d{9}$/.test(digits)) return `${CZECH_PREFIX}${digits}`
  const hasKnownPrefix = digits.startsWith(CZECH_PREFIX) || digits.startsWith(SLOVAK_PREFIX)
  const isFullLength = digits.length === CZECH_PREFIX.length + NATIONAL_NUMBER_LENGTH
  return hasKnownPrefix && isFullLength && /^\d+$/.test(digits) ? digits : null
}

/** „420777123456“ → „+420 777 123 456“ */
export function formatPhoneNumber(phone: string): string {
  const national = phone.slice(-NATIONAL_NUMBER_LENGTH)
  const prefix = phone.slice(0, -NATIONAL_NUMBER_LENGTH)
  return `+${prefix} ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`
}
