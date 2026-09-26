import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  /** Adresa stránky N (stránka 1 = bez parametru, kvůli kanonickým URL). */
  hrefForPage: (page: number) => string
}

const VISIBLE_NEIGHBOURS = 2

function visiblePages(currentPage: number, totalPages: number): number[] {
  const first = Math.max(1, currentPage - VISIBLE_NEIGHBOURS)
  const last = Math.min(totalPages, currentPage + VISIBLE_NEIGHBOURS)
  return Array.from({ length: last - first + 1 }, (_, index) => first + index)
}

const LINK_CLASSES =
  'flex h-9 min-w-9 items-center justify-center rounded-lg border border-line bg-surface px-2 text-sm hover:border-brand-600 hover:text-brand-700'

export function Pagination({ currentPage, totalPages, hrefForPage }: PaginationProps) {
  if (totalPages <= 1) return null
  return (
    <nav
      aria-label="Stránkování"
      className="mt-6 flex flex-wrap items-center justify-center gap-1.5"
    >
      {currentPage > 1 && (
        <Link href={hrefForPage(currentPage - 1)} rel="prev" className={LINK_CLASSES}>
          <ChevronLeft className="size-4" aria-hidden />
          <span className="sr-only">Předchozí stránka</span>
        </Link>
      )}
      {visiblePages(currentPage, totalPages).map((page) =>
        page === currentPage ? (
          <span
            key={page}
            aria-current="page"
            className={cn(
              LINK_CLASSES,
              'border-brand-600 bg-brand-600 text-white hover:text-white',
            )}
          >
            {page}
          </span>
        ) : (
          <Link key={page} href={hrefForPage(page)} className={LINK_CLASSES}>
            {page}
          </Link>
        ),
      )}
      {currentPage < totalPages && (
        <Link href={hrefForPage(currentPage + 1)} rel="next" className={LINK_CLASSES}>
          <ChevronRight className="size-4" aria-hidden />
          <span className="sr-only">Další stránka</span>
        </Link>
      )}
    </nav>
  )
}
