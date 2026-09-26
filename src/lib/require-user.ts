import { redirect } from 'next/navigation'
import { getSessionUser, type SessionUser } from './session'

/** Pro stránky a actions vyžadující přihlášení — jinak redirect na login s návratem zpět. */
export async function requireUser(returnTo?: string): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) {
    const query = returnTo ? `?zpet=${encodeURIComponent(returnTo)}` : ''
    redirect(`/prihlaseni${query}`)
  }
  return user
}

/** Pro admin sekci — ne-admina tiše vrátí na úvod (neprozrazuje existenci sekce). */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser()
  if (!user.isAdmin) redirect('/')
  return user
}
