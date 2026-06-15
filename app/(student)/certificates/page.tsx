import { createClient } from '@/lib/supabase/server'
import MyCertificates from './MyCertificates'

export default async function CertificatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Certificados ya emitidos
  const { data: certificates } = await supabase
    .from('certificates')
    .select(`
      id, student_name, course_title, final_score, issued_at, pdf_url, verification_code,
      enrollments!inner ( id, student_id )
    `)
    .eq('enrollments.student_id', user!.id)
    .order('issued_at', { ascending: false })

  const certs = (certificates as any[]) || []
  const certEnrollmentIds = certs.map((c: any) => c.enrollments?.id).filter(Boolean)

  // Enrollments completados sin certificado (listos para generar)
  const pendingQuery = supabase
    .from('enrollments')
    .select(`
      id, final_score, completed_at,
      courses ( id, title )
    `)
    .eq('student_id', user!.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  const { data: pendingRaw } = certEnrollmentIds.length > 0
    ? await pendingQuery.not('id', 'in', `(${certEnrollmentIds.map((id: string) => `"${id}"`).join(',')})`)
    : await pendingQuery

  const pending = (pendingRaw as any[]) || []

  // Enrollments activos (para disparar chequeo manual si el alumno cree haber completado)
  const { data: activeRaw } = await supabase
    .from('enrollments')
    .select('id, courses ( id, title )')
    .eq('student_id', user!.id)
    .eq('status', 'active')
    .order('started_at', { ascending: false })

  const activeEnrollments = (activeRaw as any[]) || []

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 56px' }}>
      <div className="mb-8">
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(28px, 3.4vw, 38px)', fontWeight: 500, letterSpacing: '-0.035em', color: 'var(--a-ink)', lineHeight: 1, marginBottom: 8 }}>
          Mis certificados
        </h1>
        <p className="text-ink-600">Tus logros en capyABA</p>
      </div>

      <MyCertificates
        initialCerts={certs}
        readyEnrollments={pending}
        activeEnrollments={activeEnrollments}
      />
    </div>
  )
}
