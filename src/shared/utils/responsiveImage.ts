/**
 * Construction des variantes responsives d'un visuel local.
 *
 * Les fichiers sont produits par `npm run images` (scripts/optimize-images.mjs) :
 * `hero.jpg` donne `hero-480.webp`, `hero-960.webp`, `hero-1376.webp`.
 *
 * Une URL qui ne pointe pas vers un JPEG de `public/images` (CDN, MinIO,
 * visuel absent) est renvoyée telle quelle : `<ResponsiveImage>` retombe alors
 * sur un `<img>` simple, sans casser le rendu.
 */
export interface ImageVariant {
  /** URL de la source `<source>`. */
  src: string;
  /** Descripteur de largeur (`480w`). */
  descriptor: string;
}

/** Largeurs effectivement générées par le script d'optimisation. */
export const IMAGE_WIDTHS = [480, 960, 1600] as const;

/**
 * Au-delà de cette largeur, le script ajoute la largeur source comme
 * descripteur supplémentaire. Doit rester synchronisé avec
 * `scripts/optimize-images.mjs`.
 */
const SOURCE_WIDTH_APPENDED_ABOVE = 960;

/** Découpe `/images/hero.jpg` ou `/images/products/sofa-oslo.jpg`. */
function parseLocalImage(src: string): { dir: string; stem: string } | null {
  const match = /^(\/images(?:\/[^/]+)*?)\/([^/]+)\.(jpe?g)$/i.exec(src);
  if (!match) return null;
  return { dir: match[1], stem: match[2] };
}

/**
 * Variantes WebP disponibles pour une image, limitées à la largeur réelle
 * du fichier source (inutile de proposer un 1600w pour un 600x600).
 *
 * La largeur source est ajoutée en dernier descripteur quand elle dépasse les
 * largeurs standard : c'est exactement ce que produit `scripts/optimize-images.mjs`.
 */
export function webpVariants(src: string, sourceWidth?: number): ImageVariant[] {
  const parsed = parseLocalImage(src);
  if (!parsed) return [];

  const widths: number[] = IMAGE_WIDTHS.filter((w) => !sourceWidth || w < sourceWidth);
  if (sourceWidth && sourceWidth > SOURCE_WIDTH_APPENDED_ABOVE) {
    widths.push(sourceWidth);
  }

  return widths.map((width) => ({
    src: `${parsed.dir}/${parsed.stem}-${width}.webp`,
    descriptor: `${width}w`,
  }));
}

/** `srcset` prêt à l'emploi, ou chaîne vide si aucune variante n'existe. */
export function webpSrcSet(src: string, sourceWidth?: number): string {
  return webpVariants(src, sourceWidth)
    .map((v) => `${v.src} ${v.descriptor}`)
    .join(", ");
}

/** True si `src` désigne un JPEG local pour lequel on a des variantes. */
export function hasWebpVariants(src: string, sourceWidth?: number): boolean {
  return webpVariants(src, sourceWidth).length > 0;
}
