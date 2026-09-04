import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://capyaba.com'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Páginas públicas estáticas
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,                 lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE_URL}/sobre-mi`,         lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/servicios`,        lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/emprendimientos`,  lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/testimonios`,      lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/blog`,             lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE_URL}/terminos`,         lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/privacidad`,       lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/devoluciones`,     lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/libro-reclamaciones`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Posts de blog publicados (dinámico). Si falla la consulta, devolvemos solo lo estático.
  let blogRoutes: MetadataRoute.Sitemap = []
  try {
    const supabase = await createClient()
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    blogRoutes = (posts || []).map((p: { slug: string; published_at: string | null }) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.published_at ? new Date(p.published_at) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch {
    blogRoutes = []
  }

  return [...staticRoutes, ...blogRoutes]
}
