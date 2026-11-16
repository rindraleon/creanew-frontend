import { ApiError, NetworkError } from "../services/client";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

export function errorMessage(error: unknown, fallback = "Une erreur est survenue."): string {
  if (error instanceof ApiError) {
    if (error.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
      return "Veuillez corriger les champs signalés.";
    }
    return error.message || fallback;
  }
  if (error instanceof NetworkError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

/**
 * Applique les erreurs de validation 422/400 du backend sur un formulaire
 * React Hook Form : le corps de réponse de l’API est `{ errors: { champ: [messages] } }`,
 * les clés correspondent aux propriétés du DTO (et, par convention du projet,
 * aux champs du formulaire).
 *
 * Retourne `true` si au moins un champ a été renseigné ; `false` si l’erreur
 * n’est pas une erreur de champ exploitable (l’appelant retombe alors sur un
 * toast générique seul).
 */
export function applyFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): boolean {
  if (!(error instanceof ApiError) || !error.isValidation) return false;
  let applied = false;
  for (const field of fields) {
    const message = error.fieldError(field);
    if (message) {
      setError(field, { type: "server", message });
      applied = true;
    }
  }
  return applied;
}

/** Erreur récupérable : l'utilisateur peut réessayer (réseau, 5xx, 429). */
export function isRetryable(error: unknown): boolean {
  if (error instanceof NetworkError) return true;
  if (error instanceof ApiError) return error.statusCode >= 500 || error.statusCode === 429;
  return false;
}
