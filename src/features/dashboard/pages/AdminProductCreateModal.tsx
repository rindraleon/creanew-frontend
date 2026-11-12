import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdminCreateProduct, useAdminSellers } from "../hooks/useAdmin";
import { useCategories } from "../../products/hooks/useCatalog";
import { productSchema } from "../../products/schemas/product";
import { PRODUCT_STATUS } from "../../../shared/utils/constants";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import { Field, Input, Select, Textarea } from "../../../components/ui/Form";
import { ImageUploadField } from "../../../components/ui/ImageUploadField";
import type { CreateProductInput, ProductImageInput } from "../../../shared/types/api";

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

  const approvedSellers = sellers.filter((seller) => seller.status === "approved");

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(adminProductSchema),
    defaultValues: emptyValues,
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

    createProduct.mutate(payload, { onSuccess: () => onClose() });
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
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={() => void onSubmit()} disabled={busy}>
            {busy ? "Enregistrement…" : "Créer le produit"}
          </Button>
        </>
      }
    >
      <form onSubmit={(event) => void onSubmit(event)} className="space-y-4" noValidate>
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prix (Ar)" required error={form.formState.errors.price?.message}>
            <Input type="number" min={0} step={1} {...form.register("price")} />
          </Field>

          <Field label="Prix barré (Ar)" error={form.formState.errors.compareAtPrice?.message}>
            <Input type="number" min={0} step={1} {...form.register("compareAtPrice")} />
          </Field>

          <Field label="Stock" required error={form.formState.errors.stock?.message}>
            <Input type="number" min={0} step={1} {...form.register("stock")} />
          </Field>

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
      </form>
    </Modal>
  );
}
