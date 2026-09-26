/** Kanonická SEO adresa detailu inzerátu. */
export function listingPath(listing: { id: number; slug: string }): string {
  return `/inzerat/${listing.id}/${listing.slug}`
}
