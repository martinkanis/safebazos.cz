import { describe, expect, it } from 'vitest'
import { htmlToText } from './html-text'

describe('htmlToText', () => {
  it('převede <br> na řádky a odstraní tagy', () => {
    expect(htmlToText('Prodám kolo.<br>\n<br>\n<b>Stav:</b> výborný')).toBe(
      'Prodám kolo.\n\nStav: výborný',
    )
  })

  it('dekóduje entity', () => {
    expect(htmlToText('Cena &amp; dohoda &#8211; &quot;TOP&quot; &#x1F4CD;')).toBe(
      'Cena & dohoda – "TOP" 📍',
    )
  })

  it('<br> následované odřádkováním dá jediný nový řádek', () => {
    expect(htmlToText('první<br>\ndruhý')).toBe('první\ndruhý')
  })

  it('sloučí víc prázdných řádků do jednoho', () => {
    expect(htmlToText('a<br><br><br><br>b')).toBe('a\n\nb')
  })
})
