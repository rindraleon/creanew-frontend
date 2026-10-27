import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import ErrorBoundary from "../components/ui/ErrorBoundary";

/**
 * Isole chaque espace (boutique, client, vendeur, administration) dans son
 * propre `ErrorBoundary` : une page en erreur ne fait pas tomber les autres,
 * et la clé sur le chemin garantit un état neuf à chaque navigation.
 */
export default function SpaceBoundary({
  space,
  children,
}: {
  space: string;
  children: ReactNode;
}) {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary key={pathname} space={space} compact>
      {children}
    </ErrorBoundary>
  );
}
