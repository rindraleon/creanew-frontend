import { Hammer, HeartHandshake, Leaf, Ruler } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SectionHeading from "../../../components/ui/SectionHeading";
import Reveal from "../../../components/ui/Reveal";

interface Reason {
  icon: LucideIcon;
  title: string;
  text: string;
}

const reasons: Reason[] = [
  {
    icon: Leaf,
    title: "Confort absolu",
    text: "Découvrez des modèles pour votre espace de vie.",
  },
  {
    icon: Hammer,
    title: "Design moderne",
    text: "Lignes contemporaines qui subliment votre salon sans l'encombrer.",
  },
  {
    icon: Ruler,
    title: "Qualité durable",
    text: "Consultez les détails de chaque modèle dans la boutique.",
  },
  {
    icon: HeartHandshake,
    title: "Service CreaNew",
    text: "Notre équipe est à votre disposition pour vos questions.",
  },
];

export default function WhySection() {
  return (
    <section className="bg-surface-container-low">
      <div className="container-app section grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative order-2 lg:order-1">
          <div className="h-full overflow-hidden rounded-xl shadow-card-hover ring-1 ring-outline-variant/20">
            <img
              src="/images/atelier.jpg"
              alt="Illustration d’un atelier de mobilier"
              loading="lazy"
              className="aspect-[4/3] h-full w-full object-cover lg:aspect-auto lg:min-h-[560px]"
            />
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <SectionHeading
            eyebrow="Nos engagements"
            title="Pourquoi choisir CreaNew ?"
            subtitle="Nous conjuguons confort, design et durabilité pour créer des canapés d'angle que vous aimerez longtemps — très longtemps."
          />
          <ul className="-mt-4 space-y-5">
            {reasons.map(({ icon: Icon, title, text }, i) => (
              <Reveal as="li" key={title} delay={i * 0.1} className="group flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container transition-transform duration-300 group-hover:scale-110">
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className="text-label-lg text-primary">{title}</h3>
                  <p className="mt-0.5 text-body-md text-on-surface-variant">{text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
