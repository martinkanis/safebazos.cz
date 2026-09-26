import { randomUUID } from 'node:crypto'
import sharp from 'sharp'
import { saveObject } from '@/lib/storage'
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGES_PER_LISTING, MAX_UPLOAD_BYTES } from './listing-limits'

const FULL_SIZE_PX = 1600
const THUMBNAIL_SIZE_PX = 400
const WEBP_QUALITY = 80

export interface StoredImage {
  storageKey: string
  thumbnailKey: string
  width: number
  height: number
}

/** Chyba pro uživatele, nebo null, když jsou soubory v pořádku. */
export function validateImageFiles(files: File[], existingCount: number): string | null {
  if (existingCount + files.length > MAX_IMAGES_PER_LISTING) {
    return `Inzerát může mít nejvýše ${MAX_IMAGES_PER_LISTING} fotek.`
  }
  const invalidType = files.find((file) => !ACCEPTED_IMAGE_TYPES.includes(file.type))
  if (invalidType) {
    return `Soubor „${invalidType.name}“ není podporovaný obrázek (JPG, PNG nebo WebP).`
  }
  const tooLarge = files.find((file) => file.size > MAX_UPLOAD_BYTES)
  if (tooLarge) {
    return `Soubor „${tooLarge.name}“ je větší než 10 MB.`
  }
  return null
}

/**
 * Překóduje fotku do WebP (plná velikost + náhled). Sharp ve výchozím stavu
 * zahazuje metadata — tím mizí i EXIF s GPS polohou, kde byla fotka pořízena
 * (u bazarových fotek typicky adresa prodejce).
 */
async function encodeImage(input: Buffer) {
  const oriented = sharp(input).rotate()
  const full = await oriented
    .clone()
    .resize(FULL_SIZE_PX, FULL_SIZE_PX, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer({ resolveWithObject: true })
  const thumbnail = await oriented
    .clone()
    .resize(THUMBNAIL_SIZE_PX, THUMBNAIL_SIZE_PX, { fit: 'cover' })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer()
  return { full, thumbnail }
}

/** Zpracuje a uloží fotky. Klíče nezávisí na ID inzerátu, takže jde uložit před zápisem do DB. */
export async function storeListingImages(files: File[]): Promise<StoredImage[]> {
  const stored: StoredImage[] = []
  for (const file of files) {
    const { full, thumbnail } = await encodeImage(Buffer.from(await file.arrayBuffer()))
    const baseKey = `listings/${randomUUID()}`
    const image: StoredImage = {
      storageKey: `${baseKey}.webp`,
      thumbnailKey: `${baseKey}_thumb.webp`,
      width: full.info.width,
      height: full.info.height,
    }
    await saveObject(image.storageKey, full.data)
    await saveObject(image.thumbnailKey, thumbnail)
    stored.push(image)
  }
  return stored
}
