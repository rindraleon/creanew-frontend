import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./AuthProvider";
import { CartDrawerProvider } from "./CartDrawerContext";
import { createQueryClient } from "../services/queryClient";

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
