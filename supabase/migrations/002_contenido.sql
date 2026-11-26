-- =========================================================
-- Puka Yurac - 002: contenido editable desde el panel admin
-- Datos del negocio, preguntas frecuentes y trabajos realizados.
-- Solo agrega tablas y políticas (no toca productos ni admins).
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query (una sola vez)
-- Requiere 001 (supabase/schema.sql): public.is_admin() y public.set_updated_at()
-- =========================================================

-- ---------- Datos del negocio (una sola fila) ----------
create table if not exists public.negocio (
  id int primary key default 1 check (id = 1),
  phone text not null,
  whatsapp_number text not null check (whatsapp_number ~ '^[0-9]{8,15}$'),
  whatsapp_message text not null default '',
  address text not null,
  map_query text not null default '',
  hours text not null default '',
  hours_short text not null default '',
  envios text not null default '',
  updated_at timestamptz not null default now()
);

drop trigger if exists negocio_updated_at on public.negocio;
create trigger negocio_updated_at
  before update on public.negocio
  for each row execute function public.set_updated_at();

alter table public.negocio enable row level security;

drop policy if exists "negocio_select_public" on public.negocio;
create policy "negocio_select_public" on public.negocio
  for select to anon, authenticated
  using (true);

drop policy if exists "negocio_insert_admin" on public.negocio;
create policy "negocio_insert_admin" on public.negocio
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "negocio_update_admin" on public.negocio;
create policy "negocio_update_admin" on public.negocio
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into public.negocio (id, phone, whatsapp_number, whatsapp_message, address, map_query, hours, hours_short, envios)
values (
  1,
  '+51 999 778 751',
  '51999778751',
  'Hola Puka & Yurac, quiero cotizar un trabajo de impresión.',
  'Jr. Orbegozo 645, Breña, Lima',
  'Jirón General Orbegoso 645, Breña 15083, Lima, Perú',
  'Lunes a sábado, 8:30 a. m. – 7:00 p. m.',
  'Lun – Sáb · 8:30 a. m. – 7:00 p. m.',
  'A todo el Perú'
)
on conflict (id) do nothing;

-- ---------- Preguntas frecuentes ----------
create table if not exists public.faqs (
  id bigserial primary key,
  pregunta text not null,
  respuesta text not null,
  orden int not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists faqs_updated_at on public.faqs;
create trigger faqs_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();

alter table public.faqs enable row level security;

drop policy if exists "faqs_select_public" on public.faqs;
create policy "faqs_select_public" on public.faqs
  for select to anon, authenticated
  using (activo = true or public.is_admin());

drop policy if exists "faqs_insert_admin" on public.faqs;
create policy "faqs_insert_admin" on public.faqs
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "faqs_update_admin" on public.faqs;
create policy "faqs_update_admin" on public.faqs
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "faqs_delete_admin" on public.faqs;
create policy "faqs_delete_admin" on public.faqs
  for delete to authenticated
  using (public.is_admin());

-- Semilla: solo si la tabla está vacía (textos provisionales actuales del sitio)
insert into public.faqs (pregunta, respuesta, orden)
select v.pregunta, v.respuesta, v.orden
from (values
  ('¿Cuánto demora un pedido?', 'Depende del producto y de la cantidad. Te confirmamos la fecha de entrega junto con la cotización.', 1),
  ('¿Cuál es la cantidad mínima?', 'Varía según el producto. Cuéntanos cuántas unidades necesitas y te decimos qué opción te conviene.', 2),
  ('¿Hacen envíos a provincias?', 'Sí, enviamos a todo el Perú. Coordinamos contigo la agencia de transporte al confirmar el pedido.', 3),
  ('¿Qué formas de pago aceptan?', 'Te indicamos las formas de pago disponibles al confirmar tu pedido.', 4)
) as v(pregunta, respuesta, orden)
where not exists (select 1 from public.faqs);

-- ---------- Trabajos realizados ----------
create table if not exists public.trabajos (
  id bigserial primary key,
  titulo text not null,
  cliente text,
  categoria text,
  descripcion text,
  imagen text,
  spec text,
  orden int not null default 0,
  activo boolean not null default true,
  destacado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trabajos_updated_at on public.trabajos;
create trigger trabajos_updated_at
  before update on public.trabajos
  for each row execute function public.set_updated_at();

alter table public.trabajos enable row level security;

drop policy if exists "trabajos_select_public" on public.trabajos;
create policy "trabajos_select_public" on public.trabajos
  for select to anon, authenticated
  using (activo = true or public.is_admin());

drop policy if exists "trabajos_insert_admin" on public.trabajos;
create policy "trabajos_insert_admin" on public.trabajos
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "trabajos_update_admin" on public.trabajos;
create policy "trabajos_update_admin" on public.trabajos
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "trabajos_delete_admin" on public.trabajos;
create policy "trabajos_delete_admin" on public.trabajos
  for delete to authenticated
  using (public.is_admin());

-- Las fotos de trabajos se guardan en el bucket 'productos' bajo la carpeta trabajos/;
-- las políticas de Storage existentes (solo admin escribe) ya las cubren.
