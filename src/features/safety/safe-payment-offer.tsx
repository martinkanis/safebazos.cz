import { ShieldCheck } from 'lucide-react'
import Link from 'next/link'

/**
 * Nabídka platby přes úschovu. Platební integrace (SafeDeal) zatím není
 * napojená — box vysvětluje princip a odkazuje na informační stránku.
 */
export function SafePaymentOffer() {
  return (
    <aside className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
      <p className="flex items-center gap-2 font-semibold">
        <ShieldCheck className="size-5" aria-hidden />
        Prodejce nabízí bezpečnou platbu
      </p>
      <p className="mt-2">
        Zaplatíte do úschovy a prodejce dostane peníze až poté, co zboží převezmete a zkontrolujete.
        Když zboží nedorazí nebo neodpovídá popisu, peníze se vám vrátí.
      </p>
      <Link
        href="/bezpecna-platba"
        className="mt-2 inline-block font-medium underline underline-offset-2"
      >
        Jak bezpečná platba funguje
      </Link>
    </aside>
  )
}
