import { ShieldAlert } from 'lucide-react'
import Link from 'next/link'

const SAFETY_TIPS = [
  'Nikdy neotevírejte odkazy na „přijetí platby“ ani „potvrzení doručení“.',
  'Pro přijetí peněz nikdy nepotřebujete údaje z karty ani kód z SMS.',
  'Neplaťte předem neznámému prodejci — použijte bezpečnou platbu nebo osobní předání.',
  'Komunikujte přes zprávy SafeBazos, ne přes WhatsApp či Telegram.',
]

export function SafetyTipsBox() {
  return (
    <aside className="rounded-xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800">
      <p className="flex items-center gap-2 font-semibold">
        <ShieldAlert className="size-5" aria-hidden />
        Než zaplatíte
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {SAFETY_TIPS.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
      <Link
        href="/bezpecnost"
        className="mt-2 inline-block font-medium underline underline-offset-2"
      >
        Více o bezpečném nákupu
      </Link>
    </aside>
  )
}
