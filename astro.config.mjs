// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Cambiar por tu dominio cuando lo compres (y actualizar public/robots.txt)
  site: 'https://puka-yurac-page.pukayurac.workers.dev',
  integrations: [
    react(),
    sitemap({
      // El panel admin no se indexa
      filter: (page) => !new URL(page).pathname.startsWith('/admin'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
