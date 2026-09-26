import { MIN_PASSWORD_LENGTH } from '@/lib/password-policy'

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: 'Nesprávný e-mail nebo heslo.',
  EMAIL_NOT_VERIFIED: 'E-mail zatím není ověřený. Klikněte na odkaz, který jsme vám poslali.',
  USER_ALREADY_EXISTS: 'Účet s tímto e-mailem už existuje. Zkuste se přihlásit.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'Účet s tímto e-mailem už existuje. Zkuste se přihlásit.',
  PASSWORD_TOO_SHORT: `Heslo je příliš krátké — použijte alespoň ${MIN_PASSWORD_LENGTH} znaků.`,
  PASSWORD_TOO_LONG: 'Heslo je příliš dlouhé.',
  INVALID_EMAIL: 'Zadejte platný e-mail.',
  INVALID_TOKEN: 'Odkaz vypršel nebo je neplatný. Požádejte o nový.',
  BANNED_USER: 'Účet byl zablokován pro porušení pravidel.',
}

const FALLBACK_MESSAGE = 'Něco se nepovedlo. Zkuste to prosím znovu.'

/** Česká hláška pro chybu z better-auth (podle kódu, ne anglického textu). */
export function authErrorMessage(error: { code?: string } | null | undefined): string {
  return (error?.code && AUTH_ERROR_MESSAGES[error.code]) || FALLBACK_MESSAGE
}
