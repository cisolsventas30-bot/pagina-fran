import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware que:
 * 1. Redirige HTTP → HTTPS en producción (requerido por Culqi: SSL en todas las URLs)
 * 2. Añade el pathname actual como header para layouts/server components
 */
export function middleware(request: NextRequest) {
  // ── HTTPS redirect (Culqi requirement: SSL en todas las URLs) ──
  // En producción, si la petición llega por HTTP, redirigir a HTTPS
  const proto = request.headers.get('x-forwarded-proto')
  if (proto === 'http' && process.env.NODE_ENV === 'production') {
    const httpsUrl = request.nextUrl.clone()
    httpsUrl.protocol = 'https:'
    return NextResponse.redirect(httpsUrl, { status: 301 })
  }

  // ── Pathname header para server components ──
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas excepto:
     * - _next/static (assets estáticos)
     * - _next/image (imágenes optimizadas)
     * - favicon.ico
     * - archivos públicos
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ttf|woff|woff2)$).*)',
  ],
}
