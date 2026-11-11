import type { Paginated } from "../../../shared/types/api";
import { api, buildQuery } from "../../../shared/api/client";

export interface CreateContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const contactApi = {
  send: (input: CreateContactInput) => api.post<{ message: string; id: string }>(`/contact`, input),
  list: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get<Paginated<ContactMessage>>(`/contact${buildQuery(params ?? {})}`),
  byId: (id: string) => api.get<ContactMessage>(`/contact/${id}`),
  reply: (id: string, reply: string) => api.post<ContactMessage>(`/contact/${id}/reply`, { reply }),
  archive: (id: string) => api.patch<ContactMessage>(`/contact/${id}/archive`, {}),
};
