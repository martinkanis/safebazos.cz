import type { Metadata } from 'next'
import Link from 'next/link'
import { Alert } from '@/components/ui/alert'
import { AuthCard } from '@/features/auth/auth-card'
import { ResetPasswordForm } from '@/features/auth/reset-password-form'

export const metadata: Metadata = { title: 'Nové heslo', robots: { index: false } }

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  return (
    <AuthCard title="Nastavit nové heslo">
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <Alert tone="danger">
          Odkaz je neplatný nebo vypršel.{' '}
          <Link href="/zapomenute-heslo" className="underline">
            Požádejte o nový
          </Link>
          .
        </Alert>
      )}
    </AuthCard>
  )
}
