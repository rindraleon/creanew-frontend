import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search, ShoppingBag } from "lucide-react";
import Reveal from "./ui/Reveal";
import Button from "./ui/Button";
import SafeImage from "@/components/ui/SafeImage";

export default function Hero() {
  const navigate = useNavigate();
  const [term, setTerm] = useState<string>("");

  const submitSearch = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const q = term.trim();
    void navigate(q ? `/boutique?q=${encodeURIComponent(q)}` : "/boutique");
  };

  return (
    <section className="relative overflow-hidden bg-surface">
      <style>{`
        .hero-line {
          animation: heroLineDrift 18s ease-in-out infinite alternate;
          will-change: transform, opacity;
        }
        .hero-line--delay {
          animation-delay: -9s;
          animation-duration: 22s;
        }
        @keyframes heroLineDrift {
          from { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0.5; }
          50% { opacity: 0.9; }
          to { transform: translate3d(-60px, 34px, 0) rotate(-2deg); opacity: 0.5; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-line { animation: none; }
        }
      `}</style>

      {/* Lignes d'accent flottantes */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 640"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <g stroke="#B78834" strokeWidth="1.5" fill="none" strokeLinecap="round">
          <path
            className="hero-line"
            d="M-40 470 C 240 420, 380 520, 620 470 S 1080 360, 1500 430"
            opacity="0.55"
          />
          <path
            className="hero-line hero-line--delay"
            d="M-60 150 C 220 210, 470 96, 760 160 S 1200 260, 1520 180"
            opacity="0.4"
          />
          <path
            className="hero-line"
            style={{ animationDelay: "-4s" }}
            d="M-50 300 C 300 260, 520 340, 830 300 S 1230 220, 1520 300"
            opacity="0.3"
          />
        </g>
      </svg>
      <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-secondary-container/40 blur-3xl" />

      <div className="container-app relative grid grid-cols-1 items-center gap-12 py-14 md:py-20 lg:grid-cols-2 lg:py-24">
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

          {/* Recherche toujours visible, CTA explicite */}
          <Reveal delay={0.25}>
            <form
              onSubmit={submitSearch}
              role="search"
              className="mt-7 flex max-w-lg items-stretch overflow-hidden rounded-xl border border-outline-variant/70 bg-white shadow-card transition-shadow focus-within:shadow-card-hover"
            >
              <label htmlFor="hero-search" className="sr-only">
                Rechercher un canapé, une table, un fauteuil…
              </label>
              <span className="flex items-center pl-4 text-on-surface-variant">
                <Search size={20} aria-hidden="true" />
              </span>
              <input
                id="hero-search"
                type="search"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Rechercher un canapé, une table, un fauteuil…"
                className="h-14 w-full min-w-0 bg-transparent px-3 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/70"
              />
              <button
                type="submit"
                className="m-1.5 inline-flex shrink-0 items-center gap-2 rounded-lg bg-secondary px-4 text-label-lg font-semibold text-on-secondary transition-colors hover:bg-secondary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary sm:px-6"
              >
                <span className="hidden sm:inline">Rechercher</span>
                <Search size={18} aria-hidden="true" className="sm:hidden" />
              </button>
            </form>
          </Reveal>

          <Reveal delay={0.35}>
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
        <Reveal delay={0.3} className="relative">
          <div className="overflow-hidden rounded-xl shadow-card-hover ring-1 ring-outline-variant/20">
            <SafeImage
              src="/images/hero.jpg"
              alt="Canapé d'angle dans un salon lumineux"
              className="aspect-video w-full object-cover"
              loading="eager"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
