import { ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export function BrandLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink">
      <span className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-white">
        <ShieldCheck className="size-5" aria-hidden />
      </span>
      <span>
        Safe<span className="text-brand-700">Bazos</span>
      </span>
    </Link>
  )
}
