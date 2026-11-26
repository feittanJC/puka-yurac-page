# Puka & Yurac Impresiones

Sitio web de Puka & Yurac, imprenta y taller gráfico en Breña, Lima. Incluye la landing, el catálogo de productos (`/productos`) y un panel de administración (`/admin`) para gestionar el catálogo.

## Stack

- [Astro 7](https://astro.build) (sitio estático) con islas de React 19
- Tailwind CSS 4
- [Supabase](https://supabase.com): base de datos, Auth (panel admin) y Storage (imágenes de productos). Esquema en `supabase/schema.sql`.
- `@astrojs/sitemap` para el sitemap

## Configuración

Requiere Node 22.12 o superior.

```sh
npm install
cp .env.example .env
```

Completa `.env` con los datos de tu proyecto de Supabase (Project Settings → API):

```
PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

Usa solo la clave `anon` pública. Nunca pongas la `service_role` en el proyecto. `.env` no se sube al repositorio.

## Base de datos

Ejecuta los scripts en Supabase → SQL Editor → New query, en este orden y una sola vez:

1. `supabase/schema.sql`: tabla de productos, administradores y bucket de imágenes.
2. `supabase/migrations/002_contenido.sql`: datos del negocio, preguntas frecuentes y trabajos realizados. Solo agrega tablas; no modifica las anteriores.
3. `supabase/migrations/003_categorias.sql`: categorías (tipos de producto) del índice "Qué imprimimos" y del cotizador.

## Panel admin

Entra en `/admin/login` con un usuario registrado en la tabla `admins` (ver el final de `schema.sql`). El panel tiene cinco secciones:

- **Productos**: catálogo (`/productos` y destacados de la página de inicio).
- **Categorías**: tipos de producto del índice "Qué imprimimos" y del cotizador, con sus cantidades sugeridas.
- **Trabajos**: galería "Trabajos que salieron del taller". Si no hay trabajos publicados, la sección no aparece.
- **Preguntas frecuentes**: con orden y publicación.
- **Datos del negocio**: teléfono, WhatsApp, dirección, horario y envíos que se muestran en todo el sitio.

Los cambios se ven al recargar la página (el navegador consulta Supabase). Si Supabase no responde, el sitio usa los valores de `src/data/siteData.js`.

## Comandos

| Comando           | Acción                                     |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Servidor local en `http://localhost:4321`  |
| `npm run build`   | Genera el sitio en `dist/`                 |
| `npm run preview` | Sirve `dist/` localmente para revisarlo    |

## Deploy en Cloudflare Pages

1. Conecta el repositorio en Cloudflare Pages.
2. Configuración de build:
   - Build command: `npm run build`
   - Build output directory: `dist`
3. Variables de entorno:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   - `NODE_VERSION` = `22`

## Supabase keep-alive

Los proyectos gratuitos de Supabase se pausan tras días sin actividad. El workflow `.github/workflows/supabase-keepalive.yml` hace una consulta cada 3 días (también se puede lanzar a mano desde la pestaña Actions).

Agrega estos secrets en GitHub (Settings → Secrets and variables → Actions):

- `SUPABASE_URL`: la URL del proyecto, por ejemplo `https://TU-PROYECTO.supabase.co`
- `SUPABASE_ANON_KEY`: la clave `anon` pública

## Cambiar el dominio

El sitio usa `https://puka-yurac-page.pukayurac.workers.dev` para el sitemap, la URL canónica y las vistas previas al compartir. Cuando compres tu dominio, cámbialo en dos lugares:

1. `astro.config.mjs` → `site`
2. `public/robots.txt` → línea `Sitemap:`

Luego vuelve a desplegar.
