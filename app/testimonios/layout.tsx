import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Testimonios — Historias reales',
  description:
    'Familias, terapeutas y analistas conductuales que confiaron en capyABA y vieron resultados con la terapia infantil ABA, la formación y las supervisiones.',
  alternates: { canonical: '/testimonios' },
  openGraph: {
    title: 'Testimonios — Historias reales | capyABA',
    description:
      'Familias y profesionales que confiaron en el proceso y vieron resultados con capyABA.',
    url: '/testimonios',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
