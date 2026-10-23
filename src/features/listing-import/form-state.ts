export type ImportFormState = { status: 'idle' } | { status: 'error'; message: string }

export const INITIAL_IMPORT_FORM_STATE: ImportFormState = { status: 'idle' }
