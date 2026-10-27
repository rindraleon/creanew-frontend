import { api } from "../../../shared/api/client";
import type { WishlistItem } from "../../../shared/types/api";

export const wishlistApi = {
  get: () => api.get<WishlistItem[]>("/wishlist"),

  add: (productId: string) => api.post<WishlistItem[]>("/wishlist/items", { productId }),

  toggle: (productId: string) =>
    api.post<WishlistItem[]>("/wishlist/items/" + productId + "/toggle"),

  remove: (productId: string) => api.delete<WishlistItem[]>("/wishlist/items/" + productId),

  clear: () => api.delete<void>("/wishlist"),
};
