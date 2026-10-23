import { randomUnambiguousCode } from '@/lib/random-code'

const GROUP_LENGTH = 4
const GROUP_COUNT = 2
const CODE_PREFIX = 'SB'

/** Kód poukázky, např. „SB-7KQM-X3PD“. */
export function generateVoucherCode(): string {
  return [CODE_PREFIX, ...Array.from({ length: GROUP_COUNT }, () => randomUnambiguousCode(GROUP_LENGTH))].join('-')
}

/** Kód zadaný uživatelem: velká písmena, bez mezer, pomlčky doplní. */
export function normalizeVoucherCode(input: string): string {
  const compact = input.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (!compact.startsWith(CODE_PREFIX)) return compact
  const body = compact.slice(CODE_PREFIX.length)
  const groups = body.match(new RegExp(`.{1,${GROUP_LENGTH}}`, 'g')) ?? []
  return [CODE_PREFIX, ...groups].join('-')
}
