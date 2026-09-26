'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition, type FormEvent } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { FormField, Input } from '@/components/ui/form-field'
import { authClient } from '@/lib/auth-client'
import { formString } from '@/lib/form'
import { MIN_PASSWORD_LENGTH } from '@/lib/password-policy'
import { authErrorMessage } from './auth-error-message'

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const newPassword = formString(new FormData(event.currentTarget), 'password')
    startTransition(async () => {
      const { error } = await authClient.resetPassword({ newPassword, token })
      if (error) {
        setErrorMessage(authErrorMessage(error))
        return
      }
      router.push('/prihlaseni')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Nové heslo"
        htmlFor="password"
        hint={`Alespoň ${MIN_PASSWORD_LENGTH} znaků.`}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
        />
      </FormField>
      {errorMessage && <Alert tone="danger">{errorMessage}</Alert>}
      <Button type="submit" className="w-full" disabled={isPending}>
        Nastavit heslo
      </Button>
    </form>
  )
}
