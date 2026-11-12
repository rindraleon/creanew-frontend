import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import {
  useCollections,
  useCreateCollection,
  useUpdateCollection,
  useDeleteCollection,
} from "../hooks/useCollections";
import { collectionsApi } from "../api/collections.api";
import { useAdminProducts } from "../../dashboard/hooks/useAdmin";
import PageLoader from "../../../components/ui/PageLoader";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { Field, Input, Textarea, Checkbox } from "../../../components/ui/Form";
import { ImageUploadField } from "../../../components/ui/ImageUploadField";
import PageHeader from "../../../components/common/PageHeader";
import DataTable from "../../../components/common/DataTable";
import { formatDate } from "../../../shared/utils/format";
import type { Collection } from "../api/collections.api";

const schema = z.object({
  name: z.string().trim().min(2, "2 caractères min").max(160),
  slug: z.string().trim().max(180).optional().or(z.literal("")),
  tagline: z.string().trim().max(220).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  coverImageUrl: z.string().trim().max(500).optional().or(z.literal("")),
  coverObjectKey: z.string().trim().max(500).optional().or(z.literal("")),
  productIds: z.array(z.string()),
  isPublished: z.boolean(),
});
type FormValues = z.infer<typeof schema>;
const empty: FormValues = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  coverImageUrl: "",
  coverObjectKey: "",
  productIds: [],
  isPublished: true,
};

export default function AdminCollections() {
  const { data: collections = [], isLoading } = useCollections(true);
  const { data: productPage, isLoading: productsLoading } = useAdminProducts({ limit: 100 });
  const create = useCreateCollection();
  const update = useUpdateCollection();
  const remove = useDeleteCollection();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [toDelete, setToDelete] = useState<Collection | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: empty });
  const selectedProductIds = form.watch("productIds");
  const products = productPage?.items ?? [];

  const toggleProduct = (productId: string): void => {
    const next = selectedProductIds.includes(productId)
      ? selectedProductIds.filter((id) => id !== productId)
      : [...selectedProductIds, productId];
    form.setValue("productIds", next, { shouldDirty: true });
  };

  const openCreate = () => {
    setEditing(null);
    form.reset(empty);
    setOpen(true);
  };
  const openEdit = (c: Collection) => {
    setEditing(c);
    form.reset({
      name: c.name,
      slug: c.slug,
      tagline: c.tagline ?? "",
      description: c.description ?? "",
      coverImageUrl: c.coverImageUrl ?? "",
      coverObjectKey: c.coverObjectKey ?? "",
      productIds: c.productIds ?? [],
      isPublished: c.isPublished,
    });
    setOpen(true);
  };
  const onSubmit = form.handleSubmit((v) => {
    const payload = {
      name: v.name,
      slug: v.slug || undefined,
      tagline: v.tagline || undefined,
      description: v.description || undefined,
      coverImageUrl: v.coverImageUrl || undefined,
      coverObjectKey: v.coverObjectKey || undefined,
      productIds: v.productIds,
      isPublished: v.isPublished,
    };
    if (editing) update.mutate({ id: editing.id, input: payload });
    else create.mutate(payload);
    setOpen(false);
  });
  const togglePublish = async (c: Collection) => {
    await collectionsApi.setPublish(c.id, !c.isPublished);
    window.location.reload();
  };

  if (isLoading)
    return (
      <div className="py-16">
        <PageLoader label="Collections CreaNew…" />
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Collections CreaNew"
        subtitle="Gérez les collections de canapés d'angle (image, tagline, publication)."
        action={
          <Button onClick={openCreate} size="sm">
            <Plus size={16} /> Nouvelle collection
          </Button>
        }
      />
      <DataTable
        keyField="id"
        data={collections}
        emptyTitle="Aucune collection"
        emptyText="Créez votre première collection CreaNew pour mettre en avant une sélection de canapés."
        columns={[
          {
            key: "name",
            header: "Nom",
            render: (c) => (
              <>
                <span className="block font-semibold text-primary">{c.name}</span>
                {c.tagline && (
                  <span className="block text-label-sm text-secondary">{c.tagline}</span>
                )}
              </>
            ),
          },
          {
            key: "slug",
            header: "Slug",
            render: (c) => <span className="text-on-surface-variant">/{c.slug}</span>,
          },
          { key: "count", header: "Pièces", render: (c) => <span>{c.productIds.length}</span> },
          {
            key: "state",
            header: "État",
            render: (c) => (
              <Badge variant={c.isPublished ? "success" : "neutral"}>
                {c.isPublished ? "Publiée" : "Brouillon"}
              </Badge>
            ),
          },
          { key: "date", header: "Créée", render: (c) => formatDate(c.createdAt) },
          {
            key: "actions",
            header: "",
            render: (c) => (
              <span className="flex justify-end gap-1">
                <button
                  onClick={() => void togglePublish(c)}
                  className="rounded-lg p-2 hover:bg-surface-container"
                  aria-label="Publier"
                >
                  {c.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => openEdit(c)}
                  className="rounded-lg p-2 hover:bg-surface-container"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setToDelete(c)}
                  className="rounded-lg p-2 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </span>
            ),
          },
        ]}
      />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Modifier la collection" : "Nouvelle collection"}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => void onSubmit()}>Enregistrer</Button>
          </>
        }
      >
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4" noValidate>
          <Field label="Nom" required error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} placeholder="Signature CreaNew" />
          </Field>
          <Field label="Slug" hint="Auto-généré depuis le nom si vide">
            <Input {...form.register("slug")} placeholder="signature-creanew" />
          </Field>
          <Field label="Tagline">
            <Input {...form.register("tagline")} placeholder="Nos classiques intemporels" />
          </Field>
          <Field label="Description">
            <Textarea
              rows={3}
              {...form.register("description")}
              placeholder="Les pièces qui ont fait la réputation de CreaNew…"
            />
          </Field>
          <Field
            label="Produits de la collection"
            hint="Les pièces sélectionnées apparaissent sur la page publique de la collection."
          >
            <div className="thin-scroll max-h-56 divide-y divide-surface-container-high overflow-y-auto rounded-md border border-outline-variant">
              {productsLoading ? (
                <p className="px-3 py-4 text-body-sm text-on-surface-variant">Chargement…</p>
              ) : products.length === 0 ? (
                <p className="px-3 py-4 text-body-sm text-on-surface-variant">
                  Aucun produit disponible.
                </p>
              ) : (
                products.map((product) => (
                  <label
                    key={product.id}
                    className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-surface-container-low"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-outline-variant text-secondary accent-secondary"
                      checked={selectedProductIds.includes(product.id)}
                      onChange={() => toggleProduct(product.id)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body-sm font-medium text-primary">
                        {product.name}
                      </span>
                      <span className="block truncate text-label-sm text-on-surface-variant">
                        {product.seller?.shopName ?? "—"} · {product.status}
                      </span>
                    </span>
                  </label>
                ))
              )}
            </div>
          </Field>

          <ImageUploadField
            bucket="products"
            label="Image de couverture"
            hint="Importez une image depuis votre ordinateur (JPG, PNG ou WebP)."
            value={form.watch("coverImageUrl") || form.watch("coverObjectKey") || null}
            onChange={(url, objectKey) => {
              form.setValue("coverImageUrl", url ?? "", { shouldDirty: true });
              form.setValue("coverObjectKey", objectKey ?? "", { shouldDirty: true });
            }}
          />
          <Field label="Publiée">
            <Checkbox {...form.register("isPublished")} label="Visible sur le site public" />
          </Field>
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Supprimer la collection ?"
        message={`La collection "${toDelete?.name}" sera supprimée.`}
        confirmLabel="Supprimer"
        onConfirm={() => {
          if (toDelete) remove.mutate(toDelete.id);
          setToDelete(null);
        }}
      />
    </div>
  );
}
