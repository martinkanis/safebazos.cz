import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type AlertTone = 'info' | 'success' | 'warning' | 'danger'

const TONE_STYLES: Record<AlertTone, { classes: string; icon: typeof Info }> = {
  info: { classes: 'border-line bg-surface text-ink', icon: Info },
  success: { classes: 'border-brand-200 bg-brand-50 text-brand-900', icon: CircleCheck },
  warning: { classes: 'border-warning-200 bg-warning-50 text-warning-800', icon: TriangleAlert },
  danger: { classes: 'border-danger-200 bg-danger-50 text-danger-800', icon: CircleAlert },
}

interface AlertProps {
  tone: AlertTone
  title?: string
  children: ReactNode
  className?: string
}

export function Alert({ tone, title, children, className }: AlertProps) {
  const { classes, icon: Icon } = TONE_STYLES[tone]
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-xl border p-4 text-sm', classes, className)}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        <div className="space-y-1">{children}</div>
      </div>
    </div>
  )
}
