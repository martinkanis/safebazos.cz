import Link from 'next/link'

const FOOTER_LINKS = [
  { href: '/bezpecnost', label: 'Jak nakupovat bezpečně' },
  { href: '/bezpecna-platba', label: 'Bezpečná platba' },
  { href: '/pridat-inzerat', label: 'Přidat inzerát' },
]

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} SafeBazos — bezpečný bazar zdarma.</p>
        <nav aria-label="Patička">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-brand-700 hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
