import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthCard } from '@/features/auth/auth-card'
import { SignUpForm } from '@/features/auth/sign-up-form'
import { getSessionUser } from '@/lib/session'

export const metadata: Metadata = {
  title: 'Registrace',
  description: 'Založte si zdarma účet na SafeBazos a inzerujte bezpečně.',
}

export default async function SignUpPage() {
  if (await getSessionUser()) redirect('/muj-ucet')
  return (
    <AuthCard title="Založit účet">
      <SignUpForm />
    </AuthCard>
  )
}
