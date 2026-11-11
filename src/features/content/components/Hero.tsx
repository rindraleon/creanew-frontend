import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";
import Reveal from "../../../components/ui/Reveal";
import Button from "../../../components/ui/Button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-surface">
      <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-secondary-container/40 blur-3xl" />
      <div className="container-app grid items-center gap-12 py-14 md:py-20 lg:grid-cols-2 lg:py-24">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary-container/50 px-4 py-1.5 text-label-md text-on-secondary-container">
              CreaNew — Canapés d'Angle · Antananarivo
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 font-display text-display-md text-primary md:text-display-lg">
              Donnez une <em className="text-secondary">nouvelle vie</em>
              <br />à votre salon.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-md text-body-lg text-on-surface-variant">
              Découvrez les canapés d'angle et les collections CreaNew pour votre intérieur.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Button as={Link} to="/boutique" variant="accent" size="lg">
                <ShoppingBag size={19} /> Voir les canapés
              </Button>
              <Link
                to="/collections"
                className="inline-flex items-center gap-2 text-label-lg text-primary transition-colors hover:text-secondary"
              >
                Nos collections <ArrowRight size={18} />
              </Link>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.25} className="relative">
          <div className="overflow-hidden rounded-xl shadow-card-hover ring-1 ring-outline-variant/20">
            <img
              src="/images/hero.jpg"
              alt="Canapé d'angle dans un salon lumineux"
              className="aspect-[4/3] w-full object-cover"
              loading="eager"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
