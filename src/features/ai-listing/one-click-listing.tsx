'use client'

import { Camera, PencilLine, Sparkles } from 'lucide-react'
import { useEffect, useState, useTransition, type ChangeEvent } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { MainCategory } from '@/features/categories/queries'
import type { ListingFormState } from '@/features/listings/form-state'
import { newListingFormValues } from '@/features/listings/form-defaults'
import { ListingForm, type ListingFormValues } from '@/features/listings/listing-form'
import type { ListingContactDefaults } from '@/features/listings/queries'
import { MAX_IMAGES_PER_LISTING } from '@/features/listings/listing-limits'
import { suggestListingFromPhotosAction } from './actions'
import { MAX_AI_PHOTOS } from './ai-config'
import type { ListingSuggestion } from './normalize-suggestion'
import { resizePhoto } from './resize-photo'

type Phase =
  | { step: 'pick'; error?: string }
  | { step: 'analyzing' }
  | { step: 'review'; suggestion: ListingSuggestion }
  | { step: 'manual'; notice?: string }

interface OneClickListingProps {
  action: (state: ListingFormState, formData: FormData) => Promise<ListingFormState>
  categoryTree: MainCategory[]
  /** Lokalita a telefon z posledního inzerátu prodejce. */
  contactDefaults: ListingContactDefaults | null
}

const CONFIDENCE_LABELS: Record<ListingSuggestion['priceConfidence'], string> = {
  low: 'hrubý odhad',
  medium: 'orientační odhad',
  high: 'obvyklá cena',
}

const priceFormatter = new Intl.NumberFormat('cs-CZ', {
  style: 'currency',
  currency: 'CZK',
  maximumFractionDigits: 0,
})

function suggestionToFormValues(
  suggestion: ListingSuggestion,
  contact: ListingContactDefaults | null,
): ListingFormValues {
  return {
    ...newListingFormValues(contact),
    categoryId: suggestion.categoryId,
    title: suggestion.title,
    description: suggestion.description,
    priceType: suggestion.suggestedPriceCzk ? 'amount' : 'negotiable',
    priceAmount: suggestion.suggestedPriceCzk,
  }
}

function usePhotoPreviews(photos: File[]): string[] {
  const [previews, setPreviews] = useState<string[]>([])
  useEffect(() => {
    const urls = photos.map((photo) => URL.createObjectURL(photo))
    setPreviews(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [photos])
  return previews
}

function SuggestionSummary({ suggestion }: { suggestion: ListingSuggestion }) {
  return (
    <Alert tone="success" title={`Rozpoznáno: ${suggestion.detectedItem}`}>
      <p>Nadpis, popis a kategorii jsme předvyplnili — zkontrolujte je a upravte podle sebe.</p>
      {suggestion.suggestedPriceCzk && (
        <p>
          Cena {priceFormatter.format(suggestion.suggestedPriceCzk)} je{' '}
          {CONFIDENCE_LABELS[suggestion.priceConfidence]} podle podobných inzerátů.
        </p>
      )}
      {suggestion.missingDetails.length > 0 && (
        <p>Z fotek nejde poznat — doplňte do popisu: {suggestion.missingDetails.join(', ')}.</p>
      )}
    </Alert>
  )
}

/** Inzerát na 1 klik: vyfotit → AI navrhne inzerát → zkontrolovat → zveřejnit. */
export function OneClickListing({ action, categoryTree, contactDefaults }: OneClickListingProps) {
  const [phase, setPhase] = useState<Phase>({ step: 'pick' })
  const [photos, setPhotos] = useState<File[]>([])
  const [, startTransition] = useTransition()
  const previews = usePhotoPreviews(photos)

  async function handlePhotosSelected(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []).slice(0, MAX_IMAGES_PER_LISTING)
    if (selected.length === 0) return
    setPhase({ step: 'analyzing' })

    let resized: File[]
    try {
      resized = await Promise.all(selected.map(resizePhoto))
    } catch {
      setPhase({
        step: 'pick',
        error: 'Některou fotku se nepodařilo načíst. Zkuste fotky ve formátu JPG.',
      })
      return
    }
    setPhotos(resized)

    const formData = new FormData()
    resized.slice(0, MAX_AI_PHOTOS).forEach((photo) => formData.append('photos', photo))
    startTransition(async () => {
      const result = await suggestListingFromPhotosAction(formData)
      setPhase(
        result.status === 'succeeded'
          ? { step: 'review', suggestion: result.suggestion }
          : { step: 'manual', notice: result.status === 'error' ? result.message : undefined },
      )
    })
  }

  if (phase.step === 'review' || phase.step === 'manual') {
    return (
      <div className="space-y-6">
        {phase.step === 'review' && <SuggestionSummary suggestion={phase.suggestion} />}
        {phase.step === 'manual' && phase.notice && <Alert tone="warning">{phase.notice}</Alert>}
        <ListingForm
          key={phase.step}
          action={action}
          categoryTree={categoryTree}
          initialValues={
            phase.step === 'review'
              ? suggestionToFormValues(phase.suggestion, contactDefaults)
              : newListingFormValues(contactDefaults)
          }
          initialFiles={photos}
          submitLabel="Zveřejnit inzerát"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <label
        className={`flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-brand-600 bg-brand-50 px-6 py-10 text-center text-brand-900 hover:bg-brand-100 ${phase.step === 'analyzing' ? 'pointer-events-none opacity-70' : ''}`}
      >
        {phase.step === 'analyzing' ? (
          <>
            <Sparkles className="size-10 animate-pulse" aria-hidden />
            <span className="text-lg font-semibold">Poznávám, co prodáváte…</span>
            <span className="text-sm">Obvykle to trvá do 15 sekund.</span>
          </>
        ) : (
          <>
            <Camera className="size-10" aria-hidden />
            <span className="text-lg font-semibold">Vyfoťte, co prodáváte</span>
            <span className="text-sm">
              AI pozná zboží a navrhne nadpis, popis, kategorii i cenu. Vy jen zkontrolujete.
            </span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          disabled={phase.step === 'analyzing'}
          onChange={(event) => void handlePhotosSelected(event)}
        />
      </label>
      {previews.length > 0 && (
        <ul className="grid grid-cols-5 gap-2">
          {previews.map((url) => (
            <li key={url}>
              <img src={url} alt="" className="aspect-square w-full rounded-lg object-cover" />
            </li>
          ))}
        </ul>
      )}
      {phase.step === 'pick' && phase.error && <Alert tone="danger">{phase.error}</Alert>}
      {phase.step === 'pick' && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
          <span>Fotky zpracuje AI (Anthropic) jen pro návrh inzerátu. Polohu z fotek mažeme.</span>
          <Button variant="ghost" size="sm" onClick={() => setPhase({ step: 'manual' })}>
            <PencilLine className="size-4" aria-hidden />
            Vyplnit ručně
          </Button>
        </div>
      )}
    </div>
  )
}
