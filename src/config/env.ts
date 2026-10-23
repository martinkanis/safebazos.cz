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

  /** Lokální úložiště fotek — použije se, když není nastavené S3. */
  STORAGE_DIR: z.string().default('./storage'),
  /** S3-kompatibilní úložiště (Rock8cloud). Názvy odpovídají klíčům, které exportuje služba bucketu. */
  S3_ENDPOINT: z.url().optional(),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().default('us-east-1'),
  S3_FORCE_PATH_STYLE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  ADMIN_EMAIL: z.email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),

  /** Počet generovaných demo inzerátů, které se při startu doplní na pozadí (0 = žádné). */
  SEED_DEMO_LISTINGS: z.coerce.number().int().min(0).default(0),

  /**
   * Platby poukázek. Výchozí je ostrý Comgate; `fake` (simulace = poukázky zdarma)
   * se zapíná jen explicitně v lokálním .env.
   */
  PAYMENT_PROVIDER: z.enum(['comgate', 'fake']).default('comgate'),
  COMGATE_MERCHANT_ID: z.string().optional(),
  COMGATE_SECRET: z.string().optional(),
  /** Testovací režim Comgate — platby se neprovádějí doopravdy. */
  COMGATE_TEST: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),

  /** SMS pro ověření telefonu. Výchozí BulkGate; `log` (kód jen do logu) jen pro lokální vývoj. */
  SMS_PROVIDER: z.enum(['bulkgate', 'log']).default('bulkgate'),
  BULKGATE_APPLICATION_ID: z.string().optional(),
  BULKGATE_APPLICATION_TOKEN: z.string().optional(),
  /** Odesílatel SMS v BulkGate (sender_id); výchozí gSystem = systémové číslo BulkGate. */
  BULKGATE_SENDER_ID: z.string().default('gSystem'),
  BULKGATE_SENDER_VALUE: z.string().optional(),
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
