import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import ErrorBoundary from "../components/ui/ErrorBoundary";

export default function SpaceBoundary({ space, children }: { space: string; children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary key={pathname} space={space} compact>
      {children}
    </ErrorBoundary>
  );
}
