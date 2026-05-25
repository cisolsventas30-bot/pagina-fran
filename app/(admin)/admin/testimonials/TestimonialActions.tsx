'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, EyeOff, Trash2, Loader2 } from 'lucide-react'

export function TestimonialActions({ id, isPublished }: { id: string; isPublished: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState<null | 'publish' | 'unpublish' | 'delete'>(null)

  async function publish(target: boolean) {
    setLoading(target ? 'publish' : 'unpublish')
    const res = await fetch(`/api/testimonials/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: target }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error || 'Error al actualizar.')
      setLoading(null)
      return
    }
    router.refresh()
    setLoading(null)
  }

  async function remove() {
    if (!confirm('¿Eliminar esta reseña? Esta acción no se puede deshacer.')) return
    setLoading('delete')
    const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error || 'Error al eliminar.')
      setLoading(null)
      return
    }
    router.refresh()
    setLoading(null)
  }

  const btn = 'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <div className="flex items-center gap-2">
      {!isPublished ? (
        <>
          <button
            onClick={() => publish(true)}
            disabled={loading !== null}
            className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}
          >
            {loading === 'publish' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            Aprobar
          </button>
          <button
            onClick={remove}
            disabled={loading !== null}
            className={`${btn} bg-red-50 text-red-700 hover:bg-red-100 border border-red-200`}
          >
            {loading === 'delete' ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
            Rechazar
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => publish(false)}
            disabled={loading !== null}
            className={`${btn} bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200`}
          >
            {loading === 'unpublish' ? <Loader2 className="w-3 h-3 animate-spin" /> : <EyeOff className="w-3 h-3" />}
            Despublicar
          </button>
          <button
            onClick={remove}
            disabled={loading !== null}
            className={`${btn} bg-red-50 text-red-700 hover:bg-red-100 border border-red-200`}
          >
            {loading === 'delete' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            Eliminar
          </button>
        </>
      )}
    </div>
  )
}
