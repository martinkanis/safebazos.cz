import type { Metadata } from 'next'
import { getCategoryTree } from '@/features/categories/queries'
import { createListing } from '@/features/listings/actions'
import { ListingForm } from '@/features/listings/listing-form'
import { requireUser } from '@/lib/require-user'

export const metadata: Metadata = {
  title: 'Přidat inzerát zdarma',
  description: 'Vložte inzerát zdarma a prodávejte bezpečně s ochranou proti podvodům.',
}

export default async function CreateListingPage() {
  await requireUser('/pridat-inzerat')
  const categoryTree = await getCategoryTree()
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Přidat inzerát</h1>
        <p className="mt-1 text-muted">Inzerce je zdarma. Inzerát bude zveřejněný 60 dní.</p>
      </div>
      <ListingForm
        action={createListing}
        categoryTree={categoryTree}
        submitLabel="Zveřejnit inzerát"
      />
    </div>
  )
}
