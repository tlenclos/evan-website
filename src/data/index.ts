import { existsSync } from 'node:fs';
import { load as chargerYaml } from 'js-yaml';
import { z } from 'astro/zod';
// `?raw` demande à l'outil de construction d'insérer le contenu brut du fichier.
import contenuSite from './site.yaml?raw';
import contenuPrestations from './prestations.yaml?raw';
import contenuTemoignages from './temoignages.yaml?raw';
import contenuRealisations from './realisations.yaml?raw';

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
  // Pages CMS écrit un fichier vide quand on supprime le dernier élément d'une liste.
  const donnees = contenu.trim() === '' ? undefined : chargerYaml(contenu);
  const resultat = schema.safeParse(donnees);

  if (!resultat.success) {
    const details = resultat.error.issues
      .map((probleme) => `  • ${probleme.path.join('.') || '(racine)'} : ${probleme.message}`)
      .join('\n');
    throw new Error(
      `Le fichier src/data/${nomFichier} est mal rempli :\n${details}\n\n` +
        `Corrigez ces champs puis relancez. Le format attendu est décrit dans les commentaires du fichier et sous chaque champ de l'interface d'édition.`,
    );
  }

  return resultat.data;
}

// Une faute de frappe dans un nom d'image afficherait une image cassée : on la refuse.
const imageExistante = (cheminPublic: string) => existsSync(`public${cheminPublic}`);

// Photo de chantier, désignée par son adresse sur le site : /images/realisations/nom.jpg.
// C'est la forme qu'écrit le sélecteur d'images de Pages CMS. Le fichier, lui, est
// rangé dans src/assets/realisations/ pour être optimisé à la construction.
export const schemaPhoto = z
  .string()
  .startsWith('/images/realisations/', {
    message:
      'doit commencer par /images/realisations/, par exemple /images/realisations/pergola-bois.jpg',
    abort: true,
  })
  .regex(/\.(jpe?g|png|webp|avif)$/i, {
    message: 'format accepté : .jpg, .png, .webp ou .avif',
    abort: true,
  })
  .refine(
    (adresse) => existsSync(adresse.replace('/images/realisations/', 'src/assets/realisations/')),
    'fichier introuvable dans src/assets/realisations/',
  );

// --- Réglages généraux : src/data/site.yaml ---------------------------------
const schemaSite = z.object({
  nom: z.string().min(1),
  logo: z.string().refine(imageExistante, 'fichier introuvable dans public/'),
  metier: z.string().min(1),
  description: z.string().min(1),
  zone: z.string().min(1),
  formeJuridique: z.string().min(1),
  contact: z.object({
    email: z.email(),
    telephone: z
      .string()
      .regex(/^\+[0-9]{6,15}$/, 'format international sans espace, par exemple +33612345678'),
    telephoneAffiche: z.string().min(1),
    adresse: z.string().min(1),
    siret: z.string().min(1),
  }),
  horaires: z.array(z.object({ jour: z.string(), heures: z.string() })).min(1),
  // Pages CMS supprime une liste vide à l'enregistrement : la clé peut donc manquer.
  reseaux: z.array(z.object({ nom: z.string(), url: z.url() })).default([]),
  menu: z
    .array(
      z.object({
        texte: z.string(),
        url: z
          .string()
          .regex(/^\/([a-z0-9-]+\/)*$/, 'doit commencer et finir par /, par exemple /contact/'),
      }),
    )
    .min(1),
  ctaPrincipal: z.object({ texte: z.string(), url: z.string() }),
});

const identifiant = z.string().regex(/^[a-z0-9-]+$/, 'minuscules, chiffres et tirets uniquement');

// --- Prestations : src/data/prestations.yaml --------------------------------
const schemaPrestations = z
  .array(
    z.object({
      id: identifiant,
      titre: z.string().min(1),
      description: z.string().min(1),
      tarif: z.string().optional(),
      details: z.array(z.string()).optional(),
      photo: schemaPhoto.optional(),
    }),
  )
  .min(1);

// --- Avis clients : src/data/temoignages.yaml -------------------------------
const schemaTemoignages = z
  .array(
    z.object({
      id: identifiant,
      texte: z.string().min(1),
      auteur: z.string().min(1),
      lieu: z.string().optional(),
    }),
  )
  .default([]);

// --- Réalisations : src/data/realisations.yaml -----------------------------
const schemaRealisations = z
  .object({
    apercuAccueil: z.object({
      surtitre: z.string().min(1),
      titre: z.string().min(1),
      bouton: z.string().min(1),
    }),
    categories: z.array(z.object({ id: identifiant, titre: z.string().min(1) })).min(1),
    photos: z
      .array(
        z.object({
          fichier: schemaPhoto,
          legende: z.string().min(1),
          categorie: z.string().min(1),
          etiquette: z.string().optional(),
          accueil: z.number().int().min(1).max(5).optional(),
        }),
      )
      .min(1),
  })
  .superRefine((realisations, contexte) => {
    const idsCategories = realisations.categories.map((categorie) => categorie.id);
    realisations.photos.forEach((photo, index) => {
      if (!idsCategories.includes(photo.categorie)) {
        contexte.addIssue({
          code: 'custom',
          path: ['photos', index, 'categorie'],
          message: `catégorie inconnue, choisir parmi : ${idsCategories.join(', ')}`,
        });
      }
    });
  });

export const site = valider(schemaSite, contenuSite, 'site.yaml');
export const prestations = valider(schemaPrestations, contenuPrestations, 'prestations.yaml');
export const temoignages = valider(schemaTemoignages, contenuTemoignages, 'temoignages.yaml');
export const realisations = valider(schemaRealisations, contenuRealisations, 'realisations.yaml');

export type Site = z.infer<typeof schemaSite>;
export type Prestation = z.infer<typeof schemaPrestations>[number];
export type Temoignage = z.infer<typeof schemaTemoignages>[number];
export type PhotoRealisation = z.infer<typeof schemaRealisations>['photos'][number];
