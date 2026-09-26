'use client'

import { MailCheck } from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition, type FormEvent } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { FormField, Input } from '@/components/ui/form-field'
import { signUp } from '@/lib/auth-client'
import { formString } from '@/lib/form'
import { MIN_PASSWORD_LENGTH } from '@/lib/password-policy'
import { authErrorMessage } from './auth-error-message'

export function SignUpForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formString(formData, 'email')
    const password = formString(formData, 'password')
    if (password !== formData.get('passwordConfirmation')) {
      setErrorMessage('Hesla se neshodují.')
      return
    }
    startTransition(async () => {
      const { error } = await signUp.email({
        name: formString(formData, 'name').trim(),
        email,
        password,
        callbackURL: '/muj-ucet',
      })
      if (error) {
        setErrorMessage(authErrorMessage(error))
        return
      }
      setRegisteredEmail(email)
    })
  }

  if (registeredEmail) {
    return (
      <Alert tone="success" title="Zkontrolujte e-mail">
        <p>
          Na adresu <strong>{registeredEmail}</strong> jsme poslali odkaz pro ověření. Po kliknutí
          budete přihlášeni.
        </p>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Jméno" htmlFor="name" hint="Zobrazí se u vašich inzerátů.">
        <Input id="name" name="name" autoComplete="name" required minLength={2} maxLength={60} />
      </FormField>
      <FormField label="E-mail" htmlFor="email" hint="Nikomu ho nezobrazujeme.">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </FormField>
      <FormField label="Heslo" htmlFor="password" hint={`Alespoň ${MIN_PASSWORD_LENGTH} znaků.`}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
        />
      </FormField>
      <FormField label="Heslo znovu" htmlFor="passwordConfirmation">
        <Input
          id="passwordConfirmation"
          name="passwordConfirmation"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
        />
      </FormField>
      {errorMessage && <Alert tone="danger">{errorMessage}</Alert>}
      <Button type="submit" className="w-full" disabled={isPending}>
        <MailCheck className="size-4" aria-hidden />
        Založit účet
      </Button>
      <p className="text-center text-sm text-muted">
        Už máte účet?{' '}
        <Link href="/prihlaseni" className="font-medium text-brand-700 hover:underline">
          Přihlaste se
        </Link>
      </p>
    </form>
  )
}
