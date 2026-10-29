# Consignes de développement

Site vitrine statique. Astro 7 + Tailwind v4, sortie 100 % statique, publiée par
GitHub Pages à l'adresse `https://ebconceptetrenovation.fr`.

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
│   └── realisations.yaml  photos de chantiers (fichiers dans src/assets/realisations/)
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
`main`, publié comme n'importe quel autre envoi.

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
  composant `photo`, rattaché au média `realisations`. Ce média range les
  fichiers dans `src/assets/realisations/` (`input`) tout en écrivant l'adresse
  `/images/realisations/…` (`output`) : voir « Photos » ci-dessous.
- Il n'est pas possible d'y créer une page : `operations` l'interdit pour la
  collection `pages`, puisqu'une page exige aussi un fichier `.astro`.

Mise en place (une seule fois, par le propriétaire du dépôt) : se connecter à
https://app.pagescms.org avec GitHub, installer l'application GitHub sur le
dépôt `tlenclos/evan-website`, puis inviter la personne qui édite par e-mail
depuis l'onglet **Collaborators** du projet. Elle n'a pas besoin de compte
GitHub.

---

## Photos

Les photos de chantiers vivent dans `src/assets/realisations/`, pas dans
`public/` : Astro en produit à la construction des versions WebP en plusieurs
largeurs. Le contenu continue de les désigner par `/images/realisations/nom.jpg`,
que `src/components/photos.ts` relie au fichier.

Toute photo s'affiche via `<Photo adresse=… cadres=… />`, jamais `<img>`.
`cadres` décrit la taille de l'emplacement pour chaque largeur d'écran (mêmes
paliers que les classes `sm:`/`lg:` du composant) ; le composant en déduit
l'attribut `sizes`, en tenant compte du rognage d'`object-cover`. En modifiant
la mise en page d'une zone photo, mettre ses `cadres` à jour, puis vérifier au
navigateur que `currentSrc` est au moins aussi large que l'image affichée × 2.

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

La page entre seule dans le sitemap. Une page passée en `noindex` doit aussi
être ajoutée à `pagesNonReferencees` dans `astro.config.mjs`, sinon le sitemap
propose à Google une page qui lui demande de l'ignorer.

### Référencement

`BaseLayout.astro` produit pour chaque page le titre (`titre` du frontmatter
suivi du nom de l'entreprise, 60 caractères au plus), la description, l'URL
canonique, l'aperçu de partage (`photoPartage` de `site.yaml`, recadrée en
1200 × 630) et la fiche d'entreprise schema.org. Les vérifications à faire
hors du code (Search Console, fiche Google, annuaires) sont suivies dans le
ticket https://github.com/tlenclos/evan-website/issues/12.

L'adresse e-mail `contact@ebconceptrenovation.fr` (sans « et ») est voulue :
elle dépend de l'ancien domaine d'Evan, servi par Google Workspace. Le domaine
du site n'a pas de boîte e-mail. Ne pas « corriger » l'adresse.

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

Le site est publié par **GitHub Pages** à l'adresse
`https://ebconceptetrenovation.fr`. Tout envoi sur `main` (y compris un
enregistrement depuis Pages CMS) déclenche une reconstruction et une mise en
ligne, en une à deux minutes.

- `.github/workflows/deploy.yml` lance `npm ci`, `npm run check`, `npm run build`
  avec Node 22, puis publie `dist/`. Le suivi se fait dans l'onglet _Actions_.
- `public/CNAME` fixe le nom de domaine : ne pas le supprimer, il est recopié
  tel quel dans `dist/` à chaque construction.
- Réglage du dépôt : _Settings → Pages → Source = « GitHub Actions »_. Pages
  n'est gratuit que parce que le dépôt est **public** : le repasser en privé
  coupe le site (c'est ce qui avait motivé un passage temporaire par Coolify).

**Le contenu est validé avant la mise en ligne.** Le workflow lance
`npm run check` avant de construire : une erreur de saisie dans un `.yaml` ou un
`.md` arrête la publication, et la version précédente du site reste en ligne.

### Nom de domaine

`ebconceptetrenovation.fr` est enregistré chez **OVH** (compte d'Evan, Thibault
en contact technique). Zone DNS attendue :

| Sous-domaine | Type    | Cible                                                 |
| ------------ | ------- | ----------------------------------------------------- |
| _(vide)_     | `A`     | `185.199.108.153`, `.109.153`, `.110.153`, `.111.153` |
| _(vide)_     | `AAAA`  | `2606:50c0:8000::153` à `2606:50c0:8003::153`         |
| `www`        | `CNAME` | `tlenclos.github.io.`                                 |

GitHub redirige `www` vers le domaine nu et fournit le certificat HTTPS
(_Enforce HTTPS_ dans _Settings → Pages_, une fois le certificat émis).

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
