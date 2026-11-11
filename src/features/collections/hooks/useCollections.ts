import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collectionsApi, type CreateCollectionInput } from "../api/collections.api";
import { useToast } from "../../../shared/context/ToastContext";
import { errorMessage } from "../../../shared/utils/errors";

export function useCollections(includeUnpublished = false) {
  return useQuery({
    queryKey: ["collections", includeUnpublished ? "all" : "published"],
    queryFn: () => collectionsApi.list(includeUnpublished),
  });
}

export function useCollection(slug: string | undefined) {
  return useQuery({
    queryKey: ["collections", "detail", slug ?? ""],
    queryFn: () => collectionsApi.bySlug(slug as string),
    enabled: Boolean(slug),
  });
}

export function useCreateCollection() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: collectionsApi.create,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["collections"] });
      toast("Collection créée.");
    },
    onError: (e: unknown) => toast(errorMessage(e), "error"),
  });
}

export function useUpdateCollection() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateCollectionInput> }) =>
      collectionsApi.update(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["collections"] });
      toast("Collection mise à jour.");
    },
    onError: (e: unknown) => toast(errorMessage(e), "error"),
  });
}

export function useDeleteCollection() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => collectionsApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["collections"] });
      toast("Collection supprimée.");
    },
    onError: (e: unknown) => toast(errorMessage(e), "error"),
  });
}
