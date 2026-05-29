import { createClient } from '@/lib/supabase/server'
import SobreMiManager from './SobreMiManager'

export const dynamic = 'force-dynamic'

export default async function SobreMiAdminPage() {
  const supabase = await createClient()

  const [{ data: certs }, { data: gallery }] = await Promise.all([
    supabase
      .from('sobre_mi_certificates')
      .select('id, src, title, badge, description, sort_order')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase
      .from('sobre_mi_gallery')
      .select('id, src, caption, sort_order')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
  ])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs text-ink-500 uppercase tracking-wider mb-1 font-semibold">Página pública</p>
        <h1 className="text-3xl lg:text-4xl font-bold text-ink-900 tracking-tight mb-1">
          Sobre mí
        </h1>
        <p className="text-ink-600">
          Administra los certificados profesionales y la galería de fotos que aparecen en <code className="text-xs bg-ink-100 px-1.5 py-0.5 rounded">/sobre-mi</code>.
        </p>
      </div>
      <SobreMiManager
        initialCerts={(certs as any[]) || []}
        initialGallery={(gallery as any[]) || []}
      />
    </div>
  )
}
