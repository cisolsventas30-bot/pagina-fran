'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import { Search, Plus, X, Users, Mail, Phone, Briefcase, Calendar, MapPin, Globe } from 'lucide-react'

type Student = {
  id: string; email: string; full_name: string; created_at: string
  phone?: string | null; profession?: string | null; age?: number | null
  country?: string | null; city?: string | null
}
type Course = { id: string; title: string; is_published: boolean }
type Enrollment = { id: string; student_id: string; course_id: string; status: string }

export default function StudentsManager({
  students, courses, enrollments,
}: { students: Student[]; courses: Course[]; enrollments: Enrollment[] }) {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [localEnrollments, setLocalEnrollments] = useState(enrollments)
  const [saving, setSaving] = useState<string | null>(null)

  const filtered = students.filter(s =>
    (s.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  function getStudentCourses(studentId: string) {
    return localEnrollments.filter(e => e.student_id === studentId)
  }

  async function toggleEnrollment(studentId: string, courseId: string, courseTitle: string) {
    setSaving(courseId)
    const supabase = createClient()
    const existing = localEnrollments.find(e => e.student_id === studentId && e.course_id === courseId)

    if (existing) {
      await supabase.from('enrollments').delete().eq('id', existing.id)
      setLocalEnrollments(localEnrollments.filter(e => e.id !== existing.id))
      showToast(`Acceso a "${courseTitle}" revocado`, 'info')
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: newEnrollment } = await supabase
        .from('enrollments')
        .insert({
          student_id: studentId,
          course_id: courseId,
          assigned_by: user!.id,
          status: 'active',
        })
        .select()
        .single()

      if (newEnrollment) {
        setLocalEnrollments([...localEnrollments, newEnrollment as any])
        showToast(`Acceso a "${courseTitle}" concedido`, 'success')
      }
    }
    setSaving(null)
  }

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'minmax(0, 320px) minmax(0, 1fr)', gap: 16,
    }} className="students-grid">

      <div>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search
            size={14}
            strokeWidth={2.5}
            style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--a-ink-4)',
            }}
          />
          <input
            type="text"
            placeholder="Buscar alumno…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base"
            style={{ paddingLeft: 36 }}
          />
        </div>

        <div style={{
          fontSize: 11, fontWeight: 700,
          color: 'var(--a-ink-3)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: 8,
          padding: '0 4px',
        }}>
          {filtered.length} {filtered.length === 1 ? 'alumno' : 'alumnos'}
        </div>

        <div className="card" style={{ maxHeight: 560, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{
              padding: '32px 20px', textAlign: 'center',
              fontSize: 13, color: 'var(--a-ink-3)',
            }}>
              {search ? 'Sin resultados' : 'Sin alumnos registrados'}
            </div>
          ) : filtered.map((student, idx) => {
            const count = getStudentCourses(student.id).length
            const isSelected = selectedStudent?.id === student.id
            return (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  background: isSelected ? 'var(--b-pink-soft)' : 'transparent',
                  border: 'none',
                  borderLeft: isSelected ? '3px solid var(--b-pink)' : '3px solid transparent',
                  borderBottom: idx < filtered.length - 1 ? '1px solid var(--a-border)' : 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background .12s',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--a-surface)' }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7a6450, var(--b-pink))',
                  color: '#fff',
                  display: 'grid', placeItems: 'center',
                  fontSize: 13, fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {(student.full_name || student.email)[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: 'var(--a-ink)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {student.full_name || 'Sin nombre'}
                  </div>
                  <div style={{
                    fontSize: 11, color: 'var(--a-ink-3)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {student.email}
                  </div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 100,
                  background: count > 0 ? 'var(--a-ok-50)' : 'var(--a-surface)',
                  color: count > 0 ? 'var(--a-ok)' : 'var(--a-ink-3)',
                  whiteSpace: 'nowrap',
                }}>
                  {count} {count === 1 ? 'curso' : 'cursos'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        {!selectedStudent ? (
          <EmptySelection hasStudents={students.length > 0} />
        ) : (
          <div className="card">
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '18px 22px',
              borderBottom: '1px solid var(--a-border)',
              background: 'linear-gradient(180deg, #fff, var(--a-surface))',
            }}>
              <div style={{
                width: 50, height: 50, borderRadius: '50%',
                background: 'linear-gradient(135deg, #7a6450, var(--b-pink))',
                color: '#fff',
                display: 'grid', placeItems: 'center',
                fontSize: 17, fontWeight: 700,
                flexShrink: 0,
                boxShadow: '0 3px 10px -2px rgba(245,139,165,.4)',
              }}>
                {(selectedStudent.full_name || selectedStudent.email)[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 16, fontWeight: 700, color: 'var(--a-ink)',
                  letterSpacing: '-0.015em', marginBottom: 2,
                }}>
                  {selectedStudent.full_name || 'Sin nombre'}
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 12, color: 'var(--a-ink-2)',
                }}>
                  <Mail size={12} strokeWidth={2} />
                  {selectedStudent.email}
                </div>
              </div>
            </div>

            {/* Datos del alumno */}
            <div style={{ padding: '18px 22px 6px' }}>
              <h3 style={{
                fontSize: 11, fontWeight: 700, color: 'var(--a-ink-2)',
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12,
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              }}>
                Datos del alumno
              </h3>
              {(() => {
                const fields = [
                  { icon: <Phone size={14} strokeWidth={2} />, label: 'Teléfono', value: selectedStudent.phone },
                  { icon: <Briefcase size={14} strokeWidth={2} />, label: 'Profesión', value: selectedStudent.profession },
                  { icon: <Calendar size={14} strokeWidth={2} />, label: 'Edad', value: selectedStudent.age ? `${selectedStudent.age} años` : null },
                  { icon: <Globe size={14} strokeWidth={2} />, label: 'País', value: selectedStudent.country },
                  { icon: <MapPin size={14} strokeWidth={2} />, label: 'Ciudad', value: selectedStudent.city },
                ]
                const hasAny = fields.some(f => f.value)
                if (!hasAny) {
                  return (
                    <div style={{
                      padding: '14px 16px', borderRadius: 12,
                      background: 'var(--a-surface)', border: '1px dashed var(--a-border-2)',
                      fontSize: 12.5, color: 'var(--a-ink-3)',
                    }}>
                      Este alumno aún no completó su perfil (teléfono, profesión, ubicación…).
                    </div>
                  )
                }
                return (
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10,
                  }}>
                    {fields.filter(f => f.value).map(f => (
                      <div key={f.label} style={{
                        display: 'flex', alignItems: 'center', gap: 11,
                        padding: '11px 14px', borderRadius: 12,
                        background: 'var(--a-surface)', border: '1px solid var(--a-border)',
                      }}>
                        <span style={{
                          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                          background: 'var(--b-pink-soft)', color: 'var(--b-pink)',
                          display: 'grid', placeItems: 'center',
                        }}>{f.icon}</span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--a-ink-4)' }}>{f.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--a-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>

            <div style={{ padding: '18px 22px 8px' }}>
              <h3 style={{
                fontSize: 11, fontWeight: 700, color: 'var(--a-ink-2)',
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12,
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              }}>
                Cursos asignados
              </h3>

              {courses.length === 0 ? (
                <div style={{
                  padding: '28px 16px', textAlign: 'center',
                  fontSize: 13, color: 'var(--a-ink-3)',
                  background: 'var(--a-surface)',
                  borderRadius: 8,
                }}>
                  No hay cursos publicados aún. Crea y publica un curso primero.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {courses.map((course) => {
                    const isEnrolled = !!getStudentCourses(selectedStudent.id).find(e => e.course_id === course.id)
                    const isSaving = saving === course.id
                    return (
                      <div
                        key={course.id}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '13px 16px',
                          borderRadius: 12,
                          border: '1px solid',
                          borderColor: isEnrolled ? 'rgba(15,110,86,.22)' : 'var(--a-border)',
                          background: isEnrolled ? 'var(--a-ok-50)' : '#fff',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 13, fontWeight: 600, color: 'var(--a-ink)',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {course.title}
                          </div>
                          <div style={{
                            fontSize: 11, fontWeight: 500,
                            color: isEnrolled ? 'var(--a-ok)' : 'var(--a-ink-3)',
                          }}>
                            {isEnrolled ? '✓ Con acceso' : 'Sin acceso'}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleEnrollment(selectedStudent.id, course.id, course.title)}
                          disabled={isSaving}
                          className={isEnrolled ? 'btn-danger' : 'btn-primary'}
                          style={{ padding: '6px 12px', fontSize: 12 }}
                        >
                          {isSaving ? '...' : isEnrolled ? (
                            <><X size={12} strokeWidth={2.5} /> Quitar</>
                          ) : (
                            <><Plus size={12} strokeWidth={2.5} /> Asignar</>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .students-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function EmptySelection({ hasStudents }: { hasStudents: boolean }) {
  return (
    <div className="card" style={{
      padding: '48px 24px',
      textAlign: 'center',
      background: 'var(--a-surface)',
      borderStyle: 'dashed',
    }}>
      <div style={{
        width: 54, height: 54, borderRadius: 16,
        background: 'var(--b-pink-soft)',
        color: 'var(--b-pink)',
        display: 'grid', placeItems: 'center',
        margin: '0 auto 14px',
      }}>
        <Users size={22} strokeWidth={2} />
      </div>
      <h3 style={{
        fontSize: 15, fontWeight: 700, color: 'var(--a-ink)',
        letterSpacing: '-0.015em', marginBottom: 4,
      }}>
        {hasStudents ? 'Selecciona un alumno' : 'Aún no hay alumnos'}
      </h3>
      <p style={{ fontSize: 13, color: 'var(--a-ink-2)', maxWidth: 360, margin: '0 auto' }}>
        {hasStudents
          ? 'Elige un alumno de la lista para ver y asignar sus cursos.'
          : 'Cuando haya alumnos registrados, aparecerán aquí y podrás asignarles cursos.'}
      </p>
    </div>
  )
}
