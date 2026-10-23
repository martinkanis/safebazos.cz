import type { StoredImage } from '@/features/listings/images'
import { ListingThumbnail } from '@/features/listings/listing-thumbnail'
import { IMPORT_CONSENT_TEXT } from './consent'

interface ImportFieldsProps {
  claimId: number
  images: StoredImage[]
}

/** Pole formuláře nového inzerátu, která přidává převzetí z Bazoše. */
export function ImportFields({ claimId, images }: ImportFieldsProps) {
  return (
    <>
      <input type="hidden" name="importClaimId" value={claimId} />
      {images.length > 0 && (
        <fieldset className="space-y-3 rounded-xl border border-line bg-surface p-5">
          <legend className="px-1 font-semibold">Fotky převzaté z Bazoše</legend>
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {images.map((image, index) => (
              <li key={image.storageKey} className="space-y-1">
                <ListingThumbnail thumbnailKey={image.thumbnailKey} alt="" />
                <label className="flex items-center gap-1.5 text-xs text-muted">
                  <input
                    type="checkbox"
                    name="keepImportedImage"
                    value={index}
                    defaultChecked
                    className="accent-brand-600"
                  />
                  Použít
                </label>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted">Polohu (GPS) jsme z fotek odstranili.</p>
        </fieldset>
      )}
      <label className="flex gap-3 rounded-xl border border-warning-200 bg-warning-50 p-5 text-sm text-warning-800">
        <input
          type="checkbox"
          name="importConsent"
          required
          className="mt-0.5 size-4 shrink-0 accent-brand-600"
        />
        <span>{IMPORT_CONSENT_TEXT}</span>
      </label>
    </>
  )
}
