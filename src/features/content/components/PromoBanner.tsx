import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import Button from "../../../components/ui/Button";
import Reveal from "../../../components/ui/Reveal";

export default function PromoBanner() {
  return (
    <section className="container-app pb-14 md:pb-20 lg:pb-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-xl bg-primary px-6 py-12 text-center md:px-12 md:py-16">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-secondary/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-secondary-fixed-dim/15 blur-3xl" />
          {/* Liseré or CreaNew */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-secondary" />

          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-secondary-fixed-dim/30 bg-white/5 px-4 py-1.5">
            <Sparkles size={14} className="text-secondary-fixed-dim" />
            <span className="text-label-sm uppercase tracking-[0.18em] text-secondary-fixed-dim">
              CreaNew — Canapés d'Angle
            </span>
          </div>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-display-md text-on-primary">
            Donnez une nouvelle vie à votre salon
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-body-lg text-primary-fixed-dim">
            Confort absolu, design moderne, qualité durable — chaque canapé est confectionné pour
            épouser votre intérieur.
          </p>

          <div className="mx-auto mt-6 flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-label-md font-semibold text-on-secondary">
              Confort absolu
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary-fixed-dim/40 bg-white/5 px-4 py-2 text-label-md font-semibold text-on-primary">
              Design moderne
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary-fixed-dim/40 bg-white/5 px-4 py-2 text-label-md font-semibold text-on-primary">
              Qualité durable
            </span>
          </div>

          <div className="mt-8 flex justify-center">
            <Button as={Link} to="/boutique" variant="light" size="lg">
              Découvrir les canapés <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
