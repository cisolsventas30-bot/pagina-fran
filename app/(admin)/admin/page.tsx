
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CapyMascot } from '@/components/ui/CapyLogo'
import {
  Plus, BookOpen, Users, Award, AlertCircle, TrendingUp,
  BarChart3, Edit2, Check, ClipboardCheck, UserPlus,
  ArrowRight, GraduationCap, Activity, Sparkles,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { CourseThumb } from '@/components/admin/CourseCoverUpload'
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: coursesCount },
    { count: studentsCount },
    { count: pendingReviews },
    { count: certificatesCount },
  ] = await Promise.all([
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('quiz_attempts').select('*', { count: 'exact', head: true }).eq('needs_review', true),
    supabase.from('certificates').select('*', { count: 'exact', head: true }),
  ])

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles').select('full_name').eq('id', user!.id).single()
  const firstName = profile?.full_name?.split(' ')[0] || 'Instructor'

  const { data: courses } = await supabase
    .from('courses')
    .select(`id, title, description, cover_url, is_published, created_at, enrollments(count), modules(count)`)
    .order('created_at', { ascending: false })
    .limit(10)

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const { count: newStudentsThisWeek } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student')
    .gte('created_at', weekAgo.toISOString())

  const { data: recentEnrollments } = await supabase
    .from('enrollments')
    .select('id, started_at, status, profiles:student_id(full_name), courses(title)')
    .order('started_at', { ascending: false })
    .limit(5)

  const { data: recentAttempts } = await supabase
    .from('quiz_attempts')
    .select('id, submitted_at, needs_review, passed, profiles:student_id(full_name), quizzes(title)')
    .order('submitted_at', { ascending: false })
    .limit(5)

  const activity: Array<{
    id: string; type: 'enroll' | 'submit' | 'complete'; name: string; detail: string; at: string
  }> = []
  recentEnrollments?.forEach((e: any) => {
    activity.push({
      id: 'e' + e.id,
      type: e.status === 'completed' ? 'complete' : 'enroll',
      name: e.profiles?.full_name || 'Alumno',
      detail: e.courses?.title || 'Curso',
      at: e.started_at,
    })
  })
  recentAttempts?.forEach((a: any) => {
    if (!a.submitted_at) return
    activity.push({
      id: 'a' + a.id,
      type: 'submit',
      name: a.profiles?.full_name || 'Alumno',
      detail: a.quizzes?.title || 'Evaluación',
      at: a.submitted_at,
    })
  })
  activity.sort((x, y) => new Date(y.at).getTime() - new Date(x.at).getTime())
  const topActivity = activity.slice(0, 6)

  const pending = pendingReviews || 0
  const newThisWeek = newStudentsThisWeek || 0
  const certRate = (studentsCount || 0) > 0
    ? Math.round(((certificatesCount || 0) / (studentsCount || 1)) * 100)
    : 0

  return (
    <div className="db2">

      {/* ══ HEADER ══ */}
      <header className="db2-head">
        <div className="db2-head-text">
          <div className="db2-crumb">
            <span>Panel de instructor</span>
            <span className="db2-crumb-sep">/</span>
            <span className="db2-crumb-cur">Resumen</span>
          </div>
          <h1 className="db2-title">{getGreeting()}, {firstName}</h1>
          <p className="db2-sub">
            {pending > 0 ? (
              <>Tienes <Link href="/admin/reviews" className="db2-sub-link">{pending} {pending === 1 ? 'evaluación pendiente' : 'evaluaciones pendientes'}</Link>{newThisWeek > 0 ? <> y {newThisWeek} {newThisWeek === 1 ? 'nuevo alumno' : 'nuevos alumnos'} esta semana.</> : '.'}</>
            ) : newThisWeek > 0 ? (
              <>Tienes {newThisWeek} {newThisWeek === 1 ? 'nuevo alumno' : 'nuevos alumnos'} esta semana.</>
            ) : 'Todo al día. No hay tareas pendientes por ahora.'}
          </p>
        </div>
        <div className="db2-head-actions">
          <Link href="/admin/courses/new" className="db2-btn-primary">
            <Plus size={16} strokeWidth={2.5} /> Nuevo curso
          </Link>
        </div>
      </header>

      {/* ══ KPI STRIP ══ */}
      <div className="db2-kpis">
        <Kpi tone="mocha" label="Cursos" value={coursesCount || 0}
          icon={<BookOpen size={18} strokeWidth={2} />}
          href="/admin/courses" foot={(coursesCount || 0) > 0 ? 'Administrar catálogo' : 'Crear el primero'} />
        <Kpi tone="peach" label="Alumnos activos" value={studentsCount || 0}
          icon={<Users size={18} strokeWidth={2} />}
          href="/admin/students" trend={newThisWeek > 0 ? `+${newThisWeek} esta semana` : 'Ver lista'} />
        <Kpi tone={pending > 0 ? 'pink' : 'mocha'} label="Por revisar" value={pending}
          icon={<AlertCircle size={18} strokeWidth={2} />}
          href="/admin/reviews" foot={pending > 0 ? 'Revisar ahora' : 'Todo al día'} attention={pending > 0} />
        <Kpi tone="gold" label="Certificados" value={certificatesCount || 0}
          icon={<Award size={18} strokeWidth={2} />}
          href="/admin/certificates" foot={(certificatesCount || 0) > 0 ? 'Ver emitidos' : 'Aún no emitidos'} />
      </div>

      {/* ══ MIS CURSOS — full width ══ */}
      <section className="db2-block">
        <div className="db2-block-head">
          <h2 className="db2-block-title"><BookOpen size={15} strokeWidth={2.2} /> Mis cursos</h2>
          <Link href="/admin/courses" className="db2-block-link">Ver todos <ArrowRight size={13} strokeWidth={2.2} /></Link>
        </div>

        {!courses?.length ? (
          <div className="db2-empty">
            <CapyMascot size={96} className="mx-auto" />
            <h3 className="db2-empty-title">Aún no has creado cursos</h3>
            <p className="db2-empty-desc">Crea tu primer curso con videos, lecciones y evaluaciones.</p>
            <Link href="/admin/courses/new" className="db2-btn-primary"><Plus size={15} strokeWidth={2.5} /> Crear mi primer curso</Link>
          </div>
        ) : (
          <div className="db2-course-grid">
            {courses.map((course: any, idx: number) => {
              const modules = course.modules?.[0]?.count || 0
              const enrollments = course.enrollments?.[0]?.count || 0
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
                      <span>{modules} {modules === 1 ? 'módulo' : 'módulos'}</span>
                      <i>·</i>
                      <span>{enrollments} {enrollments === 1 ? 'alumno' : 'alumnos'}</span>
                    </div>
                    <div className="db2-course-foot">
                      <span className="db2-course-date">{formatDate(course.created_at)}</span>
                      <div className="db2-course-actions">
                        <Link href={`/admin/courses/${course.id}?tab=students`} className="db2-ico-btn" title="Progreso"><BarChart3 size={14} strokeWidth={2.2} /></Link>
                        <Link href={`/admin/courses/${course.id}`} className="db2-ico-btn" title="Editar"><Edit2 size={14} strokeWidth={2.2} /></Link>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
            {/* Ghost card — evita el hueco vacío y guía a crear más */}
            <Link href="/admin/courses/new" className="db2-course-ghost">
              <span className="db2-ghost-plus"><Plus size={20} strokeWidth={2.4} /></span>
              <span className="db2-ghost-label">Crear nuevo curso</span>
            </Link>
          </div>
        )}
      </section>

      {/* ══ BOTTOM: actividad + resumen lado a lado ══ */}
      <div className="db2-bottom">

        {/* Actividad reciente */}
        <section className="db2-block">
          <div className="db2-block-head">
            <h2 className="db2-block-title"><Activity size={15} strokeWidth={2.2} /> Actividad reciente</h2>
          </div>
          {topActivity.length === 0 ? (
            <div className="db2-card db2-empty" style={{ padding: '32px 24px' }}>
              <div className="db2-empty-mini"><UserPlus size={18} strokeWidth={2} /></div>
              <p className="db2-empty-desc" style={{ margin: 0 }}>Cuando tengas alumnos activos verás aquí su progreso en tiempo real.</p>
            </div>
          ) : (
            <div className="db2-card">
              {topActivity.map(a => <ActivityItem key={a.id} item={a} />)}
              <Link href="/admin/students" className="db2-activity-foot">Ver toda la actividad <ArrowRight size={13} strokeWidth={2.4} /></Link>
            </div>
          )}
        </section>

        {/* Resumen rápido */}
        <section className="db2-block">
          <div className="db2-block-head">
            <h2 className="db2-block-title"><Sparkles size={15} strokeWidth={2.2} /> Resumen</h2>
          </div>
          <div className="db2-card db2-summary">
            <div className="db2-sum-row">
              <div className="db2-sum-ico" style={{ background: 'var(--b-mocha-soft)', color: 'var(--b-mocha)' }}>
                <GraduationCap size={18} strokeWidth={1.9} />
              </div>
              <div className="db2-sum-info">
                <div className="db2-sum-value">{certRate}%</div>
                <div className="db2-sum-label">Tasa de certificación</div>
              </div>
            </div>
            {/* barra de progreso de la tasa */}
            <div className="db2-bar"><div className="db2-bar-fill" style={{ width: `${certRate}%` }} /></div>

            <div className="db2-sum-divider" />

            <div className="db2-sum-row">
              <div className="db2-sum-ico" style={{ background: 'var(--b-peach-soft)', color: '#C2772E' }}>
                <Activity size={18} strokeWidth={1.9} />
              </div>
              <div className="db2-sum-info">
                <div className="db2-sum-value">{topActivity.length}</div>
                <div className="db2-sum-label">Eventos recientes</div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function ActivityItem({ item }: { item: { type: string; name: string; detail: string; at: string } }) {
  const config = {
    enroll:   { icon: <UserPlus size={14} strokeWidth={2.3} />,      bg: 'var(--b-peach-soft)', color: '#C2772E', verb: 'se inscribió a' },
    submit:   { icon: <ClipboardCheck size={14} strokeWidth={2.3} />, bg: 'var(--b-pink-soft)',  color: '#C24168', verb: 'envió evaluación de' },
    complete: { icon: <Check size={14} strokeWidth={2.6} />,          bg: 'var(--a-ok-50)',      color: 'var(--a-ok)', verb: 'completó' },
  }[item.type] || { icon: <UserPlus size={14} />, bg: 'var(--a-surface-2)', color: 'var(--a-brand)', verb: '' }

  return (
    <div className="db2-act">
      <div className="db2-act-ico" style={{ background: config.bg, color: config.color }}>{config.icon}</div>
      <div className="db2-act-body">
        <div className="db2-act-text">
          <strong>{item.name}</strong> {config.verb}{' '}
          <span className="db2-act-detail">{item.detail}</span>
        </div>
        <div className="db2-act-time">{relativeTime(item.at)}</div>
      </div>
    </div>
  )
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'hace un momento'
  if (min < 60) return `hace ${min} min`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `hace ${hrs} ${hrs === 1 ? 'hora' : 'horas'}`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `hace ${days} ${days === 1 ? 'día' : 'días'}`
  return formatDate(iso)
}

function Kpi({ tone, label, value, icon, foot, href, trend, attention }: {
  tone: 'mocha' | 'peach' | 'pink' | 'gold'
  label: string
  value: number
  icon: React.ReactNode
  foot?: string
  href?: string
  trend?: string
  attention?: boolean
}) {
  return (
    <Link href={href || '#'} className={`db2-kpi tone-${tone}${attention ? ' is-attn' : ''}`}>
      <div className="db2-kpi-top">
        <span className="db2-kpi-label">{label}</span>
        <span className="db2-kpi-ico">{icon}</span>
      </div>
      <div className="db2-kpi-value">{value}</div>
      {trend ? (
        <div className="db2-kpi-foot up"><TrendingUp size={12} strokeWidth={2.5} /> {trend}</div>
      ) : foot ? (
        <div className="db2-kpi-foot">{foot}</div>
      ) : null}
    </Link>
  )
}
