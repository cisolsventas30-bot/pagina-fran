'use client'
import Link from 'next/link'
import { Nav, Footer, WspBubble, wa, useReveal } from '@/components/shared'

const VENTURES = [
  { id:'santi', num:'01', role:'Directora Terapéutica', title:'Neuropsicología y Terapias SANTI', tagline:'Centro especializado en intervención infantil', desc:'Como directora terapéutica, superviso un equipo de especialistas que brindan intervenciones de calidad a niños y familias.', bg:'#F2C8B6', emoji:'🏥', logo:'/santi.png', wsp:'Hola capyABA, me interesa saber más sobre SANTI Terapias 🏥' },
  { id:'vanty', num:'02', role:'Co-Fundadora', title:'VANTY ABA', tagline:'IA + ABA: la próxima generación de herramientas conductuales', desc:'Co-fundé VANTY ABA para facilitar y transformar la práctica profesional. Integramos IA con ABA en una plataforma web para analistas y terapeutas.', bg:'#D4E0C5', emoji:'🤖', logo:'/vanty.png', wsp:'Hola capyABA, me interesa VANTY ABA 🤖' },
  { id:'capyaba', num:'03', role:'CEO', title:'capyABA', tagline:'Donde todo empezó. Donde todo conecta.', desc:'Mi marca personal — el espacio desde donde desarrollo contenidos, cursos y recursos para familias, estudiantes y profesionales.', bg:'#E8DCC2', emoji:'🦫', logo:'/capyaba.png', wsp:'Hola capyABA, me interesa saber más sobre capyABA 🦫' },
  { id:'Team capyABA', num:'04', role:'Líder & Fundadora', title:'Team capyABA', tagline:'Asociación Peruana de Análisis Conductual Aplicado', desc:'Fundé una asociación que acompaña proyectos y organiza eventos para profesionales interesados en certificarse en ABA.', bg:'#F5DFD3', emoji:'🌱', logo:'/capyteam-logo.png', wsp:'Hola capyABA, me interesa unirme a Capyequipo 🌱' },
]

const ECO = [
  { type:'Clínica', name:'SANTI', desc:'Atención terapéutica directa a niños y familias.' },
  { type:'Tecnología', name:'VANTY ABA', desc:'Plataforma web con IA para profesionales que trabajan con ABA.' },
  { type:'Comunidad', name:'Team capyABA', desc:'Asociación peruana de ABA y networking profesional.' },
  { type:'Marca', name:'capyABA', desc:'Divulgación, cursos y recursos abiertos al público.' },
]

export default function Emprendimientos() {
  useReveal()
  return (
    <>
      <Nav />
      <section className="page-header">
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div className="eyebrow">STARTUPs</div>
          <h1>Mi ecosistema de impacto </h1>
          <p>Cuatro proyectos que unen terapia, tecnología, formación y divulgación bajo un mismo compromiso.</p>
        </div>
      </section>

      {VENTURES.map((v, i) => {
        const even = i % 2 === 1
        return (
          <section key={v.id} id={v.id} className="section-pad" style={{ background:even?'#EADFCC':'#F4ECDF', scrollMarginTop:80 }}>
            <div className="section-inner grid-2col" style={{ direction:even?'rtl':'ltr' }}>
              <div className="reveal" style={{ direction:'ltr', minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:'1.5rem' }}>
                  <span style={{ fontFamily:"'Fraunces',serif", fontSize:'3rem', fontWeight:400, color:'var(--muted)', letterSpacing:'-.03em', lineHeight:1 }}>{v.num}</span>
                  <span style={{ display:'inline-block', background:'#1F1710', color:'#F4ECDF', padding:'6px 14px', borderRadius:100, fontSize:'.72rem', fontWeight:600, letterSpacing:'.05em', textTransform:'uppercase' }}>{v.role}</span>
                </div>
                <h2 className="section-title" style={{ marginBottom:'.5rem' }}>{v.title}</h2>
                <p style={{ fontFamily:"'Poppins', system-ui, sans-serif", fontSize:'1.2rem', fontStyle:'italic', color:'var(--muted)', marginBottom:'1.5rem' }}>— {v.tagline}</p>
                <p style={{ fontSize:'1.1rem', color:'var(--muted)', lineHeight:1.55, marginBottom:'2rem' }}>{v.desc}</p>
                <a href={wa(v.wsp)} target="_blank" rel="noopener noreferrer" className="btn-wsp">💬 Preguntar por WhatsApp</a>
              </div>
              <div className="reveal svc-img-col" style={{ direction:'ltr', aspectRatio:'5/4', borderRadius:28, overflow:'hidden', background:v.bg, minWidth:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <img src={v.logo} alt={v.title} className="venture-img" />
              </div>
            </div>
          </section>
        )
      })}

      <section className="dark-section">
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div className="reveal" style={{ textAlign:'center', maxWidth:800, margin:'0 auto 4rem' }}>
            <div className="eyebrow" style={{ color:'#F5D78E' }}>El Ecosistema</div>
            <h2 className="section-title" style={{ color:'#F4ECDF', marginBottom:'1rem' }}>Cuatro proyectos, <strong>un solo propósito</strong></h2>
            <p style={{ color:'rgba(244,236,223,.72)', fontSize:'1.1rem', lineHeight:1.55 }}>Llevar el análisis conductual desde la práctica clínica hasta la tecnología, la formación y la comunidad.</p>
          </div>
          <div className="grid-4col">
            {ECO.map((e, i) => (
              <div key={e.name} className="reveal" style={{ background:'rgba(244,236,223,.06)', borderRadius:20, padding:'2rem', transitionDelay:`${i*.1}s` }}>
                <div style={{ fontSize:'.7rem', fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase', color:'#F5D78E', marginBottom:'1rem' }}>{e.type}</div>
                <h3 style={{ fontFamily:"'Poppins', system-ui, sans-serif", fontSize:'1.4rem', fontWeight:600, color:'#F4ECDF', marginBottom:'.6rem' }}>{e.name}</h3>
                <p style={{ fontSize:'.9rem', color:'rgba(244,236,223,.7)', lineHeight:1.5 }}>{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contacto" className="landing-cta-section">
        <div className="reveal">
          <h2 className="section-title" style={{ maxWidth:860, margin:'0 auto 3rem', fontSize:'clamp(2.8rem,5.5vw,4.5rem)' }}>¿Quieres <strong>colaborar</strong> en alguno de estos proyectos?</h2>
          <div style={{ display:'flex', gap:'.75rem', justifyContent:'center', flexWrap:'wrap' }}>
            <a href={wa('Hola capyABA, me interesa colaborar en uno de tus proyectos 🦫')} target="_blank" rel="noopener noreferrer" className="btn-wsp">💬 Escribirme por WhatsApp</a>
            <Link href="/sobre-mi" className="btn-outline">Conocer más sobre mí</Link>
          </div>
        </div>
      </section>
      <Footer />
      <WspBubble msg="Hola capyABA, vi tus emprendimientos y quisiera saber más 🦫" />
    </>
  )
}
