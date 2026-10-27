import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const attemptId = req.nextUrl.searchParams.get('attemptId')
  if (!attemptId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(attemptId)) {
    return NextResponse.json({ error: 'Intento inválido' }, { status: 400 })
  }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Inicia sesión para ver tus respuestas' }, { status: 401 })

  // Keep the user's session and RLS; only return submitted attempts they own.
  const { data: attempt, error } = await supabase
    .from('quiz_attempts')
    .select(`id, needs_review, enrollments!inner(student_id), attempt_answers (
      id, answer, is_correct, points_earned, feedback,
      questions ( id, type, question_text, options, correct_answer, points, explanation, "order" )
    )`)
    .eq('id', attemptId)
    .eq('enrollments.student_id', user.id)
    .not('submitted_at', 'is', null)
    .maybeSingle()

  if (error) return NextResponse.json({ error: 'No se pudo cargar el detalle' }, { status: 500 })
  if (!attempt) return NextResponse.json({ error: 'Resultado no encontrado' }, { status: 404 })
// En app/api/quiz/feedback/route.ts (al final):
const answers = (attempt.attempt_answers as any[])
  .filter(a => a.questions)
  .sort((a, b) => a.questions.order - b.questions.order || a.questions.id.localeCompare(b.questions.id))
  .map(a => {
    if (a.is_correct !== true) {
      return {
        ...a,
        questions: {
          ...a.questions,
          correct_answer: null, // Oculta la alternativa correcta para que no se filtre por red
          // explanation se mantiene para que el estudiante lea el apoyo pedagógico
        }
      }
    }
    return a
  })

return NextResponse.json({ answers }, { headers: { 'Cache-Control': 'private, no-store' } })
}
