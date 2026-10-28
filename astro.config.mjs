// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// L'adresse publique du site. Sert à générer le sitemap et les liens de partage.
// Si le nom de domaine change un jour, c'est la seule ligne à modifier ici.
export default defineConfig({
  site: 'https://ebconceptetrenovation.fr',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
