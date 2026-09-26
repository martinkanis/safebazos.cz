import { describe, expect, it } from 'vitest'
import { canRenewListing, listingExpiryFrom, statusForAssessment } from './publication'

const DAY_MS = 24 * 60 * 60 * 1000
const now = new Date('2026-09-26T12:00:00Z')

describe('statusForAssessment', () => {
  it('vysoké riziko posílá inzerát do moderace', () => {
    expect(statusForAssessment({ level: 'high', signals: ['phishing_link'] })).toBe(
      'pending_review',
    )
  })

  it('varování inzerát nezdrží', () => {
    expect(statusForAssessment({ level: 'warning', signals: ['external_link'] })).toBe('active')
  })
})

describe('listingExpiryFrom', () => {
  it('inzerát vyprší za 60 dní', () => {
    expect(listingExpiryFrom(now).getTime() - now.getTime()).toBe(60 * DAY_MS)
  })
})

describe('canRenewListing', () => {
  it('čerstvý inzerát obnovit nejde', () => {
    expect(canRenewListing(new Date(now.getTime() + 30 * DAY_MS), now)).toBe(false)
  })

  it('týden před expirací a po ní obnovit jde', () => {
    expect(canRenewListing(new Date(now.getTime() + 7 * DAY_MS), now)).toBe(true)
    expect(canRenewListing(new Date(now.getTime() - DAY_MS), now)).toBe(true)
  })
})
