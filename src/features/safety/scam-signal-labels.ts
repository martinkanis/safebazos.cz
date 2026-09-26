import type { ScamSignal } from '@/db/schema'

/** Vysvětlení signálu pro uživatele — co je podezřelé a proč. */
export const SCAM_SIGNAL_LABELS: Record<ScamSignal, string> = {
  external_link: 'Obsahuje odkaz na jiný web. Nikdy nezadávejte údaje na stránkách z odkazu.',
  phishing_link:
    'Obsahuje odkaz, který se vydává za platební bránu nebo dopravce. Typický podvod — neotvírejte ho.',
  messenger_contact:
    'Žádá o komunikaci přes WhatsApp, Telegram apod. Mimo platformu vás nemůžeme chránit.',
  card_data_request:
    'Žádá údaje z platební karty nebo ověřovací kód. Pro přijetí peněz je nikdy nepotřebujete.',
  foreign_phone: 'Obsahuje zahraniční telefonní číslo.',
  courier_prepayment: 'Zmiňuje kurýra nebo platbu předem — častý scénář podvodu.',
  untraceable_payment:
    'Zmiňuje nevystopovatelnou platbu (Western Union, krypto, dárkové karty). Tyto platby nejdou vrátit.',
}
