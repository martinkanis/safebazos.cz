import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CategoryListingPage, categoryMetadata } from '@/features/categories/category-listing-page'
import { resolveCategory } from '@/features/categories/queries'
import type { RawSearchParams } from '@/features/listings/search-params'

interface SubcategoryPageProps {
  params: Promise<{ kategorie: string; podkategorie: string }>
  searchParams: Promise<RawSearchParams>
}

async function resolveFromParams(params: SubcategoryPageProps['params']) {
  const { kategorie, podkategorie } = await params
  return resolveCategory(kategorie, podkategorie)
}

export async function generateMetadata({
  params,
  searchParams,
}: SubcategoryPageProps): Promise<Metadata> {
  const category = await resolveFromParams(params)
  return category ? categoryMetadata(category, await searchParams) : {}
}

export default async function SubcategoryPage({ params, searchParams }: SubcategoryPageProps) {
  const category = await resolveFromParams(params)
  if (!category) notFound()
  return <CategoryListingPage category={category} rawSearchParams={await searchParams} />
}
