import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { loadEnv } from '@/config/env'
import { JsonLd } from '@/components/ui/json-ld'

export interface BreadcrumbItem {
  name: string
  href: string
}

/** Drobečková navigace včetně BreadcrumbList pro rich results. */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const appUrl = loadEnv().APP_URL
  const trail = [{ name: 'SafeBazos', href: '/' }, ...items]
  return (
    <nav aria-label="Drobečková navigace" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {trail.map((item, index) => (
          <li key={item.href} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="size-3.5" aria-hidden />}
            {index === trail.length - 1 ? (
              <span aria-current="page" className="text-ink">
                {item.name}
              </span>
            ) : (
              <Link href={item.href} className="hover:text-brand-700 hover:underline">
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: trail.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${appUrl}${item.href}`,
          })),
        }}
      />
    </nav>
  )
}
