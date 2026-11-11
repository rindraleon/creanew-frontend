import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../features/auth/context/AuthProvider";
import { CartDrawerProvider } from "../features/cart/context/CartDrawerContext";
import { createQueryClient } from "../shared/query/queryClient";

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
