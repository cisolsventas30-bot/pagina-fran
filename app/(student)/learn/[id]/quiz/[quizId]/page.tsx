import { redirect } from 'next/navigation'

// Los cuestionarios se resuelven dentro del visor del curso, que aplica el
// avance secuencial (no se puede abrir un quiz sin completar lo anterior).
export default function StudentQuizPage({ params }: { params: { id: string; quizId: string } }) {
  redirect(`/learn/${params.id}?item=quiz:${params.quizId}`)
}
