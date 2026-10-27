import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "../../categories/api/categories.api";
import { productsApi } from "../api/products.api";
import { queryKeys } from "../../../shared/query/keys";
import type { Paginated, Product, ProductQuery } from "../../../shared/types/api";

/** Catégories (publiques, peu volatiles → cache long). */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => categoriesApi.list(),
    staleTime: 5 * 60_000,
  });
}

export function useCategory(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.categories.detail(slug ?? ""),
    queryFn: () => categoriesApi.bySlug(slug as string),
    enabled: Boolean(slug),
  });
}

/**
 * Catalogue public : recherche, filtres, tri, pagination (§44, §45).
 *
 * `options.enabled` laisse l'appelant désactiver la requête — typiquement une
 * barre de recherche qui n'interroge le serveur qu'à partir de 2 caractères.
 * Sans ce garde, chaque frappe partait en requête (et `limit: 0` valait un 422
 * côté API, `limit` étant validé `@Min(1)`).
 */
export function useProducts(query: ProductQuery = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.products.list(query),
    queryFn: () => productsApi.list(query),
    enabled: options?.enabled ?? true,
    // Garde les pages précédentes affichées pendant le chargement (pagination fluide).
    placeholderData: (previous) => previous,
  });
}

export function useProduct(slug: string | undefined) {
  return useQuery<Product>({
    queryKey: queryKeys.products.detail(slug ?? ""),
    queryFn: () => productsApi.bySlug(slug as string),
    enabled: Boolean(slug),
  });
}

/** Produits mis en avant pour la page d'accueil. */
export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: queryKeys.products.list({ featured: true, limit }),
    queryFn: () => productsApi.list({ featured: true, limit, sort: "newest" }),
    select: (data: Paginated<Product>) => data.items,
    staleTime: 2 * 60_000,
  });
}

export function useNewProducts(limit = 8) {
  return useQuery({
    queryKey: queryKeys.products.list({ limit, sort: "newest" }),
    queryFn: () => productsApi.list({ limit, sort: "newest" }),
    select: (data: Paginated<Product>) => data.items,
    staleTime: 2 * 60_000,
  });
}
