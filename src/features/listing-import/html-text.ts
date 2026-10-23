const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

function decodeHtmlEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, body: string) => {
    if (body.startsWith('#x') || body.startsWith('#X')) {
      return String.fromCodePoint(Number.parseInt(body.slice(2), 16))
    }
    if (body.startsWith('#')) return String.fromCodePoint(Number.parseInt(body.slice(1), 10))
    return NAMED_ENTITIES[body.toLowerCase()] ?? entity
  })
}

/** HTML fragment → prostý text: <br> na nový řádek, tagy pryč, entity dekódované. */
export function htmlToText(html: string): string {
  // Za <br> v HTML často následuje i skutečné odřádkování — započítat jen jednou.
  const withLineBreaks = html.replace(/<br\s*\/?>\r?\n?/gi, '\n').replace(/<\/p>/gi, '\n\n')
  const withoutTags = withLineBreaks.replace(/<[^>]*>/g, '')
  return decodeHtmlEntities(withoutTags)
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
