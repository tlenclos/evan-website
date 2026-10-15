import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { schemaNomPhoto } from './data';

/**
 * Déclaration du contenu rédactionnel du site.
 *
 * Un fichier Markdown de `src/content/pages/` = une page. Les lignes entre les
 * deux `---` en haut du fichier doivent respecter le schéma ci-dessous : un
 * champ manquant ou mal orthographié fait échouer la construction avec un
 * message clair, plutôt que de publier une page sans titre.
 *
 * Les listes (prestations, avis clients, photos) ne sont pas ici mais dans
 * `src/data/`, afin que l'ordre d'écriture dans le fichier soit l'ordre d'affichage.
 *
 * Les photos se désignent par leur nom de fichier dans public/images/realisations/.
 */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    titre: z.string(),
    // Résumé affiché par Google sous le titre. 150-160 caractères idéalement.
    description: z.string(),
    hero: z
      .object({
        surtitre: z.string().optional(),
        titre: z.string(),
        texte: z.string(),
        ctaTexte: z.string().optional(),
        ctaUrl: z.string().optional(),
        photo: schemaNomPhoto.optional(),
        photoSecondaire: schemaNomPhoto.optional(),
        legendePhoto: z.string().optional(),
      })
      .optional(),
    // Grand bandeau taupe d'appel au devis, en bas de page.
    appel: z
      .object({
        titre: z.string(),
        texte: z.string().optional(),
        photo: schemaNomPhoto.optional(),
      })
      .optional(),
    // Blocs propres à la page d'accueil.
    savoirFaire: z.object({ surtitre: z.string(), titre: z.string(), lien: z.string() }).optional(),
    chantierUne: z
      .object({
        surtitre: z.string(),
        titre: z.string(),
        texte: z.string(),
        photo: schemaNomPhoto,
        etapes: z.array(z.object({ photo: schemaNomPhoto, legende: z.string() })),
        bouton: z.string(),
      })
      .optional(),
    etapes: z
      .object({
        titre: z.string(),
        liste: z.array(z.object({ titre: z.string(), texte: z.string() })).min(1),
      })
      .optional(),
  }),
});

export const collections = { pages };
