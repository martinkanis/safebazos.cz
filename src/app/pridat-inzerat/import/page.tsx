import type { Metadata } from 'next'
import { StartImportForm } from '@/features/listing-import/start-import-form'
import { requireUser } from '@/lib/require-user'

export const metadata: Metadata = {
  title: 'Převzít inzerát z Bazoše',
  description: 'Máte inzerát na Bazoš.cz? Převezměte ho na SafeBazos i s fotkami.',
}

export default async function StartImportPage() {
  await requireUser('/pridat-inzerat/import')
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Převzít inzerát z Bazoše</h1>
        <p className="text-muted">
          Text, cenu, lokalitu i fotky převezmeme za vás. Abychom ochránili prodejce před
          kopírováním jejich inzerátů podvodníky, ověříme, že inzerát je opravdu váš.
        </p>
      </div>
      <ol className="list-decimal space-y-1 rounded-xl border border-line bg-surface p-5 pl-9 text-sm">
        <li>Vložte odkaz na svůj inzerát.</li>
        <li>Do popisu inzerátu na Bazoši dočasně přidáte kód, který vám ukážeme.</li>
        <li>Ověříme kód, načteme inzerát a vy ho před zveřejněním zkontrolujete.</li>
      </ol>
      <StartImportForm />
    </div>
  )
}
