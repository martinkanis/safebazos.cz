import { randomUnambiguousCode } from '@/lib/random-code'
import { normalizeText } from '@/lib/text'

const CODE_PREFIX = 'SAFEBAZOS-'
const CODE_LENGTH = 4

/** Kód, který prodejce vloží do popisu původního inzerátu: „SAFEBAZOS-7KQM“. */
export function generateImportVerificationCode(): string {
  return `${CODE_PREFIX}${randomUnambiguousCode(CODE_LENGTH)}`
}

function codePattern(code: string): RegExp {
  const escaped = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace('-', '[\\s-]?')
  return new RegExp(escaped, 'gi')
}

export function containsVerificationCode(text: string, code: string): boolean {
  return codePattern(code).test(text)
}

/** Po kódu zbyde v řádku nanejvýš popisek — takový řádek smažeme celý. */
const LEFTOVER_LABEL = /^(?:overovaci\s+)?(?:kod)?\s*[:\-–]?\s*$/

/** Odstraní ověřovací kód z popisu, aby se nepřenesl do nového inzerátu. */
export function removeVerificationCode(text: string, code: string): string {
  return text
    .split('\n')
    .flatMap((line) => {
      if (!containsVerificationCode(line, code)) return [line]
      const remainder = line.replace(codePattern(code), '').trim()
      return LEFTOVER_LABEL.test(normalizeText(remainder)) ? [] : [remainder]
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
