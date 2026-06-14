'use client'

/**
 * Buscador del panel admin. Busca cursos y alumnos en vivo (debounced)
 * y muestra resultados en un dropdown con links a la página correspondiente.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, BookOpen, User, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type CourseHit = { kind: 'course'; id: string; title: string }
type StudentHit = { kind: 'student'; id: string; name: string; email: string }
type Hit = CourseHit | StudentHit

export default function AdminSearch() {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<Hit[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cerrar al click afuera
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const runSearch = useCallback(async (term: string) => {
    const supabase = createClient()
    const like = `%${term}%`
    const [{ data: courses }, { data: students }] = await Promise.all([
      supabase.from('courses').select('id, title').ilike('title', like).limit(5),
      supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'student')
        .or(`full_name.ilike.${like},email.ilike.${like}`)
        .limit(5),
    ])
    const results: Hit[] = [
      ...(courses || []).map((c: any) => ({ kind: 'course' as const, id: c.id, title: c.title })),
      ...(students || []).map((s: any) => ({ kind: 'student' as const, id: s.id, name: s.full_name || 'Sin nombre', email: s.email })),
    ]
    setHits(results)
    setActive(0)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const term = q.trim()
    if (term.length < 2) {
      setHits([])
      setLoading(false)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(() => runSearch(term), 250)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [q, runSearch])

  function go(hit: Hit) {
    setOpen(false)
    setQ('')
    setHits([])
    if (hit.kind === 'course') router.push(`/admin/courses/${hit.id}`)
    else router.push(`/admin/students?id=${hit.id}`)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || hits.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(hits.length - 1, a + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a - 1)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (hits[active]) go(hits[active]) }
    else if (e.key === 'Escape') { setOpen(false) }
  }

  const showDropdown = open && q.trim().length >= 2

  return (
    <div className="admin-search" ref={wrapRef} style={{ position: 'relative' }}>
      <Search />
      <input
        type="text"
        placeholder="Buscar curso o alumno…"
        aria-label="Buscar"
        value={q}
        onChange={e => { setQ(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />

      {showDropdown && (
        <div className="adm-search-pop">
          {loading ? (
            <div className="adm-search-state"><Loader2 size={14} className="animate-spin" /> Buscando…</div>
          ) : hits.length === 0 ? (
            <div className="adm-search-state">Sin resultados para “{q.trim()}”.</div>
          ) : (
            hits.map((h, i) => (
              <button
                key={h.kind + h.id}
                className={`adm-search-hit ${i === active ? 'active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(h)}
              >
                <span className="adm-search-hit-ico">
                  {h.kind === 'course' ? <BookOpen size={14} strokeWidth={2.2} /> : <User size={14} strokeWidth={2.2} />}
                </span>
                <span className="adm-search-hit-text">
                  <span className="adm-search-hit-title">
                    {h.kind === 'course' ? h.title : h.name}
                  </span>
                  <span className="adm-search-hit-sub">
                    {h.kind === 'course' ? 'Curso' : h.email}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
