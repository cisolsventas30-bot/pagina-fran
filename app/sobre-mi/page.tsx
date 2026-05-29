'use client'
import { useState, useEffect, useRef } from 'react'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Nav, Footer, WspBubble, wa, useReveal } from '@/components/shared'
import { createClient } from '@/lib/supabase/client'

type CertItem = { src: string; title: string; badge: string; desc: string }
type GalleryItem = { src: string; caption: string }

const CERTS = [
  {
    src: '/cert-iba.png',
    title: 'International Behavior Analyst',
    badge: 'IBA · IBAO',
    desc: 'El nivel más alto de certificación internacional en ABA. Otorgado por la IBAO.',
  },
  {
    src: '/cert-ibt.png',
    title: 'International Behavior Therapist',
    badge: 'IBT · IBAO',
    desc: 'Avala la práctica clínica directa bajo los más rigurosos estándares internacionales.',
  },
  {
    src: '/cert-ados2.png',
    title: 'Certificación en ADOS-2',
    badge: 'Clínico · Fundación MR',
    desc: 'Acreditación clínica en la Escala de Observación para el Diagnóstico del Autismo.',
  },
  {
    src: '/cert-psicologia.png',
    title: 'Psicóloga · UNMSM',
    badge: 'Título profesional · 2023',
    desc: 'Título Profesional de Psicóloga otorgado por la Universidad Nacional Mayor de San Marcos.',
  },
  {
    src: '/cert-neuropsicologia.png',
    title: 'Rehabilitación Neuropsicológica',
    badge: 'Especialización · UNMSM',
    desc: 'Curso de Especialización en Rehabilitación Neuropsicológica — 267 horas pedagógicas.',
  },
  {
    src: '/Certificado_Formacion_teorica_IBT.png',
    title: 'Formación Teórica como Terapeuta de Conducta Internacional',
    badge: 'Formación teórica · IBT',
    desc: '40 horas de formación teórica como terapeuta de conducta internacional — 360ABAOnline.',
  },
  {
    src: '/Certificado_teorico_IBA.png',
    title: 'Formación Teórica como Analista Internacional del Comportamiento',
    badge: 'Formación teórica · IBA',
    desc: '270 horas de formación teórica como Analista Internacional del Comportamiento — 360ABAOnline.',
  },
]


const APPROACH = [
  { num:'01', title:'Basado en evidencia', desc:'Cada decisión terapéutica se apoya en investigación actualizada en ciencias del comportamiento.' },
  { num:'02', title:'Personalizado y humano', desc:'Intervenciones únicas, adaptadas a las necesidades individuales. Sin fórmulas genéricas.' },
  { num:'03', title:'Ética y estándares IBAO', desc:'Formación y práctica alineadas con los lineamientos éticos y técnicos internacionales.' },
  { num:'04', title:'Divulgación accesible', desc:'Traduzco la ciencia del comportamiento a un lenguaje que familias y profesionales pueden usar.' },
]



function CertGallery({ items = CERTS }: { items?: CertItem[] }) {
  const CERTS = items
  const [active, setActive] = React.useState(0)
  const [open, setOpen] = useState<number | null>(null)

  // Si los items cambian (ej: llegan de la DB después del mount), reinicia el índice
  useEffect(() => { setActive(0) }, [items])

  if (CERTS.length === 0) return null

  const prev = () => setActive(i => Math.max(0, i - 1))
  const next = () => setActive(i => Math.min(CERTS.length - 1, i + 1))

  return (
    <>
      <style>{`
        .cert-thumb { transition: opacity .2s, transform .2s; }
        .cert-thumb:hover { opacity: 1 !important; transform: translateY(-2px); }
        @keyframes certFadeIn { from { opacity:0; transform:scale(.97) } to { opacity:1; transform:scale(1) } }
        .cert-gallery-img { width:100%; display:block; aspect-ratio:4/3; object-fit:cover; object-position:top center; transition:transform .4s ease; }
        @media (max-width: 768px) {
          .cert-gallery-wrap { max-width:100%; overflow:hidden; }
        }
      `}</style>

      {/* Layout editorial */}
      <div className="grid-2col-top" style={{ width:'100%' }}>

        {/* Izquierda — número grande + info */}
        <div style={{ paddingTop:'1rem', minWidth:0 }}>
          <div style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(5rem,10vw,8rem)', fontWeight:400, lineHeight:1, color:'#EADFCC', letterSpacing:'-.04em', marginBottom:'-.5rem' }}>
            {String(active + 1).padStart(2, '0')}
          </div>
          <div style={{ height:2, background:'#1F1710', width:60, marginBottom:'1.5rem' }} />
          <span style={{ display:'inline-block', background:'#1F1710', color:'#F4ECDF', padding:'4px 12px', borderRadius:100, fontSize:'.65rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:'1rem' }}>
            {CERTS[active].badge}
          </span>
          <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.4rem,2.5vw,2rem)', fontWeight:400, lineHeight:1.15, color:'#1F1710', marginBottom:'1rem', letterSpacing:'-.02em' }}>
            {CERTS[active].title}
          </h3>
          <p style={{ fontSize:'.95rem', color:'var(--muted)', lineHeight:1.6, marginBottom:'2rem' }}>
            {CERTS[active].desc}
          </p>

          {/* Controles */}
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <button onClick={prev} disabled={active === 0}
              style={{ width:48, height:48, borderRadius:'50%', border:'2px solid #1F1710', background:'transparent', cursor: active === 0 ? 'default':'pointer', opacity: active === 0 ? .25:1, fontSize:'1.2rem', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}
              onMouseEnter={e => { if (active > 0) (e.currentTarget as HTMLButtonElement).style.background='#1F1710'; (e.currentTarget as HTMLButtonElement).style.color='#F4ECDF' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background='transparent'; (e.currentTarget as HTMLButtonElement).style.color='#1F1710' }}
            >&#8592;</button>
            <span style={{ fontFamily:"'Fraunces',serif", fontSize:'.9rem', color:'var(--muted)' }}>
              {active + 1} <span style={{ opacity:.4 }}>/ {CERTS.length}</span>
            </span>
            <button onClick={next} disabled={active === CERTS.length - 1}
              style={{ width:48, height:48, borderRadius:'50%', border:'2px solid #1F1710', background:'transparent', cursor: active === CERTS.length-1 ? 'default':'pointer', opacity: active === CERTS.length-1 ? .25:1, fontSize:'1.2rem', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}
              onMouseEnter={e => { if (active < CERTS.length-1) (e.currentTarget as HTMLButtonElement).style.background='#1F1710'; (e.currentTarget as HTMLButtonElement).style.color='#F4ECDF' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background='transparent'; (e.currentTarget as HTMLButtonElement).style.color='#1F1710' }}
            >&#8594;</button>
          </div>
        </div>

        {/* Derecha — imagen principal */}
        <div style={{ minWidth:0, overflow:'hidden' }}>
          {/* Imagen grande activa */}
          <div
            onClick={() => setOpen(active)}
            className="cert-gallery-wrap"
            style={{ borderRadius:20, overflow:'hidden', boxShadow:'0 20px 60px rgba(31,23,16,.15)', cursor:'zoom-in', marginBottom:'1.25rem', animation:'certFadeIn .4s ease' }}
            key={active}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={CERTS[active].src} alt={CERTS[active].title}
              className="cert-gallery-img"
              onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform='scale(1.03)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform='scale(1)' }}
            />
          </div>

          {/* Miniaturas */}
          <div style={{ display:'flex', gap:'.6rem', overflowX:'auto', paddingBottom:'.5rem', WebkitOverflowScrolling:'touch' }}>
            {CERTS.map((c, i) => (
              <div key={c.src} className="cert-thumb"
                onClick={() => setActive(i)}
                style={{ flexShrink:0, width:72, height:52, borderRadius:8, overflow:'hidden', cursor:'pointer', border: i === active ? '2px solid #1F1710':'2px solid transparent', opacity: i === active ? 1:.5 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.src} alt={c.title} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top', display:'block', pointerEvents:'none' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {open !== null && (
        <div onClick={() => setOpen(null)}
          style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(10,7,4,.93)', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', cursor:'zoom-out', backdropFilter:'blur(8px)' }}
        >
          {open > 0 && (
            <button onClick={e => { e.stopPropagation(); setOpen(open-1); setActive(open-1) }}
              style={{ position:'fixed', left:'1.5rem', top:'50%', transform:'translateY(-50%)', background:'rgba(244,236,223,.1)', border:'1px solid rgba(244,236,223,.2)', borderRadius:'50%', width:52, height:52, cursor:'pointer', color:'#F4ECDF', fontSize:'1.3rem', display:'flex', alignItems:'center', justifyContent:'center' }}
            >&#8592;</button>
          )}
          <div onClick={e => e.stopPropagation()} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1.2rem', maxWidth:'90vw' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={CERTS[open].src} alt={CERTS[open].title}
              style={{ maxWidth:'85vw', maxHeight:'80vh', borderRadius:12, boxShadow:'0 40px 80px rgba(0,0,0,.6)', objectFit:'contain' }}
            />
            <div style={{ textAlign:'center' }}>
              <p style={{ fontFamily:"'Fraunces',serif", fontSize:'1.2rem', color:'#F4ECDF', fontWeight:400, marginBottom:'.25rem' }}>{CERTS[open].title}</p>
              <p style={{ fontSize:'.72rem', color:'rgba(244,236,223,.4)', letterSpacing:'.06em', textTransform:'uppercase' }}>{open+1} / {CERTS.length}</p>
            </div>
          </div>
          {open < CERTS.length - 1 && (
            <button onClick={e => { e.stopPropagation(); setOpen(open+1); setActive(open+1) }}
              style={{ position:'fixed', right:'1.5rem', top:'50%', transform:'translateY(-50%)', background:'rgba(244,236,223,.1)', border:'1px solid rgba(244,236,223,.2)', borderRadius:'50%', width:52, height:52, cursor:'pointer', color:'#F4ECDF', fontSize:'1.3rem', display:'flex', alignItems:'center', justifyContent:'center' }}
            >&#8594;</button>
          )}
          <button onClick={() => setOpen(null)}
            style={{ position:'fixed', top:'1.5rem', right:'1.5rem', background:'rgba(244,236,223,.1)', border:'1px solid rgba(244,236,223,.2)', borderRadius:'50%', width:44, height:44, cursor:'pointer', color:'#F4ECDF', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center' }}
          >&#10005;</button>
        </div>
      )}
    </>
  )
}

/* ── Galería de fotos — 2 filas con auto-scroll + arrastre manual ────────── */
function PhotoGallery({ items }: { items: GalleryItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  // Cerrar con Escape, navegar con flechas
  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      else if (e.key === 'ArrowLeft' && open > 0) setOpen(open - 1)
      else if (e.key === 'ArrowRight' && open < items.length - 1) setOpen(open + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, items.length])

  // Repartimos las fotos en 2 filas alternando
  const rowA = items.filter((_, i) => i % 2 === 0)
  const rowB = items.filter((_, i) => i % 2 === 1)
  const finalA = items.length < 4 ? items : rowA
  const finalB = items.length < 4 ? items : rowB

  const indexOf = (g: GalleryItem) => items.findIndex(x => x.src === g.src)

  return (
    <>
      <div className="capy-marquee-wrap">
        <MarqueeRow items={finalA} direction="right" onPhotoClick={(g) => setOpen(indexOf(g))} />
        {finalB.length > 0 && (
          <MarqueeRow items={finalB} direction="left" onPhotoClick={(g) => setOpen(indexOf(g))} />
        )}

        {/* Fades laterales decorativos */}
        <div className="capy-fade capy-fade-l" />
        <div className="capy-fade capy-fade-r" />
      </div>

      <p className="capy-hint">
        ← arrastra o desliza para ver más fotos →
      </p>

      {/* Lightbox a pantalla completa */}
      {open !== null && (
        <div
          onClick={() => setOpen(null)}
          style={{
            position:'fixed', inset:0, zIndex:9999,
            background:'rgba(15,11,7,.95)', display:'grid', placeItems:'center',
            padding:'2rem', cursor:'zoom-out',
            animation:'capyFade .2s ease',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={items[open].src} alt={items[open].caption}
            style={{
              maxWidth:'92vw', maxHeight:'85vh', objectFit:'contain',
              borderRadius:14, boxShadow:'0 30px 80px rgba(0,0,0,.7)',
              animation:'capyZoomIn .25s cubic-bezier(.22,1,.36,1)',
            }} />
          {items[open].caption && (
            <p style={{
              position:'absolute', bottom:'2.5rem', left:'50%', transform:'translateX(-50%)',
              color:'#F4ECDF', fontSize:'.95rem', fontWeight:500, fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
              padding:'8px 16px', background:'rgba(0,0,0,.4)', borderRadius:100, backdropFilter:'blur(6px)',
              maxWidth:'90vw', textAlign:'center',
            }}>
              {items[open].caption}
            </p>
          )}
          <span style={{
            position:'absolute', top:'1.5rem', left:'1.5rem',
            color:'rgba(244,236,223,.55)', fontSize:'.85rem', fontWeight:600,
            letterSpacing:'.06em', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
          }}>{open + 1} / {items.length}</span>
          {open > 0 && (
            <button onClick={e => { e.stopPropagation(); setOpen(open - 1) }}
              className="capy-lb-nav" style={{ left:'1.5rem' }}
              aria-label="Anterior">&#8592;</button>
          )}
          {open < items.length - 1 && (
            <button onClick={e => { e.stopPropagation(); setOpen(open + 1) }}
              className="capy-lb-nav" style={{ right:'1.5rem' }}
              aria-label="Siguiente">&#8594;</button>
          )}
          <button onClick={() => setOpen(null)}
            className="capy-lb-close"
            aria-label="Cerrar">&#10005;</button>
        </div>
      )}

      <style>{`
        .capy-marquee-wrap {
          position: relative;
          margin: 0 -1.5rem;
        }
        /* Fila con scroll nativo (permite arrastrar/swipear) + auto-scroll por JS */
        .capy-row {
          overflow-x: auto;
          overflow-y: hidden;
          padding: 12px 1.5rem;
          cursor: grab;
          scrollbar-width: none;          /* Firefox */
          -ms-overflow-style: none;       /* IE/Edge legacy */
          user-select: none;
          -webkit-overflow-scrolling: touch;
        }
        .capy-row::-webkit-scrollbar { display: none; }   /* Chrome/Safari */
        .capy-row.dragging { cursor: grabbing; }
        .capy-row.dragging .capy-photo { pointer-events: none; }
        .capy-row-inner {
          display: flex;
          gap: 18px;
          width: max-content;
        }

        .capy-photo {
          flex-shrink: 0;
          width: 260px;
          height: 340px;
          border: none;
          padding: 0;
          background: transparent;
          cursor: zoom-in;
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 6px 22px rgba(31,23,16,.14);
          transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s;
        }
        .capy-photo:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 20px 44px rgba(31,23,16,.28);
          z-index: 2;
        }
        .capy-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .6s cubic-bezier(.22,1,.36,1);
        }
        .capy-photo:hover img { transform: scale(1.08); }

        .capy-photo-cap {
          position: absolute;
          left: 0; right: 0; bottom: 0;
          padding: 28px 16px 14px;
          background: linear-gradient(to top, rgba(15,11,7,.85), rgba(15,11,7,0));
          color: #F4ECDF;
          font-size: .82rem;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          text-align: left;
          line-height: 1.35;
        }
        .capy-photo-zoom {
          position: absolute;
          top: 12px; right: 12px;
          width: 34px; height: 34px;
          display: grid; place-items: center;
          background: rgba(15,11,7,.55);
          color: #F4ECDF;
          font-size: 14px;
          border-radius: 50%;
          opacity: 0;
          transform: scale(.85);
          transition: opacity .25s, transform .25s;
          backdrop-filter: blur(6px);
        }
        .capy-photo:hover .capy-photo-zoom {
          opacity: 1;
          transform: scale(1);
        }

        /* Fades laterales (solo decorativos, no interfieren con el click) */
        .capy-fade {
          position: absolute;
          top: 0; bottom: 0;
          width: 80px;
          pointer-events: none;
          z-index: 1;
        }
        .capy-fade-l { left: 0;  background: linear-gradient(to right, #F4ECDF, transparent); }
        .capy-fade-r { right: 0; background: linear-gradient(to left,  #F4ECDF, transparent); }

        .capy-hint {
          text-align: center;
          margin-top: 1.2rem;
          font-size: .78rem;
          color: rgba(31,23,16,.4);
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          letter-spacing: .04em;
        }

        /* Lightbox controls (compartido) */
        .capy-lb-nav {
          position: fixed;
          top: 50%; transform: translateY(-50%);
          width: 54px; height: 54px;
          border-radius: 50%;
          background: rgba(244,236,223,.1);
          border: 1px solid rgba(244,236,223,.22);
          color: #F4ECDF;
          font-size: 1.35rem;
          cursor: pointer;
          display: grid; place-items: center;
          backdrop-filter: blur(8px);
          transition: background .2s, transform .2s;
        }
        .capy-lb-nav:hover {
          background: rgba(244,236,223,.2);
          transform: translateY(-50%) scale(1.06);
        }
        .capy-lb-close {
          position: fixed;
          top: 1.5rem; right: 1.5rem;
          width: 44px; height: 44px;
          border-radius: 50%;
          background: rgba(244,236,223,.1);
          border: 1px solid rgba(244,236,223,.22);
          color: #F4ECDF;
          font-size: 1rem;
          cursor: pointer;
          display: grid; place-items: center;
          backdrop-filter: blur(8px);
          transition: background .2s;
        }
        .capy-lb-close:hover { background: rgba(244,236,223,.22); }

        @keyframes capyFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes capyZoomIn {
          from { opacity: 0; transform: scale(.94); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Responsive */
        @media (max-width: 800px) {
          .capy-photo { width: 200px; height: 270px; border-radius: 14px; }
          .capy-row-inner { gap: 12px; }
        }
        @media (max-width: 480px) {
          .capy-photo { width: 160px; height: 220px; }
          .capy-fade { width: 40px; }
          .capy-lb-nav { width: 44px; height: 44px; font-size: 1.1rem; }
        }
      `}</style>
    </>
  )
}

/* Tarjeta individual de foto para el marquee */
function PhotoCard({ g, onClick }: { g: GalleryItem; onClick: () => void }) {
  return (
    <button
      className="capy-photo"
      onClick={onClick}
      aria-label={g.caption || 'Foto'}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={g.src} alt={g.caption || ''} loading="lazy" draggable={false} />
      {g.caption && <span className="capy-photo-cap">{g.caption}</span>}
      <span className="capy-photo-zoom">⛶</span>
    </button>
  )
}

/**
 * Fila individual del marquee: scroll horizontal nativo con
 *  - auto-scroll continuo a velocidad lenta (pausable)
 *  - drag manual con mouse (click + arrastrar)
 *  - swipe nativo en táctil (móvil/tablet)
 *  - loop infinito sin saltos (contenido duplicado)
 */
function MarqueeRow({ items, direction, onPhotoClick }: {
  items: GalleryItem[]
  direction: 'left' | 'right'
  onPhotoClick: (g: GalleryItem) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const draggingRef = useRef(false)
  const startXRef = useRef(0)
  const startScrollRef = useRef(0)
  const draggedDistRef = useRef(0)
  const [isDragging, setIsDragging] = useState(false)

  // Velocidad de auto-scroll (px por frame, ~60fps). Signo según dirección.
  const speed = direction === 'right' ? 0.4 : -0.4

  // Auto-scroll loop con requestAnimationFrame
  useEffect(() => {
    if (items.length === 0) return
    let rafId = 0
    // Espera al primer paint para tener scrollWidth correcto
    const start = () => {
      const el = ref.current
      if (!el) return
      const halfWidth = el.scrollWidth / 2
      // Posicionar al medio para que se pueda scrollear en ambas direcciones
      if (direction === 'left' && el.scrollLeft === 0) {
        el.scrollLeft = halfWidth
      }
    }
    setTimeout(start, 50)

    const tick = () => {
      const el = ref.current
      if (el && !pausedRef.current && !draggingRef.current) {
        const halfWidth = el.scrollWidth / 2
        el.scrollLeft += speed
        // Loop seamless: si pasó del medio o de 0, salta sin que se note
        if (el.scrollLeft >= halfWidth) el.scrollLeft -= halfWidth
        else if (el.scrollLeft < 0) el.scrollLeft += halfWidth
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [items.length, speed, direction])

  const onMouseDown = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    draggingRef.current = true
    setIsDragging(true)
    startXRef.current = e.pageX
    startScrollRef.current = el.scrollLeft
    draggedDistRef.current = 0
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!draggingRef.current) return
    const el = ref.current
    if (!el) return
    e.preventDefault()
    const walk = e.pageX - startXRef.current
    draggedDistRef.current = Math.abs(walk)
    el.scrollLeft = startScrollRef.current - walk
  }

  const stopDrag = () => {
    draggingRef.current = false
    setIsDragging(false)
  }

  // Evita que un drag accidental dispare onClick del botón
  const handleCardClick = (g: GalleryItem) => () => {
    if (draggedDistRef.current > 5) return // hubo arrastre, no es click
    onPhotoClick(g)
  }

  return (
    <div
      ref={ref}
      className={`capy-row ${isDragging ? 'dragging' : ''}`}
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false; stopDrag() }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={stopDrag}
    >
      <div className="capy-row-inner">
        {[...items, ...items].map((g, i) => (
          <PhotoCard key={`${direction}-${i}`} g={g} onClick={handleCardClick(g)} />
        ))}
      </div>
    </div>
  )
}


export default function SobreMi() {
  useReveal()

  // Carga certificados y galería desde Supabase y los SUMA a los hardcoded.
  // Los hardcoded (CERTS) siempre van primero; los de la admin se agregan al final.
  const [dbCerts, setDbCerts] = useState<CertItem[]>([])
  const [gallery, setGallery] = useState<GalleryItem[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('sobre_mi_certificates')
      .select('src, title, badge, description')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) {
          setDbCerts(data.map((d: any) => ({
            src: d.src,
            title: d.title || '',
            badge: d.badge || '',
            desc: d.description || '',
          })))
        }
      })
    supabase
      .from('sobre_mi_gallery')
      .select('src, caption')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) {
          setGallery(data.map((d: any) => ({
            src: d.src,
            caption: d.caption || '',
          })))
        }
      })
  }, [])

  // Hardcoded primero + los que sube la admin después
  const certItems = [...CERTS, ...dbCerts]

  return (
    <>
      <Nav />

      {/* HERO */}
      <section className="sobre-mi-hero" style={{ padding:'140px 3rem 5rem', background:'#F4ECDF' }}>
        <div className="section-inner-lg grid-2col">
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:'.8rem', fontWeight:600, marginBottom:'1.2rem', animation:'fadeUp .7s ease both' }}>— Sobre mí</div>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(3rem,5.5vw,4.8rem)', fontWeight:400, letterSpacing:'-.025em', lineHeight:1.02, marginBottom:'1.8rem', animation:'fadeUp .8s .1s ease both' }}>
              Soy <strong>Francesca</strong>,<br />la humana detrás de capyABA.
            </h1>
            <p style={{ fontSize:'1.15rem', color:'var(--muted)', lineHeight:1.55, maxWidth:520, marginBottom:'2rem', animation:'fadeUp .8s .2s ease both' }}>
              Psicóloga, neuropsicóloga y especialista en terapia infantil. Certificada como IBA y IBT por la IBAO. Peruana, apasionada por la ciencia del comportamiento.
            </p>
            <a href={wa('Hola capyABA, quisiera tener una conversación contigo 🦫')} target="_blank" rel="noopener noreferrer" className="btn-wsp">
              💬 Agendar una conversación
            </a>
          </div>
          <div style={{ aspectRatio:'4/5', borderRadius:32, overflow:'hidden', boxShadow:'0 30px 70px rgba(0,0,0,.12)', background:'#F2C8B6', animation:'fadeIn 1s .3s ease both', position:'relative', minWidth:0, maxWidth:'100%' }}>
            <video
              id="hero-video"
              src="https://kimjkyemtzmwprbrdjnw.supabase.co/storage/v1/object/public/videos/IMG_1830%20(1).mp4"
              autoPlay
              muted
              loop
              playsInline
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
            />

            {/* Callout "Click para escuchar" apuntando a la bocina */}
            <div id="sound-callout" style={{
              position:'absolute', bottom:'3.8rem', right:'1rem',
              display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4,
              animation:'soundCallout 3.5s ease-in-out infinite',
              pointerEvents:'none',
            }}>
              <div style={{
                background:'rgba(255,255,255,0.92)',
                backdropFilter:'blur(8px)',
                color:'#1a1a1a',
                borderRadius:'20px 20px 4px 20px',
                padding:'8px 13px',
                fontSize:'.78rem',
                fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
                fontWeight:700,
                whiteSpace:'nowrap',
                boxShadow:'0 4px 16px rgba(0,0,0,.18)',
                letterSpacing:'-.01em',
              }}>
                🔊 Click para escuchar
              </div>
              {/* Flecha curva apuntando al botón */}
              <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg"
                style={{ marginRight: 8 }}>
                <path d="M2 2 C6 2 16 4 18 14" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                <path d="M14 12 L18 14 L17 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>

            <button
              onClick={() => {
                const v = document.getElementById('hero-video') as HTMLVideoElement
                v.muted = !v.muted
                const btn = document.getElementById('mute-btn')!
                btn.textContent = v.muted ? '🔇' : '🔊'
                // Ocultar el callout al hacer click
                const callout = document.getElementById('sound-callout')
                if (callout) callout.style.display = 'none'
              }}
              id="mute-btn"
              style={{
                position:'absolute', bottom:'1rem', right:'1rem',
                background:'rgba(0,0,0,.45)', border:'none', borderRadius:'50%',
                width:40, height:40, cursor:'pointer', fontSize:'1.1rem',
                display:'flex', alignItems:'center', justifyContent:'center',
                backdropFilter:'blur(6px)', color:'#fff',
              }}
            >🔇</button>

            <style>{`
              @keyframes soundCallout {
                0%, 100% { transform: translateY(0);    opacity: 1; }
                50%       { transform: translateY(-6px); opacity: .9; }
              }
            `}</style>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="dark-section">
        <div className="reveal" style={{ maxWidth:900, margin:'0 auto' }}>
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(2.4rem,4.5vw,3.6rem)', fontWeight:400, letterSpacing:'-.025em', lineHeight:1.05, marginBottom:'3rem', color:'#F4ECDF' }}>
            Mi historia empieza con una <strong>pregunta:</strong> ¿como ayudar al mundo?
          </h2>
          <p style={{ fontSize:'1.2rem', color:'rgba(244,236,223,.78)', lineHeight:1.65, marginBottom:'1.5rem' }}>
            Desde muy joven me pregunté cómo aliviar el sufrimiento humano y cómo crear aquello que aún no existe pero es necesario. Esa búsqueda me llevó a interesarme profundamente por el comportamiento humano y a especializarme en Análisis Conductual Aplicado (ABA).
          </p>
          <p style={{ fontSize:'1.2rem', color:'rgba(244,236,223,.78)', lineHeight:1.65, marginBottom:'2.5rem' }}>
           Hoy acompaño a personas y familias en sus procesos de cambio, y formo a profesionales para que puedan entender, predecir y transformar conductas socialmente significativas.
          </p>
          <p style={{ fontSize:'1.2rem', color:'rgba(244,236,223,.78)', lineHeight:1.65, marginBottom:'1.5rem' }}>
            Después me orienté más hacia el trabajo con población infantil, estudiando neuropsicología, certificándome en el ADOS‑2 y realizando otros estudios importantes en intervención y educación infantil.
          </p>
          <p style={{ fontSize:'1.2rem', color:'rgba(244,236,223,.78)', lineHeight:1.65, marginBottom:'1.5rem' }}>
            Mi propósito es hacer del mundo un lugar mejor para todos los niños que, con el tiempo, se convertirán en grandes adultos.
          </p>
          <blockquote style={{ fontFamily:"'Fraunces',serif", fontSize:'1.8rem', fontWeight:400, lineHeight:1.2, letterSpacing:'-.015em', color:'#F5D78E', borderLeft:'3px solid #F5D78E', paddingLeft:'2rem', margin:'2rem 0' }}>
            “Cada niño que recibe apoyo hoy, es un adulto que <em>mañana transforma el mundo</em>.”
          </blockquote>
        </div>
      </section>

      {/* CREDENTIALS — Certificados reales */}
      <section className="section-pad" style={{ background:'#F4ECDF', paddingBottom:'3rem' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div className="reveal" style={{ textAlign:'center', maxWidth:700, margin:'0 auto 4rem' }}>
            <div className="eyebrow">Formación y Certificaciones</div>
            <h2 className="section-title">Formación <strong>rigurosa</strong></h2>
            <p style={{ fontSize:'1rem', color:'var(--muted)', marginTop:'1rem', lineHeight:1.55 }}>
              Haz clic en cualquier certificado para verlo en detalle.
            </p>
          </div>
          <CertGallery items={certItems} />
        </div>
      </section>

      {/* APPROACH */}
      <section style={{ background:'#EADFCC', padding:'3rem 1.5rem 5rem' }}>
        <div className="section-inner grid-2col">
          <div className="reveal">
            <div className="eyebrow">Mi enfoque</div>
            <h2 className="section-title" style={{ marginBottom:'1.5rem' }}>Ciencia rigurosa con <strong>calidez humana</strong></h2>
            <p style={{ fontSize:'1.1rem', color:'var(--muted)', lineHeight:1.55, marginBottom:'2rem' }}>No hay fórmulas mágicas. Cada niño, familia y profesional tiene una historia única.</p>
            {APPROACH.map(a => (
              <div key={a.num} style={{ display:'grid', gridTemplateColumns:'50px 1fr', gap:'1rem', padding:'1.5rem 0', borderTop:'1px solid var(--border)' }}>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:'1.5rem', fontWeight:500, color:'var(--muted)' }}>{a.num}</div>
                <div>
                  <h4 style={{ fontFamily:"'Fraunces',serif", fontSize:'1.3rem', fontWeight:500, marginBottom:'.4rem' }}>{a.title}</h4>
                  <p style={{ fontSize:'.93rem', color:'var(--muted)', lineHeight:1.5 }}>{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="reveal svc-img-col enfoque-img-wrap" style={{ aspectRatio:'4/5', borderRadius:28, overflow:'hidden', boxShadow:'0 20px 50px rgba(0,0,0,.10)', minWidth:0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/francesca-enfoque.png"
              alt="Francesca Ramírez Bontá"
              className="enfoque-img"
              style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 20%', display:'block', transform:'scale(1.15)', transformOrigin:'center 30%' }}
            />
          </div>
        </div>
      </section>

      {/* GALERÍA capyABA — debajo del enfoque, solo si la admin subió fotos */}
      {gallery.length > 0 && (
        <section style={{ background:'#F4ECDF', padding:'6rem 1.5rem 5rem' }}>
          <div style={{ maxWidth:1300, margin:'0 auto' }}>
            {/* Título — sin `reveal` (se renderiza dinámicamente tras cargar fotos
                y el IntersectionObserver ya pasó) */}
            <div style={{ textAlign:'center', maxWidth:760, margin:'0 auto 3.5rem' }}>
              <h2 style={{
                fontFamily:"'Fraunces',serif",
                fontSize:'clamp(2.4rem, 5vw, 3.8rem)', fontWeight:400,
                letterSpacing:'-.025em', lineHeight:1.05,
                color:'#1F1710', margin:0,
              }}>
                Galería <strong>capyABA</strong>
              </h2>
              <p style={{
                fontSize:'1.05rem', color:'var(--muted)',
                marginTop:'1.2rem', lineHeight:1.6, maxWidth:560, margin:'1.2rem auto 0',
              }}>
                Momentos, lugares y experiencias que dan vida a este proyecto.
              </p>
            </div>
            <PhotoGallery items={gallery} />
          </div>
        </section>
      )}

      {/* CTA */}
      <section id="contacto" style={{ background:'#F4ECDF', padding:'5rem 1.5rem', textAlign:'center' }}>
        <div className="reveal">
          <h2 className="section-title" style={{ maxWidth:860, margin:'0 auto 3rem', fontSize:'clamp(2.8rem,5.5vw,4.5rem)' }}>
            ¿Listos para <strong>trabajar juntos?</strong>
          </h2>
          <div style={{ display:'flex', gap:'.75rem', justifyContent:'center', flexWrap:'wrap' }}>
            <a href={wa('Hola capyABA, me gustaría hablar contigo sobre cómo podemos trabajar juntos 🦫')} target="_blank" rel="noopener noreferrer" className="btn-wsp">💬 Escribirme por WhatsApp</a>
            <Link href="/servicios" className="btn-outline">Ver servicios</Link>
          </div>
        </div>
      </section>

      <Footer />
      <WspBubble msg="Hola capyABA, vi tu página de Sobre mí y me gustaría conectar 🦫" />
    </>
  )
}
