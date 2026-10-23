export type PhoneVerificationState =
  | { status: 'idle' }
  | { status: 'code_sent'; phone: string }
  | { status: 'error'; message: string; phone?: string }

export const INITIAL_PHONE_VERIFICATION_STATE: PhoneVerificationState = { status: 'idle' }
