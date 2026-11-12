import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layers, Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../../dashboard/hooks/useAdmin";
import { slugify } from "../../../shared/utils/format";
import PageLoader from "../../../components/ui/PageLoader";
import EmptyState from "../../../components/ui/EmptyState";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import Pagination from "../../../components/ui/Pagination";
import { ImageUploadField } from "../../../components/ui/ImageUploadField";
import { Checkbox, Field, Input, Select, Textarea } from "../../../components/ui/Form";
import type { Category } from "../../../shared/types/api";

const PAGE_SIZE = 10;

const categorySchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères.").max(120),
  slug: z
    .string()
    .trim()
    .max(140)
    .regex(/^[a-z0-9-]*$/, "Lettres minuscules, chiffres et tirets uniquement.")
    .optional()
    .or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  parentId: z.string().optional().or(z.literal("")),
  position: z.coerce.number<number>().int().min(0).max(999).optional(),
  isActive: z.boolean(),
});

type CategoryForm = z.infer<typeof categorySchema>;

const emptyValues: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  parentId: "",
  position: 0,
  isActive: true,
};

export default function AdminCategories() {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [term, setTerm] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");

  const query = useMemo(
    () => ({
      search: term || undefined,
      isActive: activeFilter === "" ? undefined : activeFilter === "true",
    }),
    [term, activeFilter],
  );

  const { data: categories = [], isLoading, isFetching } = useAdminCategories(query);
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const remove = useDeleteCategory();

  const [open, setOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [imageObjectKey, setImageObjectKey] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: emptyValues,
  });

  const rootCategories = useMemo(
    () => categories.filter((category) => !category.parentId && category.id !== editing?.id),
    [categories, editing],
  );

  const totalPages = Math.max(1, Math.ceil(categories.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = categories.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalProducts = categories.reduce((sum, category) => sum + (category.productCount ?? 0), 0);
  const activeCount = categories.filter((category) => category.isActive).length;

  const openCreate = (): void => {
    setEditing(null);
    setImageObjectKey(null);
    setImageUrl(null);
    form.reset(emptyValues);
    setOpen(true);
  };

  const openEdit = (category: Category): void => {
    setEditing(category);
    setImageObjectKey(category.imageObjectKey);
    setImageUrl(category.imageUrl);
    form.reset({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      parentId: category.parentId ?? "",
      position: category.position,
      isActive: category.isActive,
    });
    setOpen(true);
  };

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      name: values.name,
      slug: values.slug || slugify(values.name),
      description: values.description || "",
      parentId: values.parentId ? values.parentId : null,
      position: values.position ?? 0,
      isActive: values.isActive,
      imageObjectKey: imageObjectKey ?? "",
    };
    if (editing) update.mutate({ id: editing.id, input: payload });
    else
      create.mutate({
        ...payload,
        imageObjectKey: imageObjectKey ?? undefined,
      });
    setOpen(false);
  });

  if (isLoading) {
    return (
      <div className="py-16">
        <PageLoader label="Chargement des catégories…" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-headline-md text-primary">Catégories</h2>
          <p className="mt-1 text-body-md text-on-surface-variant">
            {categories.length} catégorie{categories.length > 1 ? "s" : ""} · {activeCount} active
            {activeCount > 1 ? "s" : ""} · {totalProducts} produit{totalProducts > 1 ? "s" : ""}{" "}
            rattaché{totalProducts > 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus size={16} aria-hidden="true" /> Nouvelle catégorie
        </Button>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setTerm(search);
            setPage(1);
          }}
          className="relative min-w-[220px] flex-1"
          role="search"
        >
          <Search
            size={16}
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher une catégorie…"
            className="pl-9"
            aria-label="Rechercher une catégorie"
          />
        </form>
        <Select
          value={activeFilter}
          onChange={(event) => {
            setActiveFilter(event.target.value as "" | "true" | "false");
            setPage(1);
          }}
          aria-label="Filtrer par état"
          className="min-w-[180px]"
        >
          <option value="">Tous les états</option>
          <option value="true">Actives uniquement</option>
          <option value="false">Inactives uniquement</option>
        </Select>
      </div>

      {visible.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Layers}
            title={term || activeFilter ? "Aucun résultat" : "Aucune catégorie"}
            text={
              term || activeFilter
                ? "Ajustez votre recherche ou réinitialisez les filtres."
                : "Créez la première catégorie du catalogue."
            }
            actionLabel={term || activeFilter ? undefined : "Nouvelle catégorie"}
            onAction={term || activeFilter ? undefined : openCreate}
          />
        </div>
      ) : (
        <>
          <div
            className={`mt-6 overflow-x-auto rounded-lg border border-outline-variant/50 transition-opacity ${
              isFetching ? "opacity-60" : "opacity-100"
            }`}
          >
            <table className="w-full min-w-[860px] text-left text-body-sm">
              <caption className="sr-only">
                Liste des catégories, avec hiérarchie, état et nombre de produits
              </caption>
              <thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-on-surface-variant">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Catégorie
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Slug
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Produits
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Sous-catégories
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Ordre
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    État
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high bg-surface-container-lowest">
                {visible.map((category) => (
                  <tr
                    key={category.id}
                    className="transition-colors hover:bg-surface-container-low"
                  >
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        {category.parentId && (
                          <span aria-hidden="true" className="text-on-surface-variant">
                            ↳
                          </span>
                        )}
                        <span className="font-semibold text-primary">{category.name}</span>
                      </span>
                      <span className="block max-w-md truncate text-label-sm text-on-surface-variant">
                        {category.parentName ? `Dans ${category.parentName}` : "Catégorie racine"}
                        {category.description ? ` · ${category.description}` : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">/{category.slug}</td>
                    <td className="px-4 py-3 font-semibold text-primary">
                      {category.productCount ?? 0}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{category.childCount ?? 0}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{category.position}</td>
                    <td className="px-4 py-3">
                      <Badge variant={category.isActive ? "success" : "neutral"}>
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(category)}
                          aria-label={`Modifier ${category.name}`}
                          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Pencil size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setToDelete(category)}
                          aria-label={`Supprimer ${category.name}`}
                          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-error-container hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            total={categories.length}
            onPageChange={setPage}
            className="mt-4"
          />
        </>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Modifier la catégorie" : "Nouvelle catégorie"}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => void onSubmit()} disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </>
        }
      >
        <form onSubmit={(event) => void onSubmit(event)} className="space-y-4" noValidate>
          <Field label="Nom" required error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} autoComplete="off" />
          </Field>
          <Field
            label="Slug"
            hint="Généré depuis le nom si laissé vide, unicité garantie par l’API."
            error={form.formState.errors.slug?.message}
          >
            <Input {...form.register("slug")} autoComplete="off" placeholder="canapes" />
          </Field>
          <Field label="Description" error={form.formState.errors.description?.message}>
            <Textarea rows={3} {...form.register("description")} />
          </Field>
          <Field
            label="Catégorie parente"
            hint="Hiérarchie limitée à deux niveaux."
            error={form.formState.errors.parentId?.message}
          >
            <Select {...form.register("parentId")}>
              <option value="">Aucune (catégorie racine)</option>
              {rootCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
          <ImageUploadField
            bucket="products"
            label="Image de la catégorie"
            value={imageUrl}
            onChange={(url, key) => {
              setImageUrl(url);
              setImageObjectKey(key);
            }}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ordre d’affichage" error={form.formState.errors.position?.message}>
              <Input type="number" min={0} max={999} step={1} {...form.register("position")} />
            </Field>
            <div className="flex items-end pb-2">
              <Checkbox label="Catégorie visible publiquement" {...form.register("isActive")} />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) remove.mutate(toDelete.id);
          setToDelete(null);
        }}
        title="Supprimer la catégorie"
        message={
          toDelete
            ? `« ${toDelete.name} » sera archivée. La suppression est refusée par l’API si des produits (${toDelete.productCount ?? 0}) ou des sous-catégories (${toDelete.childCount ?? 0}) y sont rattachés.`
            : ""
        }
        confirmLabel="Supprimer"
      />
    </div>
  );
}
