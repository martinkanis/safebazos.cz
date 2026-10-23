import { BadgeCheck } from 'lucide-react'
import type { Metadata } from 'next'
import { safeReturnPath } from '@/features/auth/return-path'
import { formatPhoneNumber } from '@/features/phone-verification/phone-number'
import { PhoneVerificationForm } from '@/features/phone-verification/phone-verification-form'
import { getVerifiedPhone } from '@/features/phone-verification/queries'
import { requireUser } from '@/lib/require-user'

export const metadata: Metadata = { title: 'Ověření telefonu' }

export default async function PhoneVerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ zpet?: string }>
}) {
  const user = await requireUser('/muj-ucet/overeni-telefonu')
  const returnTo = safeReturnPath((await searchParams).zpet)
  const verifiedPhone = await getVerifiedPhone(user.id)

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-line bg-surface p-6">
      <h2 className="text-xl font-bold">Ověření telefonu</h2>
      {verifiedPhone && (
        <p className="flex items-center gap-2 text-sm text-brand-700">
          <BadgeCheck className="size-4" aria-hidden />
          Ověřené číslo: {formatPhoneNumber(verifiedPhone.phone)}. Můžete ho změnit níže.
        </p>
      )}
      <p className="text-sm text-muted">
        Ověřený telefon je podmínkou nákupu poukázek na topování — chrání před zneužitím platebních
        karet.
      </p>
      <PhoneVerificationForm returnTo={returnTo} />
    </div>
  )
}
