import { headers } from 'next/headers'
import { cache } from 'react'
import { auth } from './auth'

export interface SessionUser {
  id: string
  name: string
  email: string
  isAdmin: boolean
}

/** Přihlášený uživatel pro server components a actions (per-request cache). */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return null
  const { user } = session
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: user.role === 'admin',
  }
})
