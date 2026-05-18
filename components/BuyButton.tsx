'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Loader2, MessageCircle, CreditCard } from 'lucide-react'

declare global {
  interface Window {
    Culqi?: any
    culqi?: () => void
  }
}

type Props = {
  courseId: string
  courseTitle: string
  price: number
  priceLabel?: string
  userEmail: string
  waUrl: string
}

type Step = 'idle' | 'processing' | 'success' | 'error'

export default function BuyButton({
  courseId,
  courseTitle,
  price,
  priceLabel,
  userEmail,
  waUrl,
}: Props) {
  const [step, setStep] = useState<Step>('idle')
  const [culqiReady, setCulqiReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ─── Cargar script de Culqi ───────────────────────────────────────────────
  useEffect(() => {
    if (window.Culqi) { setCulqiReady(true); return }

    if (document.getElementById('culqi-script')) {
      const iv = setInterval(() => {
        if (window.Culqi) { setCulqiReady(true); clearInterval(iv) }
      }, 100)
      return () => clearInterval(iv)
    }

    const s = document.createElement('script')
    s.id = 'culqi-script'
    s.src = 'https://checkout.culqi.com/js/v4'
    s.async = true
    s.onload = () => {
      const iv = setInterval(() => {
        if (window.Culqi) { setCulqiReady(true); clearInterval(iv) }
      }, 100)
      setTimeout(() => clearInterval(iv), 5000)
    }
    document.body.appendChild(s)
  }, [])

  // ─── Abrir Culqi ─────────────────────────────────────────────────────────
  function handleBuy() {
    if (!culqiReady || !window.Culqi) return
    setError(null)

    const publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY
    if (!publicKey) {
      setError('El pago no está configurado. Contacta al administrador.')
      setStep('error')
      return
    }

    window.Culqi.publicKey = publicKey
    window.Culqi.settings({
      title: 'CapyABA',
      currency: 'PEN',
      description: courseTitle,
      amount: Math.round(price * 100),
    })

    window.culqi = async function () {
      if (window.Culqi?.token) {
        const token = window.Culqi.token.id
        window.Culqi.close()
        setStep('processing')

        try {
          const res = await fetch('/api/payments/culqi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId, token, email: userEmail }),
          })
          const data = await res.json()

          if (!res.ok) {
            setError(data.error || 'Error al procesar el pago')
            setStep('error')
          } else {
            setStep('success')
            setTimeout(() => { window.location.href = `/learn/${courseId}` }, 3500)
          }
        } catch {
          setError('Error de conexión. Por favor intenta de nuevo.')
          setStep('error')
        }
      } else {
        // Usuario cerró el popup sin pagar
        setStep('idle')
      }
    }

    window.Culqi.open()
  }

  const displayPrice = priceLabel ?? `S/ ${price.toFixed(2)}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* ── Error ── */}
      {error && (
        <div style={{
          background: '#FFF0F0', border: '1px solid #FFB3B3', borderRadius: 10,
          padding: '10px 14px', fontSize: 13, color: '#C0392B', lineHeight: 1.5,
        }}>
          {error}
        </div>
      )}

      {/* ── Éxito ── */}
      {step === 'success' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 10, padding: '20px 16px',
          background: 'linear-gradient(135deg, #F0FBF4 0%, #E8F5ED 100%)',
          border: '1.5px solid #A8D5B5', borderRadius: 14,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 44, lineHeight: 1 }}>🎉</div>
          <p style={{ fontSize: 16, fontWeight: 800, color: '#1A6B3A', margin: 0 }}>
            ¡Compra exitosa!
          </p>
          <p style={{ fontSize: 13, color: '#2D8653', margin: 0, lineHeight: 1.5 }}>
            Gracias por adquirir <strong>{courseTitle}</strong>.<br />
            Ya tienes acceso completo al curso.
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: '#4CAF80', marginTop: 4,
          }}>
            <Loader2 size={13} className="animate-spin" />
            Redirigiendo al curso…
          </div>
        </div>
      )}

      {/* ── Botón principal "Comprar" ── */}
      {step !== 'success' && (
        <button
          onClick={handleBuy}
          disabled={!culqiReady || step === 'processing'}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '13px 20px',
            background: (!culqiReady || step === 'processing') ? '#9E8C7A' : '#5F4D36',
            color: '#fff', border: 'none', borderRadius: 12,
            fontSize: 15, fontWeight: 800,
            cursor: (!culqiReady || step === 'processing') ? 'not-allowed' : 'pointer',
            transition: 'background .15s',
            letterSpacing: '-0.01em',
          }}
        >
          {step === 'processing'
            ? <><Loader2 size={16} className="animate-spin" /> Procesando...</>
            : !culqiReady
            ? <><Loader2 size={16} className="animate-spin" /> Cargando...</>
            : <><CreditCard size={16} /> Comprar · {displayPrice}</>
          }
        </button>
      )}

      {/* ── WhatsApp ── */}
      {step !== 'success' && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            width: '100%', padding: '10px 20px',
            background: 'transparent', border: '1.5px solid #25D366',
            borderRadius: 12, fontSize: 13, fontWeight: 700,
            color: '#1A9E50', textDecoration: 'none',
          }}
        >
          <MessageCircle size={14} />
          Consultar por WhatsApp
        </a>
      )}
    </div>
  )
}
