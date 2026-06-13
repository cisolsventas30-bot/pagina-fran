'use client'

/**
 * Campana de notificaciones reutilizable para admin y alumno.
 *  - Carga las notificaciones del usuario actual (RLS las filtra automáticamente)
 *  - Subscribe a realtime para mostrar nuevas notificaciones en vivo
 *  - Badge con contador de no leídas
 *  - Dropdown con lista, click → marca leída y navega al link
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Notification = {
  id: string
  type: string
  title: string
  body: string | null
  link_url: string | null
  is_read: boolean
  created_at: string
}

type Props = {
  variant?: 'admin' | 'student'  // diferentes estilos de botón según topbar
  userId: string
}

const ICONS: Record<string, string> = {
  enrollment: '🎓',
  certificate: '🏆',
  comment_reply: '💬',
  testimonial_pending: '⭐',
  quiz_review: '📝',
  new_enrollment: '👤',
  student_completed: '🎉',
  system: '🔔',
}

export default function NotificationsBell({ variant = 'admin', userId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = items.filter(n => !n.is_read).length

  // Cierra el dropdown al click afuera
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (!dropdownRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  // Carga inicial + realtime
  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data } = await supabase
        .from('notifications')
        .select('id, type, title, body, link_url, is_read, created_at')
        .order('created_at', { ascending: false })
        .limit(20)
      setItems((data as Notification[]) || [])
      setLoading(false)
    }
    load()

    // Realtime: nuevas notificaciones aparecen sin recargar
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          setItems(prev => [payload.new as Notification, ...prev].slice(0, 20))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const markRead = useCallback(async (id: string) => {
    const supabase = createClient()
    setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  }, [])

  const markAllRead = useCallback(async () => {
    const supabase = createClient()
    const unreadIds = items.filter(n => !n.is_read).map(n => n.id)
    if (unreadIds.length === 0) return
    setItems(prev => prev.map(n => ({ ...n, is_read: true })))
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds)
  }, [items])

  const remove = useCallback(async (id: string) => {
    const supabase = createClient()
    setItems(prev => prev.filter(n => n.id !== id))
    await supabase.from('notifications').delete().eq('id', id)
  }, [])

  const handleClick = (n: Notification) => {
    if (!n.is_read) markRead(n.id)
    if (n.link_url) {
      setOpen(false)
      router.push(n.link_url)
    }
  }

  const buttonClass = variant === 'admin'
    ? 'admin-iconbtn'
    : 'hidden sm:flex p-2 rounded-full hover:bg-ink-100 transition focus:ring-2 focus:ring-brand-500 focus:outline-none'

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        className={buttonClass}
        aria-label="Notificaciones"
        onClick={() => setOpen(o => !o)}
        style={{ position: 'relative' }}
      >
        <Bell
          size={variant === 'admin' ? 17 : 20}
          strokeWidth={2}
          className={variant === 'student' ? 'w-5 h-5 text-ink-600' : ''}
        />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: variant === 'admin' ? 4 : 2,
            right: variant === 'admin' ? 4 : 2,
            minWidth: 16, height: 16,
            padding: '0 4px',
            background: '#DC2626', color: '#fff',
            borderRadius: 100,
            fontSize: 10, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--a-bg, #fff)',
            lineHeight: 1,
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: 360,
          maxHeight: 'min(70vh, 540px)',
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          boxShadow: '0 14px 38px rgba(0,0,0,0.14)',
          zIndex: 100,
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          animation: 'notifFade .15s ease',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px',
            borderBottom: '1px solid #f3f4f6',
          }}>
            <span style={{ fontWeight: 800, fontSize: 14, color: '#1F1710' }}>
              Notificaciones {unreadCount > 0 && <span style={{ color: '#DC2626', fontSize: 12, fontWeight: 700 }}>· {unreadCount}</span>}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 11, fontWeight: 700, color: '#6B5E4E',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontFamily: 'inherit',
                }}
              >
                <Check size={12} /> Marcar todas
              </button>
            )}
          </div>

          {/* Lista */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ padding: 30, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                Cargando…
              </div>
            ) : items.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔕</div>
                Sin notificaciones por ahora.
              </div>
            ) : (
              items.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    display: 'flex', gap: 12,
                    padding: '12px 14px',
                    background: n.is_read ? '#fff' : '#FEF7ED',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: n.link_url ? 'pointer' : 'default',
                    transition: 'background .12s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = n.is_read ? '#FAFAFA' : '#FDF2E0'}
                  onMouseLeave={e => e.currentTarget.style.background = n.is_read ? '#fff' : '#FEF7ED'}
                >
                  <div style={{
                    width: 36, height: 36, flexShrink: 0,
                    borderRadius: 8, background: '#F5EFE6',
                    display: 'grid', placeItems: 'center',
                    fontSize: 16,
                  }}>
                    {ICONS[n.type] || '🔔'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 700, color: '#1F1710',
                      lineHeight: 1.3, marginBottom: 2,
                    }}>
                      {n.title}
                    </div>
                    {n.body && (
                      <div style={{ fontSize: 12, color: '#6B5E4E', lineHeight: 1.4, marginBottom: 4 }}>
                        {n.body}
                      </div>
                    )}
                    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>
                      {relativeTime(n.created_at)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(n.id) }}
                    aria-label="Eliminar"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: 4, opacity: 0.4,
                      alignSelf: 'flex-start',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
                  >
                    <X size={13} />
                  </button>
                  {!n.is_read && (
                    <span style={{
                      position: 'absolute', top: 18, right: 28,
                      width: 7, height: 7, borderRadius: '50%',
                      background: '#DC2626',
                    }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes notifFade {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return 'ahora'
  const m = Math.floor(s / 60)
  if (m < 60) return `hace ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h} ${h === 1 ? 'hora' : 'horas'}`
  const d = Math.floor(h / 24)
  if (d < 30) return `hace ${d} ${d === 1 ? 'día' : 'días'}`
  return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
}
