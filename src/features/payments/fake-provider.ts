import type {
  CreatedPayment,
  CreatePaymentInput,
  PaymentProvider,
  ProviderPaymentState,
  ProviderPaymentStatus,
} from './payment-provider'

/**
 * Simulace platební brány pro lokální vývoj (PAYMENT_PROVIDER=fake). Výsledek
 * „platby“ nastaví testovací stránka /topovani/testovaci-platba.
 */

interface FakePayment {
  paymentId: number
  amountCzk: number
  status: ProviderPaymentStatus
}

const TRANSACTION_PREFIX = 'FAKE-'

// Dev server může modul načíst víckrát — stav držíme na globalThis.
const globalForFake = globalThis as typeof globalThis & { fakePayments?: Map<string, FakePayment> }
const fakePayments = (globalForFake.fakePayments ??= new Map<string, FakePayment>())

export function fakeTransactionId(paymentId: number): string {
  return `${TRANSACTION_PREFIX}${paymentId}`
}

export function setFakePaymentStatus(transactionId: string, status: ProviderPaymentStatus): void {
  const payment = fakePayments.get(transactionId)
  if (!payment) throw new Error(`Testovací platba ${transactionId} neexistuje`)
  payment.status = status
}

export const fakePaymentProvider: PaymentProvider = {
  name: 'fake',

  createPayment(input: CreatePaymentInput): Promise<CreatedPayment> {
    const transactionId = fakeTransactionId(input.paymentId)
    fakePayments.set(transactionId, {
      paymentId: input.paymentId,
      amountCzk: input.amountCzk,
      status: 'pending',
    })
    return Promise.resolve({
      transactionId,
      redirectUrl: `/topovani/testovaci-platba?platba=${input.paymentId}`,
    })
  },

  getPaymentState(transactionId: string): Promise<ProviderPaymentState> {
    const payment = fakePayments.get(transactionId)
    if (!payment) return Promise.reject(new Error(`Testovací platba ${transactionId} neexistuje`))
    return Promise.resolve({ ...payment })
  },
}
