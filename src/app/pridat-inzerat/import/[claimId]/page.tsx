import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Alert } from '@/components/ui/alert'
import { ButtonLink } from '@/components/ui/button'
import { getCategoryTree } from '@/features/categories/queries'
import { verifyBazosImport } from '@/features/listing-import/actions'
import { ImportFields } from '@/features/listing-import/import-fields'
import { getImportClaim, type ImportClaim } from '@/features/listing-import/queries'
import { VerifyImportForm } from '@/features/listing-import/verify-import-form'
import { createListing } from '@/features/listings/actions'
import { ListingForm, type ListingFormValues } from '@/features/listings/listing-form'
import { requireUser } from '@/lib/require-user'

export const metadata: Metadata = { title: 'Převzít inzerát z Bazoše', robots: { index: false } }

function PendingClaim({ claim }: { claim: ImportClaim }) {
  return (
    <div className="space-y-4">
      <p>
        Upravte svůj{' '}
        <a
          href={claim.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-700 underline"
        >
          inzerát na Bazoši
        </a>{' '}
        a kamkoli do popisu přidejte tento kód:
      </p>
      <p className="rounded-xl border-2 border-dashed border-brand-600 bg-brand-50 py-4 text-center font-mono text-2xl font-bold tracking-wider text-brand-900">
        {claim.verificationCode}
      </p>
      <p className="text-sm text-muted">
        Úprava je na Bazoši zdarma a o pozici ani topování nepřijdete. Po převzetí kód z popisu zase
        smažte — do inzerátu na SafeBazos ho nepřeneseme.
      </p>
      <VerifyImportForm action={verifyBazosImport.bind(null, claim.id)} />
    </div>
  )
}

function draftToFormValues(claim: ImportClaim): ListingFormValues {
  const draft = claim.draft
  return {
    categoryId: draft?.suggestedCategoryId ?? null,
    title: draft?.title ?? '',
    description: draft?.description ?? '',
    priceType: draft?.priceType ?? 'negotiable',
    priceAmount: draft?.priceAmount ?? null,
    postalCode: draft?.postalCode ?? '',
    city: draft?.city ?? '',
    phone: null,
    acceptsSafePayment: true,
    images: [],
  }
}

export default async function ImportClaimPage({
  params,
}: {
  params: Promise<{ claimId: string }>
}) {
  const claimId = Number((await params).claimId)
  const user = await requireUser(`/pridat-inzerat/import/${claimId}`)
  const claim = Number.isSafeInteger(claimId) ? await getImportClaim(claimId, user.id) : null
  if (!claim) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Převzít inzerát z Bazoše</h1>
      {claim.status === 'pending' && <PendingClaim claim={claim} />}
      {claim.status === 'verified' && (
        <>
          <Alert tone="success" title="Ověřeno — inzerát je váš">
            Zkontrolujte převzaté údaje, vyberte kategorii a inzerát zveřejněte.
          </Alert>
          <ListingForm
            action={createListing}
            categoryTree={await getCategoryTree()}
            initialValues={draftToFormValues(claim)}
            submitLabel="Zveřejnit inzerát"
          >
            <ImportFields claimId={claim.id} images={claim.draft?.images ?? []} />
          </ListingForm>
        </>
      )}
      {claim.status === 'imported' && (
        <Alert tone="info" title="Inzerát už je převzatý">
          {claim.importedListingId && (
            <ButtonLink href={`/inzerat/${claim.importedListingId}`} size="sm" className="mt-2">
              Zobrazit inzerát
            </ButtonLink>
          )}
        </Alert>
      )}
    </div>
  )
}
