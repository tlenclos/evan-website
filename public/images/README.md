# Images du site

Déposez ici les photos utilisées par le site (chantiers, réalisations, portrait).

Conseils :

- Format **.jpg** pour les photos, **.svg** pour les logos et pictogrammes.
- Gardez **2048 px maximum** sur le plus grand côté : au-delà, la page devient
  lente à charger sans gain visible. Une photo reçue par WhatsApp en « HD » fait
  déjà cette taille : déposez-la telle quelle, sans la réduire ni la
  recompresser, sinon elle paraît floue sur les écrans haute définition.
- Nommez les fichiers sans accent ni espace : `atelier-nantes.jpg`, pas `Atelier Nantes.jpg`.

Une image déposée ici est accessible à l'adresse `/images/nom-du-fichier.jpg`.

- `logo.png` : le logo affiché en haut du site (réglé dans `src/data/site.yaml`).
  Les photos de chantiers ne sont pas ici mais dans `src/assets/realisations/` : le
  site en produit des versions allégées, à la taille de chaque emplacement. Elles
  gardent pourtant l'adresse `/images/realisations/nom-du-fichier.jpg` dans le
  contenu, et sont listées dans `src/data/realisations.yaml`.
