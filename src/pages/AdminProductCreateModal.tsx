import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdminCreateProduct, useAdminSellers } from "../hooks/useAdmin";
import Wizard from "../components/ui/Wizard";
import { useWizard } from "../hooks/useWizard";
import DraftBanner from "../components/ui/DraftBanner";
import { useDraft } from "../hooks/useDraft";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { useCategories } from "../hooks/useCatalog";
import { productSchema } from "../utils/schemas/product";
import { PRODUCT_STATUS } from "../utils/constants";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { Field, Input, Select, Textarea } from "../components/ui/Form";
import { ImageUploadField } from "../components/ui/ImageUploadField";
import type { CreateProductInput, ProductImageInput } from "../services/api";

const adminProductSchema = productSchema.extend({
  sellerId: z.string().min(1, "Choisissez un vendeur."),
});

type FormInput = z.input<typeof adminProductSchema>;
type FormOutput = z.output<typeof adminProductSchema>;

const emptyValues: FormInput = {
  sellerId: "",
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

interface AdminProductCreateModalProps {
  onClose: () => void;
}

export default function AdminProductCreateModal({ onClose }: AdminProductCreateModalProps) {
  const createProduct = useAdminCreateProduct();
  const { data: sellers = [], isLoading: sellersLoading } = useAdminSellers();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const [image, setImage] = useState<{ url: string | null; objectKey: string } | null>(null);
  const wizard = useWizard(2);

  const approvedSellers = sellers.filter((seller) => seller.status === "approved");

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(adminProductSchema),
    defaultValues: emptyValues,
  });
  const draft = useDraft("admin-product:new", form, {
    getExtra: () => image ?? undefined,
    onRestoreExtra: (extra) => {
      if (extra) setImage(extra);
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    const images: ProductImageInput[] | undefined = image
      ? [{ objectKey: image.objectKey, url: image.url ?? undefined, isPrimary: true }]
      : undefined;

    const payload: CreateProductInput = {
      sellerId: values.sellerId,
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
      images,
    };

    createProduct.mutate(payload, {
      onSuccess: () => {
        draft.clear();
        onClose();
      },
    });
  });

  const busy = createProduct.isPending;

  return (
    <Modal
      open
      onClose={onClose}
      title="Nouveau produit"
      size="xl"
      footer={
        <>
          {wizard.current === 1 && (
            <Button variant="ghost" onClick={wizard.back}>
              <ArrowLeft size={16} /> Retour
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          {wizard.current === 0 ? (
            <Button
              variant="accent"
              onClick={() =>
                void form
                  .trigger(["sellerId", "name", "shortDescription", "description", "categoryId", "sku"])
                  .then((ok) => {
                    if (ok) wizard.next();
                  })
              }
            >
              Continuer <ArrowRight size={16} />
            </Button>
          ) : (
            <Button onClick={() => void onSubmit()} disabled={busy}>
              <Save size={16} /> {busy ? "Enregistrement…" : "Créer le produit"}
            </Button>
          )}
        </>
      }
    >
      <form onSubmit={(event) => void onSubmit(event)} className="space-y-4" noValidate>
        {draft.available && (
          <DraftBanner
            savedAt={draft.savedAt}
            onRestore={() => draft.restore()}
            onDiscard={draft.discard}
          />
        )}
        <Wizard
          ariaLabel="Étapes du produit"
          steps={[
            { id: "produit", title: "Produit" },
            { id: "prix", title: "Prix & image" },
          ]}
          current={wizard.current}
          maxVisited={wizard.maxVisited}
          onGoTo={wizard.goTo}
        >
        {wizard.current === 0 && (
        <div className="space-y-4">
        <Field
          label="Vendeur"
          required
          hint="Le produit appartient à ce vendeur et apparaîtra dans sa boutique."
          error={form.formState.errors.sellerId?.message}
        >
          <Select {...form.register("sellerId")} disabled={sellersLoading}>
            <option value="">
              {sellersLoading
                ? "Chargement…"
                : approvedSellers.length === 0
                  ? "Aucun vendeur approuvé"
                  : "Choisir un vendeur…"}
            </option>
            {approvedSellers.map((seller) => (
              <option key={seller.id} value={seller.id}>
                {seller.shopName}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Nom du produit" required error={form.formState.errors.name?.message}>
          <Input {...form.register("name")} placeholder="Canapé Oslo 3 places" />
        </Field>

        <Field label="Résumé" error={form.formState.errors.shortDescription?.message}>
          <Input {...form.register("shortDescription")} />
        </Field>

        <Field label="Description" error={form.formState.errors.description?.message}>
          <Textarea rows={4} {...form.register("description")} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Catégorie" required error={form.formState.errors.categoryId?.message}>
            <Select {...form.register("categoryId")} disabled={categoriesLoading}>
              <option value="">{categoriesLoading ? "Chargement…" : "Choisir…"}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Référence (SKU)" error={form.formState.errors.sku?.message}>
            <Input {...form.register("sku")} />
          </Field>
        </div>
        </div>
        )}
        {wizard.current === 1 && (
        <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Prix (Ar)" required error={form.formState.errors.price?.message}>
            <Input type="number" min={0} step={1} {...form.register("price")} />
          </Field>

          <Field label="Prix barré (Ar)" error={form.formState.errors.compareAtPrice?.message}>
            <Input type="number" min={0} step={1} {...form.register("compareAtPrice")} />
          </Field>

          <Field label="Stock" required error={form.formState.errors.stock?.message}>
            <Input type="number" min={0} step={1} {...form.register("stock")} />
          </Field>

          <Field label="Statut" required error={form.formState.errors.status?.message}>
            <Select {...form.register("status")}>
              {Object.entries(PRODUCT_STATUS).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <ImageUploadField
          bucket="products"
          label="Image principale"
          hint="Importez une image depuis votre ordinateur (JPG, PNG ou WebP)."
          value={image?.url ?? null}
          onChange={(url, objectKey) => {
            setImage(objectKey ? { url: url ?? objectKey, objectKey } : null);
          }}
        />
        </div>
        )}
        </Wizard>
      </form>
    </Modal>
  );
}
