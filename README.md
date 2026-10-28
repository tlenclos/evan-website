# Site d'Evan

Site vitrine statique, publié automatiquement sur **https://ebconceptetrenovation.fr**.

Ce fichier s'adresse à la personne qui fait vivre le site au quotidien. Aucune
connaissance technique n'est nécessaire pour ce qui suit.

---

## Le principe

Le contenu du site est rangé dans des fichiers texte, dans le dossier `src/`.
Vous modifiez un fichier, vous enregistrez, et **le site se met à jour tout seul
en une à deux minutes**.

Trois façons de faire une modification :

1. **Avec l'interface d'édition** — des formulaires pour chaque page, chaque
   prestation et chaque avis. Voir ci-dessous.
2. **Demander à Claude** — « change le numéro de téléphone », « ajoute une
   prestation “pose de terrasse” », « remplace la photo d'accueil ».
3. **Le faire soi-même sur github.com** — voir « Modifier un texte » ci-dessous.

---

## L'interface d'édition

1. Ouvrez **https://app.pagescms.org** et connectez-vous avec l'adresse e-mail à
   laquelle vous avez reçu l'invitation.
2. Choisissez le site, puis dans le menu de gauche ce que vous voulez modifier :
   **Pages**, **Réglages du site**, **Prestations**, **Réalisations**,
   **Avis clients**, ou les photos (**Images** et **Photos de chantiers**).
3. Modifiez, puis cliquez sur **Save**. Le site se met à jour une à deux minutes
   plus tard.

Sous chaque champ, une ligne d'aide indique ce qu'il faut y mettre. Un champ mal
rempli est signalé en rouge et n'est pas enregistré.

Créer ou supprimer une **page** n'est pas possible depuis l'interface : il faut
aussi modifier le code, demandez-le à Claude. Les prestations, les photos de
chantiers et les avis, eux, s'ajoutent, se suppriment et se réordonnent
librement. Un champ photo ouvre la liste des photos de chantiers : choisissez-en
une, ou déposez-en une nouvelle depuis ce même écran.

---

## Où se trouve quoi

| Ce que vous voulez changer                              | Le fichier à ouvrir                 |
| ------------------------------------------------------- | ----------------------------------- |
| Nom, métier, téléphone, e-mail, adresse, horaires, menu | `src/data/site.yaml`                |
| La liste des prestations et leurs tarifs                | `src/data/prestations.yaml`         |
| Les avis clients de la page d'accueil                   | `src/data/temoignages.yaml`         |
| Les photos de chantiers et leurs légendes               | `src/data/realisations.yaml`        |
| Le texte de la page d'accueil                           | `src/content/pages/accueil.md`      |
| Le texte de la page Prestations                         | `src/content/pages/prestations.md`  |
| Le texte de la page À propos                            | `src/content/pages/a-propos.md`     |
| Le texte de la page Contact                             | `src/content/pages/contact.md`      |
| Le texte de la page Réalisations                        | `src/content/pages/realisations.md` |
| Les fichiers photo et le logo                           | dossier `public/images/`            |
| Les couleurs et les polices                             | `src/styles/global.css`             |

Tant qu'ils n'ont pas été enregistrés depuis l'interface d'édition, ces fichiers
commencent par des explications en commentaire. Les mentions **`TODO`**
signalent les valeurs d'exemple qui restent à remplacer par les vraies.

---

## Modifier un texte, depuis github.com

1. Ouvrez le fichier concerné sur https://github.com/tlenclos/evan-website
2. Cliquez sur l'icône **crayon** en haut à droite du fichier.
3. Modifiez le texte. **Ne changez que ce qui est entre guillemets**, et laissez
   les espaces en début de ligne tels quels : ils structurent le fichier.
4. Cliquez sur **Commit changes**, puis à nouveau sur **Commit changes**.
5. Attendez une à deux minutes, puis rechargez le site.

**Si vous vous trompez**, le site en ligne n'est jamais cassé : la publication
s'arrête et l'ancienne version reste affichée. Un point rouge apparaît dans
l'onglet _Actions_ de GitHub, et le message d'erreur indique quel fichier et
quel champ posent problème.

---

## Ajouter une photo

1. Ouvrez le dossier `public/images/` sur github.com.
2. **Add file → Upload files**, puis déposez votre photo.
3. Nommez-la sans accent ni espace, par exemple `terrasse-angouleme.jpg`, et
   redimensionnez-la à 1600 pixels maximum avant de l'envoyer.
4. Demandez ensuite où la faire apparaître sur le site. Pour une photo de
   chantier : déposez-la dans `public/images/realisations/` et ajoutez un bloc
   dans `src/data/realisations.yaml`, avec son adresse :
   `fichier: '/images/realisations/nom-de-la-photo.jpg'`.

Plus simple : dans l'interface d'édition, ouvrez **Réalisations**, ajoutez une
ligne à la liste **Photos** et déposez la photo directement dans son champ.

---

## Vérifier la charte graphique

La page **https://ebconceptetrenovation.fr/styleguide** affiche toutes les
couleurs, polices et briques visuelles du site sur un seul écran. Elle n'est pas
dans le menu et n'apparaît pas dans Google. C'est l'endroit où vérifier d'un coup
d'œil qu'une modification de charte reste cohérente.

---

## Pour un développeur

```bash
npm install      # une seule fois
npm run dev      # aperçu local sur http://localhost:4321
npm run check    # vérifie le contenu et les types
npm run build    # construit le site dans dist/
npm run format   # met en forme le code
```

La pile technique, les conventions et la marche à suivre pour ajouter une page
sont décrites dans [`CLAUDE.md`](./CLAUDE.md).
