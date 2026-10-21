# Consignes de développement

Site vitrine statique. Astro 7 + Tailwind v4, sortie 100 % statique, déployée par
Coolify à l'adresse `https://evan-website.thibaultlenclos.fr`.

**Objectif du projet : une personne non technique doit pouvoir demander une
modification en une phrase.** Toutes les règles ci-dessous en découlent.

---

## Règles à respecter

1. **Aucun texte éditorial en dur dans un fichier `.astro`.** Tout texte visible
   provient de `src/data/*.yaml` ou de `src/content/pages/*.md`. Un fichier
   `.astro` ne contient que de la mise en page. Seule exception : les pages
   techniques (`mentions-legales.astro`, `404.astro`, `styleguide.astro`).
2. **Aucune couleur, police ou taille d'arrondi en dur.** Tout passe par les
   tokens de `src/styles/global.css` (classes `bg-brand-600`, `text-ink-700`,
   `rounded-card`…). Pas de `#hex` ni de `text-[13px]` dans les composants.
3. **Commentaires en français**, y compris dans les fichiers de contenu : ils
   sont lus par la personne qui édite le site.
4. **Pas de JavaScript côté navigateur** sauf nécessité réelle. Le menu mobile
   utilise `<details>`, sans script. Le site doit fonctionner sans JS.
5. **Pas de dépendance externe au chargement** : ni Google Fonts, ni CDN, ni
   outil de mesure d'audience. Les mentions légales affirment qu'aucun cookie
   n'est déposé — cela doit rester vrai.
6. **Marquer `TODO`** toute valeur d'exemple introduite (nom, tarif, avis…).

---

## Organisation

```
src/
├── data/            DONNÉES STRUCTURÉES (YAML) — listes et réglages
│   ├── index.ts       charge et valide les fichiers .yaml ci-dessous
│   ├── site.yaml      identité, menu, coordonnées, horaires, réseaux
│   ├── prestations.yaml
│   ├── temoignages.yaml
│   └── realisations.yaml  photos de chantiers (fichiers dans public/images/realisations/)
├── content/pages/   TEXTE DES PAGES (Markdown) — un fichier = une page
├── content.config.ts  schéma du frontmatter des pages
├── components/      briques réutilisables
├── layouts/         BaseLayout.astro — <head>, SEO, header, footer
├── pages/           les routes du site
└── styles/global.css  DESIGN TOKENS + styles de base
```

**Pourquoi les listes sont dans `src/data/` et non dans une collection de
contenu** : `getCollection()` renvoie les entrées triées par identifiant, ce qui
ignore l'ordre du fichier. Les listes sont donc chargées via
`import … from './x.yaml?raw'` + `js-yaml`, ce qui préserve l'ordre d'écriture :
déplacer un bloc dans le YAML déplace l'élément sur le site. Ne pas revenir à une
collection pour ces fichiers.

**Validation** : chaque fichier YAML est validé par un schéma Zod dans
`src/data/index.ts`, chaque page Markdown par `src/content.config.ts`. Une erreur
de saisie arrête la construction avec un message nommant le fichier et le champ.
En ajoutant un champ à un fichier de contenu, **ajouter aussi la règle
correspondante au schéma** : c'est ce qui protège la personne qui édite.

---

## Interface d'édition (Pages CMS)

`.pages.yml`, à la racine, décrit les formulaires de
[Pages CMS](https://pagescms.org). Chaque enregistrement y crée un commit sur
`main`, que Coolify déploie comme n'importe quel autre envoi.

**`.pages.yml` doit suivre les schémas Zod.** Tout champ ajouté, renommé ou
rendu obligatoire dans `src/data/index.ts` ou `src/content.config.ts` doit
l'être aussi dans `.pages.yml`, avec la même règle (`required`, `pattern`).
Sinon l'interface accepte une saisie que `npm run check` refusera, et le site ne
se mettra pas à jour sans que la personne qui édite le sache.

Comportements de Pages CMS à connaître :

- Il **supprime tout champ absent de `.pages.yml`** : à l'enregistrement, le
  formulaire passe par un `z.object()` généré depuis la configuration, qui
  retire les clés inconnues, y compris dans les objets et les listes. Un champ
  oublié dans `.pages.yml` disparaît donc au premier enregistrement — et si le
  schéma Zod le rend obligatoire, le site cesse de se mettre à jour. Constaté
  dans le code de Pages CMS (`app/api/[owner]/[repo]/[branch]/files/[path]/route.ts`,
  dépôt `hunvreus/pagescms`, octobre 2026), puis reproduit en rejouant cette
  étape en local sur un fichier de test (pas encore observé sur app.pagescms.org).
  L'option `settings.content.merge: true` conserverait ces clés, mais elle
  empêcherait aussi de vider un champ facultatif (l'ancienne valeur revient) et
  ne s'applique pas aux listes : ne pas l'activer.
- Il **réécrit entièrement** le fichier enregistré : les commentaires `#` des
  `.yaml` et du frontmatter disparaissent, et la mise en forme change. Les
  consignes pour l'éditeur vont donc dans les `description` de `.pages.yml`.
- Il **supprime les clés vides**, y compris une liste vide. Un champ facultatif
  côté Pages CMS doit être `.optional()` (ou `.default([])` pour une liste)
  côté Zod — voir `reseaux`. Vider une liste à la racine (tous les avis
  supprimés) produit même un fichier **vide** : `valider()` le traite comme
  absent, d'où le `.default([])` de `schemaTemoignages`.
- Son sélecteur d'images enregistre l'**adresse** de l'image
  (`/images/realisations/pergola-bois.jpg`), jamais le seul nom de fichier :
  une valeur qui ne commence pas par le dossier du média est refusée à
  l'enregistrement. Les photos s'écrivent donc ainsi dans tout le contenu, et
  `schemaPhoto` l'exige. Les champs photo de `.pages.yml` utilisent le
  composant `photo`, rattaché au média `realisations`.
- Il n'est pas possible d'y créer une page : `operations` l'interdit pour la
  collection `pages`, puisqu'une page exige aussi un fichier `.astro`.

Mise en place (une seule fois, par le propriétaire du dépôt) : se connecter à
https://app.pagescms.org avec GitHub, installer l'application GitHub sur le
dépôt `tlenclos/evan-website`, puis inviter la personne qui édite par e-mail
depuis l'onglet **Collaborators** du projet. Elle n'a pas besoin de compte
GitHub.

---

## Recettes

### Modifier un texte

Trouver le fichier dans le tableau du `README.md`. Ne pas toucher aux `.astro`.

### Ajouter une prestation ou un avis

Ajouter un bloc dans `src/data/prestations.yaml` ou `temoignages.yaml`, avec un
`id` unique, sans accent ni espace. Rien d'autre à modifier.

### Ajouter une page

1. Créer `src/content/pages/ma-page.md` avec `titre`, `description` et
   éventuellement `hero` dans le frontmatter.
2. Créer `src/pages/ma-page.astro` en copiant `src/pages/a-propos.astro`, qui est
   le gabarit le plus simple, et changer l'identifiant passé à `getEntry`.
3. Ajouter l'entrée dans `menu:` de `src/data/site.yaml` (URL avec le `/` final).

### Modifier la charte graphique

Changer les valeurs de `@theme static` dans `src/styles/global.css`, puis
vérifier le rendu sur `/styleguide`. Le mot-clé `static` est nécessaire : sans
lui, Tailwind supprime du CSS les nuances non utilisées et le nuancier du
styleguide s'affiche vide.

---

## Vérifications avant de livrer

```bash
npm run check    # types + schémas de contenu — doit afficher 0 erreur
npm run build    # doit se terminer par « Complete! »
npm run format   # met en forme le code
```

Pour un changement visuel, contrôler le rendu réel avec Playwright (Chromium est
préinstallé) en **1280 px** et **390 px** de large, sur `/` et sur la page
touchée, et vérifier l'absence de débordement horizontal :

```js
document.documentElement.scrollWidth - document.documentElement.clientWidth; // doit valoir 0
```

---

## Publication

Le site est déployé par **Coolify**, sur un serveur OVH. Tout envoi sur `main`
déclenche une reconstruction et une mise en ligne.

Le déploiement est décrit **dans le dépôt**, par deux fichiers :

- `Dockerfile` — construction en deux étapes : `npm ci`, `npm run check`,
  `npm run build` avec Node 22, puis copie de `dist/` dans une image nginx.
  L'image finale ne contient ni Node, ni `node_modules`, ni code source.
- `nginx.conf` — comment les pages sont servies : adressage des dossiers
  (`dist/contact/index.html`), page 404, durées de cache, compression.

Il ne reste que trois champs à régler dans l'interface Coolify :

| Champ          | Valeur       |
| -------------- | ------------ |
| Build Pack     | `Dockerfile` |
| Base Directory | `/`          |
| Ports Exposes  | `80`         |

**Trois pièges déjà rencontrés**, à ne pas réintroduire :

- _Base Directory_ réglée sur `/dist` : le dossier de build est dans
  `.gitignore`, il n'existe pas dans le code importé. La construction échoue sur
  « Nixpacks failed to detect the application type ».
- Build pack `Nixpacks` : il cherche à démarrer un serveur, or il n'y a pas de
  script `start` et un site statique n'a rien à démarrer.
- Build pack `Static` : il ne permet pas de lancer une commande de build. Il
  faudrait committer `dist/`, ce que l'on ne veut pas.

`llms.txt` et `llms-full.txt`, à la racine, documentent le CLI Coolify — à
consulter pour toute intervention sur le déploiement.

**Le contenu est validé avant la mise en ligne.** Le `Dockerfile` lance
`npm run check` avant de construire : une erreur de saisie dans un `.yaml` ou un
`.md` arrête la construction de l'image, et la version précédente du site reste
en ligne.

### Tester la configuration nginx sans Docker

Le démon Docker n'est pas disponible dans les sessions Claude Code distantes.
Pour vérifier `nginx.conf` malgré tout : `npm run build`, puis lancer nginx sur
un port libre avec ce fichier, en remplaçant `listen 80` et la directive `root`
par le chemin de `dist/`. Ajouter `user root;` dans la configuration de test si
les fichiers sont hors du répertoire du projet, sinon nginx renvoie des 404 par
manque de droits. Contrôler alors : les pages répondent en 200, une URL
inconnue renvoie bien un code 404 **et** la page 404 du site, et
`/contact` redirige vers `/contact/` par un `Location` **relatif** — le
conteneur est derrière le proxy de Coolify.

---

## Lien avec Claude Design

La charte actuelle (« Grège & arche », direction A) a été conçue dans le projet
Claude Design https://claude.ai/artifact/1MvQxoeQK4aEWu1PABonbh, puis reportée
dans le code : tokens de `src/styles/global.css` (miel, grège/taupe, argile,
police Jost auto-hébergée via `@fontsource-variable/jost`, utilitaires
`rounded-arch` et `surtitre`) et rendu vérifiable sur `/styleguide`.

`src/styles/global.css` reste la source de vérité. Pour une évolution de charte,
la valider d'abord dans le projet Claude Design, puis reporter les valeurs ici ;
toute modification faite dans le code doit être répercutée dans le projet.
