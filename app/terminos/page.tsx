import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones | CapyABA',
  description: 'Términos y condiciones de uso de la plataforma CapyABA.',
}

export default function TerminosPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FDFAF6', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '1rem 1.5rem' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-.02em' }}>
              <span style={{ color: '#5F4D36' }}>capy</span>
              <span style={{ color: '#E8959A' }}>ABA</span>
            </span>
          </Link>
          <Link href="/login" style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>
            ← Volver al inicio
          </Link>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>

        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem', letterSpacing: '-.02em' }}>
            Términos y Condiciones
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Última actualización: mayo de 2025 · Plataforma operada por <strong>CapyABA</strong>
          </p>
        </div>

        <Section title="1. Aceptación de los términos">
          Al acceder y utilizar la plataforma CapyABA (en adelante "la Plataforma"), disponible en{' '}
          <a href="https://capyaba.vercel.app" style={{ color: '#5F4D36' }}>capyaba.vercel.app</a>,
          aceptas quedar vinculado a estos Términos y Condiciones. Si no estás de acuerdo con alguno de
          los términos aquí descritos, te pedimos que no utilices la Plataforma.
        </Section>

        <Section title="2. Descripción del servicio">
          CapyABA es una plataforma educativa especializada en Análisis Conductual Aplicado (ABA),
          dirigida a profesionales, estudiantes y familias. Ofrecemos cursos, materiales formativos,
          supervisiones profesionales y recursos relacionados con terapia IBT/IBA. Los cursos se
          activan cuando tu instructor los asigna a tu cuenta.
        </Section>

        <Section title="3. Registro y cuenta de usuario">
          <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Para acceder a los contenidos debes crear una cuenta con datos verídicos.</li>
            <li>Puedes registrarte con correo electrónico y contraseña, o mediante tu cuenta de Google.</li>
            <li>Eres responsable de mantener la confidencialidad de tus credenciales de acceso.</li>
            <li>Cada cuenta es de uso personal e intransferible.</li>
            <li>Nos reservamos el derecho de suspender cuentas que incumplan estos términos.</li>
          </ul>
        </Section>

        <Section title="4. Inicio de sesión con Google">
          Al elegir autenticarte con Google, autorizas a CapyABA a recibir tu nombre y dirección de
          correo electrónico desde tu cuenta de Google, únicamente con el propósito de identificarte
          dentro de la Plataforma. No accedemos a ningún otro dato de tu cuenta de Google. Puedes
          revocar este acceso en cualquier momento desde tu configuración de cuenta de Google.
        </Section>

        <Section title="5. Propiedad intelectual">
          Todo el contenido de la Plataforma — incluyendo videos, textos, materiales didácticos,
          evaluaciones y certificados — es propiedad exclusiva de CapyABA y sus colaboradores, y está
          protegido por las leyes de propiedad intelectual aplicables. Queda prohibida su reproducción,
          distribución o uso comercial sin autorización expresa por escrito.
        </Section>

        <Section title="6. Uso permitido y prohibiciones">
          Te comprometes a utilizar la Plataforma únicamente para fines lícitos y educativos. Queda
          expresamente prohibido:
          <ul style={{ paddingLeft: '1.2rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Compartir tu cuenta con terceros.</li>
            <li>Descargar, copiar o redistribuir contenido sin autorización.</li>
            <li>Utilizar la Plataforma para actividades fraudulentas o ilegales.</li>
            <li>Intentar acceder a áreas restringidas o datos de otros usuarios.</li>
          </ul>
        </Section>

        <Section title="7. Pagos y acceso a cursos">
          El acceso a los cursos es gestionado directamente por los instructores de CapyABA. Los
          detalles sobre precios, métodos de pago y condiciones de acceso se comunican de forma
          personalizada. Una vez habilitado el acceso, no se realizan reembolsos salvo en casos
          excepcionales evaluados por el equipo de CapyABA.
        </Section>

        <Section title="8. Privacidad y protección de datos">
          Recopilamos únicamente los datos necesarios para el funcionamiento del servicio (nombre,
          correo electrónico, progreso en cursos). No vendemos ni compartimos tus datos con terceros.
          Los datos son almacenados de forma segura a través de Supabase. Para más información,
          contáctanos en{' '}
          <a href="mailto:capyaba@gmail.com" style={{ color: '#5F4D36' }}>capyaba@gmail.com</a>.
        </Section>

        <Section title="9. Certificados">
          Los certificados emitidos por CapyABA acreditan la finalización de los programas formativos
          dentro de la Plataforma. Su validez y reconocimiento externo dependen de las instituciones
          o empleadores que los evalúen. CapyABA no garantiza reconocimiento oficial por organismos
          reguladores externos salvo donde se especifique.
        </Section>

        <Section title="10. Limitación de responsabilidad">
          CapyABA no se responsabiliza por interrupciones del servicio, pérdidas de datos derivadas
          de causas externas, ni por el uso indebido de la Plataforma por parte de terceros. El
          contenido educativo es de carácter formativo y no sustituye la supervisión clínica
          profesional en contextos terapéuticos reales.
        </Section>

        <Section title="11. Modificaciones">
          Nos reservamos el derecho de actualizar estos Términos y Condiciones en cualquier momento.
          Te notificaremos de cambios sustanciales a través del correo registrado en tu cuenta. El
          uso continuado de la Plataforma tras la notificación implica la aceptación de los nuevos
          términos.
        </Section>

        <Section title="12. Contacto">
          Si tienes preguntas sobre estos términos, puedes escribirnos a:{' '}
          <a href="mailto:capyaba@gmail.com" style={{ color: '#5F4D36', fontWeight: 600 }}>
            capyaba@gmail.com
          </a>{' '}
          o a través de nuestro WhatsApp:{' '}
          <a href="https://wa.me/51940428169" style={{ color: '#5F4D36', fontWeight: 600 }}>
            +51 940 428 169
          </a>
        </Section>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
          <Link href="/login" style={{
            display: 'inline-block',
            background: '#5F4D36',
            color: '#fff',
            padding: '0.75rem 2rem',
            borderRadius: '999px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px',
          }}>
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{
        fontSize: '1.05rem',
        fontWeight: 700,
        color: '#1f2937',
        marginBottom: '0.6rem',
        paddingBottom: '0.4rem',
        borderBottom: '2px solid #F5E6D3',
      }}>
        {title}
      </h2>
      <div style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.75' }}>
        {children}
      </div>
    </div>
  )
}
