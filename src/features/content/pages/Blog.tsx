import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import Breadcrumbs from "../../../components/ui/Breadcrumbs";
import EmptyState from "../../../components/ui/EmptyState";

export default function Blog() {
  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Blog" }]} />

      <div className="mt-4 max-w-2xl">
        <h1 className="font-display text-display-md text-primary">Le journal CreaNew</h1>
        <p className="mt-3 text-body-lg text-on-surface-variant">
          Inspirations, conseils d'aménagement et coulisses de nos ateliers canapés — bientôt
          disponible.
        </p>
      </div>

      <div className="mt-10">
        <EmptyState
          icon={BookOpen}
          title="Bientôt disponible"
          text="Nos articles d'inspiration arrivent prochainement. En attendant, découvrez nos collections de canapés d'angle."
          actionLabel="Voir les collections"
          actionTo="/collections"
        />
        <div className="mt-8 flex justify-center">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-label-md text-secondary hover:text-primary"
          >
            Une idée d'article ? Écrivez-nous <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
