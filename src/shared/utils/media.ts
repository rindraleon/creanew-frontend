const API_BASE_URL: string = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export const IMAGE_PLACEHOLDER = "/images/placeholder.svg";

export function mediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) return url;
  if (url.startsWith("/uploads/") || url.startsWith("/api/")) return `${API_ORIGIN}${url}`;
  if (url.startsWith("/")) return url;
  return `${API_ORIGIN}/uploads/${url.replace(/^\/+/, "")}`;
}
