'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Clock3 } from 'lucide-react'

type Answer = {
  id: string
  answer: unknown
  is_correct: boolean | null
  points_earned: number | null
  feedback: string | null
  questions: {
    id: string
    type: string
    question_text: string
    options: { id: string; text: string }[] | null
    correct_answer: unknown
    points: number
    explanation: string | null
  }
}

export function formatQuizAnswer(value: unknown, question: Answer['questions']): string {
  if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) return 'Sin respuesta'
  if (Array.isArray(value)) return value.map(v => formatQuizAnswer(v, question)).join('; ')
  if (question.type === 'true_false') {
    if (value === true || value === 'true') return 'Verdadero'
    if (value === false || value === 'false') return 'Falso'
  }
  return question.options?.find(option => option.id === value)?.text ?? String(value)
}

export default function QuizFeedback({ attemptId }: { attemptId: string }) {
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    fetch(`/api/quiz/feedback?attemptId=${encodeURIComponent(attemptId)}`, { signal: controller.signal, cache: 'no-store' })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'No se pudo cargar el detalle')
        if (!controller.signal.aborted) setAnswers(data.answers)
      })
      .catch(err => { if (!controller.signal.aborted) setError(err.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [attemptId, retry])

  return (
    <section aria-label="Detalle de tus respuestas" style={{ marginTop: 32, textAlign: 'left', borderTop: '1px solid #EDE4D4', paddingTop: 24 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1F1710', marginBottom: 8 }}>Revisa tus respuestas</h3>
      {loading ? (
        <p role="status">Cargando respuestas…</p>
      ) : error ? (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setRetry(n => n + 1)} className="underline mt-2">
            Volver a cargar
          </button>
        </div>
      ) : answers.length === 0 ? (
        <p>No hay respuestas guardadas para este intento.</p>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {answers.map((a, index) => {
            const q = a.questions
            const pending = a.is_correct === null
            const isCorrect = a.is_correct === true
            const color = pending ? '#8B6F47' : isCorrect ? '#0F6E56' : '#C2410C'
            const Icon = pending ? Clock3 : isCorrect ? CheckCircle2 : XCircle

            return (
              <article
                key={a.id}
                style={{
                  padding: 18,
                  border: '1px solid #EDE4D4',
                  borderRadius: 10,
                  background: '#FAF7F2',
                  fontSize: 14,
                  lineHeight: 1.6,
                  overflowWrap: 'anywhere',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, color, fontWeight: 700, marginBottom: 8 }}>
                  <Icon size={18} aria-hidden="true" />
                  <span>
                    Pregunta {index + 1} · {pending ? 'Pendiente de revisión' : isCorrect ? 'Correcta' : 'Incorrecta'}
                  </span>
                  {!pending && (
                    <span style={{ marginLeft: 'auto', fontSize: 12 }}>
                      {a.points_earned ?? 0} / {q.points} puntos
                    </span>
                  )}
                </div>

                {/* Enunciado de la pregunta (se muestra siempre) */}
                <p style={{ fontWeight: 600, whiteSpace: 'pre-wrap', marginBottom: isCorrect ? 12 : 6 }}>
                  {q.question_text}
                </p>

                {/* BLOQUE EXCLUSIVO PARA PREGUNTAS CORRECTAS */}
                {isCorrect && (
                  <>
                    <p style={{ whiteSpace: 'pre-wrap' }}>
                      <strong>Tu respuesta:</strong> {formatQuizAnswer(a.answer, q)}
                    </p>

                    {Boolean(q.explanation?.trim()) && (
                      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #EDE4D4' }}>
                        <strong>Explicación:</strong>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{q.explanation}</p>
                      </div>
                    )}
                  </>
                )}

                {/* BLOQUE PARA PREGUNTAS INCORRECTAS: Solo aviso pedagógico, sin respuestas ni explicaciones */}
                {!pending && !isCorrect && (
                  <p style={{ color: '#8B6F47', fontSize: 13, marginTop: 6, fontStyle: 'italic' }}>
                    💡 Esta respuesta no fue correcta. Revisa el contenido del módulo antes de volver a intentar.
                  </p>
                )}

                {a.feedback?.trim() && (
                  <p style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>
                    <strong>Comentario del instructor:</strong> {a.feedback}
                  </p>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
