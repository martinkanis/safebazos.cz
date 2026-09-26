import { BadgeCheck, CalendarDays, Tag } from 'lucide-react'
import { formatDate } from '@/lib/format-date'
import type { SellerProfile } from './queries'

/** Signály důvěryhodnosti prodejce — stáří účtu a ověření pomáhají odhalit jednorázové účty. */
export function SellerCard({ seller }: { seller: SellerProfile }) {
  return (
    <section aria-label="Prodejce" className="space-y-2 text-sm">
      <p className="text-base font-semibold">{seller.name}</p>
      <ul className="space-y-1 text-muted">
        {seller.isEmailVerified && (
          <li className="flex items-center gap-2 text-brand-700">
            <BadgeCheck className="size-4" aria-hidden />
            Ověřený e-mail
          </li>
        )}
        <li className="flex items-center gap-2">
          <CalendarDays className="size-4" aria-hidden />
          Na SafeBazos od {formatDate(seller.memberSince)}
        </li>
        <li className="flex items-center gap-2">
          <Tag className="size-4" aria-hidden />
          Aktivních inzerátů: {seller.activeListingCount}
        </li>
      </ul>
    </section>
  )
}
