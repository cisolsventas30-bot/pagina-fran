'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardCheck,
  Award,
  BarChart3,
  Newspaper,
  MessageSquareQuote,
  UserCircle,
} from 'lucide-react'

type Props = {
  counts?: {
    courses?: number
    students?: number
    pendingReviews?: number
    certificates?: number
    pendingTestimonials?: number
  }
  open?: boolean
  onClose?: () => void
}

export function AdminSidebar({ counts, open, onClose }: Props) {
  const pathname = usePathname()

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname?.startsWith(href + '/')

  return (
    <aside className={`admin-sidebar${open ? ' open' : ''}`}>
      <div className="admin-sidebar-brand">
        <Link href="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
          <span className="admin-sidebar-mascot">
            <Image src="/capyaba-mascot.png" alt="capyABA" width={30} height={44}
              style={{ objectFit: 'contain', display: 'block', width: 'auto', height: 32 }} />
          </span>
          <span style={{ minWidth: 0 }}>
            <div className="admin-sidebar-brand-logo">
              capy<span className="accent">ABA</span>
            </div>
            <div className="admin-sidebar-brand-role">Panel instructor</div>
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontSize: '1.2rem', padding: '4px', display: 'none' }} className="sidebar-close-btn">✕</button>
        )}
      </div>

      <div className="admin-sidebar-section-label">Principal</div>

      <Link href="/admin" className={`admin-sidebar-item ${isActive('/admin', true) ? 'active' : ''}`}>
        <span className="label">
          <LayoutDashboard size={15} strokeWidth={2} />
          Dashboard
        </span>
      </Link>

      <Link
        href="/admin/courses"
        className={`admin-sidebar-item ${pathname?.startsWith('/admin/courses') ? 'active' : ''}`}
      >
        <span className="label">
          <BookOpen size={15} strokeWidth={2} />
          Cursos
        </span>
        {counts?.courses !== undefined && counts.courses > 0 && (
          <span className="count">{counts.courses}</span>
        )}
      </Link>

      <Link
        href="/admin/students"
        className={`admin-sidebar-item ${isActive('/admin/students') ? 'active' : ''}`}
      >
        <span className="label">
          <Users size={15} strokeWidth={2} />
          Alumnos
        </span>
        {counts?.students !== undefined && counts.students > 0 && (
          <span className="count">{counts.students}</span>
        )}
      </Link>

      <Link
        href="/admin/reviews"
        className={`admin-sidebar-item ${isActive('/admin/reviews') ? 'active' : ''}`}
      >
        <span className="label">
          <ClipboardCheck size={15} strokeWidth={2} />
          Revisiones
        </span>
        {counts?.pendingReviews !== undefined && counts.pendingReviews > 0 && (
          <span className="pill">{counts.pendingReviews}</span>
        )}
      </Link>

      <Link
        href="/admin/certificates"
        className={`admin-sidebar-item ${isActive('/admin/certificates') ? 'active' : ''}`}
      >
        <span className="label">
          <Award size={15} strokeWidth={2} />
          Certificados
        </span>
        {counts?.certificates !== undefined && counts.certificates > 0 && (
          <span className="count">{counts.certificates}</span>
        )}
      </Link>

      <Link
        href="/admin/blog"
        className={`admin-sidebar-item ${isActive('/admin/blog') ? 'active' : ''}`}
      >
        <span className="label">
          <Newspaper size={15} strokeWidth={2} />
          Blog
        </span>
      </Link>

      <Link
        href="/admin/testimonials"
        className={`admin-sidebar-item ${isActive('/admin/testimonials') ? 'active' : ''}`}
      >
        <span className="label">
          <MessageSquareQuote size={15} strokeWidth={2} />
          Testimonios
        </span>
        {counts?.pendingTestimonials !== undefined && counts.pendingTestimonials > 0 && (
          <span className="count">{counts.pendingTestimonials}</span>
        )}
      </Link>

      <Link
        href="/admin/sobre-mi"
        className={`admin-sidebar-item ${isActive('/admin/sobre-mi') ? 'active' : ''}`}
      >
        <span className="label">
          <UserCircle size={15} strokeWidth={2} />
          Sobre mí
        </span>
      </Link>

      <div className="admin-sidebar-section-label">Análisis</div>

      <Link
        href="/admin/stats"
        className={`admin-sidebar-item ${isActive('/admin/stats') ? 'active' : ''}`}
      >
        <span className="label">
          <BarChart3 size={15} strokeWidth={2} />
          Estadísticas
        </span>
      </Link>
    </aside>
  )
}
