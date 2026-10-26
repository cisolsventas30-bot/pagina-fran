/**
 * Utilidades compartidas por el editor del blog y la página pública.
 */

/** Fuente del cuerpo del blog: la misma de todo el sitio (globals.css). */
export const BLOG_FONT = "'Plus Jakarta Sans', system-ui, sans-serif"

/**
 * Un bloque "Lista viñeta" / "Lista numerada" puede traer varios puntos:
 * uno por línea (Enter en el editor) o separados por <br>, <p> o <div> si
 * se pegó desde otro lado. Devuelve cada punto por separado, sin vacíos,
 * para que cada párrafo tenga su propia viñeta.
 */
export function splitListItems(content: string): string[] {
  if (!content) return []
  return content
    .replace(/<\/(p|div|li)>/gi, '\n')
    .replace(/<(p|div|li|ul|ol)(\s[^>]*)?>|<\/(ul|ol)>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').trim() !== '')
}
