import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TopBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded bg-amber-400 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-950',
        className,
      )}
    >
      <ArrowUp className="size-3" aria-hidden />
      Top
    </span>
  )
}
