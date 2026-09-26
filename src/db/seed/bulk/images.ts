import { randomUUID } from 'node:crypto'
import type { LucideIcon } from 'lucide-react'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import sharp from 'sharp'
import type { StoredImage } from '@/features/listings/images'
import { saveObject } from '@/lib/storage'
import type { SeededRandom } from './random'

/**
 * Ilustrační obrázky pro demo inzeráty: barevný přechod + ikona podkategorie.
 * Nejsou to fotky — mají jen naplnit výpisy, aby se dal posoudit vzhled webu.
 */

const WIDTH = 1200
const HEIGHT = 900
const THUMBNAIL_SIZE = 400
const WEBP_QUALITY = 78

type Composition = 'centered' | 'detail' | 'pattern'
const COMPOSITIONS: Composition[] = ['centered', 'detail', 'pattern']

function iconMarkup(icon: LucideIcon, size: number, x: number, y: number, opacity = 1): string {
  return renderToStaticMarkup(
    createElement(icon, { size, x, y, color: 'white', strokeWidth: 1.2, opacity }),
  )
}

function background(hue: number, random: SeededRandom): string {
  const hueShift = random.integer(20, 60)
  const angle = random.pick(['0 0 1 1', '1 0 0 1', '0 1 1 0'])
  const [x1, y1, x2, y2] = angle.split(' ')
  return `<defs><linearGradient id="bg" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
    <stop offset="0" stop-color="hsl(${hue},${random.integer(45, 70)}%,${random.integer(45, 60)}%)"/>
    <stop offset="1" stop-color="hsl(${(hue + hueShift) % 360},${random.integer(40, 65)}%,${random.integer(22, 34)}%)"/>
  </linearGradient></defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>`
}

function compositionSvg(composition: Composition, icon: LucideIcon, random: SeededRandom): string {
  switch (composition) {
    case 'centered': {
      const size = random.integer(380, 460)
      return `<circle cx="${random.integer(850, 1100)}" cy="${random.integer(80, 260)}" r="${random.integer(160, 260)}" fill="white" fill-opacity="0.08"/>
        <circle cx="${random.integer(80, 300)}" cy="${random.integer(650, 850)}" r="${random.integer(220, 320)}" fill="black" fill-opacity="0.08"/>
        <ellipse cx="600" cy="${450 + size / 2 - 20}" rx="${size * 0.7}" ry="26" fill="black" fill-opacity="0.18"/>
        ${iconMarkup(icon, size, 600 - size / 2, 450 - size / 2 - 30)}`
    }
    case 'detail': {
      const size = random.integer(900, 1100)
      return iconMarkup(icon, size, random.integer(-200, 250), random.integer(-250, 50), 0.9)
    }
    case 'pattern': {
      const tiles: string[] = []
      for (let row = 0; row < 4; row++) {
        for (let column = 0; column < 5; column++) {
          tiles.push(
            iconMarkup(icon, 120, 60 + column * 230 + (row % 2) * 115, 50 + row * 220, 0.14),
          )
        }
      }
      return `${tiles.join('')}<rect x="360" y="230" width="480" height="440" rx="48" fill="black" fill-opacity="0.18"/>
        ${iconMarkup(icon, 300, 450, 300)}`
    }
  }
}

async function renderImage(svg: string): Promise<{ full: Buffer; thumbnail: Buffer }> {
  const source = Buffer.from(svg)
  const [full, thumbnail] = await Promise.all([
    sharp(source).webp({ quality: WEBP_QUALITY }).toBuffer(),
    sharp(source)
      .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: 'cover' })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer(),
  ])
  return { full, thumbnail }
}

/** Vygeneruje a uloží sadu obrázků jednoho inzerátu (první = hlavní kompozice). */
export async function generateListingImages(
  icon: LucideIcon,
  hue: number,
  count: number,
  random: SeededRandom,
): Promise<StoredImage[]> {
  const svgs = Array.from({ length: count }, (_, index) => {
    const composition = index === 0 ? 'centered' : random.pick(COMPOSITIONS)
    const body = compositionSvg(composition, icon, random)
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">${background(hue, random)}${body}</svg>`
  })

  return Promise.all(
    svgs.map(async (svg) => {
      const { full, thumbnail } = await renderImage(svg)
      const baseKey = `listings/${randomUUID()}`
      const image: StoredImage = {
        storageKey: `${baseKey}.webp`,
        thumbnailKey: `${baseKey}_thumb.webp`,
        width: WIDTH,
        height: HEIGHT,
      }
      await Promise.all([
        saveObject(image.storageKey, full),
        saveObject(image.thumbnailKey, thumbnail),
      ])
      return image
    }),
  )
}
