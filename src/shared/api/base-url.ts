/** Base des appels HTTP : proxy same-origin en dev, URL absolue en production. */
export const API_BASE_URL: string = (
  (import.meta.env.VITE_API_URL as string | undefined) ?? "/api"
).replace(/\/$/, "");
