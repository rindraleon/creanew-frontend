import { useParams } from "react-router-dom";
import { Newspaper } from "lucide-react";
import Breadcrumbs from "../../../components/ui/Breadcrumbs";
import EmptyState from "../../../components/ui/EmptyState";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <div className="container-app py-20">
      <Breadcrumbs
        items={[
          { label: "Accueil", to: "/" },
          { label: "Blog", to: "/blog" },
          { label: slug ?? "" },
        ]}
      />
      <div className="mt-8">
        <EmptyState
          icon={Newspaper}
          title="Article introuvable"
          text="Le blog CreaNew arrive bientôt. Cet article n'est pas encore disponible."
          actionLabel="Retour au blog"
          actionTo="/blog"
        />
      </div>
    </div>
  );
}
