import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import type { ReactNode } from 'react'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { loadEnv } from '@/config/env'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter' })

const SITE_DESCRIPTION =
  'Bazar s ochranou proti podvodům. Inzeráty zdarma, zprávy kontrolované na podvodné odkazy a bezpečná platba přes úschovu.'

export const metadata: Metadata = {
  metadataBase: new URL(loadEnv().APP_URL),
  title: {
    default: 'SafeBazos — bezpečný bazar a inzerce zdarma',
    template: '%s | SafeBazos',
  },
  description: SITE_DESCRIPTION,
  applicationName: 'SafeBazos',
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
    siteName: 'SafeBazos',
    description: SITE_DESCRIPTION,
  },
}

export const viewport: Viewport = {
  themeColor: '#059669',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="cs" className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#obsah"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2"
        >
          Přeskočit na obsah
        </a>
        <SiteHeader />
        <main id="obsah" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  )
}
