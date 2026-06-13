/**
 * Helpers para insertar notificaciones desde el server (API routes, server actions).
 * Usa la service-role key para bypass de RLS porque los triggers vienen de
 * eventos del sistema, no del usuario destinatario.
 *
 * Nunca arrojan errores — si falla, solo log a la consola del servidor.
 * Una notificación rota no debe romper el flujo principal (matrícula, pago, etc.).
 */

import { createClient } from '@supabase/supabase-js'

export type NotificationType =
  | 'enrollment'           // al alumno: te asignaron / compraste un curso
  | 'certificate'          // al alumno: tu certificado está listo
  | 'comment_reply'        // al alumno: la profe respondió a tu comentario
  | 'testimonial_pending'  // al admin: hay una reseña nueva por aprobar
  | 'quiz_review'          // al admin: hay un ensayo por revisar
  | 'new_enrollment'       // al admin: un alumno se matriculó
  | 'student_completed'    // al admin: un alumno completó el curso
  | 'system'               // general

type NotifyParams = {
  userId: string
  type: NotificationType
  title: string
  body?: string
  linkUrl?: string
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

/** Inserta una notificación para un usuario específico. */
export async function notify(params: NotifyParams): Promise<void> {
  try {
    const supabase = adminClient()
    const { error } = await supabase.from('notifications').insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      body: params.body || null,
      link_url: params.linkUrl || null,
    })
    if (error) console.error('[notify] insert error:', error.message)
  } catch (e: any) {
    console.error('[notify] exception:', e?.message || e)
  }
}

/** Inserta la misma notificación para TODOS los admins de la plataforma. */
export async function notifyAllAdmins(params: Omit<NotifyParams, 'userId'>): Promise<void> {
  try {
    const supabase = adminClient()
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
    if (!admins || admins.length === 0) return
    const rows = admins.map(a => ({
      user_id: a.id,
      type: params.type,
      title: params.title,
      body: params.body || null,
      link_url: params.linkUrl || null,
    }))
    const { error } = await supabase.from('notifications').insert(rows)
    if (error) console.error('[notifyAllAdmins] insert error:', error.message)
  } catch (e: any) {
    console.error('[notifyAllAdmins] exception:', e?.message || e)
  }
}
