import type { ListingFieldErrors } from './listing-input'

export type ListingFormState =
  { status: 'idle' } | { status: 'error'; message: string; fieldErrors: ListingFieldErrors }

export const INITIAL_LISTING_FORM_STATE: ListingFormState = { status: 'idle' }
