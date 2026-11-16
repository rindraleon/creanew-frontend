import { useQuery } from "@tanstack/react-query";
import { messagingApi } from "../services/messaging.api";

/** Nombre total de messages non lus (toutes conversations confondues). */
export function useUnreadMessages(): number {
  const { data } = useQuery({
    queryKey: ["conversations"],
    queryFn: messagingApi.list,
    refetchInterval: 10000,
  });
  return (data ?? []).reduce((sum, conversation) => sum + (conversation.unreadCount ?? 0), 0);
}
