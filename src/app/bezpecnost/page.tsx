import type { Metadata } from 'next'
import { Alert } from '@/components/ui/alert'

export const metadata: Metadata = {
  title: 'Jak nakupovat a prodávat na bazaru bezpečně',
  description:
    'Nejčastější podvody na bazarech: falešné odkazy na přijetí platby, kurýři, platba předem. Jak je poznat a jak se bránit.',
  alternates: { canonical: '/bezpecnost' },
}

const SCAM_SCENARIOS = [
  {
    title: 'Falešný odkaz „na přijetí platby“',
    text: 'Kupující napíše, že už zaplatil přes „bezpečnou platbu“, Zásilkovnu nebo bazar, a pošle odkaz, kde máte peníze „přijmout“. Stránka vypadá věrohodně a chce údaje z karty nebo kód z SMS. Ve skutečnosti tím podvodníkovi potvrdíte platbu z vašeho účtu.',
  },
  {
    title: 'Kurýr a platba předem',
    text: 'Prodejce je „v zahraničí“, zboží pošle kurýrem, ale nejdřív chce zaplatit poštovné, clo nebo celou částku. Po zaplacení přestane komunikovat.',
  },
  {
    title: 'Přesun konverzace na WhatsApp nebo Telegram',
    text: 'Podvodník chce co nejdřív komunikovat mimo bazar — tam ho neohlídá žádná kontrola a nemá se čeho bát.',
  },
  {
    title: 'Nevystopovatelné platby',
    text: 'Western Union, MoneyGram, kryptoměny nebo dárkové karty. Tyto platby nejdou vrátit ani dohledat.',
  },
]

const PROTECTIONS = [
  'Zprávy kontrolujeme na podvodné vzorce a odkazy na cizí weby skrýváme.',
  'Inzeráty s podvodnými odkazy nebo žádostí o kartu zadržíme ke kontrole moderátorem.',
  'Psát a inzerovat mohou jen účty s ověřeným e-mailem; vidíte, jak dlouho prodejce u nás je.',
  'Telefon se načte až na kliknutí, takže ho roboti nemohou hromadně stáhnout.',
  'Z fotek mažeme GPS polohu, aby z nich nešlo zjistit, kde bydlíte.',
  'Bezpečná platba: peníze drží úschova, dokud zboží nepřevezmete.',
]

export default function SafetyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Jak nakupovat a prodávat bezpečně</h1>
        <p className="text-muted">
          Většina podvodů na bazarech se opakuje ve stejných scénářích. Když je znáte, poznáte je.
        </p>
      </header>

      <Alert tone="danger" title="Zlaté pravidlo">
        Pro <strong>přijetí</strong> peněz nikdy nepotřebujete zadávat údaje z karty, PIN ani kód z
        SMS. Kdo to po vás chce, je podvodník.
      </Alert>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Nejčastější podvody</h2>
        {SCAM_SCENARIOS.map((scenario) => (
          <div key={scenario.title} className="rounded-xl border border-line bg-surface p-5">
            <h3 className="font-semibold">{scenario.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{scenario.text}</p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Jak vás chrání SafeBazos</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          {PROTECTIONS.map((protection) => (
            <li key={protection}>{protection}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">Stal se vám podvod?</h2>
        <p className="leading-relaxed">
          Okamžitě kontaktujte svou banku a nechte zablokovat kartu, podejte trestní oznámení na
          Policii ČR a inzerát nebo zprávu nahlaste — pomůžete tím ochránit další uživatele.
        </p>
      </section>
    </article>
  )
}
