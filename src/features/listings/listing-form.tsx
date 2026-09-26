'use client'

import { ShieldCheck } from 'lucide-react'
import { useActionState, useState, useTransition, type FormEvent } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { FormField, Input, Select, Textarea } from '@/components/ui/form-field'
import type { PriceType } from '@/db/schema'
import type { MainCategory } from '@/features/categories/queries'
import { assessScamRisk } from '@/features/safety/scam-detector'
import { ScamSignalList } from '@/features/safety/scam-signal-list'
import { INITIAL_LISTING_FORM_STATE, type ListingFormState } from './form-state'
import type { ListingFieldErrors } from './listing-input'
import {
  ACCEPTED_IMAGE_INPUT,
  DESCRIPTION_MAX_LENGTH,
  MAX_IMAGES_PER_LISTING,
  TITLE_MAX_LENGTH,
} from './listing-limits'
import { ListingThumbnail } from './listing-thumbnail'
import { PRICE_TYPE_OPTIONS } from './price'
import type { EditableListing } from './queries'

type ListingFormValues = Omit<EditableListing, 'id' | 'slug' | 'status' | 'expiresAt'>

interface ListingFormProps {
  action: (state: ListingFormState, formData: FormData) => Promise<ListingFormState>
  categoryTree: MainCategory[]
  initialValues?: ListingFormValues
  submitLabel: string
}

function errorProps(fieldErrors: ListingFieldErrors, field: keyof ListingFieldErrors, id: string) {
  const hasError = Boolean(fieldErrors[field])
  return { 'aria-invalid': hasError, 'aria-describedby': hasError ? `${id}-error` : undefined }
}

export function ListingForm({
  action,
  categoryTree,
  initialValues,
  submitLabel,
}: ListingFormProps) {
  const [state, formAction] = useActionState(action, INITIAL_LISTING_FORM_STATE)
  const [isPending, startTransition] = useTransition()
  const [priceType, setPriceType] = useState<PriceType>(initialValues?.priceType ?? 'amount')
  const [textForCheck, setTextForCheck] = useState(
    `${initialValues?.title ?? ''}\n${initialValues?.description ?? ''}`,
  )
  const fieldErrors = state.status === 'error' ? state.fieldErrors : {}
  const scamAssessment = assessScamRisk(textForCheck)
  const existingImages = initialValues?.images ?? []

  // Odeslání mimo <form action>: React by jinak po akci vymazal pole i vybrané fotky.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(() => formAction(formData))
  }

  function handleTextChange(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget
    const title = (form.elements.namedItem('title') as HTMLInputElement | null)?.value ?? ''
    const description =
      (form.elements.namedItem('description') as HTMLTextAreaElement | null)?.value ?? ''
    setTextForCheck(`${title}\n${description}`)
  }

  return (
    <form onSubmit={handleSubmit} onChange={handleTextChange} className="space-y-6">
      {state.status === 'error' && <Alert tone="danger">{state.message}</Alert>}

      <fieldset className="space-y-4 rounded-xl border border-line bg-surface p-5">
        <legend className="px-1 font-semibold">Co prodáváte</legend>
        <FormField label="Kategorie" htmlFor="categoryId" error={fieldErrors.categoryId}>
          <Select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={initialValues?.categoryId ?? ''}
            {...errorProps(fieldErrors, 'categoryId', 'categoryId')}
          >
            <option value="" disabled>
              Vyberte kategorii
            </option>
            {categoryTree.map((main) => (
              <optgroup key={main.id} label={main.name}>
                {main.subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
        </FormField>
        <FormField label="Nadpis" htmlFor="title" error={fieldErrors.title}>
          <Input
            id="title"
            name="title"
            required
            minLength={5}
            maxLength={TITLE_MAX_LENGTH}
            defaultValue={initialValues?.title}
            placeholder='Např. Dětské kolo 20", málo jeté'
            {...errorProps(fieldErrors, 'title', 'title')}
          />
        </FormField>
        <FormField
          label="Popis"
          htmlFor="description"
          error={fieldErrors.description}
          hint="Popište stav, stáří a důvod prodeje. Odkazy na cizí weby se kupujícím nezobrazí."
        >
          <Textarea
            id="description"
            name="description"
            required
            rows={8}
            minLength={20}
            maxLength={DESCRIPTION_MAX_LENGTH}
            defaultValue={initialValues?.description}
            {...errorProps(fieldErrors, 'description', 'description')}
          />
        </FormField>
        {scamAssessment.level !== 'none' && (
          <Alert
            tone={scamAssessment.level === 'high' ? 'danger' : 'warning'}
            title={
              scamAssessment.level === 'high'
                ? 'Inzerát před zveřejněním zkontroluje moderátor'
                : 'Text obsahuje prvky, před kterými varujeme kupující'
            }
          >
            <ScamSignalList signals={scamAssessment.signals} />
          </Alert>
        )}
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border border-line bg-surface p-5">
        <legend className="px-1 font-semibold">Cena a místo</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Typ ceny" htmlFor="priceType" error={fieldErrors.priceType}>
            <Select
              id="priceType"
              name="priceType"
              value={priceType}
              onChange={(event) => setPriceType(event.target.value as PriceType)}
            >
              {PRICE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Cena (Kč)" htmlFor="priceAmount" error={fieldErrors.priceAmount}>
            <Input
              id="priceAmount"
              name="priceAmount"
              inputMode="numeric"
              disabled={priceType !== 'amount'}
              required={priceType === 'amount'}
              defaultValue={initialValues?.priceAmount ?? ''}
              {...errorProps(fieldErrors, 'priceAmount', 'priceAmount')}
            />
          </FormField>
          <FormField label="PSČ" htmlFor="postalCode" error={fieldErrors.postalCode}>
            <Input
              id="postalCode"
              name="postalCode"
              inputMode="numeric"
              autoComplete="postal-code"
              required
              defaultValue={initialValues?.postalCode}
              {...errorProps(fieldErrors, 'postalCode', 'postalCode')}
            />
          </FormField>
          <FormField label="Obec" htmlFor="city" error={fieldErrors.city}>
            <Input
              id="city"
              name="city"
              autoComplete="address-level2"
              required
              defaultValue={initialValues?.city}
              {...errorProps(fieldErrors, 'city', 'city')}
            />
          </FormField>
          <FormField
            label="Telefon (nepovinný)"
            htmlFor="phone"
            error={fieldErrors.phone}
            hint="Zobrazí se až po kliknutí, roboti ho nestáhnou."
          >
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              defaultValue={initialValues?.phone ?? ''}
              {...errorProps(fieldErrors, 'phone', 'phone')}
            />
          </FormField>
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border border-line bg-surface p-5">
        <legend className="px-1 font-semibold">Fotky</legend>
        {existingImages.length > 0 && (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {existingImages.map((image) => (
              <li key={image.id} className="space-y-1">
                <ListingThumbnail thumbnailKey={image.thumbnailKey} alt="" />
                <label className="flex items-center gap-1.5 text-xs text-muted">
                  <input
                    type="checkbox"
                    name="removeImageIds"
                    value={image.id}
                    className="accent-danger-600"
                  />
                  Odebrat
                </label>
              </li>
            ))}
          </ul>
        )}
        <FormField
          label="Přidat fotky"
          htmlFor="images"
          hint={`JPG, PNG nebo WebP, nejvýše ${MAX_IMAGES_PER_LISTING} fotek po 10 MB. Polohu z fotek (GPS) automaticky mažeme.`}
        >
          <input
            id="images"
            name="images"
            type="file"
            multiple
            accept={ACCEPTED_IMAGE_INPUT}
            className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:font-medium file:text-brand-800 hover:file:bg-brand-100"
          />
        </FormField>
      </fieldset>

      <fieldset className="rounded-xl border border-brand-200 bg-brand-50 p-5">
        <legend className="sr-only">Bezpečná platba</legend>
        <label className="flex gap-3">
          <input
            type="checkbox"
            name="acceptsSafePayment"
            defaultChecked={initialValues?.acceptsSafePayment ?? true}
            className="mt-1 size-4 shrink-0 accent-brand-600"
          />
          <span className="text-sm text-brand-900">
            <span className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="size-4" aria-hidden />
              Nabízím bezpečnou platbu přes úschovu
            </span>
            Kupující zaplatí do úschovy a vy máte jistotu, že peníze jsou připravené. Inzeráty s
            bezpečnou platbou kupující vyhledávají a filtrují.
          </span>
        </label>
      </fieldset>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? 'Ukládám…' : submitLabel}
      </Button>
    </form>
  )
}
