const DEFAULT_RETURN_PATH = '/muj-ucet'

/**
 * Cesta pro návrat po přihlášení. Jen relativní cesty v rámci webu —
 * „//evil.cz“ nebo „https://…“ by byl open redirect (phishing přes náš login).
 */
export function safeReturnPath(value: string | null | undefined): string {
  if (!value?.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return DEFAULT_RETURN_PATH
  }
  return value
}
