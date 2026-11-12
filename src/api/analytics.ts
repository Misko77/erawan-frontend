import { apiDownload } from './client.ts'

/** GET /analytics/export/{year}/{month}. Returns the monthly XLSX report. */
export function exportMonth(year: number, month: number, signal?: AbortSignal) {
  return apiDownload(`/analytics/export/${encodeURIComponent(year)}/${encodeURIComponent(month)}`, signal)
}
