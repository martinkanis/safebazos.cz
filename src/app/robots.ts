import type { MetadataRoute } from 'next'
import { loadEnv } from '@/config/env'

export default function robots(): MetadataRoute.Robots {
  const appUrl = loadEnv().APP_URL
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/muj-ucet', '/admin', '/api/', '/hledat', '/prihlaseni', '/obnova-hesla'],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  }
}
