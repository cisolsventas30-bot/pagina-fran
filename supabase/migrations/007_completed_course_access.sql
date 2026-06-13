-- =====================================================
-- capyABA · Acceso continuo a cursos completados
-- Ejecutar en SQL Editor de Supabase
-- =====================================================
--
-- Las políticas RLS originales (001_initial_schema.sql) solo permitían
-- al alumno ver cursos, módulos, lecciones y quizzes mientras
-- `enrollment.status = 'active'`. Cuando completaba el curso, el status
-- pasaba a 'completed' y el alumno PERDÍA EL ACCESO al contenido
-- (los videos "se borraban" para él).
--
-- Esta migración amplía las políticas para permitir acceso continuo
-- a alumnos cuyo enrollment está activo O completado (no revocado).

-- ── COURSES ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Students view enrolled courses" ON public.courses;
CREATE POLICY "Students view enrolled courses" ON public.courses
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM public.enrollments
      WHERE course_id = courses.id
      AND student_id = auth.uid()
      AND status IN ('active', 'completed')
    )
  );

-- ── MODULES ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Students view enrolled modules" ON public.modules;
CREATE POLICY "Students view enrolled modules" ON public.modules
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = modules.course_id
      AND e.student_id = auth.uid()
      AND e.status IN ('active', 'completed')
    )
  );

-- ── LESSONS (incluye video_url) ──────────────────────────────────────────
DROP POLICY IF EXISTS "Students view enrolled lessons" ON public.lessons;
CREATE POLICY "Students view enrolled lessons" ON public.lessons
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM public.enrollments e
      JOIN public.modules m ON m.course_id = e.course_id
      WHERE m.id = lessons.module_id
      AND e.student_id = auth.uid()
      AND e.status IN ('active', 'completed')
    )
  );

-- ── QUIZZES ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Students view quizzes" ON public.quizzes;
CREATE POLICY "Students view quizzes" ON public.quizzes
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM public.enrollments e
      WHERE (e.course_id = quizzes.course_id
             OR EXISTS(SELECT 1 FROM public.modules m
                       WHERE m.id = quizzes.module_id
                       AND m.course_id = e.course_id))
      AND e.student_id = auth.uid()
      AND e.status IN ('active', 'completed')
    )
  );
