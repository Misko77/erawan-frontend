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

const isoDateFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Today's date in Bratislava as "YYYY-MM-DD". */
export function todayIsoDate(): string {
  return isoDateFormat.format(new Date())
}

/** Shifts a "YYYY-MM-DD" date by `days` (may be negative), returning "YYYY-MM-DD". */
export function addDaysIsoDate(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}
