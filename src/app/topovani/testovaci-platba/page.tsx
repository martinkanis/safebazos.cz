import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { loadEnv } from '@/config/env'
import { completeFakePayment } from '@/features/topping/actions'
import { getUserPayment } from '@/features/topping/queries'
import { requireUser } from '@/lib/require-user'

export const metadata: Metadata = { title: 'Testovací platba', robots: { index: false } }

/** Náhrada platební brány pro lokální vývoj (PAYMENT_PROVIDER=fake). */
export default async function FakePaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ platba?: string }>
}) {
  if (loadEnv().PAYMENT_PROVIDER !== 'fake') notFound()
  const paymentId = Number((await searchParams).platba)
  const user = await requireUser()
  const payment = Number.isSafeInteger(paymentId) ? await getUserPayment(paymentId, user.id) : null
  if (!payment) notFound()

  return (
    <div className="mx-auto max-w-md space-y-4">
      <Alert tone="warning" title="Testovací platební brána">
        Žádné peníze se nestrhnou. V produkci tuto stránku nahrazuje Comgate.
      </Alert>
      <p>
        Platba č. {payment.id}: {payment.voucherCount}× poukázka, {payment.amountCzk} Kč
      </p>
      <div className="flex gap-2">
        <form action={completeFakePayment.bind(null, payment.id, 'paid')}>
          <Button type="submit">Zaplatit (test)</Button>
        </form>
        <form action={completeFakePayment.bind(null, payment.id, 'cancelled')}>
          <Button type="submit" variant="secondary">
            Zrušit platbu
          </Button>
        </form>
      </div>
    </div>
  )
}
