import type { Metadata } from 'next'
import { Alert } from '@/components/ui/alert'

export const metadata: Metadata = {
  title: 'Bezpečná platba přes úschovu',
  description:
    'Jak funguje bezpečná platba na SafeBazos: peníze drží úschova, dokud kupující nepřevezme zboží. Ochrana kupujícího i prodávajícího.',
  alternates: { canonical: '/bezpecna-platba' },
}

const STEPS = [
  {
    title: 'Kupující zaplatí do úschovy',
    text: 'Peníze nejdou přímo prodejci, ale na úschovní účet.',
  },
  {
    title: 'Prodejce odešle zboží',
    text: 'Ví, že peníze jsou připravené — nemusí riskovat odeslání na dobírku.',
  },
  {
    title: 'Kupující zboží zkontroluje',
    text: 'Po převzetí má čas ověřit, že zboží odpovídá popisu.',
  },
  {
    title: 'Peníze dostane prodejce',
    text: 'Po potvrzení převzetí se částka uvolní prodávajícímu.',
  },
]

export default function SafePaymentPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Bezpečná platba přes úschovu</h1>
        <p className="text-muted">
          Chrání obě strany: kupující neplatí naslepo předem a prodejce neposílá zboží bez jistoty
          platby.
        </p>
      </header>

      <ol className="grid gap-4 sm:grid-cols-2">
        {STEPS.map((step, index) => (
          <li key={step.title} className="rounded-xl border border-line bg-surface p-5">
            <span className="flex size-8 items-center justify-center rounded-full bg-brand-600 font-bold text-white">
              {index + 1}
            </span>
            <h2 className="mt-3 font-semibold">{step.title}</h2>
            <p className="mt-1 text-sm text-muted">{step.text}</p>
          </li>
        ))}
      </ol>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">Co když něco nesedí?</h2>
        <p className="leading-relaxed">
          Když zboží nedorazí nebo neodpovídá popisu, kupující otevře spor a peníze zůstanou v
          úschově, dokud se situace nevyřeší. Když kupující převzetí nepotvrdí bez důvodu, prodejce
          o peníze nepřijde.
        </p>
      </section>

      {/* TODO: po napojení SafeDeal doplnit ceník, lhůty a odkaz na obchodní podmínky úschovy. */}
      <Alert tone="info" title="Spouštíme brzy">
        Platbu přes úschovu připravujeme ve spolupráci se službou SafeDeal. Prodejci už teď mohou u
        inzerátu vyznačit, že bezpečnou platbu nabízejí.
      </Alert>
    </article>
  )
}
