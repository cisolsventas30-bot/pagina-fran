'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Nav, Footer, WspBubble, wa, useReveal } from '@/components/shared'
import { createClient } from '@/lib/supabase/client'

const ACCENT_PALETTE = ['#C8DFB0', '#F5C9A0', '#F5DFD3', '#D4E0C5', '#F2C8B6', '#E8DCC2']
type Testimonial = {
  cat: string
  quote: string
  name: string
  role: string
  initials: string
  accent: string
  stars: number
}

const TESTIMONIALS = [
  // FAMILIAS
  { cat:'Familias', quote:'Su explicación es muy detallada, sus métodos que aplica en las terapias son muy dinámicos, además de ser una profesional con mucho carisma, es muy empática y tiene mucha paciencia. Mi pequeño está feliz de tenerla como su miss Fran y está avanzando con sus terapias.', name:'Rosa S. M.', role:'Mamá · Terapia Infantil', initials:'RS', accent:'#C8DFB0', stars:5 },
  { cat:'Familias', quote:'Satisfecho con la aclaración de los temas a trabajar con mis pequeños, y sobretodo con la aplicación de técnicas que veo que son de gran utilidad para ellos.', name:'César Palacios', role:'Papá · Consultorio', initials:'CP', accent:'#F5C9A0', stars:5 },
  { cat:'Familias', quote:'La terapista tiene una gran capacidad y dominio en las áreas en las que se enfoca, además de una atención impecable. Siempre se ha mostrado muy empática y sin duda es la terapista ideal para brindarle la mejor atención a los pequeños que la necesitan.', name:'I.C.', role:'Mamá · Consultorio', initials:'IC', accent:'#F5DFD3', stars:5 },
  { cat:'Familias', quote:'Una buena profesional que crea un ambiente seguro y acogedor donde los niños se sienten cómodos para expresar sus sentimientos. Reconoce la importancia de la familia en el desarrollo del niño y trabaja en colaboración con ellos.', name:'Kristhian', role:'Padre · Videollamada', initials:'K', accent:'#D4E0C5', stars:5 },
  { cat:'Familias', quote:'Una psicóloga muy abierta a dar explicaciones y que brinda un servicio de calidad a sus pacientes.', name:'Jaime Arrisueño', role:'Padre · Videollamada', initials:'JA', accent:'#F2C8B6', stars:5 },
  { cat:'Familias', quote:'Excelente profesional, muy paciente y comprensiva con sus pacientes.', name:'C.E.N.A', role:'Familia · Consultorio', initials:'CE', accent:'#E8DCC2', stars:5 },
  { cat:'Familias', quote:'Buena atención, paciencia, empatía..., trato personalizado. ¡Recomendado!', name:'Jenny', role:'Mamá · Consultorio', initials:'J', accent:'#F5DFD3', stars:5 },
  { cat:'Familias', quote:'Excelente intervención, tiene metodología de llegar al niño.', name:'Melisa', role:'Mamá · Consultorio', initials:'M', accent:'#C8DFB0', stars:5 },
  { cat:'Familias', quote:'Muy buena doctora, empática y amable. Solicita exámenes previos antes de diagnosticar.', name:'Melody Chirinos', role:'Mamá · Videollamada', initials:'MC', accent:'#F5C9A0', stars:5 },
  { cat:'Familias', quote:'Me gustó porque brinda explicaciones y recomendaciones claras.', name:'Esther', role:'Mamá · Consultorio', initials:'E', accent:'#F2C8B6', stars:5 },
  { cat:'Familias', quote:'Súper atentos con la atención de mi pequeño. Sé que me ayudarán con su conducta.', name:'Massimo', role:'Papá · Consultorio', initials:'Ma', accent:'#D4E0C5', stars:5 },
  { cat:'Familias', quote:'Especialistas que atienden con dedicación, escuchando nuestros problemas y ayudando a resolverlos con pautas para poder mejorar cada día.', name:'Myrian', role:'Mamá · Primera Visita', initials:'My', accent:'#E8DCC2', stars:5 },
  // SUPERVISIÓN
  { cat:'Supervisión', quote:'Franchesca fue pieza fundamental en mi proceso de aprendizaje sobre el ABA. Es una mentora que refleja una pasión por enseñar no solo lo teórico y práctico, sino también la dedicación para mejorar la calidad de vida de los niños. En lo profesional, Fran es un modelo a seguir.', name:'Franklin Zelada', role:'Terapeuta · Formación ABA', initials:'FZ', accent:'#C8DFB0', stars:5 },
  { cat:'Supervisión', quote:'Durante mi internado, Fran ha sido una supervisora fundamental en mi aprendizaje sobre ABA y su aplicación en la terapia con niños. Su guía y retroalimentación me han permitido mejorar en la intervención y seguir desarrollándome profesionalmente.', name:'N.L.S', role:'Interna · Supervisión ABA', initials:'NLS', accent:'#F5C9A0', stars:5 },
  { cat:'Supervisión', quote:'Fran es una excelente opción como psicóloga. Realiza un análisis profundo de cada caso con un abordaje empático. Como supervisora ha sido súper flexible y amable, con ganas constantes de capacitarse para brindar un mejor servicio.', name:'A.M.B.', role:'Interna · Supervisión ABA', initials:'AMB', accent:'#F5DFD3', stars:5 },
  { cat:'Supervisión', quote:'Durante mi periodo de internado aprendí muchísimo sobre ABA con Francesca, tanto teórico como práctico. Su calidez y claridad al abordar cada caso me ayudaron a comprender cómo acompañar a los niños de manera respetuosa y efectiva.', name:'F.I.L', role:'Interna · Formación ABA', initials:'FIL', accent:'#D4E0C5', stars:5 },
  { cat:'Supervisión', quote:'Francesca tiene una dedicación admirable a cada caso, brindando recomendaciones y tratamientos basados en evidencia, efectivos y siempre teniendo en cuenta el trato humano que cada niño merece.', name:'S. Olivares', role:'Profesional · ABA', initials:'SO', accent:'#F2C8B6', stars:5 },
  { cat:'Supervisión', quote:'Fran ha sido mi supervisora en mi etapa de internado, con la que he aprendido bastante sobre ABA y su aplicación en terapia con niños. He podido ser guiada y evaluada al hacer intervención; algo que me permite seguir creciendo como profesional.', name:'E.M.T', role:'Interna · Supervisión ABA', initials:'EMT', accent:'#E8DCC2', stars:5 },
  { cat:'Supervisión', quote:'Fran es una profesional con trato humano hacia pacientes, familia y aprendices. Tiene un enfoque estructurado y mucha disposición para resolver dudas, permitiéndome desarrollar habilidades clave para mi crecimiento profesional.', name:'B.I.', role:'Interna · Supervisión ABA', initials:'BI', accent:'#C8DFB0', stars:5 },
  { cat:'Supervisión', quote:'Muy actualizada con métodos modernos y correcta aplicación a pacientes.', name:'L.B.', role:'Profesional · Consultorio', initials:'LB', accent:'#F5C9A0', stars:5 },
]

const CATS = ['Todos','Familias','Supervisión']
const STATS = [
  { num:'29+', label:'Opiniones verificadas' },
  { num:'100%', label:'Recomendarían a capyABA' },
  { num:'4.9★', label:'Calificación promedio' },
]

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div style={{ display:'flex', gap:2, marginBottom:'.75rem' }}>
      {Array.from({ length:5 }).map((_,i) => (
        <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill={i < count ? '#E8A020' : '#D4C9B8'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )
}

export default function Testimonios() {
  useReveal()
  const [active, setActive] = useState('Todos')
  const [dbReviews, setDbReviews] = useState<Testimonial[]>([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('testimonials')
      .select('name, role, category, quote, stars, initials, accent')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setDbReviews(data.map((d: any, i: number) => ({
            cat: d.category || 'Familias',
            quote: d.quote || '',
            name: d.name || 'Anónimo',
            role: d.role || '',
            initials: d.initials || (d.name || 'A').slice(0, 2).toUpperCase(),
            accent: d.accent || ACCENT_PALETTE[i % ACCENT_PALETTE.length],
            stars: d.stars || 5,
          })))
        }
      })
  }, [])

  const allReviews: Testimonial[] = [...dbReviews, ...TESTIMONIALS]
  const filtered = active === 'Todos' ? allReviews : allReviews.filter(t => t.cat === active)

  return (
    <>
      <Nav />

      <section className="page-header">
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div className="eyebrow">Historias reales</div>
          <h1>Testimonios de quienes dieron el siguiente paso</h1>
          <p>Familias, terapeutas y analistas conductuales que confiaron en el proceso y vieron resultados.</p>
        </div>
      </section>

      <section className="dark-section">
        <div className="reveal" style={{ maxWidth:1000, margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontFamily:"'Fraunces',serif", fontSize:'7rem', lineHeight:.5, color:'#F5D78E', opacity:.45, marginBottom:'1rem' }}>&ldquo;</div>
          <blockquote style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.8rem,3.2vw,2.8rem)', fontWeight:400, lineHeight:1.15, letterSpacing:'-.02em', color:'#F4ECDF', marginBottom:'3rem' }}>
            Su explicación es muy detallada, sus métodos son muy dinámicos, además de ser una profesional con mucho carisma. Mi pequeño está feliz de tenerla como su miss Fran y está{' '}
            <em style={{ color:'#F5D78E' }}>avanzando con sus terapias</em>.
          </blockquote>
          <div style={{ display:'inline-flex', alignItems:'center', gap:16 }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'#C8DFB0', color:'#1F1710', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Fraunces',serif", fontSize:'1.15rem', fontWeight:700 }}>RS</div>
            <div style={{ textAlign:'left' }}>
              <strong style={{ display:'block', color:'#F4ECDF', fontWeight:600 }}>Rosa S. M.</strong>
              <span style={{ color:'rgba(244,236,223,.6)', fontSize:'.9rem' }}>Mamá · Terapia Infantil · Lima, Perú</span>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER TABS */}
      <section style={{ padding:'5rem 3rem 2rem', background:'#F4ECDF', textAlign:'center' }}>
        <div className="reveal">
          <h2 className="section-title" style={{ marginBottom:'2.5rem' }}>Lo que dicen <strong>de mi trabajo</strong></h2>
          <div style={{ display:'inline-flex', gap:'.4rem', background:'rgba(31,23,16,.08)', padding:4, borderRadius:100 }}>
            {CATS.map(c => (
              <button key={c} onClick={() => setActive(c)} style={{
                padding:'.6rem 1.5rem', borderRadius:100, fontSize:'.88rem', fontWeight:600,
                cursor:'pointer', border:'none',
                background: active===c ? '#1F1710' : 'transparent',
                color: active===c ? '#F4ECDF' : '#1F1710',
                transition:'all .2s',
              }}>{c}</button>
            ))}
          </div>
        </div>
      </section>

      {/* MASONRY CARDS */}
      <section style={{ padding:'1.5rem 2.5rem 8rem', background:'#F4ECDF' }}>
        <div style={{ maxWidth:1300, margin:'0 auto', columns:'3 320px', columnGap:'1.2rem' }}>
          {filtered.map((t, i) => (
            <div
              key={t.name + i}
              style={{
                breakInside:'avoid', marginBottom:'1.2rem',
                background:'#fff', borderRadius:20,
                padding:'1.6rem',
                border:'1.5px solid rgba(31,23,16,.07)',
                boxShadow:'0 2px 10px rgba(31,23,16,.05)',
                transition:'transform .25s, box-shadow .25s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow='0 16px 36px rgba(31,23,16,.12)' }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 10px rgba(31,23,16,.05)' }}
            >
              {/* Avatar + name row */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{
                    width:42, height:42, borderRadius:'50%', background:t.accent,
                    color:'#1F1710', display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'.75rem', fontWeight:800, flexShrink:0, letterSpacing:'.02em',
                  }}>{t.initials}</div>
                  <div>
                    <strong style={{ display:'block', fontSize:'.9rem', color:'#1F1710', lineHeight:1.2 }}>{t.name}</strong>
                    <span style={{ fontSize:'.72rem', color:'#8A7E74' }}>{t.role}</span>
                  </div>
                </div>
                <span style={{
                  background: t.cat==='Supervisión' ? '#D4E0C5' : '#F5DFD3',
                  color:'#1F1710', padding:'3px 9px', borderRadius:100,
                  fontSize:'.6rem', fontWeight:700, letterSpacing:'.06em',
                  textTransform:'uppercase', flexShrink:0,
                }}>{t.cat}</span>
              </div>

              {/* Stars */}
              <Stars count={t.stars} />

              {/* Verified badge */}
              <div style={{ display:'inline-flex', alignItems:'center', gap:4, background:'rgba(46,125,79,.1)', color:'#2E7D4F', padding:'3px 8px', borderRadius:100, fontSize:'.65rem', fontWeight:600, marginBottom:'0.9rem' }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="#2E7D4F"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                Cita verificada
              </div>

              {/* Quote */}
              <p style={{ fontFamily:"'Fraunces',serif", fontSize:'.97rem', lineHeight:1.6, color:'#2A2118', margin:0 }}>
                <span style={{ fontSize:'1.6rem', lineHeight:0, verticalAlign:'-.3em', marginRight:3, color:t.accent, fontFamily:'Georgia,serif' }}>&ldquo;</span>
                {t.quote}
                <span style={{ fontSize:'1.6rem', lineHeight:0, verticalAlign:'-.3em', marginLeft:3, color:t.accent, fontFamily:'Georgia,serif' }}>&rdquo;</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS dark */}
      <section style={{ background:'#1F1710', padding:'6rem 3rem' }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'2rem' }}>
            {STATS.map((s,i) => (
              <div key={s.num} className="reveal" style={{ textAlign:'center', transitionDelay:`${i*.1}s` }}>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(3rem,5vw,4.5rem)', fontWeight:400, letterSpacing:'-.03em', lineHeight:1, marginBottom:'.75rem', color:'#F5D78E' }}>{s.num}</div>
                <div style={{ fontSize:'1rem', color:'rgba(244,236,223,.7)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Deja tu reseña */}
          <div className="reveal" style={{ textAlign:'center', marginTop:'4rem' }}>
            <button
              onClick={() => setShowForm(true)}
              style={{
                background:'#F5D78E', color:'#1F1710',
                border:'none', padding:'1rem 2.2rem', borderRadius:100,
                fontSize:'.95rem', fontWeight:700, cursor:'pointer',
                fontFamily:'inherit', letterSpacing:'.01em',
                transition:'transform .15s, box-shadow .15s',
                boxShadow:'0 4px 18px rgba(245,215,142,.25)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(245,215,142,.4)' }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 18px rgba(245,215,142,.25)' }}
            >
              ✍️ Deja tu reseña
            </button>
            <p style={{ fontSize:'.78rem', color:'rgba(244,236,223,.45)', marginTop:'.9rem' }}>
              Las reseñas se publican después de una breve revisión.
            </p>
          </div>
        </div>
      </section>

      {showForm && <ReviewForm onClose={() => setShowForm(false)} />}

      {/* CTA */}
      <section id="contacto" style={{ background:'#F4ECDF', padding:'8rem 3rem', textAlign:'center' }}>
        <div className="reveal">
          <h2 className="section-title" style={{ maxWidth:860, margin:'0 auto 3rem', fontSize:'clamp(2.8rem,5.5vw,4.5rem)' }}>¿Listo para iniciar el cambio?</h2>
          <div style={{ display:'flex', gap:'.75rem', justifyContent:'center', flexWrap:'wrap' }}>
            <a href={wa('Hola capyABA, quiero agendar mi primera sesión 🦫')} target="_blank" rel="noopener noreferrer" className="btn-wsp">💬 Agendar primera sesión</a>
            <Link href="/servicios" className="btn-outline">Ver servicios</Link>
          </div>
        </div>
      </section>
      <Footer />
      <WspBubble msg="Hola capyABA, leí los testimonios y me gustaría comenzar 🦫" />
    </>
  )
}

/* ── Modal: Deja tu reseña ────────────────────────────────────────────────── */
function ReviewForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState<'Familias' | 'Supervisión'>('Familias')
  const [quote, setQuote] = useState('')
  const [stars, setStars] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/testimonials/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, email, category, quote, stars }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al enviar la reseña.')
        setLoading(false)
        return
      }
      setSuccess(true)
      setLoading(false)
    } catch {
      setError('Error de conexión. Intenta más tarde.')
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '.7rem .9rem',
    border: '1.5px solid #E8DDD3', borderRadius: 10,
    fontSize: '.92rem', color: '#1F1710',
    background: '#fff', boxSizing: 'border-box',
    fontFamily: 'inherit', outline: 'none',
    transition: 'border-color .15s',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '.78rem', fontWeight: 700,
    color: '#5F4D36', marginBottom: 6, letterSpacing: '.02em',
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(31,23,16,.65)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', overflow: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FDFAF6', borderRadius: 18,
          maxWidth: 520, width: '100%',
          padding: '2rem 1.8rem', position: 'relative',
          boxShadow: '0 20px 60px rgba(0,0,0,.3)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position: 'absolute', top: 14, right: 16,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1.4rem', color: '#8A7E74', lineHeight: 1,
          }}
        >✕</button>

        {success ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌟</div>
            <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.6rem', color: '#1F1710', marginBottom: '.6rem' }}>
              ¡Gracias por tu reseña!
            </h3>
            <p style={{ color: '#6B5E4E', fontSize: '.92rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Tu opinión fue enviada y aparecerá publicada en cuanto sea revisada (1–2 días). Tu voz nos ayuda a seguir mejorando 💛
            </p>
            <button
              onClick={onClose}
              style={{
                background: '#5F4D36', color: '#fff', border: 'none',
                padding: '.7rem 1.8rem', borderRadius: 100,
                fontSize: '.9rem', fontWeight: 700, cursor: 'pointer',
              }}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.7rem', color: '#1F1710', marginBottom: '.3rem' }}>
              Deja tu reseña ✍️
            </h3>
            <p style={{ color: '#6B5E4E', fontSize: '.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Comparte tu experiencia con capyABA. Tu reseña será publicada después de una breve revisión.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              <div>
                <label style={labelStyle}>Calificación</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,2,3,4,5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setStars(n)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                      aria-label={`${n} estrellas`}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill={n <= stars ? '#E8A020' : '#D4C9B8'}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.8rem' }}>
                <div>
                  <label style={labelStyle}>Nombre *</label>
                  <input value={name} onChange={e => setName(e.target.value)} required maxLength={60} placeholder="Ej: María L." style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Categoría *</label>
                  <select value={category} onChange={e => setCategory(e.target.value as any)} style={inputStyle}>
                    <option value="Familias">Familia</option>
                    <option value="Supervisión">Profesional / Supervisión</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.8rem' }}>
                <div>
                  <label style={labelStyle}>Rol (opcional)</label>
                  <input value={role} onChange={e => setRole(e.target.value)} maxLength={60} placeholder="Ej: Mamá · Consultorio" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Correo (opcional)</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={120} placeholder="tu@correo.com" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Tu reseña * <span style={{ color: '#9C8E7F', fontWeight: 500 }}>({quote.length}/1000)</span></label>
                <textarea
                  value={quote}
                  onChange={e => setQuote(e.target.value)}
                  required
                  minLength={30}
                  maxLength={1000}
                  rows={5}
                  placeholder="Cuéntanos cómo fue tu experiencia con capyABA. Mínimo 30 caracteres."
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 110, lineHeight: 1.55 }}
                />
              </div>

              {error && (
                <div style={{ background: '#FFF0F0', border: '1px solid #FFB3B3', borderRadius: 10, padding: '.65rem .9rem', fontSize: '.85rem', color: '#C0392B' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? '#9E8C7A' : '#5F4D36',
                  color: '#fff', border: 'none',
                  padding: '.85rem 1.5rem', borderRadius: 12,
                  fontSize: '.95rem', fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background .15s',
                  marginTop: '.3rem',
                }}
              >
                {loading ? 'Enviando…' : 'Enviar reseña'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
