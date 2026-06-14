
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, BookOpen, Eye, Pencil, ChevronLeft } from 'lucide-react'
import { CourseThumb } from '@/components/admin/CourseCoverUpload'
export const dynamic = 'force-dynamic'

export default async function CoursesListPage() {
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select(`
      id, title, description, cover_url, is_published, created_at, updated_at,
      enrollments(count),
      modules(count)
    `)
    .order('created_at', { ascending: false })

  const list = (courses || []) as any[]

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <Link
            href="/admin"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 12, fontWeight: 600, color: 'var(--a-ink-3)',
              textDecoration: 'none', marginBottom: 8,
            }}
          >
            <ChevronLeft size={12} strokeWidth={2.5} />
            Panel
          </Link>
          <h1 className="page-title" style={{ margin: 0, fontSize: 30 }}>
            Cursos
          </h1>
          <p style={{ fontSize: 13, color: 'var(--a-ink-3)', marginTop: 6, marginBottom: 0 }}>
            {list.length} {list.length === 1 ? 'curso creado' : 'cursos creados'}
          </p>
        </div>
        <Link href="/admin/courses/new" className="btn-primary" style={{ gap: 6, flexShrink: 0 }}>
          <Plus size={14} strokeWidth={2.5} />
          Crear curso
        </Link>
      </div>

      {/* Lista */}
      {list.length === 0 ? (
        <div className="db2-empty">
          <div className="db2-empty-mini"><BookOpen size={20} strokeWidth={2} /></div>
          <h2 className="db2-empty-title">Aún no tienes cursos</h2>
          <p className="db2-empty-desc">Crea tu primer curso y empieza a agregar módulos, lecciones y evaluaciones.</p>
          <Link href="/admin/courses/new" className="db2-btn-primary"><Plus size={15} strokeWidth={2.5} /> Crear primer curso</Link>
        </div>
      ) : (
        <div className="db2-course-grid">
          {list.map((course, idx) => {
            const enrollCount = course.enrollments?.[0]?.count || 0
            const modulesCount = course.modules?.[0]?.count || 0
            return (
              <article key={course.id} className="db2-course">
                <div className="db2-course-cover">
                  <CourseThumb coverUrl={course.cover_url} title={course.title} index={idx} size={100} />
                  <span className={`db2-course-badge ${course.is_published ? 'pub' : 'draft'}`}>
                    {course.is_published ? 'Publicado' : 'Borrador'}
                  </span>
                </div>
                <div className="db2-course-body">
                  <h3 className="db2-course-title">{course.title}</h3>
                  <div className="db2-course-meta">
                    <span>{enrollCount} {enrollCount === 1 ? 'alumno' : 'alumnos'}</span>
                    <i>·</i>
                    <span>{modulesCount} {modulesCount === 1 ? 'módulo' : 'módulos'}</span>
                  </div>
                  <div className="db2-course-actions-full">
                    <Link href={`/learn/${course.id}`} target="_blank" className="db2-course-btn ghost">
                      <Eye size={13} strokeWidth={2.2} /> Ver
                    </Link>
                    <Link href={`/admin/courses/${course.id}`} className="db2-course-btn solid">
                      <Pencil size={13} strokeWidth={2.2} /> Editar
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
          {/* Ghost card */}
          <Link href="/admin/courses/new" className="db2-course-ghost">
            <span className="db2-ghost-plus"><Plus size={20} strokeWidth={2.4} /></span>
            <span className="db2-ghost-label">Crear nuevo curso</span>
          </Link>
        </div>
      )}
    </div>
  )
}
