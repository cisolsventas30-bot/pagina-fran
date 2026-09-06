'use client'

/**
 * Reproductor de video con tracking de progreso.
 *
 * YOUTUBE → reproductor BLOQUEADO/personalizado:
 *   - Oculta toda la interfaz de YouTube (logo, título, "Ver en YouTube",
 *     videos relacionados, controles nativos).
 *   - Controles propios: play/pausa, volumen, pantalla completa. Nada más.
 *   - Capa transparente encima: al hacer clic solo pausa/reproduce, NO salta
 *     a YouTube. Clic derecho bloqueado (sin "Copiar URL del video").
 *   NOTA HONESTA: esto frena al usuario casual, pero el ID del video sigue
 *   siendo extraíble con las herramientas de desarrollador (F12). Para
 *   protección real (link firmado / sin URL pública) se requiere un hosting
 *   de video dedicado (Bunny/Cloudflare) — no YouTube.
 *
 * VIMEO → usa el reproductor nativo de Vimeo (responsive), como antes.
 *
 * En ambos casos reporta el % visto cada ~1s mientras reproduce vía onProgress.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

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
  /** Se dispara con el porcentaje actual (0-100). El padre lo persiste. */
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

function fmt(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function VideoPlayer({ youtubeId, vimeoId, title, onProgress }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)       // objetivo de pantalla completa
  const containerRef = useRef<HTMLDivElement>(null)  // donde monta el iframe
  const playerRef = useRef<any>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastReportedRef = useRef<number>(-1)

  // onProgress en ref para no re-montar el player si cambia la identidad del callback
  const onProgressRef = useRef<Props['onProgress']>(onProgress)
  useEffect(() => { onProgressRef.current = onProgress }, [onProgress])

  // Estado de UI (solo para los controles personalizados de YouTube)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(100)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFs, setIsFs] = useState(false)
  // Subtítulos (CC). El módulo puede llamarse 'captions' (HTML5) o 'cc' (legacy).
  const [ccModule, setCcModule] = useState<string | null>(null)
  const [ccAvailable, setCcAvailable] = useState(false)
  const [captionsOn, setCaptionsOn] = useState(false)

  const reportProgress = useCallback((pct: number) => {
    if (pct === lastReportedRef.current) return
    lastReportedRef.current = pct
    onProgressRef.current?.(pct)
  }, [])

  // ── Inicialización del player ────────────────────────────────────────────
  useEffect(() => {
    let mounted = true

    function stopTicking() {
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null }
    }
    function startTicking() {
      stopTicking()
      tickRef.current = setInterval(tick, 1000)
      tick()
    }
    async function tick() {
      const player = playerRef.current
      if (!player) return
      try {
        let cur = 0, dur = 0
        if (youtubeId) {
          cur = player.getCurrentTime?.() || 0
          dur = player.getDuration?.() || 0
        } else if (vimeoId) {
          cur = await player.getCurrentTime()
          dur = await player.getDuration()
        }
        if (dur > 0) {
          setCurrent(cur)
          setDuration(dur)
          reportProgress(Math.min(100, Math.round((cur / dur) * 100)))
        }
      } catch {/* el player se está reinicializando */}
    }

    // ── YOUTUBE (reproductor bloqueado) ──────────────────────────────────
    if (youtubeId) {
      loadYouTubeApi().then(() => {
        if (!mounted || !containerRef.current) return
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId: youtubeId,
          playerVars: {
            controls: 0,          // sin controles nativos de YouTube
            disablekb: 1,         // sin atajos de teclado de YouTube
            fs: 0,                // sin botón de pantalla completa nativo
            rel: 0,               // relacionados solo del mismo canal
            modestbranding: 1,    // (obsoleto pero inofensivo)
            iv_load_policy: 3,    // sin anotaciones
            playsinline: 1,
          },
          events: {
            onReady: () => {
              if (!mounted) return
              setReady(true)
              try {
                const v = playerRef.current.getVolume?.() ?? 100
                setVolume(v)
                setMuted(playerRef.current.isMuted?.() ?? false)
              } catch {}
            },
            onStateChange: (e: any) => {
              // 1 = playing, 2 = paused, 0 = ended
              if (e.data === 1) { setPlaying(true); startTicking() }
              else if (e.data === 0) { setPlaying(false); reportProgress(100); stopTicking() }
              else { setPlaying(false); stopTicking() }
            },
            // Se dispara cuando el módulo de subtítulos queda disponible.
            onApiChange: () => {
              try {
                const p = playerRef.current
                const opts: string[] = p.getOptions?.() || []
                const mod = opts.indexOf('captions') !== -1 ? 'captions'
                          : opts.indexOf('cc') !== -1 ? 'cc' : null
                if (mod) {
                  const tracks = p.getOption(mod, 'tracklist') || []
                  setCcModule(mod)
                  setCcAvailable(Array.isArray(tracks) && tracks.length > 0)
                }
              } catch {}
            },
          },
        })
      })
    }
    // ── VIMEO (reproductor nativo) ───────────────────────────────────────
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

    return () => {
      mounted = false
      stopTicking()
      try {
        if (playerRef.current?.destroy) playerRef.current.destroy()
        else if (playerRef.current?.unload) playerRef.current.unload()
      } catch {}
      playerRef.current = null
    }
  }, [youtubeId, vimeoId, reportProgress])

  // ── Sincronizar estado de pantalla completa ──────────────────────────────
  useEffect(() => {
    const onFsChange = () => setIsFs(document.fullscreenElement === wrapRef.current)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  // ── Controles personalizados (YouTube) ───────────────────────────────────
  const togglePlay = useCallback(() => {
    const p = playerRef.current
    if (!p) return
    try {
      const st = p.getPlayerState?.()
      if (st === 1) p.pauseVideo?.()
      else p.playVideo?.()
    } catch {}
  }, [])

  const toggleMute = useCallback(() => {
    const p = playerRef.current
    if (!p) return
    try {
      if (p.isMuted?.()) { p.unMute?.(); setMuted(false); if (volume === 0) { p.setVolume?.(100); setVolume(100) } }
      else { p.mute?.(); setMuted(true) }
    } catch {}
  }, [volume])

  const changeVolume = useCallback((v: number) => {
    const p = playerRef.current
    setVolume(v)
    try {
      p?.setVolume?.(v)
      if (v === 0) { p?.mute?.(); setMuted(true) }
      else { p?.unMute?.(); setMuted(false) }
    } catch {}
  }, [])

  const toggleCaptions = useCallback(() => {
    const p = playerRef.current
    if (!p || !ccModule) return
    try {
      if (captionsOn) {
        p.setOption(ccModule, 'track', {})   // ocultar
        setCaptionsOn(false)
      } else {
        const tracks = p.getOption(ccModule, 'tracklist') || []
        p.setOption(ccModule, 'track', tracks[0] || { languageCode: 'es' })
        setCaptionsOn(true)
      }
    } catch {}
  }, [ccModule, captionsOn])

  const toggleFullscreen = useCallback(() => {
    const el = wrapRef.current
    if (!el) return
    if (document.fullscreenElement === el) document.exitFullscreen?.()
    else el.requestFullscreen?.()
  }, [])

  const blockContext = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    return false
  }, [])

  if (!youtubeId && !vimeoId) return null

  // ── VIMEO: comportamiento anterior (reproductor nativo) ──────────────────
  if (vimeoId) {
    return (
      <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: 12, overflow: 'hidden', marginBottom: 18 }}>
        <div ref={containerRef} title={title} style={{ width: '100%', height: '100%' }} />
      </div>
    )
  }

  // ── YOUTUBE: reproductor bloqueado ───────────────────────────────────────
  const pct = duration > 0 ? (current / duration) * 100 : 0
  const volPct = muted ? 0 : volume

  return (
    <div
      ref={wrapRef}
      onContextMenu={blockContext}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: isFs ? 'auto' : '16/9',
        height: isFs ? '100%' : undefined,
        background: '#000',
        borderRadius: isFs ? 0 : 12,
        overflow: 'hidden',
        marginBottom: 18,
        userSelect: 'none',
      }}
    >
      {/* iframe de YouTube — sin eventos de puntero (los captura la capa) */}
      <div
        ref={containerRef}
        title={title}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      />

      {/* Capa transparente: clic = play/pausa, clic derecho bloqueado */}
      <div
        onClick={togglePlay}
        onContextMenu={blockContext}
        style={{ position: 'absolute', inset: 0, zIndex: 2, cursor: 'pointer', background: 'transparent' }}
      />

      {/* Botón grande central cuando está pausado */}
      {ready && !playing && (
        <button
          onClick={togglePlay}
          aria-label="Reproducir"
          style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            zIndex: 3, width: 72, height: 72, borderRadius: '50%', border: 'none',
            background: 'rgba(0,0,0,.55)', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        </button>
      )}

      {/* Cargando */}
      {!ready && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.7)', fontSize: 14 }}>
          Cargando…
        </div>
      )}

      {/* Barra de controles propia */}
      <div
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 4,
          padding: '10px 12px 12px',
          background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, rgba(0,0,0,.35) 60%, transparent 100%)',
        }}
      >
        {/* Progreso (solo visual, no permite adelantar) */}
        <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,.28)', overflow: 'hidden', marginBottom: 10 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: '#E8959A', transition: 'width .25s linear' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: '#fff' }}>
          {/* Play / Pausa */}
          <button onClick={togglePlay} aria-label={playing ? 'Pausar' : 'Reproducir'} style={btn}>
            {playing
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>}
          </button>

          {/* Tiempo */}
          <span style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums', minWidth: 82 }}>
            {fmt(current)} / {fmt(duration)}
          </span>

          <div style={{ flex: 1 }} />

          {/* Subtítulos (solo si el video tiene subtítulos disponibles) */}
          {ccAvailable && (
            <button onClick={toggleCaptions} aria-label="Subtítulos" title="Subtítulos" style={btn}>
              <span style={{
                fontSize: 12, fontWeight: 700, lineHeight: 1, padding: '2px 4px', borderRadius: 3,
                border: `1.5px solid ${captionsOn ? '#E8959A' : 'rgba(255,255,255,.6)'}`,
                color: captionsOn ? '#E8959A' : '#fff',
              }}>CC</span>
            </button>
          )}

          {/* Volumen */}
          <button onClick={toggleMute} aria-label={muted || volume === 0 ? 'Activar sonido' : 'Silenciar'} style={btn}>
            {muted || volume === 0
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0014 8v2.18l2.45 2.45A4.4 4.4 0 0016.5 12zM19 12a7 7 0 01-1 3.6l1.5 1.5A9 9 0 0021 12a9 9 0 00-7-8.77v2.06A7 7 0 0119 12zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25A7 7 0 0114 18.7v2.06a9 9 0 003.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8v8a4.5 4.5 0 002.5-4zM14 3.23v2.06A7 7 0 0114 18.7v2.06a9 9 0 000-17.53z" /></svg>}
          </button>
          <input
            type="range" min={0} max={100} step={1} value={volPct}
            onChange={(e) => changeVolume(Number(e.target.value))}
            aria-label="Volumen"
            style={{ width: 80, accentColor: '#E8959A', cursor: 'pointer' }}
          />

          {/* Pantalla completa */}
          <button onClick={toggleFullscreen} aria-label="Pantalla completa" style={btn}>
            {isFs
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" /></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>}
          </button>
        </div>
      </div>
    </div>
  )
}

const btn: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 0,
}
