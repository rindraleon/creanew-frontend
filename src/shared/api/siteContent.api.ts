import { api } from "./client";

export interface SiteSetting {
  key: string;
  value: Record<string, unknown>;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const siteContentApi = {
  list: () => api.get<SiteSetting[]>(`/site-content`),
  byKey: (key: string) => api.get<SiteSetting | null>(`/site-content/${key}`),
  upsert: (key: string, input: { value: Record<string, unknown>; description?: string }) =>
    api.put<SiteSetting>(`/site-content/${key}`, { key, ...input }),
};
