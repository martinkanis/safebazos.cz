import type { RiskLevel, ScamSignal } from '@/db/schema'
import { normalizeText } from '@/lib/text'

export interface ScamAssessment {
  level: RiskLevel
  signals: ScamSignal[]
}

/** Signály, které samy o sobě znamenají téměř jistý podvod → inzerát jde do moderace. */
const HIGH_RISK_SIGNALS: ReadonlySet<ScamSignal> = new Set([
  'phishing_link',
  'card_data_request',
  'untraceable_payment',
])

/**
 * Oficiální domény dopravců a platformy. Podvodníci používají napodobeniny
 * (zasilkovna-cz.online, ppl-doruceni.com) — ty na seznamu nejsou.
 */
const TRUSTED_DOMAINS = [
  'safebazos.cz',
  'zasilkovna.cz',
  'packeta.com',
  'ppl.cz',
  'dpd.com',
  'dpd.cz',
  'gls-czech.com',
  'ceskaposta.cz',
  'postaonline.cz',
  'balikovna.cz',
]

/** Slova, kterými podvodné odkazy lákají na „doručení“ nebo „přijetí platby“. */
const PHISHING_URL_KEYWORDS =
  /pay|platb|doruc|zasilk|packeta|ppl|dpd|gls|balik|posta|bazos|safedeal|overeni|verif|secure|bank|karta|card/

/**
 * Odkaz s doménou na známé TLD. Lookbehind/lookahead vylučují e-mailové adresy
 * (jan@seznam.cz není odkaz) a části delších slov.
 */
const LINK_PATTERN =
  /(?<![\w@.-])(?:https?:\/\/)?((?:[a-z0-9-]+\.)+(?:cz|sk|com|net|org|eu|info|site|online|shop|top|xyz|app|link|live|store|click|icu|me))(?![\w@-])(?:\/\S*)?/gi

const MESSENGER_CONTACT = /\b(?:whats\s?app|telegram|viber|signal|wa\.me|t\.me)\b/
const CARD_DATA_REQUEST =
  /(?:cislo|udaje|data)\s+(?:z\s+|o\s+|vasi\s+|platebni\s+)*karty|\bcvv\b|\bcvc\b|platnost karty|kod z (?:sms|banky)|overovaci kod|3d ?secure/
const FOREIGN_PHONE = /(?:\+|\b00)(?!420|421)\d{2,3}[\s\d]{7,}/
const COURIER_PREPAYMENT =
  /kuryr|prepravni (?:spolecnost|sluzba)|platba predem|zaplatim predem|penize (?:posl\w* )?predem|zaloh[auy]\b/
const UNTRACEABLE_PAYMENT =
  /western union|moneygram|bitcoin|\bbtc\b|kryptomen|\bkrypto\b|paysafecard|darkov[aeou] kart|gift ?card/

function hostnameOf(linkMatch: RegExpExecArray | RegExpMatchArray): string {
  return (linkMatch[1] ?? '').toLowerCase().replace(/^www\./, '')
}

function isTrustedDomain(hostname: string): boolean {
  return TRUSTED_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))
}

function findUntrustedHostnames(text: string): string[] {
  const hostnames = Array.from(text.matchAll(LINK_PATTERN), hostnameOf)
  return hostnames.filter((hostname) => !isTrustedDomain(hostname))
}

function detectLinkSignal(normalizedText: string): ScamSignal | null {
  const untrustedHostnames = findUntrustedHostnames(normalizedText)
  if (untrustedHostnames.length === 0) return null
  const looksLikePhishing = untrustedHostnames.some((hostname) =>
    PHISHING_URL_KEYWORDS.test(hostname),
  )
  return looksLikePhishing ? 'phishing_link' : 'external_link'
}

const PATTERN_SIGNALS: ReadonlyArray<[ScamSignal, RegExp]> = [
  ['messenger_contact', MESSENGER_CONTACT],
  ['card_data_request', CARD_DATA_REQUEST],
  ['foreign_phone', FOREIGN_PHONE],
  ['courier_prepayment', COURIER_PREPAYMENT],
  ['untraceable_payment', UNTRACEABLE_PAYMENT],
]

function riskLevelFor(signals: ScamSignal[]): RiskLevel {
  if (signals.length === 0) return 'none'
  return signals.some((signal) => HIGH_RISK_SIGNALS.has(signal)) ? 'high' : 'warning'
}

/**
 * Heuristicky posoudí text inzerátu nebo zprávy na typické vzorce podvodů
 * z bazarů (falešné platební brány, žádosti o kartu, komunikace mimo platformu).
 */
export function assessScamRisk(text: string): ScamAssessment {
  const normalizedText = normalizeText(text)
  const signals: ScamSignal[] = []

  const linkSignal = detectLinkSignal(normalizedText)
  if (linkSignal) signals.push(linkSignal)

  for (const [signal, pattern] of PATTERN_SIGNALS) {
    if (pattern.test(normalizedText)) signals.push(signal)
  }

  return { level: riskLevelFor(signals), signals }
}

export const MASKED_LINK_PLACEHOLDER = '[odkaz skrytý]'

/**
 * Nahradí odkazy na nedůvěryhodné weby zástupným textem. Falešné „platební“
 * odkazy jsou nejčastější podvod na bazarech — uživatel je tak vůbec neuvidí.
 */
export function maskUntrustedLinks(text: string): string {
  return text.replace(LINK_PATTERN, (link: string, ...groups: unknown[]) => {
    const hostname = typeof groups[0] === 'string' ? groups[0].toLowerCase() : ''
    return isTrustedDomain(hostname.replace(/^www\./, '')) ? link : MASKED_LINK_PLACEHOLDER
  })
}
