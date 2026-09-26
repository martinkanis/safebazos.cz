'use client'

import { Send } from 'lucide-react'
import { useActionState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/form-field'
import { INITIAL_MESSAGE_FORM_STATE, type MessageFormState } from './form-state'
import { MESSAGE_MAX_LENGTH } from './message-input'

interface ContactSellerFormProps {
  action: (state: MessageFormState, formData: FormData) => Promise<MessageFormState>
}

export function ContactSellerForm({ action }: ContactSellerFormProps) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_MESSAGE_FORM_STATE)
  return (
    <form action={formAction} className="space-y-2">
      <label htmlFor="contact-message" className="sr-only">
        Zpráva prodejci
      </label>
      <Textarea
        id="contact-message"
        name="body"
        rows={4}
        required
        maxLength={MESSAGE_MAX_LENGTH}
        placeholder="Dobrý den, je inzerát stále aktuální?"
      />
      {state.status === 'error' && <Alert tone="danger">{state.message}</Alert>}
      <Button type="submit" className="w-full" disabled={isPending}>
        <Send className="size-4" aria-hidden />
        Napsat prodejci
      </Button>
    </form>
  )
}
