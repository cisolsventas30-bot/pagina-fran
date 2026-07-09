import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware de capyABA (Corregido y Tipado Completo)
 * 1. Sincroniza y propaga correctamente las cookies de autenticación de Supabase SSR.
 * 2. Redirige HTTP → HTTPS en producción (Requerido por Culqi: SSL en todas las URLs).
 * 3. Añade el pathname actual como header para layouts/server components.
 * 4. Controla el Rate Limiting en pasarelas de pago basado en usuario autenticado o IP.
 */

// ── Rate limiting en memoria (edge-compatible) ────────────────────────────
const PAYMENT_RATE_LIMIT = 5
const PAYMENT_WINDOW_MS = 10 * 60 * 1000 // 10 minutos

const attempts = new Map<string, { count: number; windowStart: number }>()

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const record = attempts.get(key)

  if (!record || now - record.windowStart > PAYMENT_WINDOW_MS) {
    attempts.set(key, { count: 1, windowStart: now })
    return false
  }

  if (record.count >= PAYMENT_RATE_LIMIT) {
    return true
  }

  record.count++
  return false
}

let cleanupCounter = 0
function maybeCleanup() {
  cleanupCounter++
  if (cleanupCounter % 100 !== 0) return
  const now = Date.now()
  for (const [key, record] of attempts.entries()) {
    if (now - record.windowStart > PAYMENT_WINDOW_MS) {
      attempts.delete(key)
    }
  }
}
// ─────────────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  // 1. Crear una respuesta base clonando los headers originales de la petición
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Inicializar el cliente SSR encargado de refrescar e inyectar cookies asíncronamente
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        // Aquí está el tipado maestro que elimina el error de TypeScript
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          
          cookiesToSet.forEach(({ name, value }) => 
            request.cookies.set(name, value)
          )
          
          // Clonamos y reconstruimos la respuesta aplicando las nuevas cookies actualizadas
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Evalúa la sesión de Supabase de manera segura (Refresca tokens expirados y asienta cookies)
  const { data: { user } } = await supabase.auth.getUser()

  // ── HTTPS redirect (Requerimiento estricto de Culqi en Producción) ──
  const proto = request.headers.get('x-forwarded-proto')
  if (proto === 'http' && process.env.NODE_ENV === 'production') {
    const httpsUrl = request.nextUrl.clone()
    httpsUrl.protocol = 'https:'
    return NextResponse.redirect(httpsUrl, { status: 301 })
  }

  // ── Rate limiting en endpoints de pago ────────────────────────────────
  const { pathname } = request.nextUrl
  const isPaymentEndpoint =
    pathname.startsWith('/api/payments/culqi') ||
    pathname.startsWith('/api/payments/paypal')

  if (isPaymentEndpoint && request.method === 'POST') {
    maybeCleanup()

    const ip =
      request.headers.get('x-real-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown'

    // Usamos de forma segura el ID del usuario provisto por la sesión sincronizada
    let rateLimitKey = ip
    if (user) {
      rateLimitKey = `user:${user.id}`
    }

    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Demasiados intentos de pago. Espera unos minutos e intenta de nuevo.' },
        { status: 429 }
      )
    }
  }
  // ─────────────────────────────────────────────────────────────────────

  // ── Inyección de Pathname header para Server Components ──
  response.headers.set('x-pathname', pathname)

  return response
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (imágenes optimizadas por Next)
     * - favicon.ico
     * - archivos con funciones o recursos públicos (svg, png, jpg, woff2, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ttf|woff|woff2)$).*)',
  ],
}