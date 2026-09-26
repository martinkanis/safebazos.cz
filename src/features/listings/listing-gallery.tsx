'use client'

import { useState } from 'react'
import { mediaUrl } from '@/lib/media-url'
import { cn } from '@/lib/utils'
import { ListingThumbnail } from './listing-thumbnail'
import type { ListingImage } from './queries'

export function ListingGallery({ images, title }: { images: ListingImage[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = images[activeIndex]

  if (!activeImage) {
    return <ListingThumbnail thumbnailKey={null} alt={title} className="aspect-[4/1] w-full" />
  }

  return (
    <div className="space-y-2">
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-ink/5">
        <img
          src={mediaUrl(activeImage.storageKey)}
          alt={`${title} – fotka ${activeIndex + 1} z ${images.length}`}
          width={activeImage.width}
          height={activeImage.height}
          className="max-h-full max-w-full object-contain"
        />
      </div>
      {images.length > 1 && (
        <ul className="grid grid-cols-5 gap-2 sm:grid-cols-8">
          {images.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Zobrazit fotku ${index + 1}`}
                aria-pressed={index === activeIndex}
                className={cn(
                  'block w-full overflow-hidden rounded-lg ring-2',
                  index === activeIndex ? 'ring-brand-600' : 'ring-transparent hover:ring-line',
                )}
              >
                <ListingThumbnail thumbnailKey={image.thumbnailKey} alt="" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
