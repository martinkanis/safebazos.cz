import { z } from 'zod'

/**
 * Serverové proměnné prostředí — validované při prvním použití.
 * Chybějící/nevalidní hodnota = okamžitý pád s čitelnou chybou, ne tichý undefined.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.url(),
  APP_URL: z.url().default('http://localhost:3010'),
  AUTH_SECRET: z.string().min(16),

  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().int().default(1035),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  MAIL_FROM: z.string().default('SafeBazos <info@safebazos.cz>'),

  STORAGE_DIR: z.string().default('./storage'),

  ADMIN_EMAIL: z.email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
})

export type Env = z.infer<typeof envSchema>

let cachedEnv: Env | null = null

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  if (cachedEnv) return cachedEnv
  const parsed = envSchema.safeParse(source)
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n')
    throw new Error(`Nevalidní konfigurace prostředí:\n${issues}`)
  }
  cachedEnv = parsed.data
  return cachedEnv
}
