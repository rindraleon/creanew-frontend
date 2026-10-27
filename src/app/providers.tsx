import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../features/auth/context/AuthProvider";
import { CartDrawerProvider } from "../features/cart/context/CartDrawerContext";
import { createQueryClient } from "../shared/query/queryClient";

/**
 * Fournisseurs globaux de l'application.
 *
 * L'ordre compte : le client React Query est créé une seule fois (donc hors
 * composant), l'authentification fournit la session, et le tiroir panier
 * dépend des deux.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const queryClient = createQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartDrawerProvider>{children}</CartDrawerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default AppProviders;
