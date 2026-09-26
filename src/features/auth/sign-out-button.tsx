'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth-client'

export function SignOutButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSignOut() {
    startTransition(async () => {
      await signOut()
      router.push('/')
      router.refresh()
    })
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleSignOut} disabled={isPending}>
      <LogOut className="size-4" aria-hidden />
      Odhlásit
    </Button>
  )
}
