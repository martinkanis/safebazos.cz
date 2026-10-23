'use client'

import { Download } from 'lucide-react'
import { useActionState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { FormField, Input } from '@/components/ui/form-field'
import { startBazosImport } from './actions'
import { INITIAL_IMPORT_FORM_STATE } from './form-state'

export function StartImportForm() {
  const [state, formAction, isPending] = useActionState(startBazosImport, INITIAL_IMPORT_FORM_STATE)
  return (
    <form action={formAction} className="space-y-4">
      <FormField label="Odkaz na váš inzerát na Bazoši" htmlFor="import-url">
        <Input
          id="import-url"
          name="url"
          type="url"
          required
          placeholder="https://mobil.bazos.cz/inzerat/123456789/..."
        />
      </FormField>
      {state.status === 'error' && <Alert tone="danger">{state.message}</Alert>}
      <Button type="submit" disabled={isPending}>
        <Download className="size-4" aria-hidden />
        Pokračovat
      </Button>
    </form>
  )
}
