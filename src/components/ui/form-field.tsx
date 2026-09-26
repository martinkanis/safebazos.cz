import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

const CONTROL_CLASSES =
  'w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted/70 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20 aria-invalid:border-danger-600'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(CONTROL_CLASSES, 'h-10', className)} {...props} />
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(CONTROL_CLASSES, 'py-2', className)} {...props} />
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return <select className={cn(CONTROL_CLASSES, 'h-10', className)} {...props} />
}

interface FormFieldProps {
  label: string
  htmlFor: string
  error?: string
  hint?: ReactNode
  children: ReactNode
}

/** Popisek + ovládací prvek + nápověda/chyba. Chybu propojuje přes id `${htmlFor}-error`. */
export function FormField({ label, htmlFor, error, hint, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-sm text-danger-600">
          {error}
        </p>
      ) : (
        hint && <p className="text-sm text-muted">{hint}</p>
      )}
    </div>
  )
}
