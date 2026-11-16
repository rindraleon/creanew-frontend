import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Lock, MapPin, Truck } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { useAddresses, useSaveAddress } from "../hooks/useAccount";
import { useCreateOrder } from "../hooks/useOrders";
import { useAuth } from "../context/AuthProvider";
import { useToast } from "../context/ToastContext";
import { addressSchema, emptyAddress } from "../utils/schemas/address";
import type { AddressFormInput } from "../utils/schemas/address";
import { SHIPPING_METHODS } from "../utils/constants";
import { formatPrice } from "../utils/format";
import { errorMessage, applyFieldErrors } from "../utils/errors";
import { productImageUrl } from "../utils/product";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import Button from "../components/ui/Button";
import { Checkbox, Field, Input } from "../components/ui/Form";
import PageLoader from "../components/ui/PageLoader";
import EmptyState from "../components/ui/EmptyState";
import type { CreateOrderInput, ShippingMethod } from "../services/api";
import SafeImage from "@/components/ui/SafeImage";
import Wizard from "../components/ui/Wizard";
import { useWizard } from "../hooks/useWizard";
import DraftBanner from "../components/ui/DraftBanner";
import { useDraft } from "../hooks/useDraft";

export default function Checkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: cart, isLoading } = useCart(true);
  const { data: addresses = [] } = useAddresses();
  const createOrder = useCreateOrder();
  const saveAddress = useSaveAddress();

  const [addressId, setAddressId] = useState<string>("new");
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [saveNewAddress, setSaveNewAddress] = useState<boolean>(true);

  useEffect(() => {
    if (addresses.length === 0) return;
    setAddressId((current) => {
      if (current !== "new") return current;
      return addresses.find((a) => a.isDefault)?.id ?? addresses[0].id;
    });
  }, [addresses]);

  const addressForm = useForm<AddressFormInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      ...emptyAddress,
      fullName: user?.fullName ?? "",
      phone: user?.phone ?? "",
    },
  });
  const wizard = useWizard(3);
  const addressDraft = useDraft("checkout-address", addressForm);

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;

  const selected = useMemo(
    () => SHIPPING_METHODS.find((m) => m.id === shippingMethod) ?? SHIPPING_METHODS[0],
    [shippingMethod],
  );

  if (isLoading) {
    return (
      <div className="py-20">
        <PageLoader label="Chargement du panier…" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-app py-12">
        <EmptyState
          as="h1"
          title="Votre panier est vide"
          text="Ajoutez des articles avant de passer commande."
          actionLabel="Voir la boutique"
          actionTo="/boutique"
        />
      </div>
    );
  }

  const onPlaceOrder = async (input: CreateOrderInput): Promise<void> => {
    const order = await createOrder.mutateAsync(input);
    addressDraft.clear();
    void navigate("/commande/succes/" + order.id, { replace: true });
  };

  const onSubmitNewAddress = async (values: AddressFormInput): Promise<void> => {
    // Adresse ponctuelle : éventuellement enregistrée dans le carnet.
    const orderAddress = {
      fullName: values.fullName,
      phone: values.phone,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2 || undefined,
      postalCode: values.postalCode || undefined,
      city: values.city,
      country: values.country || "Madagascar",
    };

    if (saveNewAddress) {
      await saveAddress.mutateAsync({
        ...orderAddress,
        label: values.label || "Adresse de livraison",
        isDefault: addresses.length === 0,
      });
    }

    await onPlaceOrder({
      shippingAddress: orderAddress,
      shippingMethod,
      saveAddress: saveNewAddress,
      addressLabel: values.label || undefined,
    });
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    // Entrée clavier ou bouton Envoyer avant la dernière étape → étape suivante.
    if (wizard.current < 2) {
      event.preventDefault();
      if (wizard.current === 0 && addressId === "new") {
        void addressForm.trigger().then((ok) => ok && wizard.next());
        return;
      }
      wizard.next();
      return;
    }
    if (addressId === "new") {
      void addressForm.handleSubmit(async (values) => {
        try {
          await onSubmitNewAddress(values);
        } catch (error) {
          applyFieldErrors(error, addressForm.setError, [
            "label",
            "fullName",
            "phone",
            "addressLine1",
            "addressLine2",
            "postalCode",
            "city",
            "country",
          ]);
          toast(errorMessage(error), "error");
        }
      })(event);
      return;
    }
    event.preventDefault();
    void onPlaceOrder({ addressId, shippingMethod }).catch((error) =>
      toast(errorMessage(error), "error"),
    );
  };

  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs
        items={[
          { label: "Accueil", to: "/" },
          { label: "Panier", to: "/panier" },
          { label: "Commande" },
        ]}
      />

      {addressDraft.available && (
        <div className="mt-4 max-w-2xl">
          <DraftBanner
            savedAt={addressDraft.savedAt}
            onRestore={() => {
              addressDraft.restore();
              setAddressId("new");
            }}
            onDiscard={addressDraft.discard}
          />
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3" noValidate>
        <div className="space-y-6 lg:col-span-2">
          <Wizard
            ariaLabel="Étapes de la commande"
            steps={[
              { id: "adresse", title: "Adresse" },
              { id: "livraison", title: "Livraison" },
              { id: "confirmer", title: "Confirmer" },
            ]}
            current={wizard.current}
            maxVisited={wizard.maxVisited}
            onGoTo={wizard.goTo}
          >
          {wizard.current === 0 && (
          <section className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-3 font-display text-headline-sm text-primary">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-bold text-on-secondary">
                1
              </span>
              Adresse de livraison
            </h2>

            {addresses.length > 0 && (
              <ul className="mt-5 space-y-3">
                {addresses.map((addr) => (
                  <li key={addr.id}>
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                        addressId === addr.id
                          ? "border-secondary bg-secondary-container/30"
                          : "border-outline-variant hover:border-secondary/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={addressId === addr.id}
                        onChange={() => setAddressId(addr.id)}
                        className="mt-1 accent-secondary"
                      />
                      <span className="text-body-sm">
                        <span className="flex flex-wrap items-center gap-2 font-semibold text-primary">
                          <MapPin size={14} className="text-secondary" />
                          {addr.label || "Adresse"}
                          {addr.isDefault && (
                            <span className="rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-bold text-on-secondary-container">
                              PAR DÉFAUT
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block text-on-surface-variant">
                          {addr.fullName} — {addr.addressLine1}
                          {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}, {addr.city},{" "}
                          {addr.country}
                        </span>
                        <span className="block text-on-surface-variant">{addr.phone}</span>
                      </span>
                    </label>
                  </li>
                ))}
                <li>
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                      addressId === "new"
                        ? "border-secondary bg-secondary-container/30"
                        : "border-outline-variant hover:border-secondary/60"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={addressId === "new"}
                      onChange={() => setAddressId("new")}
                      className="accent-secondary"
                    />
                    <span className="text-body-sm font-semibold text-primary">
                      Utiliser une nouvelle adresse
                    </span>
                  </label>
                </li>
              </ul>
            )}

            {addressId === "new" && (
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Libellé"
                  error={addressForm.formState.errors.label?.message}
                  className="sm:col-span-2"
                >
                  <Input placeholder="Domicile, Bureau…" {...addressForm.register("label")} />
                </Field>
                <Field
                  label="Destinataire"
                  required
                  error={addressForm.formState.errors.fullName?.message}
                >
                  <Input {...addressForm.register("fullName")} />
                </Field>
                <Field
                  label="Téléphone"
                  required
                  error={addressForm.formState.errors.phone?.message}
                >
                  <Input placeholder="+261 34 12 345 67" {...addressForm.register("phone")} />
                </Field>
                <Field
                  label="Adresse"
                  required
                  error={addressForm.formState.errors.addressLine1?.message}
                  className="sm:col-span-2"
                >
                  <Input placeholder="Lot II M 12 Bis" {...addressForm.register("addressLine1")} />
                </Field>
                <Field
                  label="Complément"
                  error={addressForm.formState.errors.addressLine2?.message}
                  className="sm:col-span-2"
                >
                  <Input {...addressForm.register("addressLine2")} />
                </Field>
                <Field label="Code postal" error={addressForm.formState.errors.postalCode?.message}>
                  <Input {...addressForm.register("postalCode")} />
                </Field>
                <Field label="Ville" required error={addressForm.formState.errors.city?.message}>
                  <Input {...addressForm.register("city")} />
                </Field>
                <Field label="Pays" required error={addressForm.formState.errors.country?.message}>
                  <Input {...addressForm.register("country")} />
                </Field>

                <div className="sm:col-span-2">
                  <Checkbox
                    label="Enregistrer cette adresse dans mon carnet"
                    checked={saveNewAddress}
                    onChange={(e) => setSaveNewAddress(e.target.checked)}
                  />
                </div>
              </div>
            )}
          </section>

          )}
          {wizard.current === 1 && (
          <section className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-3 font-display text-headline-sm text-primary">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-bold text-on-secondary">
                2
              </span>
              Mode de livraison
            </h2>
            <ul className="mt-5 space-y-3">
              {SHIPPING_METHODS.map((method) => (
                <li key={method.id}>
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                      shippingMethod === method.id
                        ? "border-secondary bg-secondary-container/30"
                        : "border-outline-variant hover:border-secondary/60"
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === method.id}
                      onChange={() => setShippingMethod(method.id)}
                      className="mt-1 accent-secondary"
                    />
                    <span className="flex-1 text-body-sm">
                      <span className="flex items-center gap-2 font-semibold text-primary">
                        <Truck size={14} className="text-secondary" /> {method.label}
                      </span>
                      <span className="mt-0.5 block text-on-surface-variant">{method.delay}</span>
                    </span>
                    <span className="text-body-sm font-semibold text-primary">
                      {method.price === 0 ? "Offerte" : formatPrice(method.price)}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
          )}
          {wizard.current === 2 && (
          <section className="card p-5 sm:p-6">
            <h2 className="font-display text-headline-sm text-primary">Dernière vérification</h2>
            <ul className="mt-4 space-y-2 text-body-md text-on-surface-variant">
              <li>
                Adresse :{" "}
                <span className="font-semibold text-primary">
                  {addressId === "new"
                    ? `${addressForm.watch("addressLine1") || "Nouvelle adresse"}, ${addressForm.watch("city") || ""}`
                    : (addresses.find((a) => a.id === addressId)?.addressLine1 ?? "Adresse sélectionnée")}
                </span>
              </li>
              <li>
                Livraison : <span className="font-semibold text-primary">{selected.label}</span>
                {selected.price > 0 ? ` (${formatPrice(selected.price)})` : " (Offerte)"}
              </li>
              <li>
                Articles : <span className="font-semibold text-primary">{items.length}</span>
              </li>
            </ul>
            <p className="mt-4 rounded-lg bg-surface-container-low p-3 text-label-sm text-on-surface-variant">
              La confirmation crée la commande côté serveur ; le paiement en Mobile Money se fait
              ensuite, avec vérification manuelle.
            </p>
          </section>
          )}
          </Wizard>

          {/* Navigation entre étapes */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            {wizard.current > 0 ? (
              <Button type="button" variant="outline" size="lg" onClick={wizard.back}>
                <ArrowLeft size={16} /> Retour
              </Button>
            ) : (
              <Link
                to="/panier"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-body-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
              >
                <ArrowLeft size={16} /> Retour au panier
              </Link>
            )}
            {wizard.current < 2 && (
              <Button
                type="button"
                size="lg"
                variant="accent"
                onClick={() => {
                  if (wizard.current === 0 && addressId === "new") {
                    void addressForm.trigger().then((ok) => {
                      if (ok) wizard.next();
                    });
                    return;
                  }
                  wizard.next();
                }}
              >
                Continuer <ArrowRight size={16} />
              </Button>
            )}
          </div>
        </div>

        {/* Récapitulatif */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h2 className="font-display text-headline-sm text-primary">Votre commande</h2>

            <ul className="mt-4 space-y-3">
              {items.map((item) => {
                const image = productImageUrl(item.product);
                return (
                  <li key={item.id} className="flex gap-3">
                    <span className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-container">
                      {image ? (
                        <SafeImage
                          src={image}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body-sm font-semibold text-primary">
                        {item.product.name}
                      </span>
                      <span className="block text-label-sm text-on-surface-variant">
                        {item.quantity} × {formatPrice(item.unitPrice)}
                      </span>
                    </span>
                    <span className="text-body-sm font-semibold text-primary">
                      {formatPrice(item.lineTotal)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <dl className="mt-4 space-y-2 border-t border-surface-container-highest pt-4 text-body-sm">
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Sous-total</dt>
                <dd className="font-semibold text-primary">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Livraison</dt>
                <dd className="text-on-surface-variant">{selected.label}</dd>
              </div>
            </dl>

            {/* Le total définitif est calculé et figé par le serveur (§87). */}
            <p className="mt-4 rounded-lg bg-surface-container-low p-3 text-label-sm text-on-surface-variant">
              Le montant exact, les frais de livraison et les éventuelles remises sont recalculés
              par le serveur au moment de la validation.
            </p>

            <Button
              type="submit"
              className="mt-5 w-full"
              size="lg"
              disabled={
                createOrder.isPending || saveAddress.isPending || wizard.current !== 2
              }
            >
              <Lock size={16} />
              {createOrder.isPending
                ? "Validation…"
                : wizard.current === 2
                  ? "Valider la commande"
                  : "Complétez les étapes"}
            </Button>

            <Link
              to="/panier"
              className="mt-3 block text-center text-body-sm text-on-surface-variant underline-offset-2 hover:underline"
            >
              Retour au panier
            </Link>
          </div>
        </aside>
      </form>
    </div>
  );
}
