import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { loadEnv } from '@/config/env'
import { getDb } from '@/db/client'
import { accounts, sessions, users, verifications } from '@/db/schema'
import { sendEmail } from './mailer'
import { MIN_PASSWORD_LENGTH } from './password-policy'

const env = loadEnv()

/**
 * Serverová better-auth instance. Ověřený e-mail je podmínkou přihlášení —
 * první vrstva proti jednorázovým podvodným účtům. Role: user / admin (admin plugin).
 */
export const auth = betterAuth({
  baseURL: env.APP_URL,
  secret: env.AUTH_SECRET,
  database: drizzleAdapter(getDb(), {
    provider: 'pg',
    schema: { users, sessions, accounts, verifications },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: MIN_PASSWORD_LENGTH,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Obnova hesla na SafeBazos',
        text: `Dobrý den ${user.name},\n\nheslo si nastavíte na odkazu:\n${url}\n\nPokud jste o obnovu nežádali, e-mail ignorujte.`,
      })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Potvrďte e-mail na SafeBazos',
        text: `Dobrý den ${user.name},\n\npro dokončení registrace potvrďte e-mail:\n${url}`,
      })
    },
  },
  user: { modelName: 'users' },
  session: { modelName: 'sessions' },
  account: { modelName: 'accounts' },
  verification: { modelName: 'verifications' },
  plugins: [admin()],
})
