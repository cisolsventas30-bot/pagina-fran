'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  User, Phone, Briefcase, Calendar, Mail,
  Globe, MapPin, CheckCircle2, AlertCircle, Save, ArrowLeft, Sparkles
} from 'lucide-react'
import Link from 'next/link'

const COUNTRIES = [
  'Argentina','Bolivia','Chile','Colombia','Costa Rica','Cuba','Ecuador',
  'El Salvador','España','Guatemala','Honduras','México','Nicaragua',
  'Panamá','Paraguay','Perú','Puerto Rico','República Dominicana',
  'Uruguay','Venezuela','Otro'
]

export default function AccountPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isWelcome = searchParams.get('welcome') === '1'
  const supabase = createClient()

  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [success, setSuccess]       = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const [fullName,   setFullName]   = useState('')
  const [email,      setEmail]      = useState('')
  const [phone,      setPhone]      = useState('')
  const [profession, setProfession] = useState('')
  const [age,        setAge]        = useState('')
  const [country,    setCountry]    = useState('')
  const [city,       setCity]       = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, phone, profession, age, country, city')
        .eq('id', user.id)
        .single()
      if (profile) {
        setFullName(profile.full_name || '')
        setEmail(profile.email || '')
        setPhone(profile.phone || '')
        setProfession(profile.profession || '')
        setAge(profile.age ? String(profile.age) : '')
        setCountry(profile.country || '')
        setCity(profile.city || '')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error: err } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone || null,
        profession: profession || null,
        age: age ? parseInt(age) : null,
        country: country || null,
        city: city || null,
        profile_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
    setSaving(false)
    if (err) { setError('Error al guardar. Inténtalo de nuevo.'); return }
    setSuccess(true)
    if (isWelcome) {
      setTimeout(() => router.push('/dashboard'), 1200)
    } else {
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 14, color: '#9ca3af' }}>Cargando perfil...</div>
      </div>
    )
  }

  const initials = fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 80px' }}>

      {/* Back */}
      <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', textDecoration: 'none', marginBottom: 24 }}>
        <ArrowLeft size={15} /> Volver al panel
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 32 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, #c4783c, #e0955a)',
          color: '#fff', fontSize: 22, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, boxShadow: '0 4px 14px rgba(196,120,60,.3)',
        }}>
          {initials}
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-.02em' }}>
            Configuración de cuenta
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>
            Actualiza tu información personal
          </p>
        </div>
      </div>

      {/* Welcome banner */}
      {isWelcome && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'linear-gradient(135deg, #fdf4ec, #fff7ed)', border: '1px solid #fed7aa', borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
          <Sparkles size={20} style={{ color: '#c4783c', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#92400e', margin: '0 0 4px' }}>
              ¡Bienvenido/a a capyABA! 🎉
            </p>
            <p style={{ fontSize: 13, color: '#b45309', margin: 0, lineHeight: 1.5 }}>
              Completa tu perfil para que tu instructor conozca mejor tu contexto. Puedes hacerlo ahora o más tarde desde tu cuenta.
            </p>
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#dc2626' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#16a34a' }}>
          <CheckCircle2 size={16} /> ¡Perfil actualizado correctamente!
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,.05)' }}>

          {/* Section: Personal */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9ca3af', margin: '0 0 16px' }}>
              Información personal
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Nombre completo" icon={<User size={14} />} required>
                <input
                  value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Juan Pérez" required
                  style={inputStyle}
                />
              </Field>
              <Field label="Correo electrónico" icon={<Mail size={14} />}>
                <input
                  value={email} disabled
                  style={{ ...inputStyle, background: '#f9fafb', color: '#9ca3af', cursor: 'not-allowed' }}
                />
              </Field>
              <Field label="Teléfono / Celular" icon={<Phone size={14} />}>
                <input
                  value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+51 999 999 999"
                  style={inputStyle}
                />
              </Field>
              <Field label="Edad" icon={<Calendar size={14} />}>
                <input
                  type="number" value={age} onChange={e => setAge(e.target.value)}
                  placeholder="25" min={1} max={120}
                  style={inputStyle}
                />
              </Field>
              <Field label="Profesión / Ocupación" icon={<Briefcase size={14} />} span>
                <input
                  value={profession} onChange={e => setProfession(e.target.value)}
                  placeholder="Terapeuta ABA, Psicólogo, Docente..."
                  style={inputStyle}
                />
              </Field>
            </div>
          </div>

          {/* Section: Location */}
          <div style={{ padding: '20px 24px' }}>
            <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9ca3af', margin: '0 0 16px' }}>
              Ubicación
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="País" icon={<Globe size={14} />}>
                <select value={country} onChange={e => setCountry(e.target.value)} style={inputStyle}>
                  <option value="">Selecciona tu país</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Ciudad" icon={<MapPin size={14} />}>
                <input
                  value={city} onChange={e => setCity(e.target.value)}
                  placeholder="Lima, Buenos Aires..."
                  style={inputStyle}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Save button */}
        <button
          type="submit" disabled={saving}
          style={{
            marginTop: 20, padding: '13px 28px',
            background: saving ? '#d1d5db' : '#111827',
            color: '#fff', border: 'none', borderRadius: 12,
            fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all .15s', alignSelf: 'flex-start',
          }}
        >
          <Save size={15} />
          {saving ? 'Guardando...' : isWelcome ? 'Guardar e ir a mi panel →' : 'Guardar cambios'}
        </button>
        {isWelcome && (
          <Link href="/dashboard" style={{ marginTop: 12, fontSize: 13, color: '#9ca3af', textDecoration: 'none', alignSelf: 'flex-start' }}>
            Omitir por ahora →
          </Link>
        )}
      </form>
    </div>
  )
}

/* ── Helpers ── */

function Field({ label, icon, children, required, span }: {
  label: string; icon: React.ReactNode; children: React.ReactNode; required?: boolean; span?: boolean
}) {
  return (
    <div style={{ gridColumn: span ? '1 / -1' : undefined }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
        <span style={{ color: '#9ca3af' }}>{icon}</span>
        {label}{required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 40, padding: '0 12px',
  border: '1px solid #e5e7eb', borderRadius: 9,
  fontSize: 13, color: '#111827', outline: 'none',
  background: '#fff', boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color .15s',
}
