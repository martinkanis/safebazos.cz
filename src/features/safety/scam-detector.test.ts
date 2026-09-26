import { describe, expect, it } from 'vitest'
import { assessScamRisk, maskUntrustedLinks } from './scam-detector'

describe('assessScamRisk', () => {
  it('běžný inzerát nemá žádné riziko', () => {
    const assessment = assessScamRisk(
      'Prodám dětské kolo, 20", málo jeté. Osobní předání v Brně, případně pošlu Zásilkovnou.',
    )
    expect(assessment).toEqual({ level: 'none', signals: [] })
  })

  it('odkaz na napodobeninu dopravce označí jako phishing s vysokým rizikem', () => {
    const assessment = assessScamRisk(
      'Zaplatil jsem přes Zásilkovnu, potvrďte příjem na https://zasilkovna-cz.online/prijem',
    )
    expect(assessment.level).toBe('high')
    expect(assessment.signals).toContain('phishing_link')
  })

  it('odkaz na oficiální doménu dopravce není podezřelý', () => {
    const assessment = assessScamRisk('Sledování zásilky: https://tracking.ppl.cz/abc')
    expect(assessment.signals).not.toContain('phishing_link')
    expect(assessment.signals).not.toContain('external_link')
  })

  it('neutrální cizí odkaz je jen varování', () => {
    const assessment = assessScamRisk('Více fotek najdete na www.mojefotky.com')
    expect(assessment).toEqual({ level: 'warning', signals: ['external_link'] })
  })

  it('e-mailovou adresu nepovažuje za odkaz', () => {
    const assessment = assessScamRisk('Pište na jan.novak@seznam.cz')
    expect(assessment.signals).not.toContain('external_link')
  })

  it('žádost o údaje z karty je vysoké riziko i s diakritikou', () => {
    const assessment = assessScamRisk('Pro připsání peněz pošlete číslo vaší karty a kód z SMS.')
    expect(assessment.level).toBe('high')
    expect(assessment.signals).toContain('card_data_request')
  })

  it('rozpozná přesun komunikace na WhatsApp a kurýra', () => {
    const assessment = assessScamRisk('Napište mi na WhatsApp, pošlu kurýra který zboží vyzvedne.')
    expect(assessment.level).toBe('warning')
    expect(assessment.signals).toEqual(['messenger_contact', 'courier_prepayment'])
  })

  it('zahraniční číslo je podezřelé, české a slovenské ne', () => {
    expect(assessScamRisk('Volejte +44 7911 123456').signals).toContain('foreign_phone')
    expect(assessScamRisk('Volejte +420 777 123 456').signals).not.toContain('foreign_phone')
    expect(assessScamRisk('Volajte +421 905 123 456').signals).not.toContain('foreign_phone')
  })

  it('nevystopovatelná platba je vysoké riziko', () => {
    const assessment = assessScamRisk('Platba pouze přes Western Union nebo Bitcoin.')
    expect(assessment.level).toBe('high')
    expect(assessment.signals).toContain('untraceable_payment')
  })
})

describe('maskUntrustedLinks', () => {
  it('skryje podvodný odkaz a zbytek textu zachová', () => {
    expect(maskUntrustedLinks('Potvrďte platbu na https://bazos-platba.site/xyz ještě dnes.')).toBe(
      'Potvrďte platbu na [odkaz skrytý] ještě dnes.',
    )
  })

  it('odkazy bez protokolu a s velkými písmeny skryje také', () => {
    expect(maskUntrustedLinks('Fotky: WWW.Fotky-Kola.CZ/album')).toBe('Fotky: [odkaz skrytý]')
  })

  it('oficiální dopravce a e-mailové adresy ponechá', () => {
    const text = 'Sledujte na https://www.zasilkovna.cz/sledovani, pište na jan@seznam.cz'
    expect(maskUntrustedLinks(text)).toBe(text)
  })
})
