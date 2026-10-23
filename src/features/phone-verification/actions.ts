'use server'

import { and, count, desc, eq, gt, isNotNull, isNull, ne, sql } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { loadEnv } from '@/config/env'
import { getDb } from '@/db/client'
import { phoneVerificationCodes, users } from '@/db/schema'
import { safeReturnPath } from '@/features/auth/return-path'
import { formString } from '@/lib/form'
import { createLogger } from '@/lib/logger'
import { requireUser } from '@/lib/require-user'
import { sendSms } from '@/lib/sms'
import type { PhoneVerificationState } from './form-state'
import { normalizePhoneNumber } from './phone-number'
import { generateVerificationCode, hashVerificationCode, isSameHash } from './verification-code'

const logger = createLogger('phone-verification')

const CODE_TTL_MINUTES = 10
/** Každá SMS stojí peníze — limit brání vyčerpání kreditu zneužitím formuláře. */
const MAX_CODES_PER_HOUR = 3
const MAX_FAILED_ATTEMPTS = 5

async function isPhoneVerifiedByAnotherUser(phone: string, userId: string): Promise<boolean> {
  const [row] = await getDb()
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.phone, phone), isNotNull(users.phoneVerifiedAt), ne(users.id, userId)))
    .limit(1)
  return row !== undefined
}

async function countRecentCodes(userId: string): Promise<number> {
  const [row] = await getDb()
    .select({ total: count() })
    .from(phoneVerificationCodes)
    .where(
      and(
        eq(phoneVerificationCodes.userId, userId),
        gt(phoneVerificationCodes.createdAt, sql`now() - interval '1 hour'`),
      ),
    )
  return row?.total ?? 0
}

export async function requestPhoneCode(
  _previousState: PhoneVerificationState,
  formData: FormData,
): Promise<PhoneVerificationState> {
  const user = await requireUser('/muj-ucet/overeni-telefonu')
  const phone = normalizePhoneNumber(formString(formData, 'phone'))
  if (!phone) {
    return { status: 'error', message: 'Zadejte české nebo slovenské mobilní číslo.' }
  }
  if (await isPhoneVerifiedByAnotherUser(phone, user.id)) {
    return { status: 'error', message: 'Toto číslo je už ověřené u jiného účtu.' }
  }
  if ((await countRecentCodes(user.id)) >= MAX_CODES_PER_HOUR) {
    return {
      status: 'error',
      message: 'Poslali jsme už několik kódů. Další si vyžádejte za hodinu.',
    }
  }

  const code = generateVerificationCode()
  await getDb()
    .insert(phoneVerificationCodes)
    .values({
      userId: user.id,
      phone,
      codeHash: hashVerificationCode({
        code,
        userId: user.id,
        phone,
        secret: loadEnv().AUTH_SECRET,
      }),
      expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
    })

  try {
    // Bez diakritiky: SMS s diakritikou má kratší limit a stojí víc.
    await sendSms({
      phone,
      text: `SafeBazos: overovaci kod ${code}. Plati ${CODE_TTL_MINUTES} minut. Nikomu ho nesdelujte.`,
    })
  } catch (error) {
    logger.error({ err: error, userId: user.id }, 'Odeslání ověřovací SMS selhalo')
    return {
      status: 'error',
      message: 'SMS se nepodařilo odeslat. Zkuste to prosím za chvíli.',
      phone,
    }
  }
  return { status: 'code_sent', phone }
}

export async function confirmPhoneCode(
  _previousState: PhoneVerificationState,
  formData: FormData,
): Promise<PhoneVerificationState> {
  const user = await requireUser('/muj-ucet/overeni-telefonu')
  const phone = normalizePhoneNumber(formString(formData, 'phone'))
  const code = formString(formData, 'code').replace(/\s/g, '')
  if (!phone) return { status: 'error', message: 'Neplatné telefonní číslo.' }

  const [pendingCode] = await getDb()
    .select({
      id: phoneVerificationCodes.id,
      codeHash: phoneVerificationCodes.codeHash,
      failedAttempts: phoneVerificationCodes.failedAttempts,
    })
    .from(phoneVerificationCodes)
    .where(
      and(
        eq(phoneVerificationCodes.userId, user.id),
        eq(phoneVerificationCodes.phone, phone),
        isNull(phoneVerificationCodes.consumedAt),
        gt(phoneVerificationCodes.expiresAt, sql`now()`),
      ),
    )
    .orderBy(desc(phoneVerificationCodes.createdAt))
    .limit(1)

  if (!pendingCode) {
    return { status: 'error', message: 'Kód vypršel. Vyžádejte si nový.', phone }
  }
  if (pendingCode.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    return {
      status: 'error',
      message: 'Příliš mnoho chybných pokusů. Vyžádejte si nový kód.',
      phone,
    }
  }

  const submittedHash = hashVerificationCode({
    code,
    userId: user.id,
    phone,
    secret: loadEnv().AUTH_SECRET,
  })
  if (!isSameHash(pendingCode.codeHash, submittedHash)) {
    await getDb()
      .update(phoneVerificationCodes)
      .set({ failedAttempts: sql`${phoneVerificationCodes.failedAttempts} + 1` })
      .where(eq(phoneVerificationCodes.id, pendingCode.id))
    return { status: 'error', message: 'Kód nesouhlasí, zkuste to znovu.', phone }
  }
  if (await isPhoneVerifiedByAnotherUser(phone, user.id)) {
    return { status: 'error', message: 'Toto číslo je už ověřené u jiného účtu.' }
  }

  const verifiedAt = new Date()
  await getDb().transaction(async (tx) => {
    await tx
      .update(phoneVerificationCodes)
      .set({ consumedAt: verifiedAt })
      .where(eq(phoneVerificationCodes.id, pendingCode.id))
    await tx.update(users).set({ phone, phoneVerifiedAt: verifiedAt }).where(eq(users.id, user.id))
  })
  logger.info({ userId: user.id }, 'Telefon ověřen')
  redirect(safeReturnPath(formString(formData, 'returnTo')))
}
