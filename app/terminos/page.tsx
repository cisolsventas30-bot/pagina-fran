import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones | capyABA',
  description: 'Términos y condiciones de uso de la plataforma capyABA.',
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
            Última actualización: mayo de 2025 · Plataforma operada por <strong>capyABA</strong>
          </p>
        </div>

        {/* NUEVA: Información general del comercio */}
        <Section title="1. Información del comercio">
          La presente plataforma es operada por:
          <ul style={{ paddingLeft: '1.2rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li><strong>Razón Social:</strong> Ramirez Bonta Francesca Cecilia</li>
            <li><strong>RUC:</strong> 10765671898</li>
            <li><strong>Ubicación:</strong> Lima, Perú</li>
            <li><strong>Correo electrónico:</strong> <a href="mailto:capyaba@gmail.com" style={{ color: '#5F4D36' }}>capyaba@gmail.com</a></li>
            <li><strong>WhatsApp / Teléfono:</strong> <a href="https://wa.me/51940428169" style={{ color: '#5F4D36' }}>+51 940 428 169</a></li>
          </ul>
        </Section>

        <Section title="2. Aceptación de los términos">
          Al acceder y utilizar la plataforma capyABA (en adelante &quot;la Plataforma&quot;), disponible en{' '}
          <a href="https://capyaba.com/" style={{ color: '#5F4D36' }}>capyaba.com</a>,
          aceptas quedar vinculado a estos Términos y Condiciones. Si no estás de acuerdo con alguno de
          los términos aquí descritos, te pedimos que no utilices la Plataforma. Nos reservamos el
          derecho de actualizar estos términos en cualquier momento, notificando a los usuarios
          registrados mediante el correo electrónico asociado a su cuenta.
        </Section>

        <Section title="3. Descripción del servicio">
          capyABA es una plataforma web. Ofrecemos cursos en línea, materiales formativos,
          supervisiones profesionales y recursos relacionados con certificaciones. El acceso a los cursos
          se habilita de forma digital una vez confirmado el pago o la asignación por parte de un instructor.
          La disponibilidad de los cursos puede estar sujeta a cambios sin previo aviso. Para acceder a la
          plataforma el usuario debe ser mayor de edad (18 años) o contar con autorización de un tutor legal.
        </Section>

        <Section title="4. Registro y cuenta de usuario">
          <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Para acceder a los contenidos debes crear una cuenta con datos verídicos y completos.</li>
            <li>Puedes registrarte con correo electrónico y contraseña, o mediante tu cuenta de Google.</li>
            <li>Eres responsable de mantener la confidencialidad de tus credenciales de acceso.</li>
            <li>Cada cuenta es de uso personal e intransferible.</li>
            <li>Cualquier uso indebido de la cuenta será responsabilidad exclusiva del usuario titular.</li>
            <li>Nos reservamos el derecho de suspender cuentas que incumplan estos términos.</li>
          </ul>
        </Section>

        <Section title="5. Inicio de sesión con Google">
          Al elegir autenticarte con Google, autorizas a capyABA a recibir tu nombre y dirección de
          correo electrónico desde tu cuenta de Google, únicamente con el propósito de identificarte
          dentro de la Plataforma. No accedemos a ningún otro dato de tu cuenta de Google. Puedes
          revocar este acceso en cualquier momento desde tu configuración de cuenta de Google.
        </Section>

        {/* NUEVA: Precios y formas de pago */}
        <Section title="6. Precios y formas de pago">
          Los precios de los cursos y servicios se presentan en <strong>soles peruanos (PEN)</strong> o
          <strong> dólares americanos (USD)</strong> según el método de pago seleccionado, e incluyen
          el Impuesto General a las Ventas (IGV) cuando corresponda, según la condición tributaria del
          comercio. Los métodos de pago aceptados son:
          <ul style={{ paddingLeft: '1.2rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Tarjetas de crédito y débito (Visa, Mastercard) y Yape, en soles, a través de la pasarela de pagos <strong>Culqi</strong>.</li>
            <li>Pagos en dólares a través de <strong>PayPal</strong>.</li>
            <li>Transferencias bancarias o pagos coordinados directamente con el equipo de capyABA.</li>
          </ul>
          Los pagos en línea son procesados de forma segura por <strong>Culqi</strong> y <strong>PayPal</strong>,
          plataformas certificadas en estándares PCI-DSS. capyABA no almacena datos de tarjetas bancarias.
          El usuario es responsable de verificar que los datos de pago ingresados sean correctos antes de
          confirmar la transacción.
        </Section>

        {/* NUEVA: Proceso de compra */}
        <Section title="7. Proceso de compra">
          El proceso para adquirir acceso a un curso en capyABA es el siguiente:
          <ol style={{ paddingLeft: '1.2rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>El usuario selecciona el curso o programa de su interés.</li>
            <li>Completa el formulario de pago con sus datos y elige el método de pago.</li>
            <li>La plataforma de pagos (<strong>Culqi</strong> para pagos en soles con tarjeta o Yape, o <strong>PayPal</strong> para pagos en dólares) procesa y valida la transacción.</li>
            <li>Una vez confirmado el pago, el acceso al curso se habilita de forma automática e inmediata en la cuenta del usuario.</li>
            <li>Se envía una confirmación al correo electrónico registrado.</li>
          </ol>
          capyABA se reserva el derecho de cancelar o anular una compra en casos de error en el precio
          publicado, fallo técnico en la plataforma, o sospecha de fraude, notificando al usuario y
          procediendo al reembolso correspondiente.
        </Section>

        {/* NUEVA: Entrega del servicio digital */}
        <Section title="8. Entrega del servicio digital">
          Al tratarse de un servicio completamente digital, no existe envío físico de ningún tipo.
          El acceso al contenido adquirido se habilita de forma inmediata tras la confirmación del pago,
          directamente en la cuenta del usuario dentro de la Plataforma. En caso de demoras técnicas,
          el usuario puede contactarnos a{' '}
          <a href="mailto:capyaba@gmail.com" style={{ color: '#5F4D36' }}>capyaba@gmail.com</a>{' '}
          o al <a href="https://wa.me/51940428169" style={{ color: '#5F4D36' }}>+51 940 428 169</a> para
          resolver la incidencia en un plazo máximo de 24 horas hábiles.
        </Section>

        {/* NUEVA: Política de devoluciones mejorada */}
        <Section title="9. Política de devoluciones y cancelaciones">
          Dado que capyABA ofrece servicios digitales de acceso inmediato, <strong>no se realizan
          reembolsos una vez que el usuario ha accedido al contenido del curso</strong>. Sin embargo,
          se evaluarán solicitudes de devolución en los siguientes casos excepcionales:
          <ul style={{ paddingLeft: '1.2rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Cobro duplicado o error técnico comprobable en la transacción.</li>
            <li>Cancelación solicitada dentro de las 24 horas siguientes al pago, siempre que el usuario no haya accedido al contenido.</li>
          </ul>
          Las solicitudes deben enviarse a{' '}
          <a href="mailto:capyaba@gmail.com" style={{ color: '#5F4D36' }}>capyaba@gmail.com</a>{' '}
          con el asunto &quot;Solicitud de devolución&quot; indicando el número de transacción. El equipo
          responderá en un plazo máximo de 5 días hábiles.
        </Section>

        <Section title="10. Propiedad intelectual">
          Todo el contenido de la Plataforma — incluyendo videos, textos, materiales didácticos,
          evaluaciones y certificados — es propiedad exclusiva de capyABA y sus colaboradores, y está
          protegido por las leyes de propiedad intelectual aplicables. Queda prohibida su reproducción,
          distribución o uso comercial sin autorización expresa por escrito.
        </Section>

        <Section title="11. Uso permitido y prohibiciones">
          Te comprometes a utilizar la Plataforma únicamente para fines lícitos y educativos. Queda
          expresamente prohibido:
          <ul style={{ paddingLeft: '1.2rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Compartir tu cuenta con terceros.</li>
            <li>Descargar, copiar o redistribuir contenido sin autorización.</li>
            <li>Utilizar la Plataforma para actividades fraudulentas o ilegales.</li>
            <li>Intentar acceder a áreas restringidas o datos de otros usuarios.</li>
          </ul>
        </Section>

        {/* MEJORADA: Privacidad con Ley 29733 */}
        <Section title="12. Privacidad y protección de datos personales">
          En cumplimiento de la <strong>Ley N° 29733 — Ley de Protección de Datos Personales del Perú</strong>{' '}
          y su reglamento, capyABA recopila únicamente los datos necesarios para el funcionamiento del
          servicio: nombre, correo electrónico y progreso en cursos. Estos datos son almacenados de
          forma segura a través de Supabase y no son vendidos ni compartidos con terceros.
          <br /><br />
          Como titular de datos personales, tienes derecho a:
          <ul style={{ paddingLeft: '1.2rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Acceso:</strong> conocer qué datos tuyos tenemos registrados.</li>
            <li><strong>Rectificación:</strong> solicitar la corrección de datos inexactos.</li>
            <li><strong>Cancelación:</strong> pedir la eliminación de tus datos cuando ya no sean necesarios.</li>
            <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos en determinados supuestos.</li>
          </ul>
          Para ejercer cualquiera de estos derechos, escríbenos a{' '}
          <a href="mailto:capyaba@gmail.com" style={{ color: '#5F4D36' }}>capyaba@gmail.com</a>.
        </Section>

        <Section title="13. Certificados">
          Los certificados emitidos por capyABA acreditan la finalización de los programas formativos
          dentro de la Plataforma. Su validez y reconocimiento externo dependen de las instituciones
          o empleadores que los evalúen. capyABA no garantiza reconocimiento oficial por organismos
          reguladores externos salvo donde se especifique.
        </Section>

        <Section title="14. Limitación de responsabilidad">
          capyABA no se responsabiliza por interrupciones del servicio, pérdidas de datos derivadas
          de causas externas, ni por el uso indebido de la Plataforma por parte de terceros. El
          contenido educativo es de carácter formativo y no sustituye la supervisión clínica
          profesional en contextos terapéuticos reales.
        </Section>

        <Section title="15. Modificaciones">
          Nos reservamos el derecho de actualizar estos Términos y Condiciones en cualquier momento.
          Te notificaremos de cambios sustanciales a través del correo registrado en tu cuenta. El
          uso continuado de la Plataforma tras la notificación implica la aceptación de los nuevos
          términos.
        </Section>

        {/* NUEVA: Legislación y resolución de conflictos */}
        <Section title="16. Legislación aplicable y resolución de conflictos">
          El presente documento se rige por la legislación vigente de la República del Perú. Cualquier
          controversia derivada del uso de la Plataforma o de la interpretación de estos Términos será
          resuelta, en primera instancia, mediante trato directo entre las partes. De no llegarse a un
          acuerdo, las partes podrán acudir a:
          <ul style={{ paddingLeft: '1.2rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Conciliación extrajudicial conforme a la Ley N° 26872.</li>
            <li>El <strong>Instituto Nacional de Defensa de la Competencia y de la Protección de la Propiedad Intelectual (INDECOPI)</strong>, en materia de protección al consumidor.</li>
            <li>Las instancias judiciales competentes en Lima, Perú.</li>
          </ul>
        </Section>

        <Section title="17. Contacto y soporte">
          Si tienes preguntas, consultas o reclamos relacionados con estos términos o con el uso de la
          Plataforma, puedes contactarnos por los siguientes medios:
          <ul style={{ paddingLeft: '1.2rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li><strong>Correo:</strong> <a href="mailto:capyaba@gmail.com" style={{ color: '#5F4D36', fontWeight: 600 }}>capyaba@gmail.com</a></li>
            <li><strong>WhatsApp:</strong> <a href="https://wa.me/51940428169" style={{ color: '#5F4D36', fontWeight: 600 }}>+51 940 428 169</a></li>
            <li><strong>Horario de atención:</strong> Lunes a viernes, 9:00 a.m. – 6:00 p.m. (hora de Lima)</li>
          </ul>
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
