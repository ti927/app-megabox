import {
  ChartColumn,
  Circle,
  Headset,
  House,
  type LucideIcon,
  Package,
  SquareKanban,
  Target,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react'

/**
 * Ícone de cada página do menu, pelo `slug` de `public.paginas` (db/001, db/005). Usado no
 * menu lateral, na engrenagem e nos atalhos do Início — a mesma página tem o mesmo ícone em
 * todo lugar. Página nova sem ícone aqui cai no círculo neutro.
 */
const ICONES: Record<string, LucideIcon> = {
  inicio: House,
  vendas: SquareKanban, // Fluxo de Vendas é um kanban
  financeiro: Wallet,
  metas: Target,
  rotinas: Wrench, // "Manutenção" no Bubble
  relatorios: ChartColumn,
  sac: Headset,
  cadastros: Users,
  produtos: Package,
}

export function iconePagina(slug: string): LucideIcon {
  return ICONES[slug] ?? Circle
}
