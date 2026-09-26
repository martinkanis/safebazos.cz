import { ImageOff } from 'lucide-react'
import { mediaUrl } from '@/lib/media-url'
import { cn } from '@/lib/utils'

interface ListingThumbnailProps {
  thumbnailKey: string | null
  alt: string
  className?: string
}

/** Čtvercový náhled (400×400 WebP), bez fotky neutrální zástupný symbol. */
export function ListingThumbnail({ thumbnailKey, alt, className }: ListingThumbnailProps) {
  if (!thumbnailKey) {
    return (
      <div
        className={cn(
          'flex aspect-square items-center justify-center rounded-lg bg-canvas text-muted/50',
          className,
        )}
      >
        <ImageOff className="size-8" aria-hidden />
        <span className="sr-only">Bez fotky</span>
      </div>
    )
  }
  // Náhled je už zmenšený WebP — optimalizace přes next/image by nic nepřinesla.
  return (
    <img
      src={mediaUrl(thumbnailKey)}
      alt={alt}
      width={400}
      height={400}
      loading="lazy"
      decoding="async"
      className={cn('aspect-square rounded-lg bg-canvas object-cover', className)}
    />
  )
}
