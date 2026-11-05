import { apiGet } from './client.ts'

export type PaymentType = 'Single' | 'Bulk10'

export type Payment = {
  id: number
  memberId: number
  type: PaymentType
  amount: number
  createdAt: string
  updatedAt: string | null
}

export const paymentTypeLabels: Record<PaymentType, string> = {
  Single: 'Jednorazová',
  Bulk10: 'Permanentka (10)',
}

export function getMemberPayments(memberId: string | number, signal?: AbortSignal) {
  return apiGet<Payment[]>(`/members/${encodeURIComponent(memberId)}/payments`, signal)
}
