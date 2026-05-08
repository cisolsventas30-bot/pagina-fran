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
          .from('profiles').select('role, full_name').eq('id', user.id).single()

        // Si el nombre está vacío o es genérico, sincronizar desde Google
        const googleName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.user_metadata?.given_name ||
          ''

        const needsNameUpdate =
          googleName &&
          (!profile?.full_name ||
            profile.full_name === 'Alumno' ||
            profile.full_name === user.email?.split('@')[0])

        if (needsNameUpdate) {
          await supabase
            .from('profiles')
            .update({ full_name: googleName, updated_at: new Date().toISOString() })
            .eq('id', user.id)
        }

        const redirectTo = profile?.role === 'admin' ? '/admin' : '/dashboard'
        return NextResponse.redirect(`${origin}${redirectTo}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
