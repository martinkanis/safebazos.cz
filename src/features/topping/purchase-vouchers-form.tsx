'use client'

import { CreditCard } from 'lucide-react'
import { useActionState, useState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/form-field'
import { purchaseVouchers } from './actions'
import { INITIAL_PURCHASE_FORM_STATE } from './form-state'
import { MAX_VOUCHERS_PER_ORDER, TOPPING_VOUCHER_PRICE_CZK } from './topping-rules'

const priceFormatter = new Intl.NumberFormat('cs-CZ', {
  style: 'currency',
  currency: 'CZK',
  maximumFractionDigits: 0,
})

export function PurchaseVouchersForm() {
  const [state, formAction, isPending] = useActionState(
    purchaseVouchers,
    INITIAL_PURCHASE_FORM_STATE,
  )
  const [count, setCount] = useState(1)

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label htmlFor="voucher-count" className="block text-sm font-medium">
            Počet poukázek
          </label>
          <Select
            id="voucher-count"
            name="count"
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
            className="w-28"
          >
            {Array.from({ length: MAX_VOUCHERS_PER_ORDER }, (_, index) => index + 1).map(
              (option) => (
                <option key={option} value={option}>
                  {option}×
                </option>
              ),
            )}
          </Select>
        </div>
        <p className="pb-2 text-sm">
          Celkem{' '}
          <strong className="text-base">
            {priceFormatter.format(count * TOPPING_VOUCHER_PRICE_CZK)}
          </strong>{' '}
          <span className="text-muted">vč. DPH</span>
        </p>
      </div>
      {state.status === 'error' && <Alert tone="danger">{state.message}</Alert>}
      <Button type="submit" disabled={isPending}>
        <CreditCard className="size-4" aria-hidden />
        Zaplatit kartou nebo převodem
      </Button>
      <p className="text-xs text-muted">
        Platbu zpracovává Comgate. Poukázky se připíšou hned po zaplacení.
      </p>
    </form>
  )
}
