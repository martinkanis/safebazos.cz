import {
  Armchair,
  Baby,
  BookOpen,
  Briefcase,
  Camera,
  Car,
  Dumbbell,
  House,
  type LucideIcon,
  Monitor,
  Motorbike,
  Music,
  Package,
  PawPrint,
  Shirt,
  Smartphone,
  Sprout,
  Ticket,
  Tractor,
  Tv,
  Wrench,
} from 'lucide-react'

const ICONS_BY_CATEGORY_SLUG: Record<string, LucideIcon> = {
  zvirata: PawPrint,
  deti: Baby,
  reality: House,
  prace: Briefcase,
  auto: Car,
  motorky: Motorbike,
  stroje: Tractor,
  'dum-a-zahrada': Sprout,
  pc: Monitor,
  mobily: Smartphone,
  foto: Camera,
  elektro: Tv,
  sport: Dumbbell,
  hudba: Music,
  vstupenky: Ticket,
  knihy: BookOpen,
  nabytek: Armchair,
  obleceni: Shirt,
  sluzby: Wrench,
}

export function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = ICONS_BY_CATEGORY_SLUG[slug] ?? Package
  return <Icon className={className} aria-hidden />
}
