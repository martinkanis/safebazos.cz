'use client'

import { ArrowUp } from 'lucide-react'
import { useActionState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { FormField, Input } from '@/components/ui/form-field'
import { formatDays } from './format-days'
import { INITIAL_TOPPING_FORM_STATE, type ToppingFormState } from './form-state'

interface ApplyVoucherFormProps {
  action: (state: ToppingFormState, formData: FormData) => Promise<ToppingFormState>
  availableVoucherCount: number
}

export function ApplyVoucherForm({ action, availableVoucherCount }: ApplyVoucherFormProps) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_TOPPING_FORM_STATE)
  return (
    <div className="space-y-4">
      {state.status === 'topped' && (
        <Alert tone="success" title="Inzerát je topovaný">
          Posunuli jsme ho o {formatDays(state.shiftDays)} dopředu ({state.topCount}. topování).
        </Alert>
      )}
      {state.status === 'error' && <Alert tone="danger">{state.message}</Alert>}

      {availableVoucherCount > 0 && (
        <form action={formAction}>
          <Button type="submit" disabled={isPending}>
            <ArrowUp className="size-4" aria-hidden />
            Topovat mojí poukázkou (máte {availableVoucherCount})
          </Button>
        </form>
      )}

      <form action={formAction} className="flex flex-wrap items-end gap-2">
        <div className="min-w-56 flex-1">
          <FormField label="Nebo zadejte kód poukázky" htmlFor="voucher-code">
            <Input
              id="voucher-code"
              name="code"
              required
              placeholder="SB-XXXX-XXXX"
              autoComplete="off"
            />
          </FormField>
        </div>
        <Button type="submit" variant="secondary" disabled={isPending}>
          Použít kód
        </Button>
      </form>
    </div>
  )
}
