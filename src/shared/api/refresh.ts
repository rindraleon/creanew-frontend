import type { AuthResponse } from "../types/api";
import { API_BASE_URL } from "./base-url";

export type RefreshOutcome =
  | { status: "ok"; session: AuthResponse }
  | { status: "expired" }
  | { status: "offline" };

let inFlight: Promise<RefreshOutcome> | null = null;

async function performRefresh(providedToken?: string | null): Promise<RefreshOutcome> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(providedToken ? { refreshToken: providedToken } : {}),
    });

    if (response.status === 204 || response.status === 401) {
      return { status: "expired" };
    }
    if (!response.ok) {
      return { status: "offline" };
    }
    return { status: "ok", session: (await response.json()) as AuthResponse };
  } catch {
    return { status: "offline" };
  }
}

export function requestRefresh(providedToken?: string | null): Promise<RefreshOutcome> {
  if (!inFlight) {
    inFlight = performRefresh(providedToken).finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}
