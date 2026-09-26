import { MessageCircle, Plus, Search, User } from 'lucide-react'
import Link from 'next/link'
import { ButtonLink } from '@/components/ui/button'
import { SignOutButton } from '@/features/auth/sign-out-button'
import { countUnreadMessages } from '@/features/messaging/queries'
import { getSessionUser } from '@/lib/session'
import { BrandLogo } from './brand-logo'

async function AccountLinks() {
  const user = await getSessionUser()
  if (!user) {
    return (
      <Link
        href="/prihlaseni"
        className="flex items-center gap-1.5 text-sm font-medium hover:text-brand-700"
      >
        <User className="size-4" aria-hidden />
        Přihlásit
      </Link>
    )
  }

  const unreadCount = await countUnreadMessages(user.id)
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/muj-ucet/zpravy"
        className="relative flex items-center gap-1.5 text-sm font-medium hover:text-brand-700"
      >
        <MessageCircle className="size-4" aria-hidden />
        <span className="hidden sm:inline">Zprávy</span>
        {unreadCount > 0 && (
          <span className="rounded-full bg-danger-600 px-1.5 text-xs font-semibold text-white">
            {unreadCount}
            <span className="sr-only"> nepřečtených</span>
          </span>
        )}
      </Link>
      <Link
        href="/muj-ucet"
        className="flex items-center gap-1.5 text-sm font-medium hover:text-brand-700"
      >
        <User className="size-4" aria-hidden />
        <span className="hidden sm:inline">Můj účet</span>
      </Link>
      {user.isAdmin && (
        <Link href="/admin" className="text-sm font-medium text-brand-700 hover:underline">
          Moderace
        </Link>
      )}
      <SignOutButton />
    </div>
  )
}

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
        <BrandLogo />
        <form
          action="/hledat"
          role="search"
          className="order-last flex w-full md:order-none md:w-auto md:flex-1"
        >
          <label htmlFor="header-search" className="sr-only">
            Hledat v inzerátech
          </label>
          <input
            id="header-search"
            name="q"
            type="search"
            placeholder="Co hledáte? Např. iPhone, kočárek, Octavia…"
            className="h-10 min-w-0 flex-1 rounded-l-lg border border-r-0 border-line bg-canvas px-3 text-sm focus:border-brand-600 focus:outline-none"
          />
          <button
            type="submit"
            className="flex h-10 items-center rounded-r-lg bg-brand-600 px-3 text-white hover:bg-brand-700"
          >
            <Search className="size-4" aria-hidden />
            <span className="sr-only">Hledat</span>
          </button>
        </form>
        <div className="ml-auto flex items-center gap-4">
          <AccountLinks />
          <ButtonLink href="/pridat-inzerat" size="sm">
            <Plus className="size-4" aria-hidden />
            Přidat inzerát
          </ButtonLink>
        </div>
      </div>
    </header>
  )
}
