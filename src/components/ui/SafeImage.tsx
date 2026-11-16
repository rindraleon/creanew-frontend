import { useEffect, useState } from "react";
import type { ImgHTMLAttributes } from "react";

export const PLACEHOLDER_SRC = "/images/placeholder.svg";

export interface SafeImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  /** URL éventuellement relative (objectKey, /uploads/…) résolue par l'appelant. */
  src?: string | null | undefined;
  /** Affiche le placeholder texte « image indisponible » si l'URL échoue. */
  fallbackSrc?: string;
}

/**
 * Image défensive : tout échec de chargement (404, storage muet, clé objet
 * inconnue) bascule sur /images/placeholder.svg au lieu de laisser un encart
 * vide. Ne casse jamais le rendu : alt obligatoire fourni par l'appelant.
 */
export default function SafeImage({
  src,
  fallbackSrc = PLACEHOLDER_SRC,
  onError,
  alt = "",
  ...rest
}: SafeImageProps) {
  const [failed, setFailed] = useState<boolean>(false);

  // Une nouvelle source réinitialise l'état d'échec.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  const finalSrc = !src || failed ? fallbackSrc : src;

  return (
    <img
      {...rest}
      src={finalSrc}
      alt={failed || !src ? `${alt} (image indisponible)`.trim() : alt}
      data-fallback={!src || failed ? "true" : undefined}
      onError={(event) => {
        if (!failed) setFailed(true);
        onError?.(event);
      }}
    />
  );
}
