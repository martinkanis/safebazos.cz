'use server'

import { and, count, eq, gt, sql } from 'drizzle-orm'
import { loadEnv } from '@/config/env'
import { getDb } from '@/db/client'
import { aiListingSuggestions } from '@/db/schema'
import { getCategoryTree } from '@/features/categories/queries'
import { formFiles } from '@/lib/form'
import { createLogger } from '@/lib/logger'
import { requireUser } from '@/lib/require-user'
import {
  AI_PHOTO_TYPES,
  isAiListingEnabled,
  MAX_AI_PHOTO_BYTES,
  MAX_AI_PHOTOS,
  type AiPhotoType,
} from './ai-config'
import type { AiSuggestionState } from './form-state'
import {
  suggestListingFromPhotos,
  type PhotoInput,
  type SuggestionOutcome,
} from './suggest-listing'

const logger = createLogger('ai-listing')

/** Každý návrh stojí peníze — limit brání zneužití (a nečekanému účtu). */
const MAX_AI_SUGGESTIONS_PER_DAY = 20

const OUTCOME_MESSAGES: Record<Exclude<SuggestionOutcome['status'], 'succeeded'>, string> = {
  not_sellable:
    'Na fotkách jsme nepoznali věc k prodeji. Zkuste jiné fotky, nebo inzerát vyplňte ručně.',
  refused: 'Tyto fotky AI nezpracuje. Inzerát prosím vyplňte ručně.',
  failed: 'AI teď návrh nevytvořila. Zkuste to za chvíli, nebo inzerát vyplňte ručně.',
}

function isAcceptedPhotoType(type: string): type is AiPhotoType {
  return (AI_PHOTO_TYPES as readonly string[]).includes(type)
}

async function countTodaysSuggestions(userId: string): Promise<number> {
  const [row] = await getDb()
    .select({ total: count() })
    .from(aiListingSuggestions)
    .where(
      and(
        eq(aiListingSuggestions.userId, userId),
        gt(aiListingSuggestions.createdAt, sql`now() - interval '1 day'`),
      ),
    )
  return row?.total ?? 0
}

async function toPhotoInputs(files: File[]): Promise<PhotoInput[]> {
  return Promise.all(
    files.map(async (file) => ({
      mediaType: file.type as AiPhotoType,
      base64: Buffer.from(await file.arrayBuffer()).toString('base64'),
    })),
  )
}

async function recordSuggestion(userId: string, photoCount: number, outcome: SuggestionOutcome) {
  const usage = outcome.usage
  await getDb()
    .insert(aiListingSuggestions)
    .values({
      userId,
      model: loadEnv().AI_LISTING_MODEL,
      status: outcome.status,
      photoCount,
      inputTokens: usage?.inputTokens ?? 0,
      cacheReadTokens: usage?.cacheReadTokens ?? 0,
      outputTokens: usage?.outputTokens ?? 0,
    })
}

/** Inzerát z fotek: AI pozná zboží a navrhne nadpis, popis, kategorii a cenu. */
export async function suggestListingFromPhotosAction(
  formData: FormData,
): Promise<AiSuggestionState> {
  const user = await requireUser('/pridat-inzerat')
  if (!isAiListingEnabled())
    return { status: 'error', message: 'Návrh inzerátu z fotek teď není dostupný.' }

  const photos = formFiles(formData, 'photos').slice(0, MAX_AI_PHOTOS)
  if (photos.length === 0) return { status: 'error', message: 'Vyberte alespoň jednu fotku.' }
  const invalidPhoto = photos.find(
    (photo) => !isAcceptedPhotoType(photo.type) || photo.size > MAX_AI_PHOTO_BYTES,
  )
  if (invalidPhoto)
    return { status: 'error', message: `Fotku „${invalidPhoto.name}“ se nepodařilo zpracovat.` }

  if ((await countTodaysSuggestions(user.id)) >= MAX_AI_SUGGESTIONS_PER_DAY) {
    return {
      status: 'error',
      message: 'Dnešní limit návrhů z fotek je vyčerpaný. Inzerát vyplňte ručně.',
    }
  }

  const outcome = await suggestListingFromPhotos(
    await toPhotoInputs(photos),
    await getCategoryTree(),
  )
  await recordSuggestion(user.id, photos.length, outcome)
  logger.info(
    { userId: user.id, status: outcome.status, usage: outcome.usage },
    'AI návrh inzerátu',
  )

  if (outcome.status !== 'succeeded')
    return { status: 'error', message: OUTCOME_MESSAGES[outcome.status] }
  return { status: 'succeeded', suggestion: outcome.suggestion }
}
