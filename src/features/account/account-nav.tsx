'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const ACCOUNT_LINKS = [
  { href: '/muj-ucet', label: 'Moje inzeráty' },
  { href: '/muj-ucet/zpravy', label: 'Zprávy' },
]

function isActiveLink(href: string, pathname: string): boolean {
  return href === '/muj-ucet' ? pathname === href : pathname.startsWith(href)
}

export function AccountNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Můj účet" className="flex gap-1 border-b border-line">
      {ACCOUNT_LINKS.map((link) => {
        const isActive = isActiveLink(link.href, pathname)
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium',
              isActive
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-muted hover:text-ink',
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
