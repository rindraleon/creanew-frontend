import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Save, X } from "lucide-react";
import { useCreateProduct, useUpdateProduct, useSellerProducts } from "../hooks/useSeller";
import { useCategories } from "../hooks/useCatalog";
import { filesApi } from "../services/files.api";
import { productSchema } from "../utils/schemas/product";
import type { ProductFormInput, ProductFormOutput } from "../utils/schemas/product";
import { PRODUCT_STATUS } from "../utils/constants";
import { errorMessage, applyFieldErrors } from "../utils/errors";
import { useToast } from "../context/ToastContext";
import Button from "../components/ui/Button";
import { Field, Input, Select, Textarea } from "../components/ui/Form";
import PageLoader from "../components/ui/PageLoader";
import EmptyState from "../components/ui/EmptyState";
import type { ProductImageInput } from "../services/api";
import { mediaUrl } from "../utils/media";
import SafeImage from "@/components/ui/SafeImage";
import Wizard from "../components/ui/Wizard";
import { useWizard } from "../hooks/useWizard";
import DraftBanner from "../components/ui/DraftBanner";
import { useDraft } from "../hooks/useDraft";

const emptyValues: ProductFormInput = {
  name: "",
  shortDescription: "",
  description: "",
  price: 0,
  compareAtPrice: undefined,
  stock: 0,
  categoryId: "",
  sku: "",
  material: "",
  dimensions: "",
  lowStockThreshold: undefined,
  status: "draft",
};

export default function SellerProductForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Le produit est récupéré dans la liste du vendeur : le serveur garantit
  // qu'un vendeur ne peut pas accéder au produit d'un autre (§17).
  const { data: list, isLoading } = useSellerProducts({ limit: 100 });
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const existing = id ? list?.items.find((p) => p.id === id) : undefined;
  const [images, setImages] = useState<ProductImageInput[]>([]);
  // Images déjà en base (mode édition) que l'on souhaite retirer.
  const [removedKeys, setRemovedKeys] = useState<string[]>([]);
  const wizard = useWizard(5);

  const form = useForm<ProductFormInput, unknown, ProductFormOutput>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyValues,
    values: existing
      ? {
          name: existing.name,
          shortDescription: existing.shortDescription ?? "",
          description: existing.description ?? "",
          price: existing.price,
          compareAtPrice: existing.compareAtPrice ?? undefined,
          stock: existing.stock,
          categoryId: existing.category?.id ?? "",
          sku: existing.sku ?? "",
          material: existing.material ?? "",
          dimensions: existing.dimensions ?? "",
          lowStockThreshold: existing.lowStockThreshold,
          status: existing.status,
        }
      : undefined,
  });

  // `useWatch` abonne le rendu au champ sans appeler `watch()` pendant le
  // rendu (ce que le compilateur React ne peut pas mémoïser).
  const currentStatus = useWatch({ control: form.control, name: "status" });

  const draft = useDraft(isEdit && id ? `product:${id}` : "product:new", form, {
    getExtra: () => ({ images, removedKeys }),
    onRestoreExtra: (extra) => {
      if (extra?.images) setImages(extra.images);
      if (extra?.removedKeys) setRemovedKeys(extra.removedKeys);
    },
  });

  const upload = useMutation({
    mutationFn: (file: File) => filesApi.upload("products", file),
    onSuccess: (uploaded) => {
      setImages((prev) => [
        ...prev,
        { objectKey: uploaded.objectKey, url: uploaded.url, isPrimary: prev.length === 0 },
      ]);
      toast("Image ajoutée.");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) upload.mutate(file);
    event.target.value = "";
  };

  if (isEdit && isLoading) {
    return (
      <div className="py-16">
        <PageLoader label="Chargement du produit…" />
      </div>
    );
  }

  if (isEdit && !existing) {
    return (
      <EmptyState
        title="Produit introuvable"
        text="Ce produit n'existe pas ou ne vous appartient pas."
        actionLabel="Mes produits"
        actionTo="/vendeur/produits"
      />
    );
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      shortDescription: values.shortDescription || undefined,
      description: values.description || undefined,
      price: values.price,
      compareAtPrice: values.compareAtPrice ? values.compareAtPrice : undefined,
      stock: values.stock,
      categoryId: values.categoryId,
      sku: values.sku || undefined,
      material: values.material || undefined,
      dimensions: values.dimensions || undefined,
      lowStockThreshold: values.lowStockThreshold,
      status: values.status,
      // En édition on envoie toujours la liste complète afin que les
      // suppressions soient persistées par replaceImages() côté serveur.
      images: isEdit
        ? [
            ...(existing?.images ?? [])
              .filter((image) => !removedKeys.includes(image.objectKey))
              .map((image) => ({
                objectKey: image.objectKey,
                alt: image.alt ?? undefined,
                isPrimary: image.isPrimary,
              })),
            ...images,
          ]
        : images.length > 0
          ? images
          : undefined,
    };

    try {
      if (isEdit && id) {
        await updateProduct.mutateAsync({ id, input: payload });
        draft.clear();
        toast("Produit mis à jour.");
      } else {
        await createProduct.mutateAsync(payload);
        draft.clear();
        toast("Produit créé.");
        void navigate("/vendeur/produits");
        return;
      }
    } catch (error) {
      applyFieldErrors(error, form.setError, [
        "name",
        "shortDescription",
        "description",
        "price",
        "compareAtPrice",
        "stock",
        "categoryId",
        "sku",
        "material",
        "dimensions",
        "lowStockThreshold",
        "status",
      ]);
      toast(errorMessage(error), "error");
    }
  });

  const busy = createProduct.isPending || updateProduct.isPending;

  return (
    <div>
      <Link
        to="/vendeur/produits"
        className="inline-flex items-center gap-1.5 text-body-sm text-on-surface-variant underline-offset-2 hover:text-secondary hover:underline"
      >
        <ArrowLeft size={15} /> Mes produits
      </Link>

      <h2 className="mt-3 font-display text-headline-md text-primary">
        {isEdit ? "Modifier le produit" : "Nouveau produit"}
      </h2>

      {draft.available && (
        <div className="mt-4">
          <DraftBanner
            savedAt={draft.savedAt}
            onRestore={() => draft.restore()}
            onDiscard={draft.discard}
          />
        </div>
      )}

      <form
        onSubmit={(event) => void onSubmit(event)}
        className="mt-6 space-y-6"
        noValidate
      >
        <div className="space-y-6">
          <Wizard
            ariaLabel="Étapes du formulaire produit"
            steps={[
              { id: "infos", title: "Infos" },
              { id: "prix", title: "Prix & stock" },
              { id: "details", title: "Détails" },
              { id: "images", title: "Images" },
              { id: "publication", title: "Publication" },
            ]}
            current={wizard.current}
            maxVisited={wizard.maxVisited}
            onGoTo={wizard.goTo}
          >
          {wizard.current === 0 && (
          <section className="card p-5 sm:p-6">
            <h2 className="font-display text-headline-sm text-primary">Informations</h2>

            <div className="mt-5 space-y-4">
              <Field label="Nom du produit" required error={form.formState.errors.name?.message}>
                <Input {...form.register("name")} />
              </Field>

              <Field label="Catégorie" required error={form.formState.errors.categoryId?.message}>
                <Select {...form.register("categoryId")}>
                  <option value="">Choisir…</option>
                  {(categories ?? []).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="Résumé"
                hint="Affiché dans les listes de produits."
                error={form.formState.errors.shortDescription?.message}
              >
                <Input {...form.register("shortDescription")} />
              </Field>

              <Field label="Description" error={form.formState.errors.description?.message}>
                <Textarea rows={6} {...form.register("description")} />
              </Field>
            </div>
          </section>

          )}
          {wizard.current === 1 && (
          <section className="card p-5 sm:p-6">
            <h2 className="font-display text-headline-sm text-primary">Prix et stock</h2>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Prix (Ar)"
                required
                hint="Montant entier en ariary."
                error={form.formState.errors.price?.message}
              >
                <Input type="number" min={0} step={1} {...form.register("price")} />
              </Field>

              <Field
                label="Prix barré (Ar)"
                hint="Optionnel, pour afficher une remise."
                error={form.formState.errors.compareAtPrice?.message}
              >
                <Input type="number" min={0} step={1} {...form.register("compareAtPrice")} />
              </Field>

              <Field label="Stock" required error={form.formState.errors.stock?.message}>
                <Input type="number" min={0} step={1} {...form.register("stock")} />
              </Field>

              <Field
                label="Seuil de stock bas"
                hint={`Par défaut : 5.`}
                error={form.formState.errors.lowStockThreshold?.message}
              >
                <Input type="number" min={0} step={1} {...form.register("lowStockThreshold")} />
              </Field>
            </div>
          </section>

          )}
          {wizard.current === 2 && (
          <section className="card p-5 sm:p-6">
            <h2 className="font-display text-headline-sm text-primary">Détails</h2>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Référence (SKU)" error={form.formState.errors.sku?.message}>
                <Input {...form.register("sku")} />
              </Field>
              <Field label="Matière" error={form.formState.errors.material?.message}>
                <Input placeholder="Chêne massif" {...form.register("material")} />
              </Field>
              <Field label="Dimensions" error={form.formState.errors.dimensions?.message}>
                <Input placeholder="L 200 × P 90 × H 75 cm" {...form.register("dimensions")} />
              </Field>
            </div>
          </section>
          )}

          {wizard.current === 3 && (
          <section className="card p-5 sm:p-6">
            <h2 className="font-display text-headline-sm text-primary">Images</h2>

            <ul className="mt-4 grid grid-cols-3 gap-2">
              {/* Images conservées depuis la base (mode édition) */}
              {(existing?.images ?? [])
                .filter((image) => !removedKeys.includes(image.objectKey))
                .map((image) => (
                  <li key={image.objectKey} className="relative">
                    <span className="block aspect-square overflow-hidden rounded-md bg-surface-container">
                      <SafeImage
                        src={mediaUrl(image.url) ?? mediaUrl(image.objectKey) ?? undefined}
                        alt={image.alt ?? ""}
                        className="h-full w-full object-cover"
                      />
                    </span>
                    {isPrimaryBadge(image)}
                    <button
                      type="button"
                      onClick={() => setRemovedKeys((prev) => [...prev, image.objectKey])}
                      aria-label="Retirer l'image"
                      className="absolute -right-1.5 -top-1.5 rounded-full bg-white p-1 text-red-600 shadow-card"
                    >
                      <X size={12} />
                    </button>
                  </li>
                ))}
              {/* Images nouvellement ajoutées */}
              {images.map((image, index) => (
                <li key={image.objectKey ?? index} className="relative">
                  <span className="block aspect-square overflow-hidden rounded-md bg-surface-container">
                    {image.url ? (
                      <SafeImage
                        src={mediaUrl(image.url) ?? undefined}
                        alt={image.alt ?? ""}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </span>
                  {isPrimaryBadge(image)}
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                    aria-label="Retirer l'image"
                    className="absolute -right-1.5 -top-1.5 rounded-full bg-white p-1 text-red-600 shadow-card"
                  >
                    <X size={12} />
                  </button>
                </li>
              ))}
            </ul>
            {isEdit && removedKeys.length > 0 && (
              <p className="mt-2 text-label-sm text-amber-700">
                {removedKeys.length} image(s) seront supprimées à l'enregistrement.
              </p>
            )}

            <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-outline-variant px-4 py-6 text-body-sm text-on-surface-variant transition-colors hover:border-secondary hover:text-secondary">
                {upload.isPending ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <ImagePlus size={17} />
                )}
                {upload.isPending ? "Envoi…" : "Ajouter une image"}
                <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            </label>
          </section>
          )}

          {wizard.current === 4 && (
          <section className="card p-5 sm:p-6">
            <h2 className="font-display text-headline-sm text-primary">Publication</h2>

            <div className="mt-4">
              <Field label="Statut" required error={form.formState.errors.status?.message}>
                <Select {...form.register("status")}>
                  {Object.entries(PRODUCT_STATUS).map(([value, meta]) => (
                    <option key={value} value={value}>
                      {meta.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <p className="mt-2 text-label-sm text-on-surface-variant">
                {PRODUCT_STATUS[currentStatus]?.description}
              </p>
            </div>

            <dl className="mt-5 grid grid-cols-1 gap-3 rounded-lg border border-outline-variant/50 bg-surface-container-low p-4 text-body-md sm:grid-cols-2">
              <div>
                <dt className="text-label-sm uppercase tracking-wider text-on-surface-variant">Produit</dt>
                <dd className="font-semibold text-primary">{form.watch("name") || "—"}</dd>
              </div>
              <div>
                <dt className="text-label-sm uppercase tracking-wider text-on-surface-variant">Prix</dt>
                <dd className="text-on-surface">
                  {form.watch("price") ? `${Number(form.watch("price")).toLocaleString("fr-FR")} Ar` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-label-sm uppercase tracking-wider text-on-surface-variant">Stock</dt>
                <dd className="text-on-surface">{form.watch("stock") ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-label-sm uppercase tracking-wider text-on-surface-variant">Images</dt>
                <dd className="text-on-surface">
                  {images.length + (existing?.images ?? []).filter((i) => !removedKeys.includes(i.objectKey)).length} image(s)
                </dd>
              </div>
            </dl>
          </section>
          )}
          </Wizard>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            {wizard.current > 0 ? (
              <Button type="button" variant="outline" size="lg" onClick={wizard.back}>
                <ArrowLeft size={16} /> Retour
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => void navigate("/vendeur/produits")}
              >
                Annuler
              </Button>
            )}
            {wizard.current < 4 ? (
              <Button
                type="button"
                size="lg"
                variant="accent"
                onClick={() => {
                  const stepFields: (keyof ProductFormInput)[][] = [
                    ["name", "categoryId", "sku", "shortDescription", "description"],
                    ["price", "compareAtPrice", "stock", "lowStockThreshold"],
                    ["material", "dimensions"],
                    [],
                  ];
                  void form.trigger(stepFields[wizard.current]).then((ok) => {
                    if (ok) wizard.next();
                  });
                }}
              >
                Continuer <ArrowRight size={16} />
              </Button>
            ) : (
              <Button type="submit" size="lg" disabled={busy}>
                <Save size={16} /> {busy ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

function isPrimaryBadge(image: { url?: string | null; isPrimary?: boolean }) {
  if (!image.isPrimary) return null;
  return (
    <span className="absolute bottom-1 left-1 rounded bg-primary/85 px-1.5 py-0.5 text-[9px] font-bold text-on-primary">
      PRINCIPALE
    </span>
  );
}
