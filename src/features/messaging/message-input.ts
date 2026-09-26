import { z } from 'zod'

export const MESSAGE_MAX_LENGTH = 2000

export const messageBodySchema = z
  .string()
  .trim()
  .min(1, { error: 'Napište zprávu.' })
  .max(MESSAGE_MAX_LENGTH, { error: `Zpráva může mít nejvýše ${MESSAGE_MAX_LENGTH} znaků.` })
