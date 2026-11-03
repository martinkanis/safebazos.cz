import type { ListingFormValues } from './listing-form'
import type { ListingContactDefaults } from './queries'

/** Prázdný nový inzerát s lokalitou a telefonem z posledního inzerátu prodejce. */
export function newListingFormValues(contact: ListingContactDefaults | null): ListingFormValues {
  return {
    categoryId: null,
    title: '',
    description: '',
    priceType: 'amount',
    priceAmount: null,
    postalCode: contact?.postalCode ?? '',
    city: contact?.city ?? '',
    phone: contact?.phone ?? null,
    acceptsSafePayment: true,
    images: [],
  }
}
