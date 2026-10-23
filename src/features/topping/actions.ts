'use server'

import { and, eq, gt, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { notFound, redirect } from 'next/navigation'
import { z } from 'zod'
import { loadEnv } from '@/config/env'
import { getDb, type Transaction } from '@/db/client'
import { listings, payments, toppingVouchers } from '@/db/schema'
import { findSubcategoryById } from '@/features/categories/queries'
import { fakeTransactionId, setFakePaymentStatus } from '@/features/payments/fake-provider'
import { getPaymentProvider } from '@/features/payments/get-payment-provider'
import { getVerifiedPhone } from '@/features/phone-verification/queries'
import { formString } from '@/lib/form'
import { createLogger } from '@/lib/logger'
import { requireUser } from '@/lib/require-user'
import type { PurchaseFormState, ToppingFormState } from './form-state'
import { settlePayment } from './payment-settlement'
import {
  MAX_VOUCHERS_PER_ORDER,
  maxToppingsFor,
  shiftDaysForTopping,
  sortTimeFor,
  TOPPING_VOUCHER_PRICE_CZK,
} from './topping-rules'
import { normalizeVoucherCode } from './voucher-code'

const logger = createLogger('topping')

const voucherCountSchema = z.coerce
  .number<string>()
  .int()
  .min(1, { error: 'Vyberte počet poukázek.' })
  .max(MAX_VOUCHERS_PER_ORDER, {
    error: `Najednou lze koupit nejvýše ${MAX_VOUCHERS_PER_ORDER} poukázek.`,
  })

/** Nákup poukázek: založí platbu a přesměruje plátce na platební bránu. */
export async function purchaseVouchers(
  _previousState: PurchaseFormState,
  formData: FormData,
): Promise<PurchaseFormState> {
  const user = await requireUser('/topovani')
  if (!(await getVerifiedPhone(user.id))) redirect('/muj-ucet/overeni-telefonu?zpet=/topovani')

  const voucherCount = voucherCountSchema.safeParse(formString(formData, 'count'))
  if (!voucherCount.success) {
    return { status: 'error', message: voucherCount.error.issues[0]?.message ?? 'Neplatný počet.' }
  }
  const amountCzk = voucherCount.data * TOPPING_VOUCHER_PRICE_CZK
  const provider = getPaymentProvider()

  const [payment] = await getDb()
    .insert(payments)
    .values({
      userId: user.id,
      provider: provider.name,
      voucherCount: voucherCount.data,
      amountCzk,
    })
    .returning({ id: payments.id })
  if (!payment) throw new Error(`Platbu uživatele ${user.id} se nepodařilo založit`)

  let redirectUrl: string
  try {
    const created = await provider.createPayment({
      paymentId: payment.id,
      amountCzk,
      label: `Topovani ${voucherCount.data}x`,
      email: user.email,
      fullName: user.name,
      returnUrl: `${loadEnv().APP_URL}/topovani/platba?platba=${payment.id}`,
    })
    await getDb()
      .update(payments)
      .set({ providerTransactionId: created.transactionId })
      .where(eq(payments.id, payment.id))
    redirectUrl = created.redirectUrl
  } catch (error) {
    logger.error({ err: error, paymentId: payment.id }, 'Založení platby u brány selhalo')
    await getDb().update(payments).set({ status: 'cancelled' }).where(eq(payments.id, payment.id))
    return {
      status: 'error',
      message: 'Platební bránu se nepodařilo otevřít. Zkuste to prosím za chvíli.',
    }
  }
  redirect(redirectUrl)
}

/** Spotřebuje poukázku: zadaný kód, jinak uživatelovu nejdřív expirující. Vrací ID, nebo null. */
async function consumeVoucher(
  tx: Transaction,
  input: { userId: string; listingId: number; code: string | null },
): Promise<number | null> {
  const usage = {
    status: 'used' as const,
    usedOnListingId: input.listingId,
    usedByUserId: input.userId,
    usedAt: new Date(),
  }
  const isUsable = and(
    eq(toppingVouchers.status, 'available'),
    gt(toppingVouchers.expiresAt, sql`now()`),
  )
  const ownOldestVoucher = sql`(
    select voucher.id from topping_vouchers as voucher
    where voucher.owner_user_id = ${input.userId}
      and voucher.status = 'available' and voucher.expires_at > now()
    order by voucher.expires_at limit 1
    for update skip locked
  )`
  const [voucher] = await tx
    .update(toppingVouchers)
    .set(usage)
    .where(
      and(
        isUsable,
        input.code
          ? eq(toppingVouchers.code, input.code)
          : eq(toppingVouchers.id, ownOldestVoucher),
      ),
    )
    .returning({ id: toppingVouchers.id })
  return voucher?.id ?? null
}

/** Topování inzerátu poukázkou (pravidla posunu viz topping-rules). */
export async function applyVoucher(
  listingId: number,
  _previousState: ToppingFormState,
  formData: FormData,
): Promise<ToppingFormState> {
  const user = await requireUser(`/muj-ucet/inzerat/${listingId}/topovat`)
  const rawCode = formString(formData, 'code').trim()
  const code = rawCode ? normalizeVoucherCode(rawCode) : null

  const result = await getDb().transaction(async (tx): Promise<ToppingFormState> => {
    const [listing] = await tx
      .select({
        categoryId: listings.categoryId,
        topCount: listings.topCount,
        publishedAt: listings.publishedAt,
      })
      .from(listings)
      .where(
        and(
          eq(listings.id, listingId),
          eq(listings.ownerUserId, user.id),
          eq(listings.status, 'active'),
          gt(listings.expiresAt, sql`now()`),
        ),
      )
      .for('update')
    if (!listing) return { status: 'error', message: 'Topovat lze jen vlastní aktivní inzerát.' }

    const category = await findSubcategoryById(listing.categoryId)
    const maxToppings = maxToppingsFor(category?.main.slug ?? '')
    if (listing.topCount >= maxToppings) {
      return { status: 'error', message: `Inzerát už byl topován maximálně (${maxToppings}×).` }
    }

    const voucherId = await consumeVoucher(tx, { userId: user.id, listingId, code })
    if (!voucherId) {
      return {
        status: 'error',
        message: code
          ? 'Kód poukázky je neplatný, už použitý nebo prošlý.'
          : 'Nemáte žádnou platnou poukázku. Kupte si ji nebo zadejte kód.',
      }
    }

    const topCount = listing.topCount + 1
    await tx
      .update(listings)
      .set({ topCount, sortAt: sortTimeFor(listing.publishedAt, topCount) })
      .where(eq(listings.id, listingId))
    return { status: 'topped', topCount, shiftDays: shiftDaysForTopping(topCount) }
  })

  if (result.status === 'topped') {
    logger.info({ listingId, userId: user.id, topCount: result.topCount }, 'Inzerát topován')
    revalidatePath('/muj-ucet')
  }
  return result
}

/** Výsledek testovací platby (jen PAYMENT_PROVIDER=fake) — nahrazuje notifikaci z brány. */
export async function completeFakePayment(paymentId: number, outcome: 'paid' | 'cancelled') {
  if (loadEnv().PAYMENT_PROVIDER !== 'fake') notFound()
  const user = await requireUser('/topovani')
  const [payment] = await getDb()
    .select({ id: payments.id })
    .from(payments)
    .where(and(eq(payments.id, paymentId), eq(payments.userId, user.id)))
  if (!payment) notFound()

  const transactionId = fakeTransactionId(paymentId)
  setFakePaymentStatus(transactionId, outcome)
  await settlePayment(transactionId)
  redirect(`/topovani/platba?platba=${paymentId}`)
}
