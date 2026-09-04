import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider, ConfirmProvider } from '@/components/ui/Toast'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://capyaba.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'capyABA — Terapeuta infantil y Docente',
    template: '%s | capyABA',
  },
  description:
    'Análisis Conductual Aplicado basado en evidencia para niños y familias. Terapia infantil, formación IBT/IBA y supervisiones profesionales.',
  keywords: [
    'análisis conductual aplicado', 'ABA', 'terapia infantil', 'terapeuta infantil',
    'formación IBT', 'formación IBA', 'supervisiones ABA', 'autismo', 'Francesca Ramírez Bontá',
  ],
  authors: [{ name: 'Francesca Ramírez Bontá' }],
  creator: 'capyABA',
  publisher: 'capyABA',
  icons: { icon: '/favicon.png' },
  alternates: { canonical: '/' },
  verification: {
    google: 'qvYPyU1sEQ1V8YzW38iPnAy6CHez-HFhOecA5vkniKA',
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'capyABA',
    url: SITE_URL,
    title: 'capyABA — Terapeuta infantil y Docente',
    description:
      'Análisis Conductual Aplicado basado en evidencia para niños y familias. Terapia infantil, formación IBT/IBA y supervisiones profesionales.',
    images: [{ url: '/francesca-hero.png', width: 1257, height: 707, alt: 'capyABA — Francesca Ramírez Bontá' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'capyABA — Terapeuta infantil y Docente',
    description:
      'Análisis Conductual Aplicado basado en evidencia para niños y familias. Terapia infantil, formación IBT/IBA y supervisiones profesionales.',
    images: ['/francesca-hero.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ProfessionalService',
      '@id': `${SITE_URL}/#organization`,
      name: 'capyABA',
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.png`,
      image: `${SITE_URL}/francesca-hero.png`,
      description:
        'Análisis Conductual Aplicado basado en evidencia para niños y familias. Terapia infantil, formación IBT/IBA y supervisiones profesionales.',
      areaServed: 'PE',
      founder: { '@type': 'Person', name: 'Francesca Ramírez Bontá', jobTitle: 'Analista de Conducta (IBA)' },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'capyABA',
      inLanguage: 'es',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ToastProvider>
          <ConfirmProvider>
            {children}
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
