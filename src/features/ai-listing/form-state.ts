import type { ListingSuggestion } from './normalize-suggestion'

export type AiSuggestionState =
  | { status: 'idle' }
  | { status: 'succeeded'; suggestion: ListingSuggestion }
  | { status: 'error'; message: string }
