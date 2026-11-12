import { supabase } from '../auth/supabase.ts'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export async function apiRequest<T = void>(
  method: HttpMethod,
  path: string,
  options: { body?: unknown; signal?: AbortSignal; anonymous?: boolean } = {},
): Promise<T> {
  const { body, signal, anonymous } = options
  const token = anonymous ? undefined : (await supabase.auth.getSession()).data.session?.access_token
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  })
  if (!response.ok) {
    throw new ApiError(response.status, `${method} ${path} failed: ${response.status} ${response.statusText}`)
  }
  // Endpoints like activate/deactivate may return no body
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export type DownloadedFile = {
  blob: Blob
  fileName: string | undefined
}

/**
 * Pulls the file name out of a header like
 * `attachment; filename="x.xlsx"; filename*=UTF-8''x.xlsx` or `application/...; name="x.xlsx"`.
 */
function parseFileName(header: string | null): string | undefined {
  if (!header) return undefined
  const encoded = /filename\*\s*=\s*(?:[\w-]+'[^']*')?"?([^";]+)"?/i.exec(header)
  if (encoded) {
    try {
      return decodeURIComponent(encoded[1].trim())
    } catch {
      // fall through to the plain parameter
    }
  }
  const plain = /(?:file)?name\s*=\s*"?([^";]+)"?/i.exec(header)
  return plain?.[1].trim()
}

/** Authenticated GET of a binary file. The name comes from Content-Disposition (or Content-Type `name=`). */
export async function apiDownload(path: string, signal?: AbortSignal): Promise<DownloadedFile> {
  const token = (await supabase.auth.getSession()).data.session?.access_token
  const response = await fetch(`${API_URL}${path}`, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal,
  })
  if (!response.ok) {
    throw new ApiError(response.status, `GET ${path} failed: ${response.status} ${response.statusText}`)
  }
  const fileName =
    parseFileName(response.headers.get('Content-Disposition')) ??
    parseFileName(response.headers.get('Content-Type'))
  return { blob: await response.blob(), fileName }
}

/** Hands a blob to the browser as a file download. */
export function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  return apiRequest<T>('GET', path, { signal })
}
