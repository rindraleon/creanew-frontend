/**
 * Brouillons de formulaires : persistance locale versionnée.
 *
 * Règles :
 * - Chaque brouillon est namespacé `creanew:draft:<clé>` avec un numéro de
 *   version de schéma. Un brouillon d'une version différente est ignoré puis
 *   écrasé silencieusement (jamais tenté de migration magique).
 * - Aucune donnée n'est envoyée avant soumission explicite ; le brouillon ne
 *   quitte pas le poste (localStorage).
 * - Le brouillon est purgé à la soumission réussie, ou à la demande de
 *   l'utilisateur (« Recommencer »).
 */

const PREFIX = "creanew:draft:";
export const DRAFT_VERSION = 1;

export interface StoredDraft<T> {
  v: number;
  savedAt: string;
  data: T;
}

export function readDraft<T>(formKey: string, version: number = DRAFT_VERSION): StoredDraft<T> | null {
  try {
    const raw = window.localStorage.getItem(PREFIX + formKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraft<T>;
    if (!parsed || parsed.v !== version || typeof parsed.savedAt !== "string" || parsed.data === null || parsed.data === undefined) {
      window.localStorage.removeItem(PREFIX + formKey);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeDraft<T>(formKey: string, data: T, version: number = DRAFT_VERSION): boolean {
  try {
    const payload: StoredDraft<T> = { v: version, savedAt: new Date().toISOString(), data };
    window.localStorage.setItem(PREFIX + formKey, JSON.stringify(payload));
    return true;
  } catch {
    // Quota dépassé ou storage indisponible : le formulaire reste utilisable.
    return false;
  }
}

export function removeDraft(formKey: string): void {
  try {
    window.localStorage.removeItem(PREFIX + formKey);
  } catch {
    /* noop */
  }
}
