import { api, buildQuery } from "../../../shared/api/client";
import type { Category } from "../../../shared/types/api";

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  imageObjectKey?: string;
  position?: number;
  isActive?: boolean;
  parentId?: string | null;
}

export interface AdminCategoryQuery {
  search?: string;
  isActive?: boolean;
}

export const categoriesApi = {
  list: (search?: string) =>
    api.get<Category[]>("/categories" + (search ? "?search=" + encodeURIComponent(search) : "")),

  adminList: (query: AdminCategoryQuery = {}) =>
    api.get<Category[]>("/categories/admin/all" + buildQuery(query)),

  bySlug: (slug: string) => api.get<Category>("/categories/" + slug),

  all: (query: AdminCategoryQuery = {}) =>
    api.get<Category[]>("/categories/admin/all" + buildQuery(query)),

  create: (input: CreateCategoryInput) => api.post<Category>("/categories", input),

  update: (id: string, input: Partial<CreateCategoryInput>) =>
    api.patch<Category>("/categories/" + id, input),

  remove: (id: string) => api.delete<void>("/categories/" + id),
};
