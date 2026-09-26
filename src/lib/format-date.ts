const dateFormatter = new Intl.DateTimeFormat('cs-CZ', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  timeZone: 'Europe/Prague',
})

const dateTimeFormatter = new Intl.DateTimeFormat('cs-CZ', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Prague',
})

/** „26. 9. 2026“ */
export function formatDate(date: Date): string {
  return dateFormatter.format(date)
}

/** „26. 9. 2026 14:05“ */
export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date)
}
