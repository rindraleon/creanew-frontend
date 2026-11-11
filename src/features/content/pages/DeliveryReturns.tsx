import { Link } from "react-router-dom";
import Breadcrumbs from "../../../components/ui/Breadcrumbs";

export default function DeliveryReturns() {
  return (
    <main className="container-app py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Livraison & retours" }]} />
      <article className="mx-auto mt-6 max-w-3xl">
        <h1 className="font-display text-display-md text-primary">Livraison & retours</h1>
        <p className="mt-5 text-body-lg text-on-surface-variant">
          Les conditions de livraison et de retour doivent être confirmées par CreaNew. Pour toute
          question, utilisez notre{" "}
          <Link className="text-secondary underline" to="/contact">
            formulaire de contact
          </Link>
          .
        </p>
      </article>
    </main>
  );
}
