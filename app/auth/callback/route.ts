import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: object }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles').select('role, full_name, profile_completed').eq('id', user.id).single()

        const googleName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.user_metadata?.given_name ||
          ''

        if (!profile) {
          // Usuario nuevo: crear perfil y mandar a completarlo
          await supabase.from('profiles').upsert({
            id: user.id,
            full_name: googleName || user.email?.split('@')[0] || 'Alumno',
            email: user.email,
            role: 'student',
            profile_completed: false,
            updated_at: new Date().toISOString()
          })
          return NextResponse.redirect(`${origin}/account?welcome=1`)
        }

        // Sincronizar nombre desde Google si está vacío/genérico
        const needsNameUpdate =
          googleName &&
          (!profile.full_name ||
            profile.full_name === 'Alumno' ||
            profile.full_name === user.email?.split('@')[0])

        if (needsNameUpdate) {
          await supabase.from('profiles')
            .update({ full_name: googleName, updated_at: new Date().toISOString() })
            .eq('id', user.id)
        }

        // Si nunca completó el perfil, mandarlo a completarlo
        if (!profile.profile_completed) {
          return NextResponse.redirect(`${origin}/account?welcome=1`)
        }

        const redirectTo = profile.role === 'admin' ? '/admin' : '/dashboard'
        return NextResponse.redirect(`${origin}${redirectTo}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
