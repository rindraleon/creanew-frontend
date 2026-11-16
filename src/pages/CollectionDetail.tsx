import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, MessageCircle, Shapes, Truck } from "lucide-react";
import { useCollection } from "../hooks/useCollections";
import { useProducts } from "../hooks/useCatalog";
import { formatDate } from "../utils/format";
import { mediaUrl } from "../utils/media";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import Button from "../components/ui/Button";
import PageLoader from "../components/ui/PageLoader";
import EmptyState from "../components/ui/EmptyState";
import ProductCard from "../components/ProductCard";
import SafeImage from "../components/ui/SafeImage";

export default function CollectionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: collection, isLoading, isError, error, refetch } = useCollection(slug);
  const [activeImage, setActiveImage] = useState<number>(0);
  const { data: page } = useProducts(
    { collection: slug, limit: 12 },
    { enabled: Boolean(slug && collection) },
  );

  if (isLoading) {
    return (
      <div className="py-20">
        <PageLoader label="Chargement de la collection…" />
      </div>
    );
  }

  if (isError || !collection) {
    return (
      <div className="container-app py-20">
        <EmptyState
          title="Collection introuvable"
          text={
            error instanceof Error
              ? error.message
              : "Cette collection n'existe pas ou n'est plus publiée."
          }
          actionLabel="Réessayer"
          onAction={() => void refetch()}
        />
      </div>
    );
  }

  const gallery = collection.gallery ?? [];
  const cover = mediaUrl(collection.coverObjectKey ?? collection.coverImageUrl);
  // Toutes les images de la page (couverture en premier, puis la galerie).
  const allImages = [
    ...(cover ? [{ objectKey: collection.coverObjectKey ?? "", url: cover, alt: collection.name }] : []),
    ...gallery,
  ];
  const active = allImages[Math.min(activeImage, Math.max(0, allImages.length - 1))];
  const currentImage = active
    ? (mediaUrl(active.url ?? active.objectKey) ?? undefined)
    : undefined;
  const products = page?.items ?? [];
  const messagesLink = `/messages?subject=${encodeURIComponent(
    `Question sur la collection « ${collection.name} »`,
  )}`;

  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs
        items={[
          { label: "Accueil", to: "/" },
          { label: "Collections", to: "/collections" },
          { label: collection.name },
        ]}
      />

      {/* Couverture + titre */}
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-video overflow-hidden rounded-lg bg-surface-container">
            <SafeImage
              src={currentImage}
              alt={collection.name}
              className="h-full w-full object-cover"
            />
          </div>
          {allImages.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {allImages.map((image, i) => (
                <button
                  key={`${image.objectKey || image.url}-${i}`}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Image ${i + 1}`}
                  className={`h-20 w-32 shrink-0 overflow-hidden rounded-md border-2 bg-surface-container transition-colors ${
                    i === activeImage
                      ? "border-secondary"
                      : "border-transparent hover:border-outline-variant"
                  }`}
                >
                  <SafeImage
                    src={mediaUrl(image.url ?? image.objectKey) ?? undefined}
                    alt={image.alt ?? `Image ${i + 1} de la collection`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {collection.tagline && (
            <p className="text-label-md uppercase tracking-widest text-secondary">
              {collection.tagline}
            </p>
          )}
          <h1 className="mt-2 font-display text-display-md text-primary">{collection.name}</h1>
          {collection.description && (
            <p className="mt-4 whitespace-pre-line text-body-lg text-on-surface-variant">
              {collection.description}
            </p>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-3 text-body-sm">
            <div>
              <dt className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                Pièces
              </dt>
              <dd className="text-primary">
                {collection.productIds.length} modèle{collection.productIds.length > 1 ? "s" : ""}
              </dd>
            </div>
            <div>
              <dt className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                Publiée le
              </dt>
              <dd className="text-primary">{formatDate(collection.createdAt)}</dd>
            </div>
          </dl>

          <p className="mt-4 flex items-center gap-2 text-body-sm text-on-surface-variant">
            <Truck size={16} className="text-secondary" />
            Livraison et retours : renseignez-vous auprès de notre équipe
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button as={Link} to={`/boutique?collection=${collection.slug}`} variant="accent" size="lg">
              Voir les pièces <ArrowRight size={18} />
            </Button>
          </div>

          {/* Contact direct avec l'équipe CreaNew au sujet de la collection */}
          <div className="mt-8 rounded-lg border border-outline-variant/50 bg-surface-container-low p-5">
            <p className="flex items-center gap-2 text-label-md uppercase tracking-wider text-on-surface-variant">
              <Shapes size={16} className="text-secondary" /> Une question sur ce modèle ?
            </p>
            <p className="mt-2 text-body-md text-on-surface-variant">
              Dimensions, tissu, coloris, délai de fabrication — notre équipe vous répond avec les
              détails de la collection{" "}
              <strong className="text-primary">« {collection.name} »</strong>.
            </p>
            <Link
              to={messagesLink}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-body-md font-semibold text-on-primary transition-colors hover:bg-secondary"
            >
              <MessageCircle size={18} /> Envoyer un message à CreaNew
            </Link>
          </div>
        </div>
      </div>

      {/* Pièces de la collection */}
      <section className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-headline-md text-primary">Les pièces de la collection</h2>
          <Link
            to={`/boutique?collection=${collection.slug}`}
            className="inline-flex items-center gap-1.5 text-label-md font-semibold text-secondary hover:underline"
          >
            Voir toute la sélection <ArrowRight size={14} />
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="mt-6 rounded-lg border border-dashed border-outline-variant px-6 py-10 text-center text-body-md text-on-surface-variant">
            Les pièces de cette collection arrivent très bientôt.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
