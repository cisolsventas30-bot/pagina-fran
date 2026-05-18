'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Loader2, MessageCircle } from 'lucide-react'

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

export default function BuyButton({ courseId, courseTitle, price, priceLabel, userEmail, waUrl }: Props) {
  const [loading, setLoading] = useState(false)
  const [culqiReady, setCulqiReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Si ya cargó antes, marcar como listo inmediatamente
    if (window.Culqi) {
      setCulqiReady(true)
      return
    }

    // Evitar cargar el script dos veces
    if (document.getElementById('culqi-script')) {
      // El script existe pero Culqi aún no está en window — esperar con polling
      const interval = setInterval(() => {
        if (window.Culqi) {
          setCulqiReady(true)
          clearInterval(interval)
        }
      }, 100)
      return () => clearInterval(interval)
    }

    // Cargar el script por primera vez
    const script = document.createElement('script')
    script.id = 'culqi-script'
    script.src = 'https://checkout.culqi.com/js/v4'
    script.async = true

    script.onload = () => {
      // El script cargó pero window.Culqi puede tardar un tick más en definirse
      const interval = setInterval(() => {
        if (window.Culqi) {
          setCulqiReady(true)
          clearInterval(interval)
        }
      }, 100)
      // Timeout de seguridad: 5 segundos
      setTimeout(() => clearInterval(interval), 5000)
    }

    script.onerror = () => {
      setError('No se pudo cargar el sistema de pago. Recarga la página.')
    }

    document.body.appendChild(script)
  }, [])

  function handleBuy() {
    if (!culqiReady || !window.Culqi) return
    setError(null)
    setLoading(true)

    const culqiPublicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY
    if (!culqiPublicKey) {
      setError('Clave pública de Culqi no configurada.')
      setLoading(false)
      return
    }

    window.Culqi.publicKey = culqiPublicKey
    window.Culqi.settings({
      title: 'CapyABA',
      currency: 'PEN',
      description: courseTitle,
      amount: Math.round(price * 100), // en céntimos
      order: courseId,
    })

    window.culqi = async function () {
      if (window.Culqi?.token) {
        const token = window.Culqi.token.id
        window.Culqi.close()

        try {
          const res = await fetch('/api/payments/culqi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId, token, email: userEmail }),
          })
          const data = await res.json()

          if (!res.ok) {
            setError(data.error || 'Error al procesar el pago')
            setLoading(false)
          } else {
            window.location.href = `/learn/${courseId}`
          }
        } catch {
          setError('Error de conexión. Por favor intenta de nuevo.')
          setLoading(false)
        }
      } else {
        // Usuario cerró el modal sin pagar
        setLoading(false)
      }
    }

    window.Culqi.open()
  }

  const displayPrice = priceLabel ?? `S/ ${price.toFixed(2)}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {error && (
        <div style={{
          background: '#FFF0F0', border: '1px solid #FFB3B3', borderRadius: 10,
          padding: '10px 14px', fontSize: 13, color: '#C0392B', lineHeight: 1.5,
        }}>
          {error}
        </div>
      )}

      <button
        onClick={handleBuy}
        disabled={loading || !culqiReady}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: '13px 20px',
          background: loading || !culqiReady ? '#9E8C7A' : '#5F4D36',
          color: '#fff', border: 'none', borderRadius: 12,
          fontSize: 15, fontWeight: 800,
          cursor: loading || !culqiReady ? 'not-allowed' : 'pointer',
          transition: 'background .15s',
          letterSpacing: '-0.01em',
        }}
      >
        {!culqiReady
          ? <><Loader2 size={16} className="animate-spin" /> Cargando pago…</>
          : loading
            ? <><Loader2 size={16} className="animate-spin" /> Procesando…</>
            : <><ShoppingCart size={16} /> Comprar · {displayPrice}</>
        }
      </button>

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
    </div>
  )
}
