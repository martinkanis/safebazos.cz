'use client'

import { Send } from 'lucide-react'
import { useActionState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/form-field'
import { INITIAL_MESSAGE_FORM_STATE, type MessageFormState } from './form-state'
import { MESSAGE_MAX_LENGTH } from './message-input'

interface ReplyFormProps {
  action: (state: MessageFormState, formData: FormData) => Promise<MessageFormState>
}

/** <form action> záměrně — React po odeslání pole vyprázdní, jak se u chatu čeká. */
export function ReplyForm({ action }: ReplyFormProps) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_MESSAGE_FORM_STATE)
  return (
    <form action={formAction} className="space-y-2">
      <label htmlFor="reply-body" className="sr-only">
        Odpověď
      </label>
      <Textarea
        id="reply-body"
        name="body"
        rows={3}
        required
        maxLength={MESSAGE_MAX_LENGTH}
        placeholder="Napište odpověď…"
      />
      {state.status === 'error' && <Alert tone="danger">{state.message}</Alert>}
      <Button type="submit" disabled={isPending}>
        <Send className="size-4" aria-hidden />
        Odeslat
      </Button>
    </form>
  )
}
