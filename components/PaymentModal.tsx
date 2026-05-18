// components/PaymentModal.tsx
// Si decides usar este modal en vez de BuyButton, reemplaza el archivo.
// La declaración global de Window está REMOVIDA para evitar conflicto con BuyButton.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, CreditCard, ShieldCheck, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface Course {
  id: string
  title: string
  price: number
  price_label?: string
}

interface PaymentModalProps {
  course: Course
  userEmail: string
  onClose: () => void
  onSuccess: () => void
}

type Step = 'idle' | 'loading' | 'processing' | 'success' | 'error'

export default function PaymentModal({ course, userEmail, onClose, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<Step>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [culqiReady, setCulqiReady] = useState(false)

  useEffect(() => {
    if ((window as any).Culqi) {
      setCulqiReady(true)
      return
    }

    setStep('loading')
    const script = document.createElement('script')
    script.src = 'https://checkout.culqi.com/js/v4'
    script.async = true
    script.onload = () => {
      setCulqiReady(true)
      setStep('idle')
    }
    script.onerror = () => {
      setStep('error')
      setErrorMsg('No se pudo cargar el sistema de pago. Verifica tu conexión.')
    }
    document.body.appendChild(script)
  }, [])

  const handlePagar = useCallback(() => {
    const culqi = (window as any).Culqi
    if (!culqiReady || !culqi) return

    const publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY
    if (!publicKey) {
      setStep('error')
      setErrorMsg('Culqi no está configurado. Contacta al administrador.')
      return
    }

    culqi.publicKey = publicKey
    culqi.settings({
      title: 'CapyABA',
      currency: 'PEN',
      amount: Math.round(course.price * 100),
      description: course.title,
      order: course.id,
    })

    culqi.options({
      style: {
        logo: '/favicon.png',
        maincolor: '#5F4D36',
        buttontext: '#ffffff',
        maintext: '#1a1a1a',
        desctext: '#666666',
      },
    })

    ;(window as any).culqi = async () => {
      if (!(window as any).Culqi?.token) return

      const token = (window as any).Culqi.token.id
      ;(window as any).Culqi.close()
      setStep('processing')

      try {
        const res = await fetch('/api/payments/culqi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId: course.id, token, email: userEmail }),
        })
        const data = await res.json()

        if (!res.ok) {
          setStep('error')
          setErrorMsg(data.error || 'Error al procesar el pago')
        } else {
          setStep('success')
          setTimeout(() => onSuccess(), 2000)
        }
      } catch {
        setStep('error')
        setErrorMsg('Error de conexión. Intenta de nuevo.')
      }
    }

    culqi.open()
  }, [culqiReady, course, userEmail, onSuccess])

  const priceDisplay = course.price_label || `S/ ${Number(course.price).toFixed(2)}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-mocha-700 to-mocha-900 px-6 py-5 text-white">
          {step !== 'processing' && step !== 'success' && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <p className="text-mocha-300 text-xs font-medium uppercase tracking-wider mb-1">Comprar curso</p>
          <h2 className="text-lg font-bold leading-snug pr-6">{course.title}</h2>
          <div className="mt-3 text-3xl font-black">{priceDisplay}</div>
        </div>

        <div className="p-6">
          {(step === 'idle' || step === 'loading') && (
            <>
              <p className="text-sm text-gray-500 mb-5 text-center">
                Paga de forma segura con tu tarjeta de crédito o débito (Visa, Mastercard, Amex).
              </p>
              <button
                onClick={handlePagar}
                disabled={!culqiReady}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                  font-bold text-white text-sm transition-all shadow-md
                  bg-mocha-700 hover:bg-mocha-800 hover:shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!culqiReady
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Cargando…</>
                  : <><CreditCard className="w-4 h-4" />Pagar con tarjeta</>
                }
              </button>
              <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                Pago seguro con encriptación SSL · Powered by Culqi
              </div>
            </>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center py-8 gap-4">
              <Loader2 className="w-12 h-12 text-mocha-600 animate-spin" />
              <p className="font-semibold text-gray-700">Procesando tu pago…</p>
              <p className="text-xs text-gray-400">No cierres esta ventana</p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center py-8 gap-3">
              <CheckCircle2 className="w-14 h-14 text-green-500" />
              <p className="text-xl font-bold text-gray-800">¡Pago exitoso!</p>
              <p className="text-sm text-gray-500 text-center">Ya tienes acceso al curso. Redirigiendo…</p>
            </div>
          )}

          {step === 'error' && (
            <div className="flex flex-col items-center py-6 gap-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-sm font-semibold text-gray-700 text-center">{errorMsg}</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setStep('idle')}
                  className="flex-1 py-2 rounded-lg bg-mocha-700 text-white text-sm font-semibold hover:bg-mocha-800 transition"
                >
                  Intentar de nuevo
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
