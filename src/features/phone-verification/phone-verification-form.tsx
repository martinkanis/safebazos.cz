'use client'

import { MessageSquareText } from 'lucide-react'
import { useActionState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { FormField, Input } from '@/components/ui/form-field'
import { confirmPhoneCode, requestPhoneCode } from './actions'
import { INITIAL_PHONE_VERIFICATION_STATE } from './form-state'
import { formatPhoneNumber } from './phone-number'

/** Dva kroky: číslo → SMS kód. Po úspěšném ověření server přesměruje na `returnTo`. */
export function PhoneVerificationForm({ returnTo }: { returnTo: string }) {
  const [requestState, requestAction, isRequesting] = useActionState(
    requestPhoneCode,
    INITIAL_PHONE_VERIFICATION_STATE,
  )
  const [confirmState, confirmAction, isConfirming] = useActionState(
    confirmPhoneCode,
    INITIAL_PHONE_VERIFICATION_STATE,
  )
  const sentToPhone = requestState.status === 'code_sent' ? requestState.phone : null

  if (!sentToPhone) {
    return (
      <form action={requestAction} className="space-y-4">
        <FormField
          label="Mobilní telefon"
          htmlFor="phone"
          hint="Pošleme vám SMS s kódem. Číslo nikde nezveřejníme."
        >
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            placeholder="777 123 456"
          />
        </FormField>
        {requestState.status === 'error' && <Alert tone="danger">{requestState.message}</Alert>}
        <Button type="submit" disabled={isRequesting}>
          <MessageSquareText className="size-4" aria-hidden />
          Poslat ověřovací kód
        </Button>
      </form>
    )
  }

  return (
    <form action={confirmAction} className="space-y-4">
      <input type="hidden" name="phone" value={sentToPhone} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <Alert tone="info">Kód jsme poslali na {formatPhoneNumber(sentToPhone)}.</Alert>
      <FormField label="Kód z SMS" htmlFor="code">
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          required
        />
      </FormField>
      {confirmState.status === 'error' && <Alert tone="danger">{confirmState.message}</Alert>}
      <Button type="submit" disabled={isConfirming}>
        Ověřit telefon
      </Button>
    </form>
  )
}
