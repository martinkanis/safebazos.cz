import { and, eq } from 'drizzle-orm'
import { getDb } from '@/db/client'
import { payments, toppingVouchers } from '@/db/schema'
import { getPaymentProvider } from '@/features/payments/get-payment-provider'
import { createLogger } from '@/lib/logger'
import { voucherExpiryFrom } from './topping-rules'
import { generateVoucherCode } from './voucher-code'

const logger = createLogger('topping-payments')

/**
 * Zpracuje výsledek platby podle stavu přímo od poskytovatele. Idempotentní:
 * notifikace i návrat plátce můžou přijít víckrát, poukázky vzniknou jen jednou
 * (přechod pending → paid proběhne jen jednou díky podmínce ve WHERE).
 */
export async function settlePayment(transactionId: string): Promise<void> {
  const db = getDb()
  const [payment] = await db
    .select({
      id: payments.id,
      userId: payments.userId,
      amountCzk: payments.amountCzk,
      voucherCount: payments.voucherCount,
      status: payments.status,
    })
    .from(payments)
    .where(eq(payments.providerTransactionId, transactionId))
    .limit(1)
  if (!payment) {
    logger.warn({ transactionId }, 'Platba k transakci nenalezena')
    return
  }
  if (payment.status !== 'pending') return

  const remote = await getPaymentProvider().getPaymentState(transactionId)
  const matchesOrder = remote.paymentId === payment.id && remote.amountCzk === payment.amountCzk
  if (!matchesOrder) {
    logger.error({ transactionId, paymentId: payment.id, remote }, 'Platba neodpovídá objednávce')
    return
  }

  if (remote.status === 'cancelled') {
    await db
      .update(payments)
      .set({ status: 'cancelled' })
      .where(and(eq(payments.id, payment.id), eq(payments.status, 'pending')))
    return
  }
  if (remote.status !== 'paid') return

  const paidAt = new Date()
  await db.transaction(async (tx) => {
    const [settled] = await tx
      .update(payments)
      .set({ status: 'paid', paidAt })
      .where(and(eq(payments.id, payment.id), eq(payments.status, 'pending')))
      .returning({ id: payments.id })
    if (!settled) return
    await tx.insert(toppingVouchers).values(
      Array.from({ length: payment.voucherCount }, () => ({
        code: generateVoucherCode(),
        ownerUserId: payment.userId,
        paymentId: payment.id,
        expiresAt: voucherExpiryFrom(paidAt),
      })),
    )
  })
  logger.info(
    { paymentId: payment.id, vouchers: payment.voucherCount },
    'Platba připsána, poukázky vydány',
  )
}
