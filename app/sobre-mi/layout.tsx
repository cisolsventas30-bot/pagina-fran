import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sobre mí — Francesca Ramírez Bontá',
  description:
    'Conoce a Francesca Ramírez Bontá, Analista de Conducta (IBA). Su formación, enfoque y experiencia en Análisis Conductual Aplicado para niños, familias y profesionales.',
  alternates: { canonical: '/sobre-mi' },
  openGraph: {
    title: 'Sobre mí — Francesca Ramírez Bontá | capyABA',
    description:
      'Analista de Conducta (IBA) con enfoque en Análisis Conductual Aplicado basado en evidencia. Formación, enfoque y experiencia.',
    url: '/sobre-mi',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
