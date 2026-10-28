import type { ImageMetadata } from 'astro';

/**
 * Le contenu désigne une photo par son adresse (/images/realisations/nom.jpg),
 * mais le fichier vit dans src/assets/realisations/ pour qu'Astro en produise
 * des versions allégées, à la bonne taille pour chaque emplacement.
 */
const fichiers = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/realisations/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true },
);

export function imagePhoto(adresse: string): ImageMetadata {
  const fichier = fichiers[adresse.replace('/images/realisations/', '../assets/realisations/')];
  if (!fichier) throw new Error(`Photo introuvable dans src/assets/realisations/ : ${adresse}`);
  return fichier.default;
}

const LARGEURS_GENEREES = [256, 384, 512, 640, 768, 1024, 1280, 1536, 2048];

export function largeursPhoto(image: ImageMetadata) {
  return [...LARGEURS_GENEREES.filter((largeur) => largeur < image.width), image.width];
}

// Largeur en px, ou [vw, px] pour une largeur qui suit l'écran : [50, -40] = 50vw - 40px.
type Largeur = number | [vw: number, px: number];

/**
 * Taille d'un emplacement de photo à partir d'une largeur d'écran (`ecranMin`).
 * Le cadre a soit une hauteur fixe (px), soit un rapport largeur / hauteur.
 */
export type Cadre = { ecranMin?: number; largeur: Largeur } & (
  { hauteur: number } | { ratio: number }
);

const arrondi = (nombre: number) => Math.round(nombre * 100) / 100;

function longueur(largeur: Largeur, facteur = 1) {
  if (typeof largeur === 'number') return `${Math.ceil(largeur * facteur)}px`;
  const [vw, px] = largeur;
  return `calc(${arrondi(vw * facteur)}vw ${px < 0 ? '-' : '+'} ${arrondi(Math.abs(px * facteur))}px)`;
}

const condition = (ecranMin: number | undefined) =>
  ecranMin ? `(min-width: ${Math.ceil(ecranMin)}px) ` : '';

/**
 * Construit l'attribut `sizes` : pour chaque taille d'écran, la largeur que la
 * photo occupe réellement. Avec `object-cover`, une photo plus large que son
 * cadre est rognée sur les côtés : elle s'affiche plus large que le cadre, et
 * il faut en tenir compte pour qu'elle reste nette.
 * Les cadres sont listés du plus grand écran au plus petit.
 */
export function taillesAffichage(cadres: Cadre[], ratioPhoto: number) {
  return cadres
    .flatMap((cadre, index) => {
      if ('ratio' in cadre) {
        const facteur = Math.max(1, ratioPhoto / cadre.ratio);
        return [condition(cadre.ecranMin) + longueur(cadre.largeur, facteur)];
      }

      const largeurMinimale = cadre.hauteur * ratioPhoto;
      if (typeof cadre.largeur === 'number') {
        return [condition(cadre.ecranMin) + longueur(Math.max(cadre.largeur, largeurMinimale))];
      }

      // Largeur d'écran à partir de laquelle le cadre devient plus large que la photo rognée.
      const [vw, px] = cadre.largeur;
      const bascule = ((largeurMinimale - px) * 100) / vw;
      const ecranMin = cadre.ecranMin ?? 0;
      const ecranMax = cadres[index - 1]?.ecranMin ?? Infinity;

      if (bascule <= ecranMin) return [condition(cadre.ecranMin) + longueur(cadre.largeur)];
      if (bascule >= ecranMax) return [condition(cadre.ecranMin) + longueur(largeurMinimale)];
      return [
        condition(bascule) + longueur(cadre.largeur),
        condition(cadre.ecranMin) + longueur(largeurMinimale),
      ];
    })
    .join(', ');
}
