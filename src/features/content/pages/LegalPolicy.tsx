import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Breadcrumbs from "../../../components/ui/Breadcrumbs";
import { siteContentApi } from "../../../shared/api/siteContent.api";
import { isPublishedLegalPolicy } from "../../../shared/utils/legalPolicy";

type Props = { policyKey: "legal_terms" | "privacy_policy"; title: string };

/** Texte réel saisi et publié par l'administrateur, jamais du HTML injecté. */
export default function LegalPolicy({ policyKey, title }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["site-content", policyKey],
    queryFn: () => siteContentApi.byKey(policyKey),
  });
  const policy = isPublishedLegalPolicy(data?.value) ? data.value : null;
  return (
    <main className="container-app py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: title }]} />
      <article className="mx-auto mt-6 max-w-3xl">
        <h1 className="font-display text-display-md text-primary">{title}</h1>
        {isLoading ? <p className="mt-6">Chargement…</p> : null}
        {!isLoading && (!policy || isError) ? (
          <p role="status" className="mt-6">
            Ce document n’est pas encore publié. Pour toute question, utilisez le{" "}
            <Link className="underline" to="/contact">
              formulaire de contact
            </Link>
            .
          </p>
        ) : null}
        {policy && !isError ? (
          <>
            <p className="mt-4 text-label-sm text-on-surface-variant">Version {policy.version}</p>
            <div className="mt-8 whitespace-pre-wrap text-body-md leading-relaxed text-on-surface-variant">
              {policy.text}
            </div>
          </>
        ) : null}
      </article>
    </main>
  );
}
