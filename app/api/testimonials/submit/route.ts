import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notifyAllAdmins } from '@/lib/notifications/insert'

const VALID_CATEGORIES = ['Familias', 'Supervisión'] as const

export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const role = typeof body.role === 'string' ? body.role.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const quote = typeof body.quote === 'string' ? body.quote.trim() : ''
  const category = VALID_CATEGORIES.includes(body.category) ? body.category : 'Familias'
  const stars = Math.min(5, Math.max(1, parseInt(body.stars, 10) || 5))

  if (!name) return NextResponse.json({ error: 'El nombre es obligatorio.' }, { status: 400 })
  if (name.length > 60) return NextResponse.json({ error: 'El nombre es demasiado largo.' }, { status: 400 })
  if (!quote) return NextResponse.json({ error: 'La reseña es obligatoria.' }, { status: 400 })
  if (quote.length < 30) return NextResponse.json({ error: 'La reseña debe tener al menos 30 caracteres.' }, { status: 400 })
  if (quote.length > 1000) return NextResponse.json({ error: 'La reseña no puede superar 1000 caracteres.' }, { status: 400 })
  if (role && role.length > 60) return NextResponse.json({ error: 'El rol es demasiado largo.' }, { status: 400 })
  if (email && email.length > 120) return NextResponse.json({ error: 'El correo es demasiado largo.' }, { status: 400 })

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w: string) => w[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 3)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { error } = await supabase.from('testimonials').insert({
    name,
    role: role || null,
    email: email || null,
    category,
    quote,
    stars,
    initials,
    is_published: false,
  })

  if (error) {
    console.error('testimonials insert error', error)
    return NextResponse.json({ error: 'No se pudo enviar tu reseña. Intenta más tarde.' }, { status: 500 })
  }

  // Notifica a todos los admins que hay una nueva reseña por aprobar
  await notifyAllAdmins({
    type: 'testimonial_pending',
    title: `Nueva reseña de ${name}`,
    body: quote.length > 80 ? quote.slice(0, 80) + '…' : quote,
    linkUrl: '/admin/testimonials',
  })

  return NextResponse.json({ ok: true })
}
