import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, ShieldAlert } from "lucide-react";
import Button from "../../../components/ui/Button";
import { useAuth } from "../context/AuthProvider";
import type { SellerStatus } from "../../../shared/types/api";

interface AccessDeniedProps {
  sellerStatus?: SellerStatus | null;
}

const SELLER_MESSAGES: Record<SellerStatus, { title: string; text: string }> = {
  pending: {
    title: "Demande en cours de validation",
    text: "Votre demande vendeur a bien été reçue. Un administrateur doit la valider avant que vous puissiez publier des produits. Vous recevrez un e-mail dès que votre boutique sera active.",
  },
  rejected: {
    title: "Demande refusée",
    text: "Votre demande vendeur a été refusée. Contactez-nous pour connaître les raisons et soumettre un nouveau dossier.",
  },
  suspended: {
    title: "Boutique suspendue",
    text: "Votre boutique est actuellement suspendue. La vente est désactivée le temps du traitement par un administrateur.",
  },
  approved: {
    title: "Accès refusé",
    text: "Vous n'avez pas accès à cette page.",
  },
};

/** Page 403 applicative : explique **pourquoi** l'accès est refusé. */
export default function AccessDenied({ sellerStatus }: AccessDeniedProps) {
  const message = sellerStatus ? SELLER_MESSAGES[sellerStatus] : null;
  const { refreshSession } = useAuth();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [refreshed, setRefreshed] = useState<boolean>(false);

  /**
   * Une demande vendeur validée pendant que l'utilisateur est connecté laisse
   * son jeton d'accès sur l'ancien rôle (`customer`) : `/vendeur` renvoie 403
   * alors que la base est à jour. Ce bouton relance la session côté serveur
   * pour récupérer le rôle réel, au lieu de faire attendre 15 minutes.
   */
  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    try {
      await refreshSession();
      setRefreshed(true);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-error-container text-on-error-container">
        <ShieldAlert size={30} />
      </span>
      <h1 className="mt-6 font-display text-display-md text-primary">
        {message?.title ?? "Accès refusé"}
      </h1>
      <p className="mt-3 max-w-lg text-body-lg text-on-surface-variant">
        {message?.text ??
          "Vous n'avez pas les droits nécessaires pour consulter cette page."}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button as={Link} to="/" variant="primary">
          <ArrowLeft size={16} /> Retour à l'accueil
        </Button>
        {sellerStatus === "rejected" && (
          <Button as={Link} to="/contact" variant="outline">
            Nous contacter
          </Button>
        )}
        {sellerStatus === "pending" && (
          <Button
            type="button"
            variant="outline"
            disabled={refreshing}
            onClick={() => void onRefresh()}
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshed
              ? "Actualiser la page"
              : refreshing
                ? "Vérification…"
                : "Ma demande a été validée"}
          </Button>
        )}
      </div>
      {refreshed && (
        <p className="mt-4 max-w-lg text-body-sm text-on-surface-variant">
          Session rechargée. Si votre demande vient d'être validée, rechargez
          cette page pour accéder à votre espace vendeur.
        </p>
      )}
    </div>
  );
}
