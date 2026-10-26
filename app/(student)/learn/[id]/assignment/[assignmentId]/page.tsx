import { redirect } from 'next/navigation'

// Las asignaciones se resuelven dentro del visor del curso, que aplica el
// avance secuencial (no se puede abrir una asignación sin completar lo anterior).
export default function StudentAssignmentPage({ params }: { params: { id: string; assignmentId: string } }) {
  redirect(`/learn/${params.id}?item=assignment:${params.assignmentId}`)
}
