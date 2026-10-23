import { and, asc, eq, gt, sql } from 'drizzle-orm'
import { getDb } from '@/db/client'
import { payments, toppingVouchers, type PaymentStatus } from '@/db/schema'

export interface WalletVoucher {
  code: string
  expiresAt: Date
}

/** Platné nepoužité poukázky uživatele, nejdřív ty, které dřív vyprší. */
export function getAvailableVouchers(userId: string): Promise<WalletVoucher[]> {
  return getDb()
    .select({ code: toppingVouchers.code, expiresAt: toppingVouchers.expiresAt })
    .from(toppingVouchers)
    .where(
      and(
        eq(toppingVouchers.ownerUserId, userId),
        eq(toppingVouchers.status, 'available'),
        gt(toppingVouchers.expiresAt, sql`now()`),
      ),
    )
    .orderBy(asc(toppingVouchers.expiresAt))
}

export interface UserPayment {
  id: number
  status: PaymentStatus
  voucherCount: number
  amountCzk: number
  providerTransactionId: string | null
}

export async function getUserPayment(
  paymentId: number,
  userId: string,
): Promise<UserPayment | null> {
  const [row] = await getDb()
    .select({
      id: payments.id,
      status: payments.status,
      voucherCount: payments.voucherCount,
      amountCzk: payments.amountCzk,
      providerTransactionId: payments.providerTransactionId,
    })
    .from(payments)
    .where(and(eq(payments.id, paymentId), eq(payments.userId, userId)))
    .limit(1)
  return row ?? null
}
