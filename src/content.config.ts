import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * Déclaration du contenu rédactionnel du site.
 *
 * Un fichier Markdown de `src/content/pages/` = une page. Les lignes entre les
 * deux `---` en haut du fichier doivent respecter le schéma ci-dessous : un
 * champ manquant ou mal orthographié fait échouer la construction avec un
 * message clair, plutôt que de publier une page sans titre.
 *
 * Les listes (prestations, avis clients) ne sont pas ici mais dans `src/data/`,
 * afin que l'ordre d'écriture dans le fichier soit l'ordre d'affichage.
 */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    titre: z.string(),
    // Résumé affiché par Google sous le titre. 150-160 caractères idéalement.
    description: z.string(),
    hero: z
      .object({
        titre: z.string(),
        texte: z.string(),
        ctaTexte: z.string().optional(),
        ctaUrl: z.string().optional(),
      })
      .optional(),
  }),
});

export const collections = { pages };
