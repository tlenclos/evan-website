import { load as chargerYaml } from 'js-yaml';
import { z } from 'astro/zod';
// `?raw` demande à l'outil de construction d'insérer le contenu brut du fichier.
import contenuSite from './site.yaml?raw';
import contenuPrestations from './prestations.yaml?raw';
import contenuTemoignages from './temoignages.yaml?raw';

/**
 * Chargement et validation des données du site (les fichiers .yaml de ce dossier).
 *
 * Les schémas ci-dessous décrivent la forme attendue de chaque fichier. Si
 * quelqu'un se trompe en l'éditant (champ oublié, guillemet manquant, e-mail
 * invalide), la construction du site s'arrête avec un message explicite plutôt
 * que de publier une page cassée.
 *
 * L'ordre des listes est celui du fichier : déplacer un bloc dans le YAML
 * déplace l'élément sur le site.
 */

function valider<T>(schema: z.ZodType<T>, contenu: string, nomFichier: string): T {
  const resultat = schema.safeParse(chargerYaml(contenu));

  if (!resultat.success) {
    const details = resultat.error.issues
      .map((probleme) => `  • ${probleme.path.join('.') || '(racine)'} : ${probleme.message}`)
      .join('\n');
    throw new Error(
      `Le fichier src/data/${nomFichier} est mal rempli :\n${details}\n\n` +
        `Corrigez ces champs puis relancez. Voir les commentaires du fichier pour le format attendu.`,
    );
  }

  return resultat.data;
}

// --- Réglages généraux : src/data/site.yaml ---------------------------------
const schemaSite = z.object({
  nom: z.string().min(1),
  metier: z.string().min(1),
  baseline: z.string().min(1),
  description: z.string().min(1),
  zone: z.string().min(1),
  contact: z.object({
    email: z.email(),
    telephone: z.string().min(1),
    telephoneAffiche: z.string().min(1),
    adresse: z.string().min(1),
    siret: z.string().min(1),
  }),
  horaires: z.array(z.object({ jour: z.string(), heures: z.string() })).min(1),
  reseaux: z.array(z.object({ nom: z.string(), url: z.url() })),
  menu: z.array(z.object({ texte: z.string(), url: z.string() })).min(1),
  ctaPrincipal: z.object({ texte: z.string(), url: z.string() }),
});

// --- Prestations : src/data/prestations.yaml --------------------------------
const schemaPrestations = z
  .array(
    z.object({
      id: z.string().min(1),
      titre: z.string().min(1),
      description: z.string().min(1),
      tarif: z.string().optional(),
      details: z.array(z.string()).optional(),
    }),
  )
  .min(1);

// --- Avis clients : src/data/temoignages.yaml -------------------------------
const schemaTemoignages = z.array(
  z.object({
    id: z.string().min(1),
    texte: z.string().min(1),
    auteur: z.string().min(1),
    lieu: z.string().optional(),
  }),
);

export const site = valider(schemaSite, contenuSite, 'site.yaml');
export const prestations = valider(schemaPrestations, contenuPrestations, 'prestations.yaml');
export const temoignages = valider(schemaTemoignages, contenuTemoignages, 'temoignages.yaml');

export type Site = z.infer<typeof schemaSite>;
export type Prestation = z.infer<typeof schemaPrestations>[number];
export type Temoignage = z.infer<typeof schemaTemoignages>[number];
