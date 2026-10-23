import { Ticket } from 'lucide-react'
import type { Metadata } from 'next'
import { ButtonLink } from '@/components/ui/button'
import { getVerifiedPhone } from '@/features/phone-verification/queries'
import { formatDate } from '@/lib/format-date'
import { getSessionUser } from '@/lib/session'
import { PurchaseVouchersForm } from '@/features/topping/purchase-vouchers-form'
import { getAvailableVouchers } from '@/features/topping/queries'
import { ShiftTable } from '@/features/topping/shift-table'
import { TopBadge } from '@/features/topping/top-badge'
import {
  TOPPING_VOUCHER_PRICE_CZK,
  TOPPING_VOUCHER_VALIDITY_MONTHS,
} from '@/features/topping/topping-rules'

export const metadata: Metadata = {
  title: 'Topování inzerátů — ceník',
  description: `Topování inzerátu za ${TOPPING_VOUCHER_PRICE_CZK} Kč. Posuňte inzerát mezi první ve výpisu.`,
  alternates: { canonical: '/topovani' },
}

async function VoucherWallet({ userId }: { userId: string }) {
  const [vouchers, verifiedPhone] = await Promise.all([
    getAvailableVouchers(userId),
    getVerifiedPhone(userId),
  ])
  return (
    <section className="space-y-4 rounded-xl border border-line bg-surface p-5">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Ticket className="size-5 text-brand-600" aria-hidden />
        Moje poukázky ({vouchers.length})
      </h2>
      {vouchers.length > 0 && (
        <ul className="divide-y divide-line rounded-lg border border-line text-sm">
          {vouchers.map((voucher) => (
            <li key={voucher.code} className="flex justify-between px-3 py-2">
              <code className="font-mono font-semibold">{voucher.code}</code>
              <span className="text-muted">platí do {formatDate(voucher.expiresAt)}</span>
            </li>
          ))}
        </ul>
      )}
      {verifiedPhone ? (
        <PurchaseVouchersForm />
      ) : (
        <div className="space-y-2 text-sm">
          <p>Před nákupem poukázky je nutné ověřit mobilní telefon.</p>
          <ButtonLink href="/muj-ucet/overeni-telefonu?zpet=/topovani">Ověřit telefon</ButtonLink>
        </div>
      )}
    </section>
  )
}

export default async function ToppingPage() {
  const user = await getSessionUser()
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          Topování inzerátu <TopBadge />
        </h1>
        <p className="text-muted">
          Topování posune čas vložení inzerátu dopředu, takže se ve výpisu zobrazuje mezi prvními.
          Dobu zobrazení inzerátu neprodlužuje a úpravou inzerátu o topování nepřijdete.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 sm:col-span-1">
          <p className="text-sm text-brand-900">Cena poukázky</p>
          <p className="text-3xl font-bold text-brand-900">{TOPPING_VOUCHER_PRICE_CZK} Kč</p>
          <p className="text-xs text-brand-800">
            vč. DPH · 1 poukázka = 1 topování · platí {TOPPING_VOUCHER_VALIDITY_MONTHS} měsíců
          </p>
        </div>
        <ol className="list-decimal space-y-1 rounded-xl border border-line bg-surface p-5 pl-9 text-sm sm:col-span-2">
          <li>Ověřte mobilní telefon SMS kódem.</li>
          <li>Kupte poukázku kartou nebo bankovním převodem.</li>
          <li>V sekci Můj účet u inzerátu klikněte na Topovat.</li>
          <li>Kód poukázky můžete darovat — uplatnit ho může kdokoli.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">O kolik se inzerát posune</h2>
        <ShiftTable />
      </section>

      {user ? (
        <VoucherWallet userId={user.id} />
      ) : (
        <ButtonLink href="/prihlaseni?zpet=/topovani">Přihlásit se a koupit poukázku</ButtonLink>
      )}
    </article>
  )
}
