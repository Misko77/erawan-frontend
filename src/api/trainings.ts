import { apiGet, apiRequest } from './client.ts'
import type { Member } from './members.ts'

export type TrainingType = 'Mma' | 'Kickbox' | 'FemaleKickbox' | 'Circuit' | 'Other'

export type Training = {
  id: number
  /** DateOnly, e.g. "2026-11-05" */
  date: string
  type: TrainingType
  createdBy: string
  createdAt: string
  updatedAt: string | null
}

export const trainingTypeLabels: Record<TrainingType, string> = {
  Mma: 'MMA',
  Kickbox: 'Kickbox',
  FemaleKickbox: 'Kickbox (ženy)',
  Circuit: 'Kruhový tréning',
  Other: 'Iné',
}

export const trainingTypeColors: Record<TrainingType, string> = {
  Mma: 'red',
  Kickbox: 'blue',
  FemaleKickbox: 'pink',
  Circuit: 'orange',
  Other: 'gray',
}

export function getMemberTrainings(memberId: string | number, signal?: AbortSignal) {
  return apiGet<Training[]>(`/members/${encodeURIComponent(memberId)}/trainings`, signal)
}

/** `from` / `to` are inclusive DateOnly strings ("YYYY-MM-DD"); omit for no bound. */
export function getTrainings(filter: { from?: string; to?: string }, signal?: AbortSignal) {
  const params = new URLSearchParams()
  if (filter.from) params.set('from', filter.from)
  if (filter.to) params.set('to', filter.to)
  const query = params.toString()
  return apiGet<Training[]>(`/trainings${query ? `?${query}` : ''}`, signal)
}

export type CreateTrainingRequest = {
  /** DateOnly, e.g. "2026-11-05" */
  date: string
  type: TrainingType
}

export function createTraining(request: CreateTrainingRequest) {
  return apiRequest<Training | undefined>('POST', '/trainings', { body: request })
}

export function getTraining(id: string | number, signal?: AbortSignal) {
  return apiGet<Training>(`/trainings/${encodeURIComponent(id)}`, signal)
}

/** Members who attended the training. */
export function getTrainingMembers(id: string | number, signal?: AbortSignal) {
  return apiGet<Member[]>(`/trainings/${encodeURIComponent(id)}/members`, signal)
}

/** Replaces the training's attendees with `memberIds`. */
export function setTrainingMembers(id: string | number, memberIds: number[]) {
  return apiRequest<Training>('PUT', `/trainings/${encodeURIComponent(id)}/members`, { body: { memberIds } })
}
