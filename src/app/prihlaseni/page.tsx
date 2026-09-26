import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthCard } from '@/features/auth/auth-card'
import { safeReturnPath } from '@/features/auth/return-path'
import { SignInForm } from '@/features/auth/sign-in-form'
import { getSessionUser } from '@/lib/session'

export const metadata: Metadata = { title: 'Přihlášení', robots: { index: false } }

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ zpet?: string }>
}) {
  const { zpet } = await searchParams
  if (await getSessionUser()) redirect(safeReturnPath(zpet))
  return (
    <AuthCard title="Přihlášení">
      <SignInForm returnTo={zpet} />
    </AuthCard>
  )
}
