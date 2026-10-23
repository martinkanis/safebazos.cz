import { randomInt } from 'node:crypto'

/** Bez snadno zaměnitelných znaků (0/O, 1/I/L) — kódy se opisují ručně. */
const UNAMBIGUOUS_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function randomUnambiguousCode(length: number): string {
  return Array.from({ length }, () => UNAMBIGUOUS_ALPHABET[randomInt(UNAMBIGUOUS_ALPHABET.length)]).join('')
}
