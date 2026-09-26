'use client'

import { Flag } from 'lucide-react'
import { useActionState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { FormField, Select, Textarea } from '@/components/ui/form-field'
import { INITIAL_REPORT_FORM_STATE, type ReportFormState } from './form-state'
import { REPORT_REASON_LABELS } from './report-reasons'

interface ReportListingFormProps {
  action: (state: ReportFormState, formData: FormData) => Promise<ReportFormState>
}

export function ReportListingForm({ action }: ReportListingFormProps) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_REPORT_FORM_STATE)

  if (state.status === 'reported') {
    return <Alert tone="success">Děkujeme, hlášení prověří moderátor.</Alert>
  }

  return (
    <details className="group rounded-xl border border-line bg-surface p-4">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-muted hover:text-danger-600">
        <Flag className="size-4" aria-hidden />
        Nahlásit inzerát
      </summary>
      <form action={formAction} className="mt-4 space-y-3">
        <FormField label="Důvod" htmlFor="report-reason">
          <Select id="report-reason" name="reason" required defaultValue="">
            <option value="" disabled>
              Vyberte důvod
            </option>
            {Object.entries(REPORT_REASON_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Poznámka (nepovinné)" htmlFor="report-note">
          <Textarea id="report-note" name="note" rows={3} maxLength={1000} />
        </FormField>
        {state.status === 'error' && <Alert tone="danger">{state.message}</Alert>}
        <Button type="submit" variant="danger" size="sm" disabled={isPending}>
          Odeslat hlášení
        </Button>
      </form>
    </details>
  )
}
