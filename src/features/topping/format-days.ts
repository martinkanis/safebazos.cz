/** Počet dní s českým skloňováním: 1 den, 2–4 dny, 5+ dní. */
export function formatDays(days: number): string {
  if (days === 1) return '1 den'
  return days >= 2 && days <= 4 ? `${days} dny` : `${days} dní`
}
