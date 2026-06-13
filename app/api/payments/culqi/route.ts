import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { notify, notifyAllAdmins } from '@/lib/notifications/insert'

/**
 * POST /api/payments/culqi
 * Body: { courseId: string, token: string }
 *
 * 1. Verifica que el curso exista y tenga precio
 * 2. Cobra con Culqi usando el token del frontend
 * 3. Si el cargo es exitoso, crea el enrollment del alumno
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { courseId, token, email } = await req.json()
  if (!courseId || !token) {
    return NextResponse.json({ error: 'courseId y token son requeridos' }, { status: 400 })
  }

  const adminClient = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // Obtener el curso y su precio
  const { data: course, error: courseError } = await adminClient
    .from('courses')
    .select('id, title, price, is_published')
    .eq('id', courseId)
    .eq('is_published', true)
    .single()

  if (courseError || !course) {
    return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })
  }
  if (!course.price || course.price <= 0) {
    return NextResponse.json({ error: 'Este curso no tiene precio configurado' }, { status: 400 })
  }

  // Verificar que no esté ya matriculado
  const { data: existingEnrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('course_id', courseId)
    .eq('student_id', user.id)
    .single()

  if (existingEnrollment) {
    return NextResponse.json({ error: 'Ya tienes acceso a este curso' }, { status: 409 })
  }

  // Culqi requiere el monto en céntimos (soles × 100)
  const amountCentimos = Math.round(course.price * 100)

  const culqiResponse = await fetch('https://api.culqi.com/v2/charges', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.CULQI_SECRET_KEY}`,
    },
    body: JSON.stringify({
      amount: amountCentimos,
      currency_code: 'PEN',
      email: email || user.email,
      source_id: token,
      description: `capyABA – ${course.title}`,
      metadata: {
        course_id: courseId,
        user_id: user.id,
      },
    }),
  })

  const culqiData = await culqiResponse.json()

  if (!culqiResponse.ok || culqiData.object === 'error') {
    // Log completo para diagnóstico (ver consola del servidor / logs de Vercel)
    console.error('❌ CULQI ERROR:', {
      status: culqiResponse.status,
      type: culqiData?.type,
      code: culqiData?.code,
      merchant_message: culqiData?.merchant_message,
      user_message: culqiData?.user_message,
      decline_code: culqiData?.decline_code,
      using_sk_live: process.env.CULQI_SECRET_KEY?.startsWith('sk_live_') || false,
      using_sk_test: process.env.CULQI_SECRET_KEY?.startsWith('sk_test_') || false,
    })
    const msg = friendlyCulqiError(culqiData)
    return NextResponse.json({ error: msg }, { status: 402 })
  }

  // Pago exitoso → crear enrollment
  const { error: enrollError } = await adminClient
    .from('enrollments')
    .insert({
      course_id: courseId,
      student_id: user.id,
      status: 'active',
      payment_id: culqiData.id,
      paid_amount: course.price,
      payment_method: 'culqi',
    })

  if (enrollError) {
    console.error('ENROLLMENT ERROR after successful charge:', enrollError, culqiData.id)
    return NextResponse.json(
      { error: 'Pago procesado pero hubo un error al activar el curso. Contáctanos a capyaba@gmail.com con tu comprobante.' },
      { status: 500 }
    )
  }

  // Notifica al alumno y al admin
  await Promise.all([
    notify({
      userId: user.id,
      type: 'enrollment',
      title: `¡Bienvenido a "${course.title}"! 🎓`,
      body: 'Ya tienes acceso al curso. Empezá cuando quieras desde tu panel.',
      linkUrl: `/learn/${courseId}`,
    }),
    notifyAllAdmins({
      type: 'new_enrollment',
      title: 'Nueva matrícula pagada',
      body: `${user.email} compró "${course.title}" (S/ ${course.price}).`,
      linkUrl: `/admin/courses/${courseId}?tab=students`,
    }),
  ])

  return NextResponse.json({
    success: true,
    chargeId: culqiData.id,
    courseId,
  })
}

/**
 * Convierte un error de Culqi en un mensaje claro y accionable en español.
 * Prioriza decline_code (lo que dice el banco emisor); si no, usa el code
 * de Culqi. Devuelve algo útil para el usuario final.
 */
function friendlyCulqiError(data: any): string {
  const declineCode = String(data?.decline_code || '').toLowerCase()
  const code = String(data?.code || '').toUpperCase()
  const type = String(data?.type || '').toLowerCase()

  // ── Por decline_code (estándar internacional) ───────────────────────────
  switch (declineCode) {
    case 'insufficient_funds':
      return '💸 Tu tarjeta no tiene fondos suficientes. Intenta con otra tarjeta o recarga la cuenta.'
    case 'expired_card':
      return '⏰ Tu tarjeta está vencida. Usa otra tarjeta o renueva esta con tu banco.'
    case 'incorrect_cvv':
    case 'incorrect_cvc':
      return '🔒 El código de seguridad (CVV) es incorrecto. Revisa los 3 dígitos del reverso de tu tarjeta.'
    case 'invalid_cvv':
      return '🔒 El CVV ingresado no es válido. Verifica los 3 dígitos del reverso.'
    case 'incorrect_number':
    case 'invalid_number':
      return '💳 El número de tarjeta no es válido. Revísalo y vuelve a intentarlo.'
    case 'invalid_expiry_month':
    case 'invalid_expiry_year':
      return '📅 La fecha de vencimiento no es válida. Revísala (MM/AA).'
    case 'card_declined':
    case 'do_not_honor':
      return '🏦 Tu banco rechazó la compra. Llama al número que figura al reverso de tu tarjeta para autorizarla o intenta con otra.'
    case 'invalid_transaction':
      return '🚫 Tu banco no permite este tipo de transacción. Probablemente tu tarjeta no está habilitada para compras por internet — actívala desde la app de tu banco o usa otra tarjeta.'
    case 'fraudulent':
    case 'pickup_card':
    case 'lost_card':
    case 'stolen_card':
      return '⚠️ Tu banco bloqueó esta operación por seguridad. Contacta a tu banco para más detalles.'
    case 'transaction_not_allowed':
    case 'card_not_supported':
      return '🌍 Tu tarjeta no soporta este tipo de pago. Verifica que tenga habilitadas las compras en línea o usa otra tarjeta.'
    case 'restricted_card':
      return '🔐 Tu tarjeta tiene restricciones que impiden esta compra. Contacta a tu banco.'
    case 'processing_error':
    case 'try_again_later':
      return '⏳ Hubo un error temporal procesando el pago. Espera unos segundos e intenta de nuevo.'
    case 'duplicate_transaction':
      return '🔁 Esta operación ya fue intentada hace poco. Espera un momento antes de reintentarla.'
    case 'currency_not_supported':
      return '💱 Tu tarjeta no acepta pagos en soles peruanos (PEN). Intenta con otra tarjeta.'
  }

  // ── Por código Culqi (DNGE####) ─────────────────────────────────────────
  if (code.startsWith('DNGE')) {
    return '🚫 Tu banco rechazó la transacción. La causa más común: tu tarjeta no está habilitada para compras en línea. Actívala desde la app de tu banco o intenta con otra tarjeta.'
  }

  // ── Por type general ────────────────────────────────────────────────────
  if (type === 'card_error') {
    return '💳 Hay un problema con los datos de tu tarjeta. Revisa el número, la fecha y el CVV.'
  }
  if (type === 'invalid_request_error') {
    return '⚠️ Los datos del pago no son válidos. Refresca la página e intenta de nuevo.'
  }
  if (type === 'api_error') {
    return '⏳ Hubo un problema con el procesador de pagos. Intenta de nuevo en unos minutos.'
  }
  if (type === 'authentication_error') {
    return '⚙️ Error de configuración del comercio. Por favor avísanos a capyaba@gmail.com.'
  }

  // ── Fallback: usar el mensaje de Culqi si existe ────────────────────────
  return (
    data?.user_message ||
    data?.merchant_message ||
    'No pudimos procesar el pago. Intenta con otra tarjeta o contáctanos al WhatsApp.'
  )
}
