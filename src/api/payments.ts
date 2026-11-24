import { apiGet, apiRequest } from './client.ts'

export type PaymentType = 'Single' | 'Bulk10' | 'SinglePrivate' | 'Bulk5Private' | 'SingleRecommendation'

export type Payment = {
  id: number
  memberId: number
  type: PaymentType
  amount: number
  /** Date the payment was actually made, "YYYY-MM-DD". */
  paidAt: string
  createdAt: string
  updatedAt: string | null
}

export const paymentTypeLabels: Record<PaymentType, string> = {
  Single: 'Jednorazová',
  Bulk10: 'Permanentka (10)',
  SinglePrivate: 'Súkromný tréning',
  Bulk5Private: 'Súkromná permanentka (5)',
  SingleRecommendation: 'Jednorazová (odporúčanie)',
}

/**
 * Badge style per type: group entries green, private entries violet, recommendation teal.
 * Single entries are filled, passes are light.
 */
export const paymentTypeBadge: Record<PaymentType, { color: string; variant: 'filled' | 'light' }> = {
  Single: { color: 'green.8', variant: 'filled' },
  Bulk10: { color: 'green', variant: 'light' },
  SinglePrivate: { color: 'violet.8', variant: 'filled' },
  Bulk5Private: { color: 'violet', variant: 'light' },
  SingleRecommendation: { color: 'teal', variant: 'light' },
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
  /** "YYYY-MM-DD" */
  paidAt: string
}

/** POST /payments. The amount is priced by the server from the payment type. */
export function createPayment(request: CreatePaymentRequest) {
  return apiRequest<Payment>('POST', '/payments', { body: request })
}

export type UpdatePaymentRequest = {
  type: PaymentType
  /** "YYYY-MM-DD" */
  paidAt: string
}

/** PUT /payments/{id}. Type and payment date can change; the server re-prices the amount from the type. */
export function updatePayment(id: number, request: UpdatePaymentRequest) {
  return apiRequest<Payment>('PUT', `/payments/${encodeURIComponent(id)}`, { body: request })
}

export type PaymentTotal = {
  memberId: number
  fullName: string
  /** Group trainings left (all non-private types): purchased minus attended. Can be negative. */
  groupCount: number
  /** Private trainings left: purchased minus attended. Can be negative. */
  privateCount: number
}

/** GET /payments/totals. One row per active member. */
export function getPaymentTotals(signal?: AbortSignal) {
  return apiGet<PaymentTotal[]>('/payments/totals', signal)
}

export function getMemberPaymentTotal(memberId: string | number, signal?: AbortSignal) {
  return apiGet<PaymentTotal>(`/members/${encodeURIComponent(memberId)}/payments/total`, signal)
}
