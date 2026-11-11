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
import PageLoader from "../../../components/ui/PageLoader";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { Field, Input, Textarea, Checkbox } from "../../../components/ui/Form";
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
  isPublished: z.boolean(),
});
type FormValues = z.infer<typeof schema>;
const empty: FormValues = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  coverImageUrl: "",
  isPublished: true,
};

export default function AdminCollections() {
  const { data: collections = [], isLoading } = useCollections(true);
  const create = useCreateCollection();
  const update = useUpdateCollection();
  const remove = useDeleteCollection();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [toDelete, setToDelete] = useState<Collection | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: empty });

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
          <Field label="URL image de couverture">
            <Input
              {...form.register("coverImageUrl")}
              placeholder="/images/collection-signature.jpg"
            />
          </Field>
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
