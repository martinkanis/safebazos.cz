import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AccountNav } from '@/features/account/account-nav'
import { requireUser } from '@/lib/require-user'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await requireUser('/muj-ucet')
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted">Přihlášen(a) jako {user.email}</p>
        <h1 className="text-2xl font-bold">Můj účet</h1>
      </div>
      <AccountNav />
      {children}
    </div>
  )
}
