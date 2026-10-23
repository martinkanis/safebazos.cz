/**
 * Pravidla topování převzatá z Bazoše (bazos.cz/napoveda.php): topování posouvá
 * „čas vložení“ inzerátu dopředu, první o 7 dní, každé další o den méně, od
 * sedmého o 1 den. Dobu zobrazení inzerátu neprodlužuje.
 */

export const TOPPING_VOUCHER_PRICE_CZK = 49
export const TOPPING_VOUCHER_VALIDITY_MONTHS = 6
export const MAX_VOUCHERS_PER_ORDER = 10

const SHIFT_DAYS_BY_ORDER = [7, 6, 5, 4, 3, 2]
const MIN_SHIFT_DAYS = 1

export const MAX_TOPPINGS = 21
/** Ve službách jde topovat méně — jinak by řemeslníci trvale obsadili vršek výpisu. */
export const MAX_TOPPINGS_IN_SERVICES = 7
const SERVICES_CATEGORY_SLUG = 'sluzby'

const DAY_MS = 24 * 60 * 60 * 1000

/** O kolik dní posune inzerát N-té topování (číslováno od 1). */
export function shiftDaysForTopping(toppingOrder: number): number {
  return SHIFT_DAYS_BY_ORDER[toppingOrder - 1] ?? MIN_SHIFT_DAYS
}

/** Celkový posun po `topCount` topováních (7, 13, 18, 22, 25, 27, 28, 29…). */
export function totalShiftDays(topCount: number): number {
  let total = 0
  for (let order = 1; order <= topCount; order++) total += shiftDaysForTopping(order)
  return total
}

/** Čas, podle kterého se inzerát řadí ve výpisu „nejnovější“. */
export function sortTimeFor(publishedAt: Date, topCount: number): Date {
  return new Date(publishedAt.getTime() + totalShiftDays(topCount) * DAY_MS)
}

export function maxToppingsFor(mainCategorySlug: string): number {
  return mainCategorySlug === SERVICES_CATEGORY_SLUG ? MAX_TOPPINGS_IN_SERVICES : MAX_TOPPINGS
}

/** Štítek TOP má každý topovaný inzerát — i starší, kterému posun nestačil až na úplný vrch. */
export function isTopped(topCount: number): boolean {
  return topCount > 0
}

export function voucherExpiryFrom(purchasedAt: Date): Date {
  const expiresAt = new Date(purchasedAt)
  expiresAt.setUTCMonth(expiresAt.getUTCMonth() + TOPPING_VOUCHER_VALIDITY_MONTHS)
  return expiresAt
}
