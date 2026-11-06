import { apiGet, apiRequest } from './client.ts'

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

export const paymentTypeOptions = (Object.keys(paymentTypeLabels) as PaymentType[]).map((value) => ({
  value,
  label: paymentTypeLabels[value],
}))

export function getPayments(signal?: AbortSignal) {
  return apiGet<Payment[]>('/payments', signal)
}

export function getMemberPayments(memberId: string | number, signal?: AbortSignal) {
  return apiGet<Payment[]>(`/members/${encodeURIComponent(memberId)}/payments`, signal)
}

export type CreatePaymentRequest = {
  memberId: number
  type: PaymentType
}

/** POST /payments. The amount is priced by the server from the payment type. */
export function createPayment(request: CreatePaymentRequest) {
  return apiRequest<Payment>('POST', '/payments', { body: request })
}

/** PUT /payments/{id}. Only the type can change; the server re-prices the amount. */
export function updatePayment(id: number, type: PaymentType) {
  return apiRequest<Payment>('PUT', `/payments/${encodeURIComponent(id)}`, { body: { type } })
}

export type PaymentTotal = {
  memberId: number
  fullName: string
  /** Trainings left: purchased minus attended. Can be negative. */
  count: number
}

/** GET /payments/totals. One row per active member. */
export function getPaymentTotals(signal?: AbortSignal) {
  return apiGet<PaymentTotal[]>('/payments/totals', signal)
}

export function getMemberPaymentTotal(memberId: string | number, signal?: AbortSignal) {
  return apiGet<PaymentTotal>(`/members/${encodeURIComponent(memberId)}/payments/total`, signal)
}
