import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Alert } from '@/components/ui/alert'
import { ButtonLink } from '@/components/ui/button'
import { settlePayment } from '@/features/topping/payment-settlement'
import { getUserPayment } from '@/features/topping/queries'
import { createLogger } from '@/lib/logger'
import { requireUser } from '@/lib/require-user'

export const metadata: Metadata = { title: 'Výsledek platby', robots: { index: false } }

const logger = createLogger('topping-payments')

/**
 * Návrat z platební brány. Výsledku z URL nevěříme — stav ověříme u brány
 * (to zároveň pojistí případ, kdy notifikace z brány nedorazila).
 */
export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ platba?: string }>
}) {
  const paymentId = Number((await searchParams).platba)
  const user = await requireUser(`/topovani/platba?platba=${paymentId}`)
  if (!Number.isSafeInteger(paymentId)) notFound()

  const pending = await getUserPayment(paymentId, user.id)
  if (!pending) notFound()
  if (pending.status === 'pending' && pending.providerTransactionId) {
    try {
      await settlePayment(pending.providerTransactionId)
    } catch (error) {
      logger.warn({ err: error, paymentId }, 'Ověření stavu platby při návratu selhalo')
    }
  }
  const payment = (await getUserPayment(paymentId, user.id)) ?? pending

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Platba za poukázky</h1>
      {payment.status === 'paid' && (
        <Alert tone="success" title="Zaplaceno">
          Připsali jsme vám {payment.voucherCount}× poukázku na topování.
        </Alert>
      )}
      {payment.status === 'pending' && (
        <Alert tone="info" title="Čekáme na potvrzení platby">
          Převod může trvat i několik minut. Poukázky se připíšou automaticky, stránku můžete
          obnovit.
        </Alert>
      )}
      {payment.status === 'cancelled' && (
        <Alert tone="warning" title="Platba neproběhla">
          Nic jsme vám nestrhli. Nákup můžete zkusit znovu.
        </Alert>
      )}
      <div className="flex gap-2">
        <ButtonLink href="/muj-ucet">Topovat inzerát</ButtonLink>
        <ButtonLink href="/topovani" variant="secondary">
          Moje poukázky
        </ButtonLink>
      </div>
    </div>
  )
}
