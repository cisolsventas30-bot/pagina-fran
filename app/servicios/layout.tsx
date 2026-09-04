import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Servicios — Terapia ABA, formación y supervisiones',
  description:
    'Terapia infantil ABA, formación IBT/IBA y supervisiones profesionales basadas en evidencia. Un proceso claro y ordenado para niños, familias y profesionales.',
  alternates: { canonical: '/servicios' },
  openGraph: {
    title: 'Servicios — Terapia ABA, formación y supervisiones | capyABA',
    description:
      'Terapia infantil ABA, formación IBT/IBA y supervisiones profesionales basadas en evidencia.',
    url: '/servicios',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
