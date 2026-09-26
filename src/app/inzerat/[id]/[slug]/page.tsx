import { Eye, MapPin } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { after } from 'next/server'
import { cache } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Alert } from '@/components/ui/alert'
import { JsonLd } from '@/components/ui/json-ld'
import { loadEnv } from '@/config/env'
import { categoryPath, findSubcategoryById } from '@/features/categories/queries'
import { ListingContact } from '@/features/listings/listing-contact'
import { ListingGallery } from '@/features/listings/listing-gallery'
import { ListingStatusNotice, type SavedState } from '@/features/listings/listing-status-notice'
import { listingPath } from '@/features/listings/paths'
import { formatListingPrice } from '@/features/listings/price'
import {
  getListingDetail,
  getSellerProfile,
  incrementViewCount,
  type ListingDetail,
} from '@/features/listings/queries'
import { SafePaymentBadge } from '@/features/listings/safe-payment-badge'
import { SellerCard } from '@/features/listings/seller-card'
import { reportListing } from '@/features/moderation/actions'
import { ReportListingForm } from '@/features/moderation/report-listing-form'
import { SafePaymentOffer } from '@/features/safety/safe-payment-offer'
import { SafetyTipsBox } from '@/features/safety/safety-tips-box'
import { maskUntrustedLinks } from '@/features/safety/scam-detector'
import { ScamSignalList } from '@/features/safety/scam-signal-list'
import { formatDate } from '@/lib/format-date'
import { mediaUrl } from '@/lib/media-url'
import { getSessionUser } from '@/lib/session'
import { formatPostalCode, truncateText } from '@/lib/text'

interface ListingPageProps {
  params: Promise<{ id: string; slug: string }>
  searchParams: Promise<{ stav?: string }>
}

const META_DESCRIPTION_LENGTH = 160

const loadListing = cache(async (rawId: string): Promise<ListingDetail | null> => {
  const id = Number(rawId)
  return Number.isSafeInteger(id) && id > 0 ? getListingDetail(id) : null
})

function isPubliclyVisible(listing: ListingDetail): boolean {
  return listing.status === 'active' && listing.expiresAt > new Date()
}

function parseSavedState(value: string | undefined): SavedState | null {
  return value === 'novy' || value === 'upraveno' ? value : null
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const listing = await loadListing((await params).id)
  if (!listing) return {}
  const price = formatListingPrice(listing.priceType, listing.priceAmount)
  const title = `${listing.title} – ${price}, ${listing.city}`
  const firstImage = listing.images[0]
  return {
    title,
    description: truncateText(maskUntrustedLinks(listing.description), META_DESCRIPTION_LENGTH),
    alternates: { canonical: listingPath(listing) },
    robots: isPubliclyVisible(listing) ? undefined : { index: false, follow: false },
    openGraph: {
      title,
      url: listingPath(listing),
      images: firstImage ? [{ url: mediaUrl(firstImage.storageKey) }] : undefined,
    },
  }
}

function productJsonLd(listing: ListingDetail, description: string) {
  const appUrl = loadEnv().APP_URL
  const hasFixedPrice = listing.priceType === 'amount' && listing.priceAmount !== null
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description,
    image: listing.images.map((image) => `${appUrl}${mediaUrl(image.storageKey)}`),
    ...(hasFixedPrice && {
      offers: {
        '@type': 'Offer',
        url: `${appUrl}${listingPath(listing)}`,
        price: listing.priceAmount,
        priceCurrency: 'CZK',
        availability: 'https://schema.org/InStock',
      },
    }),
  }
}

export default async function ListingPage({ params, searchParams }: ListingPageProps) {
  const { id, slug } = await params
  const [listing, viewer] = await Promise.all([loadListing(id), getSessionUser()])
  if (!listing) notFound()

  const isOwner = viewer?.id === listing.ownerUserId
  const isPublic = isPubliclyVisible(listing)
  if (!isPublic && !isOwner && !viewer?.isAdmin) notFound()
  if (slug !== listing.slug) permanentRedirect(listingPath(listing))

  if (isPublic && !isOwner) after(() => incrementViewCount(listing.id))

  const [category, seller] = await Promise.all([
    findSubcategoryById(listing.categoryId),
    getSellerProfile(listing.ownerUserId),
  ])
  const description = maskUntrustedLinks(listing.description)
  const breadcrumbs = category
    ? [
        { name: category.main.name, href: categoryPath(category.main) },
        { name: category.sub.name, href: categoryPath(category.main, category.sub) },
        { name: listing.title, href: listingPath(listing) },
      ]
    : [{ name: listing.title, href: listingPath(listing) }]

  return (
    <div className="space-y-5">
      <Breadcrumbs items={breadcrumbs} />
      {(isOwner || viewer?.isAdmin) && (
        <ListingStatusNotice
          listing={listing}
          isExpired={listing.expiresAt <= new Date()}
          savedState={parseSavedState((await searchParams).stav)}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <article className="space-y-5 lg:col-span-2">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{listing.title}</h1>
            {/* Na mobilu je postranní panel s cenou až pod popisem — cenu ukážeme hned. */}
            <p className="text-xl font-bold text-brand-700 lg:hidden">
              {formatListingPrice(listing.priceType, listing.priceAmount)}
            </p>
          </div>
          <ListingGallery images={listing.images} title={listing.title} />

          {listing.riskLevel === 'warning' && (
            <Alert tone="warning" title="Buďte opatrní">
              <ScamSignalList signals={listing.riskSignals} />
            </Alert>
          )}

          <section aria-label="Popis" className="rounded-xl border border-line bg-surface p-5">
            <p className="whitespace-pre-line leading-relaxed">{description}</p>
            <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3 text-xs text-muted">
              <span>
                Vloženo{' '}
                <time dateTime={listing.publishedAt.toISOString()}>
                  {formatDate(listing.publishedAt)}
                </time>
              </span>
              <span className="flex items-center gap-1">
                <Eye className="size-3.5" aria-hidden />
                Zobrazeno {listing.viewCount}×
              </span>
              <span>ID inzerátu: {listing.id}</span>
            </p>
          </section>

          <ReportListingForm action={reportListing.bind(null, listing.id)} />
        </article>

        <aside className="space-y-4">
          <div className="space-y-4 rounded-xl border border-line bg-surface p-5">
            <div>
              <p className="text-3xl font-bold">
                {formatListingPrice(listing.priceType, listing.priceAmount)}
              </p>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                <MapPin className="size-4" aria-hidden />
                {listing.city}, {formatPostalCode(listing.postalCode)}
              </p>
              {listing.acceptsSafePayment && <SafePaymentBadge className="mt-2" />}
            </div>
            {seller && <SellerCard seller={seller} />}
            <ListingContact listing={listing} viewer={viewer} />
          </div>
          {listing.acceptsSafePayment ? <SafePaymentOffer /> : <SafetyTipsBox />}
        </aside>
      </div>

      <JsonLd data={productJsonLd(listing, description)} />
    </div>
  )
}
