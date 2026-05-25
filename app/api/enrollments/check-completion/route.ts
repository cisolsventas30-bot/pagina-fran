import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndCompleteEnrollment } from '@/lib/certificates/auto-complete'

/**
 * POST /api/enrollments/check-completion
 *
 * Body: { enrollmentId: string }
 *
 * Verifica si el alumno completó todas las lecciones y aprobó todos los
 * quizzes del curso. Si sí:
 *   - Marca la matrícula como `completed`
 *   - Inserta el certificado
 *   - Genera el PDF y lo sube al bucket `certificates`
 *
 * Responde { completed: boolean, certificateUrl?: string, error?: string }.
 *
 * Solo el dueño de la matrícula (o un admin) puede dispararlo.
 */
export async function POST(req: NextRequest) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON inválido' }, { status: 400 }) }

  const enrollmentId = typeof body?.enrollmentId === 'string' ? body.enrollmentId : null
  if (!enrollmentId) {
    return NextResponse.json({ error: 'enrollmentId requerido' }, { status: 400 })
  }

  // ── Autorización ─────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // El alumno solo puede chequear su propia matrícula; los admins pueden chequear cualquiera.
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id, student_id')
    .eq('id', enrollmentId)
    .maybeSingle()

  if (!enrollment) {
    return NextResponse.json({ error: 'Matrícula no encontrada' }, { status: 404 })
  }

  if (enrollment.student_id !== user.id) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }
  }

  // ── Ejecutar la verificación + generación de certificado ─────────────────
  const result = await checkAndCompleteEnrollment(enrollmentId)
  return NextResponse.json(result)
}
