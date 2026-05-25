-- =====================================================
-- capyABA · Agregar template "libre" a courses
-- Ejecutar en SQL Editor de Supabase
-- =====================================================
--
-- La columna courses.certificate_template tiene una CHECK constraint
-- que solo permite 'ceu' | 'ibt' | 'iba'. Esta migración la actualiza
-- para que también acepte 'libre' (certificados de cursos libres).

-- Eliminar la constraint vieja (si existe)
ALTER TABLE public.courses
  DROP CONSTRAINT IF EXISTS courses_certificate_template_check;

-- Crear la constraint nueva con 'libre' incluido
ALTER TABLE public.courses
  ADD CONSTRAINT courses_certificate_template_check
  CHECK (certificate_template IN ('ceu', 'ibt', 'iba', 'libre'));
