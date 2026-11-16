import { Hammer, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Reveal from "./ui/Reveal";

interface Feature {
  icon: LucideIcon;
  title: string;
  text: string;
}

/** Réassurance : uniquement des promesses vérifiées — aucune affirmation inventée. */
const features: Feature[] = [
  {
    icon: Hammer,
    title: "Atelier local",
    text: "Canapés d'angle sélectionnés et préparés à Antananarivo",
  },
  {
    icon: Truck,
    title: "Livraison",
    text: "Détails et modalités confirmés lors de la commande",
  },
  {
    icon: RotateCcw,
    title: "Retours gérés",
    text: "Notre équipe vous accompagne pour tout échange ou retour",
  },
  {
    icon: ShieldCheck,
    title: "Mobile Money sécurisé",
    text: "Paiement vérifié et suivi transparent de votre commande",
  },
];

export default function FeatureBar() {
  return (
    <section aria-label="Engagements CreaNew" className="border-y border-surface-container-highest bg-surface-container-low">
      <div className="container-app grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
        {features.map(({ icon: Icon, title, text }, i) => (
          <Reveal key={title} delay={i * 0.1} className="flex flex-col items-center text-center">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
              <Icon size={22} aria-hidden="true" />
            </span>
            <h3 className="text-label-md text-primary">{title}</h3>
            <p className="mt-1 text-label-sm text-on-surface-variant">{text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
