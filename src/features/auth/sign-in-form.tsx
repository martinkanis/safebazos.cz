'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition, type FormEvent } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { FormField, Input } from '@/components/ui/form-field'
import { signIn } from '@/lib/auth-client'
import { formString } from '@/lib/form'
import { authErrorMessage } from './auth-error-message'
import { safeReturnPath } from './return-path'

export function SignInForm({ returnTo }: { returnTo: string | undefined }) {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      const { error } = await signIn.email({
        email: formString(formData, 'email'),
        password: formString(formData, 'password'),
      })
      if (error) {
        setErrorMessage(authErrorMessage(error))
        return
      }
      router.push(safeReturnPath(returnTo))
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="E-mail" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </FormField>
      <FormField label="Heslo" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </FormField>
      {errorMessage && <Alert tone="danger">{errorMessage}</Alert>}
      <Button type="submit" className="w-full" disabled={isPending}>
        Přihlásit se
      </Button>
      <div className="flex justify-between text-sm">
        <Link href="/zapomenute-heslo" className="text-muted hover:text-brand-700 hover:underline">
          Zapomenuté heslo
        </Link>
        <Link href="/registrace" className="font-medium text-brand-700 hover:underline">
          Založit účet
        </Link>
      </div>
    </form>
  )
}
