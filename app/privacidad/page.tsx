import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad | capyABA',
  description: 'Política de privacidad y tratamiento de datos personales de la plataforma capyABA.',
}

export default function PrivacidadPage() {
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
            Política de Privacidad
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Última actualización: mayo de 2025 · Plataforma operada por <strong>capyABA</strong>
          </p>
        </div>

        <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '2rem', fontSize: '14px', color: '#92400E', lineHeight: '1.6' }}>
          🔒 En capyABA nos tomamos muy en serio la privacidad de nuestros usuarios. Esta política explica de forma clara qué datos recopilamos, cómo los usamos y cómo los protegemos.
        </div>

        <Section title="1. Responsable del tratamiento">
          El responsable del tratamiento de tus datos personales es <strong>capyABA</strong>,
          operado por Francesca Ramírez Bontá. Puedes contactarnos en cualquier momento en:{' '}
          <a href="mailto:capyaba@gmail.com" style={{ color: '#5F4D36', fontWeight: 600 }}>
            capyaba@gmail.com
          </a>{' '}
          o por WhatsApp al{' '}
          <a href="https://wa.me/51940428169" style={{ color: '#5F4D36', fontWeight: 600 }}>
            +51 940 428 169
          </a>.
        </Section>

        <Section title="2. Datos que recopilamos">
          Recopilamos únicamente los datos necesarios para brindarte el servicio:
          <DataTable rows={[
            ['Nombre completo', 'Identificarte dentro de la plataforma', 'Registro o cuenta de Google'],
            ['Correo electrónico', 'Comunicaciones y acceso a tu cuenta', 'Registro o cuenta de Google'],
            ['Contraseña (cifrada)', 'Autenticación segura', 'Registro con email'],
            ['Progreso en cursos', 'Registrar tu avance formativo', 'Uso de la plataforma'],
            ['Certificados obtenidos', 'Emitir y guardar tus certificados', 'Finalización de cursos'],
            ['Fecha de registro', 'Gestión interna de cuentas', 'Automático al registrarse'],
          ]} />
          <p style={{ marginTop: '0.75rem', fontSize: '14px', color: '#6b7280' }}>
            No recopilamos datos sensibles como DNI, datos bancarios, ubicación ni información médica.
          </p>
        </Section>

        <Section title="3. Inicio de sesión con Google">
          Si eliges iniciar sesión con Google, recibimos de forma automática tu <strong>nombre</strong> y{' '}
          <strong>correo electrónico</strong> desde tu cuenta de Google, con tu consentimiento expreso.
          No accedemos a tus contactos, archivos, calendario ni ningún otro dato de tu cuenta de Google.
          Puedes revocar este acceso en cualquier momento desde{' '}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" style={{ color: '#5F4D36' }}>
            myaccount.google.com/permissions
          </a>.
        </Section>

        <Section title="4. Cómo usamos tus datos">
          Utilizamos tus datos exclusivamente para:
          <ul style={{ paddingLeft: '1.2rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Gestionar tu cuenta y acceso a los cursos.</li>
            <li>Registrar y mostrar tu progreso de aprendizaje.</li>
            <li>Emitir certificados al completar formaciones.</li>
            <li>Enviarte comunicaciones relacionadas con tu cuenta (nunca publicidad de terceros).</li>
            <li>Mejorar el funcionamiento y contenido de la plataforma.</li>
          </ul>
        </Section>

        <Section title="5. Con quién compartimos tus datos">
          <strong>No vendemos ni compartimos tus datos con terceros con fines comerciales.</strong>{' '}
          Solo los compartimos con proveedores tecnológicos de confianza estrictamente necesarios para
          el servicio:
          <ul style={{ paddingLeft: '1.2rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Supabase</strong> — base de datos y autenticación segura (servidores en AWS).</li>
            <li><strong>Vercel</strong> — alojamiento de la plataforma web.</li>
            <li><strong>Google OAuth</strong> — opción de inicio de sesión (solo si la usas).</li>
          </ul>
          Todos estos proveedores cuentan con sus propias políticas de privacidad y estándares de seguridad.
        </Section>

        <Section title="6. Almacenamiento y seguridad">
          Tus datos se almacenan de forma segura en los servidores de <strong>Supabase</strong>, con
          cifrado en tránsito (HTTPS/TLS) y en reposo. Las contraseñas se almacenan siempre cifradas
          y nunca en texto plano. Aplicamos medidas técnicas y organizativas para proteger tu
          información contra accesos no autorizados, pérdida o alteración.
        </Section>

        <Section title="7. Cuánto tiempo guardamos tus datos">
          Conservamos tus datos mientras mantengas una cuenta activa en capyABA. Si decides eliminar
          tu cuenta, tus datos personales serán suprimidos en un plazo máximo de 30 días, salvo
          obligación legal de conservación. Puedes solicitarlo en cualquier momento escribiéndonos a{' '}
          <a href="mailto:capyaba@gmail.com" style={{ color: '#5F4D36' }}>capyaba@gmail.com</a>.
        </Section>

        <Section title="8. Tus derechos">
          En cualquier momento puedes ejercer los siguientes derechos enviándonos un correo a{' '}
          <a href="mailto:capyaba@gmail.com" style={{ color: '#5F4D36', fontWeight: 600 }}>capyaba@gmail.com</a>:
          <ul style={{ paddingLeft: '1.2rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Acceso</strong> — saber qué datos tenemos sobre ti.</li>
            <li><strong>Rectificación</strong> — corregir datos incorrectos o incompletos.</li>
            <li><strong>Eliminación</strong> — solicitar que borremos tus datos.</li>
            <li><strong>Portabilidad</strong> — recibir tus datos en formato exportable.</li>
            <li><strong>Oposición</strong> — oponerte a ciertos usos de tus datos.</li>
          </ul>
          Responderemos tu solicitud en un plazo máximo de 15 días hábiles.
        </Section>

        <Section title="9. Cookies">
          capyABA utiliza únicamente cookies técnicas estrictamente necesarias para el funcionamiento
          de la sesión (autenticación). No utilizamos cookies de rastreo, publicidad ni analítica de
          terceros. Al usar la plataforma aceptas el uso de estas cookies esenciales.
        </Section>

        <Section title="10. Menores de edad">
          La plataforma está dirigida a mayores de 18 años o a personas que cuenten con supervisión
          de un adulto responsable. No recopilamos intencionalmente datos de menores de 13 años. Si
          detectamos que un menor ha proporcionado datos sin supervisión, los eliminaremos de
          inmediato.
        </Section>

        <Section title="11. Cambios en esta política">
          Podemos actualizar esta Política de Privacidad ocasionalmente. Cuando realicemos cambios
          importantes, te lo notificaremos por correo electrónico o mediante un aviso destacado en
          la plataforma. La fecha de última actualización siempre estará visible en la parte superior
          de esta página.
        </Section>

        <Section title="12. Contacto">
          Para cualquier consulta relacionada con tu privacidad o el tratamiento de tus datos,
          contáctanos en:
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span>📧 <a href="mailto:capyaba@gmail.com" style={{ color: '#5F4D36', fontWeight: 600 }}>capyaba@gmail.com</a></span>
            <span>💬 <a href="https://wa.me/51940428169" style={{ color: '#5F4D36', fontWeight: 600 }}>+51 940 428 169</a></span>
          </div>
        </Section>

        <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '13px', color: '#6b7280', textAlign: 'center', lineHeight: '1.6' }}>
          Esta política complementa nuestros{' '}
          <Link href="/terminos" style={{ color: '#5F4D36', fontWeight: 600, textDecoration: 'none' }}>
            Términos y Condiciones
          </Link>.
          Ambos documentos regulan el uso de la plataforma capyABA.
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
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

function DataTable({ rows }: { rows: string[][] }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ background: '#F5E6D3' }}>
            {['Dato', 'Finalidad', 'Origen'].map(h => (
              <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#5F4D36', borderBottom: '2px solid #E8C9A0' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#FDFAF6' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid #f3f4f6', color: j === 0 ? '#1f2937' : '#6b7280', fontWeight: j === 0 ? 600 : 400 }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
