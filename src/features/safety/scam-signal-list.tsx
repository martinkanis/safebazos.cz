import type { ScamSignal } from '@/db/schema'
import { SCAM_SIGNAL_LABELS } from './scam-signal-labels'

export function ScamSignalList({ signals }: { signals: ScamSignal[] }) {
  return (
    <ul className="list-disc space-y-0.5 pl-4">
      {signals.map((signal) => (
        <li key={signal}>{SCAM_SIGNAL_LABELS[signal]}</li>
      ))}
    </ul>
  )
}
