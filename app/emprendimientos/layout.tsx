import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Emprendimientos — Mi ecosistema de impacto',
  description:
    'Los proyectos y emprendimientos de capyABA: cuatro iniciativas con un solo propósito en Análisis Conductual Aplicado, educación y acompañamiento a familias.',
  alternates: { canonical: '/emprendimientos' },
  openGraph: {
    title: 'Emprendimientos — Mi ecosistema de impacto | capyABA',
    description:
      'Cuatro proyectos, un solo propósito: impacto en ABA, educación y acompañamiento a familias y profesionales.',
    url: '/emprendimientos',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
