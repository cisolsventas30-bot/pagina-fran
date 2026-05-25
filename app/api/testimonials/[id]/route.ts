import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', status: 401 as const, supabase: null }
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    return { error: 'Solo administradores', status: 403 as const, supabase: null }
  }
  return { error: null, status: 200 as const, supabase }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, status, supabase } = await requireAdmin()
  if (error || !supabase) return NextResponse.json({ error }, { status })

  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON inválido' }, { status: 400 }) }

  const patch: Record<string, unknown> = {}
  if (typeof body.is_published === 'boolean') patch.is_published = body.is_published
  if (typeof body.name === 'string') patch.name = body.name.trim().slice(0, 60)
  if (typeof body.role === 'string') patch.role = body.role.trim().slice(0, 60) || null
  if (typeof body.quote === 'string') patch.quote = body.quote.trim().slice(0, 1000)
  if (typeof body.category === 'string' && ['Familias', 'Supervisión'].includes(body.category)) patch.category = body.category
  if (typeof body.stars === 'number') patch.stars = Math.min(5, Math.max(1, body.stars))

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'Sin cambios' }, { status: 400 })
  }

  const { error: updateErr } = await supabase
    .from('testimonials')
    .update(patch)
    .eq('id', params.id)

  if (updateErr) {
    console.error('testimonials update error', updateErr)
    return NextResponse.json({ error: 'No se pudo actualizar la reseña.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error, status, supabase } = await requireAdmin()
  if (error || !supabase) return NextResponse.json({ error }, { status })

  const { error: delErr } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', params.id)

  if (delErr) {
    console.error('testimonials delete error', delErr)
    return NextResponse.json({ error: 'No se pudo eliminar la reseña.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
