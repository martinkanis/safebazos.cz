import { ButtonLink } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md space-y-4 py-16 text-center">
      <p className="text-5xl font-bold text-brand-600">404</p>
      <h1 className="text-2xl font-bold">Stránka nenalezena</h1>
      <p className="text-muted">Inzerát mohl být prodán, smazán nebo vypršel.</p>
      <ButtonLink href="/">Zpět na hlavní stránku</ButtonLink>
    </div>
  )
}
