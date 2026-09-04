import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Libro de Reclamaciones',
  description:
    'Libro de Reclamaciones virtual de capyABA. Registra tu queja o reclamo conforme a la normativa peruana de protección al consumidor.',
  alternates: { canonical: '/libro-reclamaciones' },
  openGraph: {
    title: 'Libro de Reclamaciones | capyABA',
    description: 'Registra tu queja o reclamo conforme a la normativa peruana de protección al consumidor.',
    url: '/libro-reclamaciones',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
