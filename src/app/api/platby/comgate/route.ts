import { loadEnv } from '@/config/env'
import { isAuthenticComgateNotification } from '@/features/payments/comgate'
import { settlePayment } from '@/features/topping/payment-settlement'
import { createLogger } from '@/lib/logger'

const logger = createLogger('comgate-notification')

/** Odpověď, kterou Comgate očekává po úspěšném zpracování notifikace. */
const ACKNOWLEDGEMENT = 'code=0&message=OK'

/**
 * Notifikace o výsledku platby z Comgate (URL se nastavuje v portálu Comgate).
 * Stav si po ověření hesla stejně znovu vyžádáme přes API — viz settlePayment.
 */
export async function POST(request: Request): Promise<Response> {
  const notification = new URLSearchParams(await request.text())
  const transactionId = notification.get('transId')
  const isAuthentic = isAuthenticComgateNotification(loadEnv(), {
    merchant: notification.get('merchant'),
    secret: notification.get('secret'),
  })
  if (!isAuthentic || !transactionId) {
    logger.warn({ transactionId }, 'Neověřená notifikace Comgate odmítnuta')
    return new Response('code=1&message=Unauthorized', { status: 401 })
  }

  try {
    await settlePayment(transactionId)
  } catch (error) {
    logger.error({ err: error, transactionId }, 'Zpracování notifikace Comgate selhalo')
    // Chybová odpověď → Comgate notifikaci zopakuje později.
    return new Response('code=1&message=Error', { status: 500 })
  }
  return new Response(ACKNOWLEDGEMENT, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}
