'use client'

/**
 * Reproductor de video con tracking de progreso usando las APIs oficiales
 * de YouTube IFrame y Vimeo Player. Reporta el % visto cada ~3 segundos
 * mientras se reproduce.
 *
 * El componente padre (LessonViewer) usa esos eventos para:
 *   - Actualizar `lesson_progress.watch_percentage` en la DB (debounceado)
 *   - Mover la barra de progreso del sidebar en tiempo real
 *   - Auto-marcar la lección como completa cuando se alcanza ~90%
 */

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    YT?: any
    onYouTubeIframeAPIReady?: () => void
    Vimeo?: any
  }
}

type Props = {
  videoUrl: string
  youtubeId: string | null
  vimeoId: string | null
  title: string
  /**
   * Se dispara cada ~3s con el porcentaje actual (0-100).
   * El padre lo debouncea/persiste como crea conveniente.
   */
  onProgress?: (percent: number) => void
}

// Carga el script de YouTube IFrame API una sola vez por sesión
let ytApiPromise: Promise<void> | null = null
function loadYouTubeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.YT && window.YT.Player) return Promise.resolve()
  if (ytApiPromise) return ytApiPromise
  ytApiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve()
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  })
  return ytApiPromise
}

// Carga el script de Vimeo Player API una sola vez por sesión
let vimeoApiPromise: Promise<void> | null = null
function loadVimeoApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.Vimeo && window.Vimeo.Player) return Promise.resolve()
  if (vimeoApiPromise) return vimeoApiPromise
  vimeoApiPromise = new Promise((resolve) => {
    const tag = document.createElement('script')
    tag.src = 'https://player.vimeo.com/api/player.js'
    tag.onload = () => resolve()
    document.head.appendChild(tag)
  })
  return vimeoApiPromise
}

export default function VideoPlayer({ youtubeId, vimeoId, title, onProgress }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastReportedRef = useRef<number>(-1)

  useEffect(() => {
    let mounted = true

    // ── YOUTUBE ───────────────────────────────────────────────────────────
    if (youtubeId) {
      loadYouTubeApi().then(() => {
        if (!mounted || !containerRef.current) return
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId: youtubeId,
          playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
          events: {
            onReady: () => {
              startTicking()
            },
            onStateChange: (e: any) => {
              // 1 = playing, 0 = ended
              if (e.data === 1) startTicking()
              else if (e.data === 0) reportProgress(100)
              else stopTicking()
            },
          },
        })
      })
    }
    // ── VIMEO ─────────────────────────────────────────────────────────────
    else if (vimeoId) {
      loadVimeoApi().then(() => {
        if (!mounted || !containerRef.current) return
        playerRef.current = new window.Vimeo.Player(containerRef.current, {
          id: vimeoId,
          responsive: true,
        })
        playerRef.current.on('play', startTicking)
        playerRef.current.on('pause', stopTicking)
        playerRef.current.on('ended', () => reportProgress(100))
      })
    }

    function startTicking() {
      stopTicking()
      // Reporta cada 3s mientras reproduce — sin saturar al servidor
      tickRef.current = setInterval(checkProgress, 3000)
      checkProgress() // primer reporte inmediato
    }
    function stopTicking() {
      if (tickRef.current) {
        clearInterval(tickRef.current)
        tickRef.current = null
      }
    }
    async function checkProgress() {
      const player = playerRef.current
      if (!player) return
      try {
        let current = 0, duration = 0
        if (youtubeId) {
          current = player.getCurrentTime?.() || 0
          duration = player.getDuration?.() || 0
        } else if (vimeoId) {
          current = await player.getCurrentTime()
          duration = await player.getDuration()
        }
        if (duration > 0) {
          const pct = Math.min(100, Math.round((current / duration) * 100))
          reportProgress(pct)
        }
      } catch {/* silent — el player se está reinicializando */}
    }
    function reportProgress(pct: number) {
      // Evita disparar muchas veces seguidas con el mismo valor
      if (pct === lastReportedRef.current) return
      lastReportedRef.current = pct
      onProgress?.(pct)
    }

    return () => {
      mounted = false
      stopTicking()
      try {
        if (playerRef.current?.destroy) playerRef.current.destroy()
        else if (playerRef.current?.unload) playerRef.current.unload()
      } catch {}
      playerRef.current = null
    }
  }, [youtubeId, vimeoId, onProgress])

  if (!youtubeId && !vimeoId) return null

  return (
    <div style={{
      width: '100%',
      aspectRatio: '16/9',
      background: '#000',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 18,
    }}>
      <div ref={containerRef} title={title} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
