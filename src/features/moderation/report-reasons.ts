import type { ReportReason } from '@/db/schema'

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  scam: 'Podvod nebo podezřelé jednání',
  prohibited: 'Zakázané zboží nebo služba',
  wrong_category: 'Špatná kategorie',
  duplicate: 'Duplicitní inzerát',
  other: 'Jiný důvod',
}
