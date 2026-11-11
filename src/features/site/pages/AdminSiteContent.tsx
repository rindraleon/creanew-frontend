import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { siteContentApi } from "../../../shared/api/siteContent.api";
import Button from "../../../components/ui/Button";
import { Field, Textarea } from "../../../components/ui/Form";
import PageLoader from "../../../components/ui/PageLoader";
import { useToast } from "../../../shared/context/ToastContext";
import { errorMessage } from "../../../shared/utils/errors";

export default function AdminSiteContent() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin", "site-content"],
    queryFn: siteContentApi.list,
  });

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState("");

  const saveMut = useMutation({
    mutationFn: ({ key, value }: { key: string; value: Record<string, unknown> }) =>
      siteContentApi.upsert(key, { value }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "site-content"] });
      setEditingKey(null);
      toast("Contenu enregistré.");
    },
    onError: (e) => toast(errorMessage(e), "error"),
  });

  if (isLoading)
    return (
      <div className="py-12">
        <PageLoader label="Contenus du site…" />
      </div>
    );

  // Ces brouillons sont affichés dans l'éditeur uniquement ; rien n'est inséré en base avant Enregistrer.
  const legalDrafts = ["legal_terms", "privacy_policy"]
    .filter((key) => !(settings ?? []).some((setting) => setting.key === key))
    .map((key) => ({
      key,
      value: { published: false, version: "", text: "" },
      description: "Brouillon non enregistré",
    }));
  const visibleSettings = [...(settings ?? []), ...legalDrafts];

  return (
    <div>
      <h2 className="font-display text-headline-md text-primary">Contenus du site</h2>
      <p className="mt-2 text-body-sm text-on-surface-variant">
        Titres, bannières, coordonnées — tout le contenu public administrable sans redéployer. Les
        modifications sont visibles après rafraîchissement. Les documents legal_terms et
        privacy_policy peuvent être publiés ici, mais leur publication n'est pas requise pour
        l'inscription. Aucun document juridique n’est fourni par défaut.
      </p>

      <div className="mt-6 space-y-4">
        {visibleSettings.map((s) => (
          <div key={s.key} className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold text-primary">{s.key}</h3>
              <span className="text-label-sm text-on-surface-variant">{s.description}</span>
            </div>
            {editingKey === s.key ? (
              <div className="mt-4 space-y-3">
                <Field label="JSON (éditez puis Enregistrer)">
                  <Textarea
                    rows={12}
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    className="font-mono text-[12px]"
                  />
                </Field>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      try {
                        const parsed: unknown = JSON.parse(jsonText);
                        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
                          throw new Error("Objet JSON attendu");
                        saveMut.mutate({ key: s.key, value: parsed as Record<string, unknown> });
                      } catch {
                        toast("JSON invalide.", "error");
                      }
                    }}
                    size="sm"
                  >
                    Enregistrer
                  </Button>
                  <Button variant="outline" onClick={() => setEditingKey(null)} size="sm">
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <pre className="mt-4 max-h-72 overflow-auto rounded-lg bg-surface-container-low p-4 text-[12px] leading-relaxed text-on-surface-variant">
                  {JSON.stringify(s.value, null, 2)}
                </pre>
                <Button
                  size="sm"
                  className="mt-3"
                  variant="outline"
                  onClick={() => {
                    setEditingKey(s.key);
                    setJsonText(JSON.stringify(s.value, null, 2));
                  }}
                >
                  Modifier
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
