import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Archive, Reply, Inbox } from "lucide-react";
import { contactApi, type ContactMessage } from "../api/contact.api";
import PageLoader from "../../../components/ui/PageLoader";
import EmptyState from "../../../components/ui/EmptyState";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import { Field, Textarea } from "../../../components/ui/Form";
import { formatDate } from "../../../shared/utils/format";
import { useToast } from "../../../shared/context/ToastContext";
import { errorMessage } from "../../../shared/utils/errors";

export default function AdminContact() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [status, setStatus] = useState<string>("");
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyOpen, setReplyOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "contact", status],
    queryFn: () => contactApi.list({ status: status || undefined, limit: 50 }),
  });

  const replyMut = useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) => contactApi.reply(id, reply),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "contact"] });
      setReplyOpen(false);
      setSelected(null);
      toast("Réponse envoyée par e-mail au visiteur.");
    },
    onError: (e) => toast(errorMessage(e), "error"),
  });

  const archiveMut = useMutation({
    mutationFn: (id: string) => contactApi.archive(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "contact"] });
      setSelected(null);
      toast("Message archivé.");
    },
  });

  if (isLoading)
    return (
      <div className="py-12">
        <PageLoader label="Messages de contact…" />
      </div>
    );

  const items = data?.items ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-headline-md text-primary">Messages de contact</h2>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-outline-variant bg-white px-3 py-2 text-body-sm"
          >
            <option value="">Tous</option>
            <option value="new">Nouveaux</option>
            <option value="read">Lus</option>
            <option value="replied">Répondus</option>
            <option value="archived">Archivés</option>
          </select>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Inbox}
            title="Aucun message"
            text="Les messages du formulaire de contact apparaîtront ici. Chaque soumission génère un e-mail admin + accusé client."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            {items.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                className={`w-full rounded-lg border p-4 text-left transition ${selected?.id === m.id ? "border-secondary bg-secondary-container/20" : "border-outline-variant/40 bg-white hover:border-secondary/40"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-primary">{m.name}</span>
                  <Badge
                    variant={
                      m.status === "new"
                        ? "warning"
                        : m.status === "replied"
                          ? "success"
                          : "neutral"
                    }
                  >
                    {m.status}
                  </Badge>
                </div>
                <p className="text-label-sm text-on-surface-variant">
                  {m.email} · {m.subject}
                </p>
                <p className="mt-2 line-clamp-2 text-body-sm text-on-surface-variant">
                  {m.message}
                </p>
                <p className="mt-2 text-label-sm text-on-surface-variant/70">
                  {formatDate(m.createdAt)}
                </p>
              </button>
            ))}
          </div>

          <div className="card p-6">
            {selected ? (
              <>
                <h3 className="font-display text-headline-sm text-primary">{selected.subject}</h3>
                <p className="mt-1 text-label-md text-secondary">
                  {selected.name} — {selected.email}
                </p>
                <p className="mt-4 whitespace-pre-wrap text-body-md text-on-surface-variant">
                  {selected.message}
                </p>
                {selected.adminReply && (
                  <div className="mt-4 rounded-lg bg-secondary-container/30 p-4">
                    <p className="text-label-sm font-semibold text-primary">Votre réponse</p>
                    <p className="mt-1 whitespace-pre-wrap text-body-sm text-on-surface-variant">
                      {selected.adminReply}
                    </p>
                    {selected.repliedAt && (
                      <p className="mt-2 text-label-sm text-on-surface-variant/60">
                        {formatDate(selected.repliedAt)}
                      </p>
                    )}
                  </div>
                )}
                <div className="mt-6 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => setReplyOpen(true)}>
                    <Reply size={16} /> Répondre
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => archiveMut.mutate(selected.id)}
                  >
                    <Archive size={16} /> Archiver
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-12 text-center">
                <Mail size={28} className="mx-auto text-on-surface-variant/40" />
                <p className="mt-3 text-body-sm text-on-surface-variant">
                  Sélectionnez un message pour l’afficher.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        open={replyOpen}
        onClose={() => setReplyOpen(false)}
        title="Répondre au visiteur"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setReplyOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (selected) replyMut.mutate({ id: selected.id, reply: replyText });
              }}
              disabled={replyMut.isPending}
            >
              Envoyer
            </Button>
          </>
        }
      >
        <Field label="Votre réponse (envoyée par e-mail)">
          <Textarea
            rows={5}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Bonjour, merci pour votre message…"
          />
        </Field>
      </Modal>
    </div>
  );
}
