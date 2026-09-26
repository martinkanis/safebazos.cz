import type { NextConfig } from 'next'

/** 10 fotek × 10 MB (limit v features/listings/images.ts) + textová pole. */
const LISTING_FORM_BODY_LIMIT = '105mb'

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: LISTING_FORM_BODY_LIMIT,
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
