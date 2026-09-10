# Consignes de développement

Site vitrine statique. Astro 7 + Tailwind v4, sortie 100 % statique, publié sur
GitHub Pages à l'adresse `https://evan-website.thibaultlenclos.fr`.

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
│   ├── index.ts       charge et valide les 3 fichiers .yaml ci-dessous
│   ├── site.yaml      identité, menu, coordonnées, horaires, réseaux
│   ├── prestations.yaml
│   └── temoignages.yaml
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

`.github/workflows/deploy.yml` construit et publie à chaque envoi sur `main`.
Le fichier `public/CNAME` fixe le nom de domaine : ne pas le supprimer, il est
recopié tel quel dans `dist/` à chaque construction.

---

## Lien avec Claude Design (à faire)

Le design system existe déjà **dans le code** : les tokens de
`src/styles/global.css` et leur rendu sur `/styleguide`.

Il n'est pas encore synchronisé avec un projet claude.ai/design, car l'outil
`DesignSync` exige une autorisation obtenue via `/design-login`, qui ne
s'exécute que depuis une session Claude Code **interactive** (application de
bureau ou terminal local) — pas depuis une session distante.

Marche à suivre, une fois `/design-login` effectué :

1. Générer un dossier de cartes de prévisualisation HTML à partir de
   `/styleguide`, une par groupe (`Couleurs`, `Typo`, `Boutons`, `Cartes`,
   `Navigation`), chacune commençant par un marqueur
   `<!-- @dsCard group="…" -->`.
2. `DesignSync` : `create_project` (ou `list_projects` pour réutiliser un projet
   existant), puis `finalize_plan`, puis `write_files`.
3. Le projet Claude Design devient l'endroit où valider visuellement une
   évolution de charte ; `src/styles/global.css` reste la source de vérité, et
   toute modification doit être reportée dans les deux sens.
