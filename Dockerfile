# Construction du site, puis service des fichiers produits.
#
# Coolify construit cette image à chaque envoi sur `main`. Tout ce qui concerne
# le déploiement est décrit ici et dans `nginx.conf` : rien à régler dans
# l'interface Coolify en dehors du build pack, du dossier de base et du port.

# --- Étape 1 : construction ---------------------------------------------------
FROM node:22-alpine AS construction

WORKDIR /app

# Les dépendances sont copiées seules en premier : tant que ces deux fichiers ne
# changent pas, Docker réutilise le résultat de `npm ci` et la construction est
# bien plus rapide.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# `npm run check` valide les types et les schémas de contenu : une erreur de
# saisie dans un fichier .yaml ou .md arrête la construction ici, et la version
# précédente du site reste en ligne.
RUN npm run check && npm run build

# --- Étape 2 : service --------------------------------------------------------
# L'image finale ne contient que nginx et les fichiers du site : ni Node, ni
# node_modules, ni code source.
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=construction /app/dist /usr/share/nginx/html

EXPOSE 80
