-- =====================================================
-- capyABA · Sobre mí — Certificados + Galería editables
-- Ejecutar en SQL Editor de Supabase
-- =====================================================

-- ── Certificados profesionales (sección "Formación rigurosa") ─────────────
create table public.sobre_mi_certificates (
  id uuid primary key default uuid_generate_v4(),
  src text not null,                        -- URL pública del PNG/JPG
  title text not null,
  badge text,                               -- ej. "IBA · IBAO"
  description text,
  sort_order int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_sobre_mi_certs_order on public.sobre_mi_certificates(sort_order);

create trigger sobre_mi_certs_updated_at
  before update on public.sobre_mi_certificates
  for each row execute function public.set_updated_at();

-- ── Galería de fotos ──────────────────────────────────────────────────────
create table public.sobre_mi_gallery (
  id uuid primary key default uuid_generate_v4(),
  src text not null,                        -- URL pública
  caption text,                             -- opcional, descripción corta
  sort_order int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_sobre_mi_gallery_order on public.sobre_mi_gallery(sort_order);

create trigger sobre_mi_gallery_updated_at
  before update on public.sobre_mi_gallery
  for each row execute function public.set_updated_at();

-- ── RLS — cualquiera puede leer, solo admin escribe ───────────────────────
alter table public.sobre_mi_certificates enable row level security;
alter table public.sobre_mi_gallery      enable row level security;

create policy "Public read sobre_mi_certificates"
  on public.sobre_mi_certificates for select using (true);
create policy "Admins manage sobre_mi_certificates"
  on public.sobre_mi_certificates for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));

create policy "Public read sobre_mi_gallery"
  on public.sobre_mi_gallery for select using (true);
create policy "Admins manage sobre_mi_gallery"
  on public.sobre_mi_gallery for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));

-- ── Storage bucket compartido para ambos ──────────────────────────────────
insert into storage.buckets (id, name, public)
values ('sobre-mi', 'sobre-mi', true)
on conflict (id) do nothing;

create policy "Anyone can view sobre-mi files"
  on storage.objects for select
  using (bucket_id = 'sobre-mi');

create policy "Admins can upload sobre-mi files"
  on storage.objects for insert
  with check (
    bucket_id = 'sobre-mi' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete sobre-mi files"
  on storage.objects for delete
  using (
    bucket_id = 'sobre-mi' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
