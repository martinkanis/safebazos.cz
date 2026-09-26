import nodemailer, { type Transporter } from 'nodemailer'
import { loadEnv } from '@/config/env'
import { createLogger } from './logger'

const logger = createLogger('mailer')

let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (!transporter) {
    const env = loadEnv()
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
    })
  }
  return transporter
}

export interface EmailMessage {
  to: string
  subject: string
  text: string
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  try {
    await getTransporter().sendMail({ from: loadEnv().MAIL_FROM, ...message })
  } catch (error) {
    logger.error({ err: error, subject: message.subject }, 'Odeslání e-mailu selhalo')
    throw error
  }
}
