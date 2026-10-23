export type ToppingFormState =
  | { status: 'idle' }
  | { status: 'topped'; topCount: number; shiftDays: number }
  | { status: 'error'; message: string }

export const INITIAL_TOPPING_FORM_STATE: ToppingFormState = { status: 'idle' }

export type PurchaseFormState = { status: 'idle' } | { status: 'error'; message: string }

export const INITIAL_PURCHASE_FORM_STATE: PurchaseFormState = { status: 'idle' }
