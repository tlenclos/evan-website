// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// L'adresse publique du site. Sert à générer le sitemap et les liens de partage.
// Si le nom de domaine change un jour, c'est la seule ligne à modifier ici.
const site = 'https://ebconceptetrenovation.fr';

// Pages marquées `noindex` : Google ne doit pas les trouver dans le sitemap.
const pagesNonReferencees = ['/styleguide/', '/mentions-legales/'];

export default defineConfig({
  site,
  integrations: [
    sitemap({
      filter: (page) => !pagesNonReferencees.some((chemin) => page === site + chemin),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
