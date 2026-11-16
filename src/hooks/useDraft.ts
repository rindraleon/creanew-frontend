import { useCallback, useEffect, useState } from "react";
import type { UseFormReturn, FieldValues } from "react-hook-form";
import { readDraft, removeDraft, writeDraft, DRAFT_VERSION } from "../utils/formDraft";

export interface UseDraftResult {
  /** Brouillon détecté au montage (afficher « Reprendre la saisie »). */
  available: boolean;
  savedAt: string | null;
  /** Applique le brouillon : reset du formulaire + onRestoreExtra si fourni. */
  restore: () => boolean;
  /** Supprime le brouillon et masque la bannière (« Recommencer »). */
  discard: () => void;
  /** À appeler à la soumission réussie. */
  clear: () => void;
}

interface StoredEnvelope<V, X> {
  values: V;
  extra?: X;
}

/**
 * Branche l'auto-save d'un formulaire react-hook-form sur localStorage.
 *
 * @param formKey clé stable et unique par formulaire (ex. `become-seller`, `product:new`)
 * @param form instance RHF (type d'entrée — les schémas zod stricts en output restent OK
 *             car le brouillon stocke l'input brut)
 * @param options.getExtra récupère les données hors-formulaire à joindre au brouillon
 * @param options.onRestoreExtra réinjecte ces données lors de la reprise
 */
export function useDraft<V extends FieldValues, X = undefined>(
  formKey: string,
  form: UseFormReturn<V>,
  options: {
    getExtra?: () => X;
    onRestoreExtra?: (extra: X | undefined) => void;
    version?: number;
    debounceMs?: number;
  } = {},
): UseDraftResult {
  const version = options.version ?? DRAFT_VERSION;
  const debounceMs = options.debounceMs ?? 700;
  const [available, setAvailable] = useState<boolean>(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Détection au montage.
  useEffect(() => {
    const draft = readDraft<StoredEnvelope<V, X>>(formKey, version);
    if (draft) {
      setAvailable(true);
      setSavedAt(draft.savedAt);
    }
  }, [formKey, version]);

  // Auto-save débouncé sur chaque changement.
  useEffect(() => {
    let timer: number | undefined;
    const subscription = form.watch((values) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const envelope: StoredEnvelope<typeof values, X> = {
          values,
          extra: options.getExtra?.(),
        };
        writeDraft(formKey, envelope, version);
      }, debounceMs);
    });
    return () => {
      window.clearTimeout(timer);
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, formKey, version, debounceMs]);

  const restore = useCallback(() => {
    const draft = readDraft<StoredEnvelope<V, X>>(formKey, version);
    if (!draft) {
      setAvailable(false);
      setSavedAt(null);
      return false;
    }
    form.reset(draft.data.values);
    options.onRestoreExtra?.(draft.data.extra);
    setAvailable(false);
    setSavedAt(draft.savedAt);
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, formKey, version]);

  const discard = useCallback(() => {
    removeDraft(formKey);
    setAvailable(false);
    setSavedAt(null);
  }, [formKey]);

  const clear = useCallback(() => {
    removeDraft(formKey);
    setAvailable(false);
    setSavedAt(null);
  }, [formKey]);

  return { available, savedAt, restore, discard, clear };
}
