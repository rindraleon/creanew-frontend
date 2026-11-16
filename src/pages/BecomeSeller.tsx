import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2, Clock, RefreshCw, Store } from "lucide-react";
import { useSellerApplication, useApplySeller } from "../hooks/useSeller";
import { sellerApplicationSchema } from "../utils/schemas/seller";
import type { SellerApplicationInput } from "../utils/schemas/seller";
import { SELLER_STATUS } from "../utils/constants";
import { formatDate } from "../utils/format";
import { errorMessage, applyFieldErrors } from "../utils/errors";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthProvider";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import Button from "../components/ui/Button";
import { Field, Input, Textarea } from "../components/ui/Form";
import StatusBadge from "../components/ui/StatusBadge";
import PageLoader from "../components/ui/PageLoader";
import Wizard from "../components/ui/Wizard";
import { useWizard } from "../hooks/useWizard";
import DraftBanner from "../components/ui/DraftBanner";
import { useDraft } from "../hooks/useDraft";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function BecomeSeller() {
  const { toast } = useToast();
  const { data: seller, isLoading } = useSellerApplication();
  const { refreshSession, isApprovedSeller } = useAuth();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const apply = useApplySeller();

  const form = useForm<SellerApplicationInput>({
    resolver: zodResolver(sellerApplicationSchema),
    defaultValues: { shopName: "", description: "", phone: "", city: "", addressLine: "" },
  });
  const wizard = useWizard(3);
  const draft = useDraft("become-seller", form);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await apply.mutateAsync({
        shopName: values.shopName,
        description: values.description || undefined,
        phone: values.phone || undefined,
        city: values.city || undefined,
        addressLine: values.addressLine || undefined,
      });
      draft.clear();
    } catch (error) {
      applyFieldErrors(error, form.setError, [
        "shopName",
        "description",
        "phone",
        "city",
        "addressLine",
      ]);
      toast(errorMessage(error), "error");
    }
  });

  if (isLoading) {
    return (
      <div className="py-20">
        <PageLoader label="Chargement de votre demande…" />
      </div>
    );
  }

  // Une demande existe déjà : on affiche son état d'avancement.
  if (seller) {
    const meta = SELLER_STATUS[seller.status];
    return (
      <div className="container-app py-8 lg:py-12">
        <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Devenir vendeur" }]} />

        <div className="mx-auto mt-8 max-w-2xl">
          <div className="card p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                {seller.status === "approved" ? (
                  <CheckCircle2 size={22} />
                ) : seller.status === "rejected" ? (
                  <AlertCircle size={22} />
                ) : (
                  <Clock size={22} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-headline-md text-primary">{seller.shopName}</h1>
                <div className="mt-2">
                  <StatusBadge kind="seller" status={seller.status} />
                </div>
                <p className="mt-3 text-body-md text-on-surface-variant">{meta?.description}</p>
                {seller.rejectionReason && (
                  <p className="mt-3 rounded-lg bg-red-50 p-3 text-body-sm text-red-800">
                    Motif : {seller.rejectionReason}
                  </p>
                )}
                {seller.submittedAt && (
                  <p className="mt-3 text-label-sm text-on-surface-variant">
                    Demandé le {formatDate(seller.submittedAt)}
                  </p>
                )}
              </div>
            </div>

            {seller.status === "approved" && (
              <Button as={Link} to="/vendeur" className="mt-6 w-full" size="lg">
                <Store size={16} /> Accéder à mon espace vendeur
              </Button>
            )}

            {seller.status === "pending" && (
              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  size="lg"
                  disabled={refreshing}
                  onClick={() => {
                    setRefreshing(true);
                    void refreshSession().finally(() => setRefreshing(false));
                  }}
                >
                  <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                  {refreshing ? "Vérification…" : "Actualiser le statut"}
                </Button>
                <p className="mt-2 text-center text-label-sm text-on-surface-variant">
                  {isApprovedSeller
                    ? "Votre demande a été validée : rechargez la page pour entrer dans votre espace vendeur."
                    : "Si votre demande vient d'être validée, rechargez votre session puis cette page."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Devenir vendeur" }]} />

      <div className="mx-auto mt-8 grid grid-cols-1 max-w-3xl gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="card p-6 sm:p-8">
            <h1 className="font-display text-headline-md text-primary">Devenir vendeur</h1>
            <p className="mt-2 text-body-md text-on-surface-variant">
              Créez votre boutique et vendez vos meubles. Votre demande sera examinée par un
              administrateur avant activation.
            </p>

            {draft.available && (
              <div className="mt-6">
                <DraftBanner
                  savedAt={draft.savedAt}
                  onRestore={() => draft.restore()}
                  onDiscard={draft.discard}
                />
              </div>
            )}
            <form onSubmit={(event) => void onSubmit(event)} className="mt-6 space-y-4" noValidate>
              <Wizard
                ariaLabel="Étapes de votre demande vendeur"
                steps={[
                  { id: "boutique", title: "Boutique" },
                  { id: "contact", title: "Contact" },
                  { id: "recap", title: "Vérifier" },
                ]}
                current={wizard.current}
                maxVisited={wizard.maxVisited}
                onGoTo={wizard.goTo}
              >
                {wizard.current === 0 && (
                  <div className="space-y-4">
                    <Field
                      label="Nom de la boutique"
                      required
                      error={form.formState.errors.shopName?.message}
                    >
                      <Input placeholder="Atelier Mamy" {...form.register("shopName")} />
                    </Field>
                    <Field
                      label="Description"
                      hint="Présentez votre atelier, vos matériaux, vos délais."
                      error={form.formState.errors.description?.message}
                    >
                      <Textarea rows={4} {...form.register("description")} />
                    </Field>
                  </div>
                )}
                {wizard.current === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Téléphone" error={form.formState.errors.phone?.message}>
                        <Input placeholder="+261 34 12 345 67" {...form.register("phone")} />
                      </Field>
                      <Field label="Ville" error={form.formState.errors.city?.message}>
                        <Input placeholder="Antananarivo" {...form.register("city")} />
                      </Field>
                    </div>
                    <Field
                      label="Adresse de l'atelier"
                      error={form.formState.errors.addressLine?.message}
                    >
                      <Input {...form.register("addressLine")} />
                    </Field>
                  </div>
                )}
                {wizard.current === 2 && (
                  <dl className="space-y-3 rounded-lg border border-outline-variant/50 bg-surface-container-low p-4 text-body-md">
                    <div>
                      <dt className="text-label-sm uppercase tracking-wider text-on-surface-variant">Boutique</dt>
                      <dd className="font-semibold text-primary">{form.watch("shopName") || "—"}</dd>
                    </div>
                    {form.watch("description") && (
                      <div>
                        <dt className="text-label-sm uppercase tracking-wider text-on-surface-variant">Description</dt>
                        <dd className="whitespace-pre-line text-on-surface">{form.watch("description")}</dd>
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <dt className="text-label-sm uppercase tracking-wider text-on-surface-variant">Téléphone</dt>
                        <dd className="text-on-surface">{form.watch("phone") || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-label-sm uppercase tracking-wider text-on-surface-variant">Ville</dt>
                        <dd className="text-on-surface">{form.watch("city") || "—"}</dd>
                      </div>
                    </div>
                    <div>
                      <dt className="text-label-sm uppercase tracking-wider text-on-surface-variant">Adresse</dt>
                      <dd className="text-on-surface">{form.watch("addressLine") || "—"}</dd>
                    </div>
                  </dl>
                )}
              </Wizard>

              <p className="rounded-lg bg-surface-container-low p-3 text-label-sm text-on-surface-variant">
                Vous pourrez téléverser vos pièces justificatives après la création de la demande,
                depuis votre espace vendeur.
              </p>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                {wizard.current > 0 ? (
                  <Button type="button" variant="outline" size="lg" onClick={wizard.back}>
                    <ArrowLeft size={16} /> Retour
                  </Button>
                ) : (
                  <span className="hidden sm:block" />
                )}
                {wizard.current < 2 ? (
                  <Button
                    type="button"
                    size="lg"
                    variant="accent"
                    onClick={() => {
                      const stepFields: (keyof SellerApplicationInput)[][] = [
                        ["shopName", "description"],
                        ["phone", "city", "addressLine"],
                      ];
                      void form.trigger(stepFields[wizard.current]).then((ok) => {
                        if (ok) wizard.next();
                      });
                    }}
                  >
                    Continuer <ArrowRight size={16} />
                  </Button>
                ) : (
                  <Button type="submit" size="lg" disabled={apply.isPending}>
                    {apply.isPending ? "Envoi…" : "Envoyer ma demande"}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        <aside className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="font-display text-headline-sm text-primary">Comment ça marche ?</h2>
            <ol className="mt-4 space-y-4">
              {[
                "Vous envoyez votre demande avec les informations de votre atelier.",
                "Un administrateur vérifie la demande et vos pièces justificatives.",
                "Une fois approuvée, votre boutique est active : vous publiez vos produits.",
                "Vous suivez vos commandes, vos stocks et vos revenus en temps réel.",
              ].map((text, i) => (
                <li key={text} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-on-secondary">
                    {i + 1}
                  </span>
                  <span className="text-body-sm text-on-surface-variant">{text}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 rounded-lg bg-amber-50 p-3 text-label-sm text-amber-800">
              Aucune vente n'est possible tant que la boutique n'est pas approuvée.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
