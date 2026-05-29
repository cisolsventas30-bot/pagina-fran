'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Award, Image as ImageIcon, Upload, Trash2, Save, Loader2,
  ChevronUp, ChevronDown, X,
} from 'lucide-react'

type Cert = {
  id: string
  src: string
  title: string
  badge: string | null
  description: string | null
  sort_order: number
}
type GalleryItem = {
  id: string
  src: string
  caption: string | null
  sort_order: number
}

export default function SobreMiManager({
  initialCerts, initialGallery,
}: {
  initialCerts: Cert[]
  initialGallery: GalleryItem[]
}) {
  const [certs, setCerts] = useState<Cert[]>(initialCerts)
  const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery)
  const [tab, setTab] = useState<'certs' | 'gallery'>('certs')

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1.5px solid var(--a-border)', marginBottom: 22 }}>
        <TabBtn active={tab === 'certs'} onClick={() => setTab('certs')} icon={<Award size={14} strokeWidth={2.2} />} label={`Certificados (${certs.length})`} />
        <TabBtn active={tab === 'gallery'} onClick={() => setTab('gallery')} icon={<ImageIcon size={14} strokeWidth={2.2} />} label={`Galería (${gallery.length})`} />
      </div>

      {tab === 'certs'
        ? <CertsSection items={certs} setItems={setCerts} />
        : <GallerySection items={gallery} setItems={setGallery} />}
    </div>
  )
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '10px 16px', border: 'none', background: 'transparent',
        fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
        cursor: 'pointer', color: active ? 'var(--a-brand)' : 'var(--a-ink-2)',
        borderBottom: active ? '2px solid var(--a-brand)' : '2px solid transparent',
        marginBottom: -1.5,
        transition: 'color .15s',
      }}
    >
      {icon}{label}
    </button>
  )
}

/* ── CERTIFICADOS ─────────────────────────────────────────────────────────── */

function CertsSection({ items, setItems }: { items: Cert[]; setItems: (v: Cert[]) => void }) {
  return (
    <div>
      <UploadButton
        bucketPath="certificates"
        label="Subir nuevo certificado"
        accept="image/png,image/jpeg,image/webp"
        onUploaded={async (url) => {
          const supabase = createClient()
          const { data, error } = await supabase
            .from('sobre_mi_certificates')
            .insert({
              src: url,
              title: 'Nuevo certificado',
              badge: '',
              description: '',
              sort_order: items.length,
            })
            .select()
            .single()
          if (error) { alert('Error: ' + error.message); return }
          if (data) setItems([...items, data as Cert])
        }}
      />

      {items.length === 0 ? (
        <EmptyState label="Aún no has subido ningún certificado." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
          {items.map((c, i) => (
            <CertCard
              key={c.id}
              cert={c}
              canMoveUp={i > 0}
              canMoveDown={i < items.length - 1}
              onChange={updated => setItems(items.map(x => x.id === c.id ? updated : x))}
              onDelete={() => setItems(items.filter(x => x.id !== c.id))}
              onMove={dir => {
                const j = i + dir
                if (j < 0 || j >= items.length) return
                const next = [...items]
                ;[next[i], next[j]] = [next[j], next[i]]
                // Update sort_orders
                next.forEach((it, idx) => { it.sort_order = idx })
                setItems(next)
                // Persist new orders
                const supabase = createClient()
                Promise.all(next.map(it =>
                  supabase.from('sobre_mi_certificates').update({ sort_order: it.sort_order }).eq('id', it.id)
                ))
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CertCard({ cert, canMoveUp, canMoveDown, onChange, onDelete, onMove }: {
  cert: Cert
  canMoveUp: boolean
  canMoveDown: boolean
  onChange: (c: Cert) => void
  onDelete: () => void
  onMove: (dir: -1 | 1) => void
}) {
  const router = useRouter()
  const [title, setTitle] = useState(cert.title || '')
  const [badge, setBadge] = useState(cert.badge || '')
  const [description, setDescription] = useState(cert.description || '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [dirty, setDirty] = useState(false)

  const onField = <K extends 'title' | 'badge' | 'description'>(key: K, val: string) => {
    setDirty(true)
    if (key === 'title') setTitle(val)
    else if (key === 'badge') setBadge(val)
    else setDescription(val)
  }

  async function save() {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('sobre_mi_certificates')
      .update({ title, badge: badge || null, description: description || null })
      .eq('id', cert.id)
    setSaving(false)
    if (error) { alert('Error: ' + error.message); return }
    setDirty(false)
    onChange({ ...cert, title, badge, description })
  }

  async function remove() {
    if (!confirm('¿Eliminar este certificado? También se borrará la imagen.')) return
    setDeleting(true)
    const supabase = createClient()
    // Try to delete the storage file (best-effort)
    const path = extractStoragePath(cert.src)
    if (path) await supabase.storage.from('sobre-mi').remove([path]).catch(() => {})
    const { error } = await supabase.from('sobre_mi_certificates').delete().eq('id', cert.id)
    setDeleting(false)
    if (error) { alert('Error: ' + error.message); return }
    onDelete()
    router.refresh()
  }

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 18,
      padding: 14, background: '#fff',
      border: '1px solid var(--a-border)', borderRadius: 12,
    }}>
      <div style={{
        width: 120, height: 90, borderRadius: 8, overflow: 'hidden',
        background: '#F5EFE6', display: 'grid', placeItems: 'center',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cert.src} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        <input
          value={title} onChange={e => onField('title', e.target.value)}
          placeholder="Título del certificado" className="input-base"
          style={{ fontWeight: 700, fontSize: 14 }}
        />
        <input
          value={badge} onChange={e => onField('badge', e.target.value)}
          placeholder="Etiqueta (ej: IBA · IBAO)" className="input-base"
          style={{ fontSize: 12 }}
        />
        <textarea
          value={description} onChange={e => onField('description', e.target.value)}
          placeholder="Descripción corta" rows={2} className="input-base"
          style={{ fontSize: 12, resize: 'vertical', minHeight: 50, fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch' }}>
        <IconBtn onClick={() => onMove(-1)} disabled={!canMoveUp} title="Subir"><ChevronUp size={14} /></IconBtn>
        <IconBtn onClick={() => onMove(1)} disabled={!canMoveDown} title="Bajar"><ChevronDown size={14} /></IconBtn>
        <IconBtn onClick={save} disabled={!dirty || saving} title="Guardar cambios" highlight={dirty}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        </IconBtn>
        <IconBtn onClick={remove} disabled={deleting} title="Eliminar" danger>
          {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </IconBtn>
      </div>
    </div>
  )
}

/* ── GALERÍA ──────────────────────────────────────────────────────────────── */

function GallerySection({ items, setItems }: { items: GalleryItem[]; setItems: (v: GalleryItem[]) => void }) {
  return (
    <div>
      <UploadButton
        bucketPath="gallery"
        label="Subir nueva foto"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onUploaded={async (url) => {
          const supabase = createClient()
          const { data, error } = await supabase
            .from('sobre_mi_gallery')
            .insert({ src: url, caption: '', sort_order: items.length })
            .select()
            .single()
          if (error) { alert('Error: ' + error.message); return }
          if (data) setItems([...items, data as GalleryItem])
        }}
      />

      {items.length === 0 ? (
        <EmptyState label="Aún no has subido ninguna foto a la galería." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginTop: 20 }}>
          {items.map(g => (
            <GalleryCard
              key={g.id}
              item={g}
              onChange={updated => setItems(items.map(x => x.id === g.id ? updated : x))}
              onDelete={() => setItems(items.filter(x => x.id !== g.id))}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function GalleryCard({ item, onChange, onDelete }: {
  item: GalleryItem
  onChange: (g: GalleryItem) => void
  onDelete: () => void
}) {
  const router = useRouter()
  const [caption, setCaption] = useState(item.caption || '')
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)

  async function saveCaption() {
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('sobre_mi_gallery')
      .update({ caption: caption || null })
      .eq('id', item.id)
    setBusy(false)
    if (error) { alert('Error: ' + error.message); return }
    setDirty(false)
    onChange({ ...item, caption })
  }

  async function remove() {
    if (!confirm('¿Eliminar esta foto?')) return
    setBusy(true)
    const supabase = createClient()
    const path = extractStoragePath(item.src)
    if (path) await supabase.storage.from('sobre-mi').remove([path]).catch(() => {})
    const { error } = await supabase.from('sobre_mi_gallery').delete().eq('id', item.id)
    setBusy(false)
    if (error) { alert('Error: ' + error.message); return }
    onDelete()
    router.refresh()
  }

  return (
    <div style={{
      background: '#fff', border: '1px solid var(--a-border)',
      borderRadius: 10, overflow: 'hidden', position: 'relative',
    }}>
      <button
        onClick={remove}
        disabled={busy}
        title="Eliminar"
        style={{
          position: 'absolute', top: 6, right: 6, zIndex: 2,
          width: 26, height: 26, borderRadius: '50%',
          border: 'none', background: 'rgba(31,23,16,.7)', color: '#fff',
          cursor: busy ? 'not-allowed' : 'pointer',
          display: 'grid', placeItems: 'center',
        }}
      >
        {busy ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.src} alt={caption} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
      <div style={{ padding: '8px 10px', display: 'flex', gap: 6 }}>
        <input
          value={caption}
          onChange={e => { setCaption(e.target.value); setDirty(true) }}
          onBlur={() => { if (dirty) saveCaption() }}
          placeholder="Caption (opcional)"
          className="input-base"
          style={{ fontSize: 12, flex: 1 }}
        />
      </div>
    </div>
  )
}

/* ── SHARED ────────────────────────────────────────────────────────────────── */

function UploadButton({ bucketPath, label, accept, onUploaded }: {
  bucketPath: string
  label: string
  accept: string
  onUploaded: (url: string) => void | Promise<void>
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(file: File) {
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${bucketPath}/${crypto.randomUUID()}.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('sobre-mi')
      .upload(fileName, file, { contentType: file.type, upsert: false })
    if (uploadErr) {
      alert('Error al subir: ' + uploadErr.message)
      setUploading(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('sobre-mi').getPublicUrl(fileName)
    await onUploaded(publicUrl)
    setUploading(false)
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 18px', borderRadius: 100, border: 'none',
          background: uploading ? 'var(--a-surface-2)' : 'var(--a-brand)',
          color: uploading ? 'var(--a-ink-3)' : '#fff',
          fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
          cursor: uploading ? 'not-allowed' : 'pointer',
        }}
      >
        {uploading
          ? <><Loader2 size={14} className="animate-spin" /> Subiendo…</>
          : <><Upload size={14} /> {label}</>}
      </button>
    </>
  )
}

function IconBtn({ children, onClick, disabled, title, danger, highlight }: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  title: string
  danger?: boolean
  highlight?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display: 'grid', placeItems: 'center',
        width: 28, height: 28, borderRadius: 6,
        border: `1px solid ${danger ? '#fca5a5' : highlight ? 'var(--a-brand)' : 'var(--a-border)'}`,
        background: danger ? '#fef2f2' : highlight ? 'var(--a-brand)' : '#fff',
        color: danger ? '#dc2626' : highlight ? '#fff' : 'var(--a-ink-2)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all .12s',
      }}
    >
      {children}
    </button>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div style={{
      marginTop: 20, padding: '40px 20px', textAlign: 'center',
      background: 'var(--a-surface)', border: '1px dashed var(--a-border)',
      borderRadius: 10, color: 'var(--a-ink-3)', fontSize: 13,
    }}>
      {label}
    </div>
  )
}

// Extrae el path interno del bucket desde una public URL de Supabase.
// Ej: https://xxx.supabase.co/storage/v1/object/public/sobre-mi/certificates/abc.png
//   →  certificates/abc.png
function extractStoragePath(url: string): string | null {
  const match = url.match(/\/storage\/v1\/object\/public\/sobre-mi\/(.+)$/)
  return match ? match[1] : null
}
