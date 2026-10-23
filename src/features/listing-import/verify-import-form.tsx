'use client'

import { BadgeCheck } from 'lucide-react'
import { useActionState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { INITIAL_IMPORT_FORM_STATE, type ImportFormState } from './form-state'

interface VerifyImportFormProps {
  action: (state: ImportFormState, formData: FormData) => Promise<ImportFormState>
}

export function VerifyImportForm({ action }: VerifyImportFormProps) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_IMPORT_FORM_STATE)
  return (
    <form action={formAction} className="space-y-3">
      {state.status === 'error' && <Alert tone="danger">{state.message}</Alert>}
      <Button type="submit" disabled={isPending}>
        <BadgeCheck className="size-4" aria-hidden />
        {isPending ? 'Ověřuji a načítám…' : 'Ověřit a načíst inzerát'}
      </Button>
    </form>
  )
}
