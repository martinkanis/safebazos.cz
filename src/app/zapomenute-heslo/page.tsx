import type { Metadata } from 'next'
import { AuthCard } from '@/features/auth/auth-card'
import { ForgotPasswordForm } from '@/features/auth/forgot-password-form'

export const metadata: Metadata = { title: 'Zapomenuté heslo', robots: { index: false } }

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Zapomenuté heslo">
      <ForgotPasswordForm />
    </AuthCard>
  )
}
