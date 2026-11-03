import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import { loadEnv } from '@/config/env'
import type { MainCategory } from '@/features/categories/queries'
import { createLogger } from '@/lib/logger'
import type { AiPhotoType } from './ai-config'
import { normalizeSuggestion, type ListingSuggestion } from './normalize-suggestion'
import { listingSuggestionSchema } from './suggestion-schema'
import { buildSystemPrompt } from './system-prompt'

const logger = createLogger('ai-listing')

const REQUEST_TIMEOUT_MS = 60_000
const MAX_RETRIES = 1
/** Zahrnuje i přemýšlení modelu (adaptive thinking), samotný návrh je krátký. */
const MAX_OUTPUT_TOKENS = 8_000
/** Při odmítnutí bezpečnostním filtrem zkusí API jiný model (Claude API, režim „default“). */
const SERVER_SIDE_FALLBACK_BETA = 'server-side-fallback-2026-07-01'
const USER_INSTRUCTION = 'Navrhni inzerát z těchto fotek.'

export interface PhotoInput {
  mediaType: AiPhotoType
  base64: string
}

export interface SuggestionUsage {
  inputTokens: number
  cacheReadTokens: number
  outputTokens: number
}

export type SuggestionOutcome =
  | { status: 'succeeded'; suggestion: ListingSuggestion; usage: SuggestionUsage }
  | { status: 'not_sellable'; usage: SuggestionUsage }
  | { status: 'refused'; usage: SuggestionUsage }
  | {
      status: 'failed'
      reason: 'busy' | 'unavailable' | 'invalid_output'
      usage: SuggestionUsage | null
    }

let client: Anthropic | null = null

function getClient(apiKey: string): Anthropic {
  client ??= new Anthropic({ apiKey, timeout: REQUEST_TIMEOUT_MS, maxRetries: MAX_RETRIES })
  return client
}

function knownSubcategoryIds(categoryTree: MainCategory[]): Set<number> {
  return new Set(categoryTree.flatMap((main) => main.subcategories.map((sub) => sub.id)))
}

/** Chyby API → výsledek pro uživatele. Neznámé chyby (mimo SDK) propadnou výš. */
function outcomeForError(error: unknown): SuggestionOutcome {
  if (error instanceof Anthropic.APIError && (error.status === 429 || (error.status ?? 0) >= 500)) {
    logger.warn({ err: error, status: error.status }, 'AI je přetížená')
    return { status: 'failed', reason: 'busy', usage: null }
  }
  if (error instanceof Anthropic.APIConnectionError) {
    logger.warn({ err: error }, 'AI neodpověděla (spojení / timeout)')
    return { status: 'failed', reason: 'unavailable', usage: null }
  }
  if (error instanceof Anthropic.AnthropicError) {
    // 400/401/403/404 = chyba konfigurace nebo požadavku, ne uživatele.
    logger.error({ err: error }, 'Volání AI selhalo')
    return { status: 'failed', reason: 'unavailable', usage: null }
  }
  throw error
}

/** Z fotek navrhne inzerát. Výstup modelu se před použitím normalizuje jako nedůvěryhodný vstup. */
export async function suggestListingFromPhotos(
  photos: PhotoInput[],
  categoryTree: MainCategory[],
): Promise<SuggestionOutcome> {
  const env = loadEnv()
  if (!env.ANTHROPIC_API_KEY)
    throw new Error('AI návrh inzerátu není nastavený (chybí ANTHROPIC_API_KEY)')

  let response
  try {
    response = await getClient(env.ANTHROPIC_API_KEY).beta.messages.parse({
      model: env.AI_LISTING_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      betas: [SERVER_SIDE_FALLBACK_BETA],
      fallbacks: 'default',
      system: [
        {
          type: 'text',
          text: buildSystemPrompt(categoryTree),
          cache_control: { type: 'ephemeral' },
        },
      ],
      output_config: {
        effort: env.AI_LISTING_EFFORT,
        format: betaZodOutputFormat(listingSuggestionSchema),
      },
      messages: [
        {
          role: 'user',
          content: [
            ...photos.map((photo) => ({
              type: 'image' as const,
              source: { type: 'base64' as const, media_type: photo.mediaType, data: photo.base64 },
            })),
            { type: 'text' as const, text: USER_INSTRUCTION },
          ],
        },
      ],
    })
  } catch (error) {
    return outcomeForError(error)
  }

  const usage: SuggestionUsage = {
    inputTokens: response.usage.input_tokens,
    cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
    outputTokens: response.usage.output_tokens,
  }
  if (response.stop_reason === 'refusal') return { status: 'refused', usage }

  const parsed = response.parsed_output
  if (!parsed) {
    logger.warn({ stopReason: response.stop_reason }, 'AI nevrátila platný návrh')
    return { status: 'failed', reason: 'invalid_output', usage }
  }
  if (!parsed.isSellableItem) return { status: 'not_sellable', usage }

  return {
    status: 'succeeded',
    suggestion: normalizeSuggestion(parsed, knownSubcategoryIds(categoryTree)),
    usage,
  }
}
