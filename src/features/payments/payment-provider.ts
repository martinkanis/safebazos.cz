export interface CreatePaymentInput {
  /** Naše ID platby — u poskytovatele jako refId, podle něj párujeme. */
  paymentId: number
  amountCzk: number
  /** Krátký popis na platební bráně (Comgate: max 16 znaků). */
  label: string
  email: string
  fullName: string
  /** Kam se plátce vrátí po zaplacení / zrušení. */
  returnUrl: string
}

export interface CreatedPayment {
  transactionId: string
  redirectUrl: string
}

export type ProviderPaymentStatus = 'pending' | 'paid' | 'cancelled'

export interface ProviderPaymentState {
  status: ProviderPaymentStatus
  amountCzk: number
  paymentId: number
}

export interface PaymentProvider {
  name: string
  createPayment(input: CreatePaymentInput): Promise<CreatedPayment>
  /** Stav přímo od poskytovatele — nikdy nevěříme jen údajům z přesměrování nebo notifikace. */
  getPaymentState(transactionId: string): Promise<ProviderPaymentState>
}
