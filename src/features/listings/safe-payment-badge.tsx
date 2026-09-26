import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SafePaymentBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-800 ring-1 ring-brand-200',
        className,
      )}
    >
      <ShieldCheck className="size-3.5" aria-hidden />
      Bezpečná platba
    </span>
  )
}
