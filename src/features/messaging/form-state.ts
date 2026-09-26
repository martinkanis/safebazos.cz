export type MessageFormState =
  { status: 'idle' } | { status: 'sent' } | { status: 'error'; message: string }

export const INITIAL_MESSAGE_FORM_STATE: MessageFormState = { status: 'idle' }
