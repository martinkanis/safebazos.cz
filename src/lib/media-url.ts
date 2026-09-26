/** Veřejná URL nahraného souboru (servíruje ji app/media/[...key]/route.ts). */
export function mediaUrl(key: string): string {
  return `/media/${key}`
}
