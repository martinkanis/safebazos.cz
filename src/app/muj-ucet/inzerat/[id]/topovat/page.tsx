import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Alert } from '@/components/ui/alert'
import { findSubcategoryById } from '@/features/categories/queries'
import { listingPath } from '@/features/listings/paths'
import { getEditableListing } from '@/features/listings/queries'
import { applyVoucher } from '@/features/topping/actions'
import { ApplyVoucherForm } from '@/features/topping/apply-voucher-form'
import { formatDays } from '@/features/topping/format-days'
import { getAvailableVouchers } from '@/features/topping/queries'
import {
  maxToppingsFor,
  shiftDaysForTopping,
  TOPPING_VOUCHER_PRICE_CZK,
} from '@/features/topping/topping-rules'
import { requireUser } from '@/lib/require-user'

export const metadata: Metadata = { title: 'Topovat inzerát' }

export default async function TopListingPage({ params }: { params: Promise<{ id: string }> }) {
  const listingId = Number((await params).id)
  const user = await requireUser(`/muj-ucet/inzerat/${listingId}/topovat`)
  if (!Number.isSafeInteger(listingId)) notFound()

  const [listing, vouchers] = await Promise.all([
    getEditableListing(listingId, user.id),
    getAvailableVouchers(user.id),
  ])
  if (!listing) notFound()
  const category = await findSubcategoryById(listing.categoryId)
  const maxToppings = maxToppingsFor(category?.main.slug ?? '')
  const isActive = listing.status === 'active' && listing.expiresAt > new Date()
  const isAtLimit = listing.topCount >= maxToppings

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="text-xl font-bold">Topovat inzerát</h2>
        <Link href={listingPath(listing)} className="text-brand-700 hover:underline">
          {listing.title}
        </Link>
      </div>
      <p className="text-sm text-muted">
        Topováno {listing.topCount}× z {maxToppings}.{' '}
        {!isAtLimit &&
          `Další topování posune inzerát o ${formatDays(shiftDaysForTopping(listing.topCount + 1))}.`}{' '}
        <Link href="/topovani" className="underline">
          Ceník a pravidla
        </Link>
      </p>
      {!isActive && <Alert tone="warning">Topovat lze jen aktivní, schválený inzerát.</Alert>}
      {isActive && isAtLimit && (
        <Alert tone="info">Inzerát už byl topován maximální počet krát.</Alert>
      )}
      {isActive && !isAtLimit && (
        <>
          <ApplyVoucherForm
            action={applyVoucher.bind(null, listing.id)}
            availableVoucherCount={vouchers.length}
          />
          {vouchers.length === 0 && (
            <p className="text-sm">
              Nemáte poukázku?{' '}
              <Link href="/topovani" className="font-medium text-brand-700 underline">
                Kupte si ji za {TOPPING_VOUCHER_PRICE_CZK} Kč
              </Link>
              .
            </p>
          )}
        </>
      )}
    </div>
  )
}
