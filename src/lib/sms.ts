import { loadEnv, type Env } from '@/config/env'
import { createLogger } from './logger'

const logger = createLogger('sms')

const BULKGATE_TRANSACTIONAL_URL = 'https://portal.bulkgate.com/api/1.0/simple/transactional'

export interface SmsMessage {
  /** Mezinárodní formát bez +, např. 420777123456. */
  phone: string
  text: string
}

async function sendViaBulkGate(env: Env, message: SmsMessage): Promise<void> {
  if (!env.BULKGATE_APPLICATION_ID || !env.BULKGATE_APPLICATION_TOKEN) {
    throw new Error(
      'BulkGate není nastavený: chybí BULKGATE_APPLICATION_ID nebo BULKGATE_APPLICATION_TOKEN',
    )
  }
  const response = await fetch(BULKGATE_TRANSACTIONAL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      application_id: env.BULKGATE_APPLICATION_ID,
      application_token: env.BULKGATE_APPLICATION_TOKEN,
      number: message.phone,
      text: message.text,
      unicode: false,
      sender_id: env.BULKGATE_SENDER_ID,
      sender_id_value: env.BULKGATE_SENDER_VALUE,
      duplicates_check: 'on',
    }),
  })
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`BulkGate odmítl SMS (HTTP ${response.status}): ${body}`)
  }
}

/** Odešle SMS. V režimu `log` (lokální vývoj) text jen zapíše do logu. */
export async function sendSms(message: SmsMessage): Promise<void> {
  const env = loadEnv()
  if (env.SMS_PROVIDER === 'log') {
    logger.warn({ phone: message.phone, text: message.text }, 'SMS neodeslána (SMS_PROVIDER=log)')
    return
  }
  await sendViaBulkGate(env, message)
}
