import type { CSSProperties, ImgHTMLAttributes } from "react";
import { hasWebpVariants, webpSrcSet } from "../../shared/utils/responsiveImage";

export interface ResponsiveImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> {
  src: string;
  alt: string;
  /** Largeur intrinsèque (évite le décalage de mise en page). */
  width?: number;
  /** Hauteur intrinsèque. */
  height?: number;
  /** Attribut `sizes` : décrit la place réelle de l'image dans la page. */
  sizes?: string;
  /** Style additionnel fusionné avec le ratio intrinsèque. */
  className?: string;
}

/**
 * Image responsive avec repli JPEG.
 *
 * - Si des variantes WebP ont été générées (`npm run images`), on rend un
 *   `<picture>` : le navigateur choisit la variante la plus petite qui convient
 *   et les très vieux navigateurs retombent sur le JPEG d'origine.
 * - Sinon (URL CDN/MinIO, visuel absent), on rend un `<img>` classique.
 *
 * `sizes` est indispensable : sans lui, le navigateur suppose `100vw` et
 * télécharge systématiquement la plus grande variante.
 */
export default function ResponsiveImage({
  src,
  alt,
  width,
  height,
  sizes = "100vw",
  className,
  style,
  loading = "lazy",
  decoding = "async",
  ...rest
}: ResponsiveImageProps) {
  const variants = hasWebpVariants(src, width);
  const ratio = width && height ? { aspectRatio: `${width} / ${height}` } : undefined;
  const mergedStyle: CSSProperties | undefined = { ...ratio, ...style };

  if (!variants) {
    return (
      <img
        {...rest}
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={className}
        style={mergedStyle}
        loading={loading}
        decoding={decoding}
      />
    );
  }

  return (
    <picture>
      <source type="image/webp" srcSet={webpSrcSet(src, width)} sizes={sizes} />
      <img
        {...rest}
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={className}
        style={mergedStyle}
        loading={loading}
        decoding={decoding}
      />
    </picture>
  );
}
