# Site d'Evan

Site vitrine statique, publié automatiquement sur **https://evan-website.thibaultlenclos.fr**.

Ce fichier s'adresse à la personne qui fait vivre le site au quotidien. Aucune
connaissance technique n'est nécessaire pour ce qui suit.

---

## Le principe

Le contenu du site est rangé dans des fichiers texte, dans le dossier `src/`.
Vous modifiez un fichier, vous enregistrez, et **le site se met à jour tout seul
en une à deux minutes**.

Deux façons de faire une modification :

1. **Demander à Claude** — « change le numéro de téléphone », « ajoute une
   prestation “pose de terrasse” », « remplace la photo d'accueil ». C'est la
   voie la plus simple, et celle pour laquelle ce projet a été conçu.
2. **Le faire soi-même sur github.com** — voir « Modifier un texte » ci-dessous.

---

## Où se trouve quoi

| Ce que vous voulez changer                              | Le fichier à ouvrir                |
| ------------------------------------------------------- | ---------------------------------- |
| Nom, métier, téléphone, e-mail, adresse, horaires, menu | `src/data/site.yaml`               |
| La liste des prestations et leurs tarifs                | `src/data/prestations.yaml`        |
| Les avis clients de la page d'accueil                   | `src/data/temoignages.yaml`        |
| Le texte de la page d'accueil                           | `src/content/pages/accueil.md`     |
| Le texte de la page Prestations                         | `src/content/pages/prestations.md` |
| Le texte de la page À propos                            | `src/content/pages/a-propos.md`    |
| Le texte de la page Contact                             | `src/content/pages/contact.md`     |
| Les photos                                              | dossier `public/images/`           |
| Les couleurs et les polices                             | `src/styles/global.css`            |

Chacun de ces fichiers commence par des explications en commentaire. Les mentions
**`TODO`** signalent les valeurs d'exemple qui restent à remplacer par les vraies.

---

## Modifier un texte, depuis github.com

1. Ouvrez le fichier concerné sur https://github.com/tlenclos/evan-website
2. Cliquez sur l'icône **crayon** en haut à droite du fichier.
3. Modifiez le texte. **Ne changez que ce qui est entre guillemets**, et laissez
   les espaces en début de ligne tels quels : ils structurent le fichier.
4. Cliquez sur **Commit changes**, puis à nouveau sur **Commit changes**.
5. Attendez une à deux minutes, puis rechargez le site.

**Si vous vous trompez**, le site en ligne n'est jamais cassé : la publication
s'arrête et l'ancienne version reste affichée. Le déploiement apparaît en échec
dans Coolify, et le message d'erreur indique quel fichier et quel champ posent
problème.

---

## Ajouter une photo

1. Ouvrez le dossier `public/images/` sur github.com.
2. **Add file → Upload files**, puis déposez votre photo.
3. Nommez-la sans accent ni espace, par exemple `atelier-nantes.jpg`, et
   redimensionnez-la à 1600 pixels de large maximum avant de l'envoyer.
4. Demandez ensuite où la faire apparaître sur le site.

---

## Vérifier la charte graphique

La page **https://evan-website.thibaultlenclos.fr/styleguide** affiche toutes les
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
