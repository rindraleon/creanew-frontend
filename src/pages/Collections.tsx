import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useCollections } from "../hooks/useCollections";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import Button from "../components/ui/Button";
import Reveal from "../components/ui/Reveal";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import PageLoader from "../components/ui/PageLoader";
import { mediaUrl } from "../utils/media";
import SafeImage from "@/components/ui/SafeImage";

export default function Collections() {
  const { data: collections = [], isLoading } = useCollections(false);

  if (isLoading) {
    return (
      <div className="container-app py-12">
        <PageLoader label="Chargement des collections…" />
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="container-app py-8 lg:py-12">
        <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Collections" }]} />
        <div className="mt-4 max-w-2xl">
          <h1 className="font-display text-display-md text-primary">
            Nos collections de canapés d'angle
          </h1>
          <p className="mt-3 text-body-lg text-on-surface-variant">
            Des univers pensés pour épouser votre salon — chaque collection incarne un style
            CreaNew.
          </p>
        </div>
        <div className="mt-10">
          <EmptyState
            title="Aucune collection pour le moment"
            text="Nos designers préparent les prochaines collections CreaNew. Revenez très bientôt — ou explorez déjà tous nos canapés."
            actionLabel="Voir tous les canapés"
            actionTo="/boutique"
          />
        </div>
      </div>
    );
  }

  const [first, ...rest] = collections;

  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Collections" }]} />

      <div className="mt-4 max-w-2xl">
        <h1 className="font-display text-display-md text-primary">Nos collections</h1>
        <p className="mt-3 text-body-lg text-on-surface-variant">
          Des univers pensés par nos designers pour s'accorder pièce par pièce. Chaque collection
          raconte une histoire de confort et de style — à vous de choisir la vôtre.
        </p>
      </div>

      <Reveal className="mt-10">
        <Link
          to={`/collections/${first.slug}`}
          className="group grid grid-cols-1 overflow-hidden rounded-xl bg-primary shadow-card-hover md:grid-cols-2"
        >
          <div className="relative aspect-video overflow-hidden bg-surface-container md:aspect-auto md:min-h-[320px]">
            <SafeImage
              src={(first.coverObjectKey ?? first.coverImageUrl) ? mediaUrl(first.coverObjectKey ?? first.coverImageUrl) : null}
              alt={first.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-md bg-black/60 px-4 py-2 text-label-md font-semibold text-white backdrop-blur-sm transition-colors group-hover:bg-secondary group-hover:text-on-secondary">
              Voir la collection <ArrowRight size={16} />
            </span>
          </div>
          <div className="flex flex-col justify-center p-8 md:p-12">
            <Badge
              variant="neutral"
              className="w-fit border-secondary-fixed-dim/40 text-secondary-fixed-dim"
            >
              Collection vedette
            </Badge>
            <h2 className="mt-4 font-display text-display-md text-on-primary">{first.name}</h2>
            {first.tagline && (
              <p className="mt-1 text-label-md uppercase tracking-widest text-secondary-fixed-dim">
                {first.tagline}
              </p>
            )}
            {first.description && (
              <p className="mt-4 text-body-lg text-primary-fixed-dim">{first.description}</p>
            )}
            <p className="mt-6 inline-flex items-center gap-2 font-semibold text-on-primary transition-colors group-hover:text-white">
              Découvrir les {first.productIds.length} pièces
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
            </p>
          </div>
        </Link>
      </Reveal>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {rest.map((col, i) => (
          <Reveal key={col.id} delay={i * 0.1}>
            <Link
              to={`/collections/${col.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-lg border border-outline-variant/40 bg-surface-container-lowest shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="relative aspect-video overflow-hidden bg-surface-container">
                <SafeImage
                  src={(col.coverObjectKey ?? col.coverImageUrl) ? mediaUrl(col.coverObjectKey ?? col.coverImageUrl) : null}
                  alt={col.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-black/60 px-3 py-1.5 text-label-sm font-semibold text-white backdrop-blur-sm transition-colors group-hover:bg-secondary group-hover:text-on-secondary">
                  Voir <ArrowRight size={13} />
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                {col.tagline && (
                  <p className="text-label-md uppercase tracking-widest text-secondary">
                    {col.tagline}
                  </p>
                )}
                <h3 className="mt-2 font-display text-headline-md text-primary">{col.name}</h3>
                {col.description && (
                  <p className="mt-2 flex-1 text-body-sm text-on-surface-variant">
                    {col.description}
                  </p>
                )}
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-label-md text-on-surface-variant">
                    {col.productIds.length} pièce{col.productIds.length !== 1 ? "s" : ""}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-label-md text-secondary">
                    Explorer{" "}
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      <div className="mt-12 rounded-lg bg-secondary-container/40 p-8 text-center md:p-10">
        <h2 className="font-display text-headline-md text-primary">
          Un projet d'aménagement complet ?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-body-md text-on-surface-variant">
          Nos conseillers vous aident à composer votre salon autour d’un canapé d’angle CreaNew,
          avec des remises dès 2 pièces.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button as={Link} to="/contact" variant="accent">
            Prendre rendez-vous
          </Button>
          <Link
            to={`/messages?subject=${encodeURIComponent("Une question sur vos collections")}`}
            className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-5 py-3 text-body-md font-medium text-primary transition-colors hover:border-secondary hover:text-secondary"
          >
            <MessageCircle size={18} /> Une question sur cette sélection ?
          </Link>
        </div>
      </div>
    </div>
  );
}
