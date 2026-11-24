import { apiRequest } from './client.ts'

export type PublicMember = {
  name: string
  lastName: string
  /** Group trainings left (all non-private types): purchased minus attended. Can be negative. */
  groupCount: number
  /** Private trainings left: purchased minus attended. Can be negative. */
  privateCount: number
}

/** GET /public/members/{lastName}?firstName=. Anonymous endpoint, no auth header is sent. */
export async function getPublicMembers(
  lastName: string,
  firstName?: string,
  signal?: AbortSignal,
): Promise<PublicMember[]> {
  const query = firstName ? `?firstName=${encodeURIComponent(firstName)}` : ''
  const result = await apiRequest<PublicMember | PublicMember[] | undefined>(
    'GET',
    `/public/members/${encodeURIComponent(lastName)}${query}`,
    { signal, anonymous: true },
  )
  // Accept both a single object and a list (several members can share a last name)
  if (!result) return []
  return Array.isArray(result) ? result : [result]
}
