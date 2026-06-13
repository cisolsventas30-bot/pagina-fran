-- =====================================================
-- capyABA · Sistema de notificaciones
-- Ejecutar en SQL Editor de Supabase
-- =====================================================

create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,                     -- 'enrollment' | 'certificate' | 'testimonial_pending' | 'quiz_review' | etc.
  title text not null,                    -- 1 línea, lo que se ve grande
  body text,                              -- 1-2 líneas adicionales (opcional)
  link_url text,                          -- href al hacer click (opcional)
  is_read boolean not null default false,
  created_at timestamptz default now()
);

-- Indexes para la query más común: notificaciones no leídas del usuario actual ordenadas
create index idx_notifications_user on public.notifications(user_id, created_at desc);
create index idx_notifications_unread on public.notifications(user_id, is_read) where is_read = false;

alter table public.notifications enable row level security;

-- Cada usuario ve sus propias notificaciones
create policy "Users read own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

-- Cada usuario puede marcar sus notificaciones como leídas / eliminarlas
create policy "Users update own notifications"
  on public.notifications for update
  using (user_id = auth.uid());

create policy "Users delete own notifications"
  on public.notifications for delete
  using (user_id = auth.uid());

-- Los admins pueden gestionar todas (servicio + dashboard interno)
create policy "Admins manage all notifications"
  on public.notifications for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Realtime: cualquier cambio en notifications dispara eventos al cliente suscrito.
-- Esto permite que el badge aparezca en vivo sin refrescar.
alter publication supabase_realtime add table public.notifications;
