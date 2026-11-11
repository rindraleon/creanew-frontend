import { Link } from "react-router-dom";
import { Lightbulb, Ruler, Sofa } from "lucide-react";
import SectionHeading from "../../../components/ui/SectionHeading";
import Reveal from "../../../components/ui/Reveal";

const tips = [
  {
    icon: Sofa,
    title: "Comment choisir son canapé d'angle ?",
    text: "Dimensions, tissus et orientation : 5 critères pour trouver le modèle qui épouse parfaitement votre salon.",
  },
  {
    icon: Ruler,
    title: "Prendre les bonnes mesures",
    text: "Évitez les mauvaises surprises : nos conseils pour mesurer votre espace et vos accès avant livraison.",
  },
  {
    icon: Lightbulb,
    title: "Entretenir son canapé CreaNew",
    text: "Taches, poussière, soleil : les gestes simples pour garder votre canapé d'angle comme au premier jour.",
  },
];

export default function BlogTeaser() {
  return (
    <section className="container-app pb-14 md:pb-20 lg:pb-24">
      <SectionHeading
        center
        eyebrow="Inspirations"
        title="Nos conseils canapé d'angle"
        subtitle="Bientôt, le journal CreaNew : inspirations, guides et coulisses de nos ateliers."
      />
      <div className="grid gap-6 md:grid-cols-3">
        {tips.map((tip, i) => (
          <Reveal key={tip.title} delay={i * 0.1}>
            <div className="card flex h-full flex-col p-6 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                <tip.icon size={20} />
              </span>
              <h3 className="mt-4 font-display text-headline-sm text-primary">{tip.title}</h3>
              <p className="mt-2 flex-1 text-body-sm text-on-surface-variant">{tip.text}</p>
              <Link
                to="/contact"
                className="mt-4 inline-flex items-center justify-center gap-1.5 text-label-md font-semibold text-secondary hover:text-primary"
              >
                En savoir plus
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
