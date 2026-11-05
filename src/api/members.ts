import { apiGet, apiRequest } from './client.ts'

export type Member = {
  id: number
  isActive: boolean
  name: string
  lastName: string
  email: string | null
  phone: string | null
  createdAt: string
  updatedAt: string | null
}

export function getMembers(signal?: AbortSignal) {
  return apiGet<Member[]>('/members?includeInactive=true', signal)
}

export function getMember(id: string | number, signal?: AbortSignal) {
  return apiGet<Member>(`/members/${encodeURIComponent(id)}`, signal)
}

export function activateMember(id: string | number) {
  return apiRequest('PUT', `/members/${encodeURIComponent(id)}/activate`)
}

export function deactivateMember(id: string | number) {
  return apiRequest('DELETE', `/members/${encodeURIComponent(id)}/deactivate`)
}

export type CreateMemberRequest = {
  name: string
  lastName: string
  email: string | null
  phone: string | null
}

/** POST /members. The API may or may not return the created member. */
export function createMember(request: CreateMemberRequest) {
  return apiRequest<Member | undefined>('POST', '/members', { body: request })
}
