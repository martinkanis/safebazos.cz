import { LockKeyhole, MessageCircleWarning, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { JsonLd } from '@/components/ui/json-ld'
import { loadEnv } from '@/config/env'
import { CategoryIcon } from '@/features/categories/category-icon'
import { categoryPath, getCategoryTree } from '@/features/categories/queries'
import { ListingRows } from '@/features/listings/listing-row'
import { countListingsByMainCategory, searchListings } from '@/features/listings/queries'

const LATEST_LISTINGS_COUNT = 10
const SUBCATEGORY_PREVIEW_COUNT = 4

const SAFETY_PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Bezpečná platba',
    text: 'Peníze leží v úschově a prodávající je dostane až poté, co zboží převezmete.',
  },
  {
    icon: MessageCircleWarning,
    title: 'Hlídáme podvodné zprávy',
    text: 'Falešné odkazy na „přijetí platby“ skryjeme a před podezřelými zprávami vás varujeme.',
  },
  {
    icon: LockKeyhole,
    title: 'Ověřené účty',
    text: 'Inzerovat a psát může jen ověřený účet. Telefon se robotům nezobrazí.',
  },
]

export default async function HomePage() {
  const [categoryTree, countsByCategory, latest] = await Promise.all([
    getCategoryTree(),
    countListingsByMainCategory(),
    searchListings({ sort: 'newest', page: 1, pageSize: LATEST_LISTINGS_COUNT }),
  ])
  const appUrl = loadEnv().APP_URL

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 px-6 py-10 text-white sm:px-10">
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Bazar, kde nakupujete bez obav z podvodu
        </h1>
        <p className="mt-3 max-w-2xl text-brand-100">
          Inzerce zdarma jako na klasickém bazaru, navíc s ochranou kupujících i prodávajících.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {SAFETY_PILLARS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <Icon className="size-6 text-brand-200" aria-hidden />
              <p className="mt-2 font-semibold">{title}</p>
              <p className="mt-1 text-sm text-brand-100">{text}</p>
            </li>
          ))}
        </ul>
        <Link
          href="/bezpecnost"
          className="mt-6 inline-block text-sm font-medium text-white underline underline-offset-4 hover:text-brand-100"
        >
          Jak poznat podvodníka na bazaru →
        </Link>
      </section>

      <section aria-labelledby="kategorie-nadpis">
        <h2 id="kategorie-nadpis" className="mb-4 text-xl font-bold">
          Kategorie
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categoryTree.map((category) => (
            <li key={category.id} className="rounded-xl border border-line bg-surface p-4">
              <Link
                href={categoryPath(category)}
                className="flex items-center gap-2 font-semibold hover:text-brand-700"
              >
                <CategoryIcon slug={category.slug} className="size-5 text-brand-600" />
                {category.name}
                <span className="ml-auto text-xs font-normal text-muted">
                  {countsByCategory.get(category.id) ?? 0}
                </span>
              </Link>
              <p className="mt-2 hidden text-xs leading-relaxed text-muted sm:block">
                {category.subcategories.slice(0, SUBCATEGORY_PREVIEW_COUNT).map((sub, index) => (
                  <span key={sub.id}>
                    {index > 0 && ', '}
                    <Link
                      href={categoryPath(category, sub)}
                      className="hover:text-brand-700 hover:underline"
                    >
                      {sub.name}
                    </Link>
                  </span>
                ))}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="nejnovejsi-nadpis">
        <h2 id="nejnovejsi-nadpis" className="mb-4 text-xl font-bold">
          Nejnovější inzeráty
        </h2>
        <ListingRows listings={latest.listings} />
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'SafeBazos',
          url: appUrl,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${appUrl}/hledat?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        }}
      />
    </div>
  )
}
