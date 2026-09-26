/**
 * Strukturovaná data pro vyhledávače. `<` escapujeme, aby text z inzerátu
 * nemohl ukončit <script> a vložit vlastní HTML (XSS).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
