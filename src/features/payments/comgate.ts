import { timingSafeEqual } from 'node:crypto'
import type { Env } from '@/config/env'
import type {
  CreatedPayment,
  CreatePaymentInput,
  PaymentProvider,
  ProviderPaymentState,
  ProviderPaymentStatus,
} from './payment-provider'

/** Comgate API v1.0 — https://apidoc.comgate.cz/en/api/post/ */
const COMGATE_API_URL = 'https://payments.comgate.cz/v1.0'
const HALERU_PER_KORUNA = 100
const COMGATE_OK_CODE = '0'

const STATUS_MAP: Record<string, ProviderPaymentStatus> = {
  PAID: 'paid',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
  AUTHORIZED: 'pending',
}

interface ComgateCredentials {
  merchantId: string
  secret: string
  isTest: boolean
}

function credentialsFrom(env: Env): ComgateCredentials {
  if (!env.COMGATE_MERCHANT_ID || !env.COMGATE_SECRET) {
    throw new Error('Comgate není nastavený: chybí COMGATE_MERCHANT_ID nebo COMGATE_SECRET')
  }
  return {
    merchantId: env.COMGATE_MERCHANT_ID,
    secret: env.COMGATE_SECRET,
    isTest: env.COMGATE_TEST,
  }
}

async function callComgate(
  method: string,
  params: Record<string, string>,
): Promise<URLSearchParams> {
  const response = await fetch(`${COMGATE_API_URL}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  })
  const result = new URLSearchParams(await response.text())
  if (!response.ok || result.get('code') !== COMGATE_OK_CODE) {
    throw new Error(
      `Comgate ${method} selhal (HTTP ${response.status}, code ${result.get('code')}): ${result.get('message')}`,
    )
  }
  return result
}

function requiredField(result: URLSearchParams, name: string): string {
  const value = result.get(name)
  if (!value) throw new Error(`Comgate odpověď neobsahuje pole ${name}`)
  return value
}

export function createComgateProvider(env: Env): PaymentProvider {
  return {
    name: 'comgate',

    async createPayment(input: CreatePaymentInput): Promise<CreatedPayment> {
      const credentials = credentialsFrom(env)
      const result = await callComgate('create', {
        merchant: credentials.merchantId,
        secret: credentials.secret,
        test: String(credentials.isTest),
        price: String(input.amountCzk * HALERU_PER_KORUNA),
        curr: 'CZK',
        label: input.label,
        refId: String(input.paymentId),
        method: 'ALL',
        country: 'CZ',
        lang: 'cs',
        email: input.email,
        fullName: input.fullName,
        prepareOnly: 'true',
        url_paid: input.returnUrl,
        url_cancelled: input.returnUrl,
        url_pending: input.returnUrl,
      })
      return {
        transactionId: requiredField(result, 'transId'),
        redirectUrl: requiredField(result, 'redirect'),
      }
    },

    async getPaymentState(transactionId: string): Promise<ProviderPaymentState> {
      const credentials = credentialsFrom(env)
      const result = await callComgate('status', {
        merchant: credentials.merchantId,
        secret: credentials.secret,
        transId: transactionId,
      })
      const status = STATUS_MAP[requiredField(result, 'status')]
      if (!status) throw new Error(`Neznámý stav Comgate platby: ${result.get('status')}`)
      return {
        status,
        amountCzk: Number(requiredField(result, 'price')) / HALERU_PER_KORUNA,
        paymentId: Number(requiredField(result, 'refId')),
      }
    },
  }
}

function constantTimeEquals(expected: string, actual: string): boolean {
  const expectedBytes = Buffer.from(expected)
  const actualBytes = Buffer.from(actual)
  return expectedBytes.length === actualBytes.length && timingSafeEqual(expectedBytes, actualBytes)
}

/** Ověří, že notifikace opravdu přišla od Comgate (shoda merchant ID a tajného hesla). */
export function isAuthenticComgateNotification(
  env: Env,
  notification: { merchant: string | null; secret: string | null },
): boolean {
  if (!env.COMGATE_MERCHANT_ID || !env.COMGATE_SECRET) return false
  return (
    notification.merchant === env.COMGATE_MERCHANT_ID &&
    constantTimeEquals(env.COMGATE_SECRET, notification.secret ?? '')
  )
}
