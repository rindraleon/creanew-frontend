import { api } from "./client";
import type { Product } from "./api";

export interface CollectionGalleryImage {
  objectKey: string;
  url?: string | null;
  alt?: string | null;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  coverImageUrl: string | null;
  coverObjectKey: string | null;
  gallery: CollectionGalleryImage[];
  productIds: string[];
  position: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollectionInput {
  name: string;
  slug?: string;
  tagline?: string;
  description?: string;
  coverImageUrl?: string;
  coverObjectKey?: string;
  gallery?: CollectionGalleryImage[];
  productIds?: string[];
  isPublished?: boolean;
  position?: number;
}

export const collectionsApi = {
  list: (includeUnpublished = false) =>
    api.get<Collection[]>(includeUnpublished ? "/collections/admin/all" : "/collections"),
  bySlug: (slug: string) => api.get<Collection & { products?: Product[] }>(`/collections/${slug}`),
  create: (input: CreateCollectionInput) => api.post<Collection>(`/collections`, input),
  update: (id: string, input: Partial<CreateCollectionInput>) =>
    api.patch<Collection>(`/collections/${id}`, input),
  remove: (id: string) => api.delete<void>(`/collections/${id}`),
  setPublish: (id: string, isPublished: boolean) =>
    api.patch<Collection>(`/collections/${id}/publish`, { isPublished }),
};
