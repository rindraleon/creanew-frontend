import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(183,136,52,0.10),transparent_45%),radial-gradient(circle_at_85%_85%,rgba(231,220,203,0.55),transparent_45%)]"
      />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-6 px-4 py-10 sm:px-6">
        {children}
        <p className="text-center text-label-sm text-on-surface-variant">
          CreaNew — Showroom Ankorondrano, Antananarivo · Paiement Mobile Money sécurisé
        </p>
      </div>
    </div>
  );
}
