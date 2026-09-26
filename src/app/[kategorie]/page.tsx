import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CategoryListingPage, categoryMetadata } from '@/features/categories/category-listing-page'
import { resolveCategory } from '@/features/categories/queries'
import type { RawSearchParams } from '@/features/listings/search-params'

interface MainCategoryPageProps {
  params: Promise<{ kategorie: string }>
  searchParams: Promise<RawSearchParams>
}

export async function generateMetadata({
  params,
  searchParams,
}: MainCategoryPageProps): Promise<Metadata> {
  const category = await resolveCategory((await params).kategorie)
  return category ? categoryMetadata(category, await searchParams) : {}
}

export default async function MainCategoryPage({ params, searchParams }: MainCategoryPageProps) {
  const category = await resolveCategory((await params).kategorie)
  if (!category) notFound()
  return <CategoryListingPage category={category} rawSearchParams={await searchParams} />
}
