import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send, Loader2, Plus } from "lucide-react";
import { messagingApi, type Conversation, type Message } from "../api/messaging.api";
import { useAuth } from "../../auth/context/AuthProvider";
import Button from "../../../components/ui/Button";
import { Field, Input, Textarea } from "../../../components/ui/Form";
import Modal from "../../../components/ui/Modal";
import PageLoader from "../../../components/ui/PageLoader";
import EmptyState from "../../../components/ui/EmptyState";
import { formatDate } from "../../../shared/utils/format";
import { useToast } from "../../../shared/context/ToastContext";
import { errorMessage } from "../../../shared/utils/errors";

export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composer, setComposer] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: messagingApi.list,
    refetchInterval: 10000,
  });

  const { data: messages = [], isLoading: msgLoading } = useQuery({
    queryKey: ["conversation", selectedId, "messages"],
    queryFn: () => messagingApi.messages(selectedId as string),
    enabled: Boolean(selectedId),
    refetchInterval: 4000,
  });

  useEffect(() => {
    if (selectedId) void messagingApi.markRead(selectedId).catch(() => {});
  }, [selectedId, messages.length]);

  const sendMut = useMutation({
    mutationFn: () => messagingApi.send(selectedId as string, composer),
    onSuccess: () => {
      setComposer("");
      void qc.invalidateQueries({ queryKey: ["conversation", selectedId, "messages"] });
      void qc.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (e) => toast(errorMessage(e), "error"),
  });

  const createMut = useMutation({
    mutationFn: () => messagingApi.createConversation({ subject: newSubject, message: newMessage }),
    onSuccess: (conv: Conversation) => {
      setCreateOpen(false);
      setNewSubject("");
      setNewMessage("");
      void qc.invalidateQueries({ queryKey: ["conversations"] });
      setSelectedId(conv.id);
      toast("Conversation créée.");
    },
    onError: (e) => toast(errorMessage(e), "error"),
  });

  if (isLoading)
    return (
      <div className="py-12">
        <PageLoader label="Messagerie CreaNew…" />
      </div>
    );

  return (
    <div className="container-app py-8 lg:py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-display-md text-primary">Messagerie</h1>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> Nouvelle conversation
        </Button>
      </div>
      <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">
        Échangez directement avec notre équipe ou votre vendeur. Les messages non lus sont surlignés
        — mise à jour automatique toutes les 4 secondes sans rechargement.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Liste */}
        <div className="card overflow-hidden p-0">
          <div className="border-b border-outline-variant/30 px-4 py-3">
            <h3 className="font-semibold text-primary">Conversations</h3>
            <p className="text-label-sm text-on-surface-variant">
              {conversations.length} conversation(s)
            </p>
          </div>
          <div>
            {conversations.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={MessageCircle}
                  title="Aucune conversation"
                  text="Créez votre première conversation pour contacter l’équipe CreaNew."
                />
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`flex w-full flex-col gap-1 border-b border-outline-variant/20 px-4 py-3 text-left transition ${selectedId === c.id ? "bg-secondary-container/30" : "bg-white hover:bg-surface-container-low"}`}
                >
                  <span className="flex items-center justify-between">
                    <span className="truncate font-semibold text-primary">{c.subject}</span>
                    {c.unreadCount > 0 && (
                      <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-on-secondary">
                        {c.unreadCount}
                      </span>
                    )}
                  </span>
                  {c.lastMessage && (
                    <span className="line-clamp-1 text-body-sm text-on-surface-variant">
                      {c.lastMessage.body}
                    </span>
                  )}
                  <span className="text-label-sm text-on-surface-variant/60">
                    {c.lastMessageAt ? formatDate(c.lastMessageAt) : formatDate(c.createdAt)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Détail */}
        <div className="card flex min-h-[520px] flex-col p-0">
          {!selectedId ? (
            <div className="flex flex-1 items-center justify-center p-8">
              <div className="text-center">
                <MessageCircle size={32} className="mx-auto text-on-surface-variant/40" />
                <p className="mt-3 text-body-md text-on-surface-variant">
                  Sélectionnez une conversation ou créez-en une.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b border-outline-variant/30 px-4 py-3">
                <h3 className="font-semibold text-primary">
                  {conversations.find((c) => c.id === selectedId)?.subject}
                </h3>
                <p className="text-label-sm text-on-surface-variant">
                  {messages.length} message(s)
                </p>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto bg-surface-container-low/40 p-4">
                {msgLoading ? (
                  <PageLoader label="Messages…" />
                ) : (
                  messages.map((m: Message) => {
                    const mine = m.senderId === user?.id;
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${mine ? "bg-secondary text-on-secondary" : "bg-white text-primary shadow-card"}`}
                        >
                          <p className="whitespace-pre-wrap text-body-sm leading-relaxed">
                            {m.body}
                          </p>
                          <p
                            className={`mt-1 text-[11px] ${mine ? "text-on-secondary/70" : "text-on-surface-variant/60"}`}
                          >
                            {formatDate(m.createdAt)} {m.isRead ? "· lu" : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (composer.trim()) sendMut.mutate();
                }}
                className="flex gap-2 border-t border-outline-variant/20 p-3"
              >
                <Textarea
                  rows={2}
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  placeholder="Votre message…"
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={sendMut.isPending || !composer.trim()}
                  className="self-end"
                >
                  {sendMut.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}{" "}
                  Envoyer
                </Button>
              </form>
            </>
          )}
        </div>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nouvelle conversation"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}>
              Créer
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Sujet" required>
            <Input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Question sur le canapé d'angle Oslo"
            />
          </Field>
          <Field label="Message" required>
            <Textarea
              rows={4}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Bonjour, je souhaite…"
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
