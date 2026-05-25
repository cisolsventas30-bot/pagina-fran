-- =====================================================
-- capyABA · Testimonios públicos
-- Ejecutar en SQL Editor de Supabase
-- =====================================================

create table public.testimonials (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text,
  email text,
  category text not null default 'Familias' check (category in ('Familias', 'Supervisión')),
  quote text not null,
  stars int not null default 5 check (stars between 1 and 5),
  initials text,
  accent text default '#F5DFD3',
  is_published boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_testimonials_published on public.testimonials(is_published, created_at desc);

create trigger testimonials_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

alter table public.testimonials enable row level security;

-- Cualquiera puede leer testimonios publicados
create policy "Public read published testimonials"
  on public.testimonials for select
  using (is_published = true);

-- Cualquiera (visitante anónimo o usuario logueado) puede enviar una reseña
-- Pero NO puede marcarla como publicada — siempre entra como pendiente
create policy "Anyone can submit a testimonial"
  on public.testimonials for insert
  with check (is_published = false);

-- Solo admins pueden actualizar (publicar), eliminar o ver todas (incluso las no publicadas)
create policy "Admins manage testimonials"
  on public.testimonials for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
