import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import StaticContentPage from "../components/StaticContentPage";

export default function DeliveryReturns() {
  return (
    <StaticContentPage
      title="Livraison & retours"
      intro="Nos délais, nos tarifs et les conditions d'échange, expliqués simplement."
      updatedAt="1er janvier 2026"
      path="/livraison-retours"
      sections={[
        {
          heading: "Zones et délais de livraison",
          paragraphs: [
            "Nous livrons actuellement à Antananarivo et dans un rayon de 50 km autour de la capitale. Toute commande confirmée est préparée sous 48 heures ouvrées.",
          ],
          list: [
            "Livraison standard : 3 à 5 jours ouvrés après préparation.",
            "Livraison express : 24 à 48 heures, sur rendez-vous.",
            "Retrait en atelier : gratuit, à récupérer à Antananarivo Ivato.",
          ],
        },
        {
          heading: "Frais de livraison",
          paragraphs: [
            "Le montant exact est calculé dans votre panier avant paiement. La livraison standard est offerte à partir de 1 500 000 Ar d'achat, tous articles confondus.",
          ],
        },
        {
          heading: "Déroulé d'une livraison",
          paragraphs: [
            "Un livreur vous contacte la veille pour convenir d'un créneau. Vous disposez de 15 minutes pour vérifier votre colis en sa présence. En cas de dommage apparent, refusez le colis et prévenez-nous le jour même.",
          ],
        },
        {
          heading: "Retours et échanges",
          paragraphs: [
            "Vous disposez de 30 jours à compter de la réception pour changer d'avis, à condition que le produit soit complet, non monté et dans son emballage d'origine.",
          ],
          list: [
            "Étape 1 : contactez-nous depuis la page contact ou à contact@mobilier-shop.mg.",
            "Étape 2 : nous vous envoyons un bordereau de retour et un transporteur.",
            "Étape 3 : nous contrôlons le produit puis déclenchons le remboursement sous 10 jours ouvrés.",
          ],
        },
        {
          heading: "Cas exclus du retour",
          paragraphs: [
            "Les produits sur mesure, personnalisés ou déjà montés chez vous ne sont pas repris. C'est également le cas des articles soldés dont la mention « ni repris ni échangé » figure sur la fiche produit.",
          ],
        },
      ]}
    >
      <div className="mt-10 rounded-xl border border-outline-variant bg-surface-container-low p-6">
        <h2 className="font-display text-label-lg text-primary">Une question sur votre commande ?</h2>
        <div className="mt-3 flex flex-col gap-2 text-body-md text-on-surface-variant">
          <span className="flex items-center gap-2">
            <Mail size={16} aria-hidden /> contact@mobilier-shop.mg
          </span>
          <span className="flex items-center gap-2">
            <Phone size={16} aria-hidden /> +261 34 00 000 00
          </span>
        </div>
        <Link
          to="/contact"
          className="mt-4 inline-block text-body-md font-semibold text-secondary underline-offset-4 hover:underline"
        >
          Ouvrir le formulaire de contact
        </Link>
      </div>
    </StaticContentPage>
  );
}
