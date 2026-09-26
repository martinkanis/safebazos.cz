'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { FormField, Input } from '@/components/ui/form-field'
import { authClient } from '@/lib/auth-client'
import { formString } from '@/lib/form'
import { authErrorMessage } from './auth-error-message'

export function ForgotPasswordForm() {
  const [isSent, setIsSent] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = formString(new FormData(event.currentTarget), 'email')
    startTransition(async () => {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: '/obnova-hesla',
      })
      if (error) {
        setErrorMessage(authErrorMessage(error))
        return
      }
      setIsSent(true)
    })
  }

  if (isSent) {
    return (
      <Alert tone="success">
        Pokud u nás účet s tímto e-mailem existuje, poslali jsme na něj odkaz pro nastavení hesla.
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="E-mail" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </FormField>
      {errorMessage && <Alert tone="danger">{errorMessage}</Alert>}
      <Button type="submit" className="w-full" disabled={isPending}>
        Poslat odkaz
      </Button>
    </form>
  )
}
