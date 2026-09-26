-- =========================================================
-- Puka Yurac - Esquema inicial
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query
-- =========================================================

-- ---------- Admins ----------
-- Lista de usuarios (de Supabase Auth) con permiso de administrador.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Cada usuario solo puede ver su propia fila (para saber si es admin).
create policy "admins_select_self" on public.admins
  for select to authenticated
  using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- Productos ----------
create table if not exists public.productos (
  id bigint generated always as identity primary key,
  titulo text not null,
  categoria text not null,
  descripcion text,
  imagen text,
  acabados text[] not null default '{}',
  destacado boolean not null default false,
  activo boolean not null default true,
  orden int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists productos_updated_at on public.productos;
create trigger productos_updated_at
  before update on public.productos
  for each row execute function public.set_updated_at();

alter table public.productos enable row level security;

-- Público: solo productos activos.
create policy "productos_select_public" on public.productos
  for select to anon, authenticated
  using (activo = true or public.is_admin());

-- Admin: escritura completa.
create policy "productos_insert_admin" on public.productos
  for insert to authenticated
  with check (public.is_admin());

create policy "productos_update_admin" on public.productos
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "productos_delete_admin" on public.productos
  for delete to authenticated
  using (public.is_admin());

-- ---------- Storage: bucket de imágenes ----------
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

create policy "productos_img_insert_admin" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'productos' and public.is_admin());

create policy "productos_img_update_admin" on storage.objects
  for update to authenticated
  using (bucket_id = 'productos' and public.is_admin());

create policy "productos_img_delete_admin" on storage.objects
  for delete to authenticated
  using (bucket_id = 'productos' and public.is_admin());

-- ---------- Datos iniciales (catálogo actual) ----------
insert into public.productos (titulo, categoria, descripcion, imagen, acabados, destacado, orden) values
  ('Agendas Corporativas', 'Encuadernación', 'Agendas personalizadas en tapa dura, finos acabados en cuero o biocuero, hojas interiores personalizadas con tu marca y cinta separadora.', '/assets/cuaderno.jpg', array['Tapa Dura','Hot Stamping','Anillado Doble Ring'], true, 1),
  ('Cuadernos Personalizados', 'Encuadernación', 'Cuadernos para empresas y colegios. Hojas rayadas, cuadriculadas o bond de alta blancura con diseño exclusivo de carátula.', '/assets/anillado.jpg', array['Anillado Metálico','Hojas Personalizadas','Plastificado Mate/Brillo'], true, 2),
  ('Facturas y Talonarios', 'Imprenta Comercial', 'Talonarios de facturas, boletas, guías de remisión y comprobantes en papel autocopiativo de alta definición.', '/assets/facturas.png', array['Papel Autocopiativo','Numerado Secuencial','Troquelado y Engomado'], false, 3),
  ('Folletos y Afiches', 'Publicidad', 'Trípticos, dípticos y afiches publicitarios con colores vibrantes para promocionar tus productos o eventos corporativos.', '/assets/folleto.jpg', array['Papel Couché 150g - 300g','Barniz UV','Doblez de Precisión'], true, 4),
  ('Calendarios de Escritorio y Pared', 'Merchandising', 'Calendarios publicitarios para fin de año. Base rígida, encuadernados en doble ring con acabados dorados o plateados.', '/assets/calendario.jpg', array['Base Cartón Maqueta','Impresión Full Color','Anillado Superior'], false, 5),
  ('Agendas de Cuero de Lujo', 'Encuadernación', 'Línea ejecutiva de agendas en cuero sintético, grabado en pan de oro o repujado, ideal para regalos corporativos de alta gama.', '/assets/agenda.png', array['Grabado Láser / Pan de Oro','Esquineros Metálicos','Bolsillo Interno'], true, 6);

-- ---------- Registrar admin ----------
-- 1) Crear usuario en: Authentication > Users > Add user (email + password, "Auto Confirm User").
-- 2) Ejecutar (reemplazar email):
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'TU_EMAIL@ejemplo.com';
