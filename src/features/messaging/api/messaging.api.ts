import { api } from "../../../shared/api/client";

export interface Conversation {
  id: string;
  subject: string;
  orderId: string | null;
  status: string;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  lastMessage: { body: string; createdAt: string } | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export const messagingApi = {
  createConversation: (input: {
    subject: string;
    message: string;
    orderId?: string;
    sellerId?: string;
    recipientId?: string;
  }) => api.post<Conversation>(`/conversations`, input),
  list: () => api.get<Conversation[]>(`/conversations`),
  get: (id: string) => api.get<Conversation>(`/conversations/${id}`),
  messages: (id: string) => api.get<Message[]>(`/conversations/${id}/messages`),
  send: (id: string, body: string) => api.post<Message>(`/conversations/${id}/messages`, { body }),
  markRead: (id: string) => api.patch<void>(`/conversations/${id}/read`, {}),
};
