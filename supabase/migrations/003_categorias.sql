-- =========================================================
-- Puka Yurac - 003: categorías (tipos de producto) editables desde el panel
-- Alimentan el índice "Qué imprimimos" del inicio, los tipos de producto del
-- cotizador (con sus cantidades sugeridas) y las sugerencias de categoría del admin.
-- Solo agrega una tabla; no modifica productos (productos.categoria sigue siendo texto).
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query (una sola vez)
-- =========================================================

create table if not exists public.categorias (
  id bigserial primary key,
  nombre text not null unique,
  spec text,
  cantidades int[] not null default '{50,100,250}',
  orden int not null default 0,
  activo boolean not null default true,
  mostrar_en_inicio boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists categorias_updated_at on public.categorias;
create trigger categorias_updated_at
  before update on public.categorias
  for each row execute function public.set_updated_at();

alter table public.categorias enable row level security;

drop policy if exists "categorias_select_public" on public.categorias;
create policy "categorias_select_public" on public.categorias
  for select to anon, authenticated
  using (activo = true or public.is_admin());

drop policy if exists "categorias_insert_admin" on public.categorias;
create policy "categorias_insert_admin" on public.categorias
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "categorias_update_admin" on public.categorias;
create policy "categorias_update_admin" on public.categorias
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "categorias_delete_admin" on public.categorias;
create policy "categorias_delete_admin" on public.categorias
  for delete to authenticated
  using (public.is_admin());

-- Semilla: las 6 categorías actuales del sitio con sus cantidades sugeridas
insert into public.categorias (nombre, spec, cantidades, orden) values
  ('Agendas corporativas', 'Tapa dura · Hot stamping', '{50,100,250}', 1),
  ('Cuadernos personalizados', 'Doble ring · Tapa dura', '{100,250,500}', 2),
  ('Facturas y talonarios', 'Autocopiativo · Numerado', '{10,25,50}', 3),
  ('Folletos y afiches', 'Couché · Offset', '{500,1000,2500}', 4),
  ('Calendarios', 'Sobremesa · Pared', '{50,100,250}', 5),
  ('Agendas de cuero', 'Biocuero · Bajo relieve', '{25,50,100}', 6)
on conflict (nombre) do nothing;
