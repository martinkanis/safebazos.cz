import { pgEnum } from 'drizzle-orm/pg-core'

export const listingStatusEnum = pgEnum('listing_status', [
  'active',
  'pending_review',
  'blocked',
  'deleted',
])
export type ListingStatus = (typeof listingStatusEnum.enumValues)[number]

export const priceTypeEnum = pgEnum('price_type', ['amount', 'negotiable', 'offer', 'free', 'in_text'])
export type PriceType = (typeof priceTypeEnum.enumValues)[number]

export const riskLevelEnum = pgEnum('risk_level', ['none', 'warning', 'high'])
export type RiskLevel = (typeof riskLevelEnum.enumValues)[number]

/** Signály podvodu, které detekuje features/safety/scam-detector. */
export const scamSignalEnum = pgEnum('scam_signal', [
  'external_link',
  'phishing_link',
  'messenger_contact',
  'card_data_request',
  'foreign_phone',
  'courier_prepayment',
  'untraceable_payment',
])
export type ScamSignal = (typeof scamSignalEnum.enumValues)[number]

export const reportReasonEnum = pgEnum('report_reason', [
  'scam',
  'prohibited',
  'wrong_category',
  'duplicate',
  'other',
])
export type ReportReason = (typeof reportReasonEnum.enumValues)[number]

export const reportStatusEnum = pgEnum('report_status', ['open', 'resolved', 'dismissed'])
export type ReportStatus = (typeof reportStatusEnum.enumValues)[number]
