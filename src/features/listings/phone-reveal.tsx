'use client'

import { Phone } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { revealListingPhone } from './actions'

type RevealState =
  { status: 'hidden' } | { status: 'shown'; phone: string } | { status: 'unavailable' }

export function PhoneReveal({ listingId }: { listingId: number }) {
  const [state, setState] = useState<RevealState>({ status: 'hidden' })
  const [isPending, startTransition] = useTransition()

  function handleReveal() {
    startTransition(async () => {
      const phone = await revealListingPhone(listingId)
      setState(phone ? { status: 'shown', phone } : { status: 'unavailable' })
    })
  }

  if (state.status === 'shown') {
    return (
      <a
        href={`tel:${state.phone}`}
        className="flex h-10 items-center justify-center gap-2 rounded-lg border border-line text-sm font-semibold hover:bg-canvas"
      >
        <Phone className="size-4" aria-hidden />
        {state.phone}
      </a>
    )
  }
  if (state.status === 'unavailable') {
    return <p className="text-sm text-muted">Telefon už není k dispozici.</p>
  }
  return (
    <Button variant="secondary" className="w-full" onClick={handleReveal} disabled={isPending}>
      <Phone className="size-4" aria-hidden />
      Zobrazit telefon
    </Button>
  )
}
