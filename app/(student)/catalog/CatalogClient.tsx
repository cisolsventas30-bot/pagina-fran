'use client'
// app/(student)/catalog/CatalogClient.tsx
// CREAR este archivo en la misma carpeta que page.tsx

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Lock, CheckCircle2, BookOpen } from 'lucide-react'
import { CapyMascot } from '@/components/ui/CapyLogo'
import BuyButton from '@/components/BuyButton'

interface Course {
  id: string
  title: string
  description?: string
  cover_url?: string
  price?: number
  price_label?: string
}

interface Props {
  allCourses: Course[]
  enrolledIds: string[]
  userEmail: string
}

export default function CatalogClient({ allCourses, enrolledIds, userEmail }: Props) {
  const enrolledSet = new Set(enrolledIds)

  if (!allCourses.length) {
    return (
      <div className="text-center py-20 bg-mocha-50 rounded-xl border border-mocha-100">
        <CapyMascot size={120} className="mx-auto mb-4" />
        <h3 className="text-xl font-bold text-ink-900 mb-2 tracking-tight">
          Pronto habrá cursos
        </h3>
        <p className="text-ink-600 max-w-sm mx-auto text-sm">
          Los instructores están preparando nuevo contenido
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {allCourses.map((course) =>
        enrolledSet.has(course.id) ? (
          <EnrolledCard key={course.id} course={course} />
        ) : (
          <LockedCard
            key={course.id}
            course={course}
            userEmail={userEmail}
          />
        )
      )}
    </div>
  )
}

// ── Card: curso ya comprado ───────────────────────────────────────────────────

function EnrolledCard({ course }: { course: Course }) {
  return (
    <Link href={`/learn/${course.id}`} className="card card-hover group">
      <div className="aspect-video bg-mocha-100 flex items-center justify-center relative overflow-hidden">
        {course.cover_url
          ? <Image src={course.cover_url} alt={course.title} fill className="object-cover" />
          : <CapyMascot size={56} className="opacity-70" />
        }
        <div className="absolute top-3 right-3 badge badge-mocha">
          <CheckCircle2 className="w-3 h-3" />
          Disponible
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold text-ink-900 line-clamp-2 mb-2 leading-snug group-hover:text-mocha-700 transition">
          {course.title}
        </h3>
        <p className="text-xs text-ink-500 line-clamp-2 mb-3 leading-relaxed">
          {course.description || 'Curso online con certificación'}
        </p>
        <div className="flex items-center gap-1.5 pt-3 border-t border-ink-100">
          <BookOpen className="w-3.5 h-3.5 text-mocha-600" />
          <span className="text-xs font-semibold text-mocha-700">Acceder al curso</span>
        </div>
      </div>
    </Link>
  )
}

// ── Card: curso bloqueado ─────────────────────────────────────────────────────

function LockedCard({ course, userEmail }: { course: Course; userEmail: string }) {
  const priceDisplay = course.price_label
    ? course.price_label
    : course.price != null
      ? `S/ ${Number(course.price).toFixed(2)}`
      : 'Consultar precio'

  const waMsg = encodeURIComponent(`Hola! Me interesa el curso "${course.title}". ¿Cómo puedo adquirirlo?`)
  const waUrl = `https://wa.me/51940428169?text=${waMsg}`

  return (
    <div className="card relative group flex flex-col">
      <Link href={`/learn/${course.id}`} className="block" style={{ textDecoration: 'none' }}>
        <div className="aspect-video bg-ink-100 flex items-center justify-center relative overflow-hidden">
          {course.cover_url
            ? <Image src={course.cover_url} alt={course.title} fill className="object-cover" />
            : <CapyMascot size={56} className="opacity-30 grayscale" />
          }
          <div className="absolute top-3 right-3 badge bg-ink-700 text-white">
            <Lock className="w-3 h-3" />
            Bloqueado
          </div>
        </div>
        <div className="p-4 pb-2">
          <h3 className="text-base font-semibold text-ink-700 line-clamp-2 mb-2 leading-snug group-hover:text-mocha-700 transition">
            {course.title}
          </h3>
          <p className="text-xs text-ink-500 line-clamp-2 mb-3 leading-relaxed">
            {course.description || 'Curso online con certificación IBT/IBA'}
          </p>
          <div className="flex items-center justify-between pb-3 border-b border-ink-100">
            <span className="text-lg font-bold text-mocha-700">{priceDisplay}</span>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-ink-400" />
              <span className="text-xs text-ink-500">Ver intro</span>
            </div>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4 pt-2">
        {course.price != null && course.price > 0 ? (
          // Tiene precio → BuyButton con Culqi (el que ya existe en tu proyecto)
          <BuyButton
            courseId={course.id}
            courseTitle={course.title}
            price={course.price}
            priceLabel={course.price_label}
            userEmail={userEmail}
            waUrl={waUrl}
          />
        ) : (
          // Sin precio → solo WhatsApp
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5
              text-sm font-bold text-white transition"
            style={{ background: '#25D366', textDecoration: 'none' }}
          >
            Consultar precio por WhatsApp
          </a>
        )}
      </div>
    </div>
  )
}
