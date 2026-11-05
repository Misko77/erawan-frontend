// All dates/times are displayed in Bratislava time (CET/CEST, DST handled automatically),
// regardless of the viewer's device timezone.
export const TIME_ZONE = 'Europe/Bratislava'
export const LOCALE = 'sk-SK'

const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  dateStyle: 'medium',
  timeStyle: 'short',
})

const dateFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  dateStyle: 'medium',
})

const currencyFormat = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'EUR' })

/** e.g. "4. 11. 2026, 16:34" (Bratislava time). Returns "—" for empty values. */
export function formatDateTime(value: string | Date | null | undefined): string {
  return value ? dateTimeFormat.format(new Date(value)) : '—'
}

/** e.g. "4. 11. 2026" (Bratislava time). Returns "—" for empty values. */
export function formatDate(value: string | Date | null | undefined): string {
  return value ? dateFormat.format(new Date(value)) : '—'
}

export function formatCurrency(amount: number): string {
  return currencyFormat.format(amount)
}
