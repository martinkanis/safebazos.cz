/** Limity inzerátu sdílené serverovou validací a klientským formulářem (bez těžkých závislostí). */
export const TITLE_MAX_LENGTH = 100
export const DESCRIPTION_MAX_LENGTH = 5000

export const MAX_IMAGES_PER_LISTING = 10
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const ACCEPTED_IMAGE_INPUT = ACCEPTED_IMAGE_TYPES.join(',')
