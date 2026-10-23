import { loadEnv } from '@/config/env'
import { createComgateProvider } from './comgate'
import { fakePaymentProvider } from './fake-provider'
import type { PaymentProvider } from './payment-provider'

export function getPaymentProvider(): PaymentProvider {
  const env = loadEnv()
  return env.PAYMENT_PROVIDER === 'fake' ? fakePaymentProvider : createComgateProvider(env)
}
