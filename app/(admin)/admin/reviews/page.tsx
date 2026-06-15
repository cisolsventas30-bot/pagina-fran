
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CapyMascot } from '@/components/ui/CapyLogo'
import { ChevronRight, FileText, User } from 'lucide-react'
export const dynamic = 'force-dynamic'

export default async function ReviewsPage() {
  const supabase = await createClient()

  const { data: pending } = await supabase
    .from('quiz_attempts')
    .select(`
      id, submitted_at,
      quizzes ( title, type ),
      enrollments ( profiles:student_id ( full_name, email ) )
    `)
    .eq('needs_review', true)
    .order('submitted_at', { ascending: false })

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 40px 56px' }}>
      <div className="mb-8">
        <p className="text-xs text-ink-500 uppercase tracking-wider mb-1 font-semibold">Pendientes</p>
        <h1 className="page-title" style={{ marginBottom: 6 }}>
          Revisiones
        </h1>
        <p className="text-ink-600">
          Ensayos y respuestas abiertas que requieren tu revisión manual
        </p>
      </div>

      {!pending?.length ? (
        <div
          className="text-center"
          style={{
            padding: '56px 24px',
            background: '#fff',
            border: '1px solid rgba(95,77,54,.09)',
            borderRadius: 18,
            boxShadow: '0 1px 2px rgba(95,77,54,.05), 0 10px 26px -16px rgba(95,77,54,.16)',
          }}
        >
          <CapyMascot size={130} className="mx-auto mb-4" />
          <h3 style={{ fontFamily: "'Poppins', system-ui, sans-serif", fontSize: 24, fontWeight: 500, letterSpacing: '-0.03em', color: 'var(--a-ink)', marginBottom: 6 }}>
            ¡Todo al día!
          </h3>
          <p className="max-w-sm mx-auto" style={{ fontSize: 13.5, color: 'var(--a-ink-2)' }}>
            No hay respuestas pendientes de revisión
          </p>
        </div>
      ) : (
        <div className="card divide-y divide-ink-100 shadow-card">
          {pending.map((attempt: any) => (
            <Link
              key={attempt.id}
              href={`/admin/reviews/${attempt.id}`}
              className="flex items-center gap-4 p-5 hover:bg-ink-50 transition group"
            >
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--b-pink-soft)', color: 'var(--b-pink)' }}
              >
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink-900 truncate">
                  {attempt.quizzes?.title || 'Examen'}
                </p>
                <div className="flex items-center gap-2 text-xs text-ink-500 mt-1 font-medium">
                  <User className="w-3 h-3" />
                  {attempt.enrollments?.profiles?.full_name || attempt.enrollments?.profiles?.email}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-500 hidden sm:inline font-medium">
                  Enviado {new Date(attempt.submitted_at).toLocaleDateString('es-ES')}
                </span>
                <ChevronRight className="w-4 h-4 text-ink-400 group-hover:text-ink-600 transition" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
