import { createClient } from '@/lib/supabase/server'
import { CapyMascot } from '@/components/ui/CapyLogo'
import { Star, Mail, User, Calendar } from 'lucide-react'
import { TestimonialActions } from './TestimonialActions'

export const dynamic = 'force-dynamic'

type Testimonial = {
  id: string
  name: string
  role: string | null
  email: string | null
  category: string
  quote: string
  stars: number
  initials: string | null
  is_published: boolean
  created_at: string
}

export default async function AdminTestimonialsPage() {
  const supabase = await createClient()

  const { data: all } = await supabase
    .from('testimonials')
    .select('id, name, role, email, category, quote, stars, initials, is_published, created_at')
    .order('created_at', { ascending: false })

  const items = (all || []) as Testimonial[]
  const pending = items.filter(t => !t.is_published)
  const published = items.filter(t => t.is_published)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs text-ink-500 uppercase tracking-wider mb-1 font-semibold">Reseñas del público</p>
        <h1 className="text-3xl lg:text-4xl font-bold text-ink-900 tracking-tight mb-1">
          Testimonios
        </h1>
        <p className="text-ink-600">
          Aprueba o rechaza las reseñas que dejaron los visitantes en <code className="text-xs bg-ink-100 px-1.5 py-0.5 rounded">/testimonios</code>.
        </p>
      </div>

      {/* ── Pendientes ── */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-bold text-ink-900 tracking-tight">Pendientes</h2>
          {pending.length > 0 && (
            <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="text-center py-16 bg-mocha-50 rounded-xl border border-mocha-100">
            <CapyMascot size={120} className="mx-auto mb-3" />
            <h3 className="text-lg font-bold text-ink-900 mb-1 tracking-tight">¡Todo al día!</h3>
            <p className="text-ink-600 max-w-sm mx-auto text-sm">No hay reseñas pendientes de revisión.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(t => (
              <TestimonialCard key={t.id} t={t} />
            ))}
          </div>
        )}
      </section>

      {/* ── Publicados ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-bold text-ink-900 tracking-tight">Publicados</h2>
          {published.length > 0 && (
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              {published.length}
            </span>
          )}
        </div>

        {published.length === 0 ? (
          <p className="text-sm text-ink-500 italic">Aún no has publicado ninguna reseña enviada por usuarios.</p>
        ) : (
          <div className="space-y-3">
            {published.map(t => (
              <TestimonialCard key={t.id} t={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="bg-white rounded-xl border border-ink-100 shadow-card p-5">
      <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-mocha-100 text-mocha-700 flex items-center justify-center font-bold text-sm">
            {t.initials || t.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-ink-900 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-ink-400" /> {t.name}
            </p>
            <div className="flex items-center gap-3 text-xs text-ink-500 mt-0.5">
              {t.role && <span>{t.role}</span>}
              <span className="bg-ink-100 px-2 py-0.5 rounded-full font-medium">{t.category}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < t.stars ? 'fill-amber-400 text-amber-400' : 'text-ink-200'}`}
            />
          ))}
        </div>
      </div>

      <blockquote className="text-ink-700 text-sm leading-relaxed border-l-2 border-mocha-300 pl-3 italic mb-3">
        “{t.quote}”
      </blockquote>

      <div className="flex items-center justify-between gap-3 flex-wrap text-xs text-ink-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(t.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
          {t.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <a href={`mailto:${t.email}`} className="hover:text-mocha-700 underline">{t.email}</a>
            </span>
          )}
        </div>
        <TestimonialActions id={t.id} isPublished={t.is_published} />
      </div>
    </div>
  )
}
