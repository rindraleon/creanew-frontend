import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useCategories } from "../hooks/useCatalog";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";
import { mediaUrl } from "../utils/media";
import SafeImage from "@/components/ui/SafeImage";

/** Visuels générés (D6) — replis visuels liés par position aux vraies catégories de l'API. */
const FALLBACK_IMAGES = [
  "/images/univers-01.jpg",
  "/images/univers-02.jpg",
  "/images/univers-03.jpg",
  "/images/univers-04.jpg",
];

/** Catégories récupérées depuis l'API (plus aucune liste en dur). */
export default function CategorySection() {
  const { data: categories = [], isLoading } = useCategories();
  const visible = categories.filter((c) => c.isActive !== false).slice(0, 4);

  if (isLoading || visible.length === 0) return null;

  return (
    <section className="section bg-surface-container-low/60">
      <style>{`
        .univers-card__image {
          animation: universDrift 22s ease-in-out infinite alternate;
          will-change: transform;
        }
        .univers-card:hover .univers-card__image {
          animation-play-state: paused;
        }
        @keyframes universDrift {
          from { transform: scale(1.02) translate(0, 0); }
          to { transform: scale(1.1) translate(-1.5%, -2.5%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .univers-card__image { animation: none; }
        }
      `}</style>
      <div className="container-app">
        <SectionHeading
          eyebrow="Par univers"
          title="Trouvez le meuble qui vous ressemble"
          subtitle="Des univers pensés pour composer votre salon — chaque pièce est sélectionnée auprès de boutiques et d'artisans malgaches."
          center
        />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((category, i) => {
            const fallback = FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
            const image = category.imageUrl
              ? (mediaUrl(category.imageUrl) ?? fallback)
              : fallback;
            return (
              <Reveal key={category.id} delay={i * 0.08}>
                <Link
                  to={"/boutique?categorie=" + category.slug}
                  aria-label={`Voir l’univers ${category.name}`}
                  className="univers-card group relative block overflow-hidden rounded-xl ring-1 ring-outline-variant/30 transition-shadow duration-300 hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <SafeImage
                      src={image}
                      alt={category.name}
                      loading="lazy"
                      className="univers-card__image absolute inset-0 h-full w-full object-cover"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent transition-opacity duration-300"
                    />
                    <span className="absolute inset-x-0 bottom-0 p-5">
                      <span className="block font-display text-headline-sm leading-snug text-white drop-shadow-sm">
                        {category.name}
                      </span>
                      {category.description && (
                        <span className="mt-1 line-clamp-2 block text-body-sm text-white/85">
                          {category.description}
                        </span>
                      )}
                      <span className="mt-3 inline-flex items-center gap-1.5 text-label-md font-semibold text-secondary-fixed-dim transition-transform duration-300 group-hover:translate-x-1">
                        Explorer cet univers
                        <ArrowRight size={16} aria-hidden="true" />
                      </span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
