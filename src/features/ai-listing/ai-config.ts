import { loadEnv } from '@/config/env'

/** Funkce „inzerát z fotek“ se nabízí jen s nastaveným klíčem k Anthropic API. */
export function isAiListingEnabled(): boolean {
  return Boolean(loadEnv().ANTHROPIC_API_KEY)
}

/** Kolik fotek posíláme modelu — víc fotek zvyšuje cenu, rozpoznání už moc nezlepší. */
export const MAX_AI_PHOTOS = 5
export const MAX_AI_PHOTO_BYTES = 3.5 * 1024 * 1024
export const AI_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export type AiPhotoType = (typeof AI_PHOTO_TYPES)[number]
