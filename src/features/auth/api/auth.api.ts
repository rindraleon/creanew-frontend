import { api, API_BASE_URL, restoreSession } from "../../../shared/api/client";
import type { AuthResponse, AuthUser, UserProfile } from "../../../shared/types/api";

export interface RegisterInput {
  username: string;
  firstName?: string | null;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}
export type SocialProvider = "google" | "facebook";

export const authApi = {
  register: (input: RegisterInput) =>
    api.post<{ message: string }>("/auth/register", input, { auth: false }),
  login: (identifier: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { identifier, password }, { auth: false }),
  providers: () =>
    api.get<Record<SocialProvider, boolean>>("/auth/oauth/providers", { auth: false }),
  oauth: (provider: SocialProvider, registration = false, username = "") => {
    const params = new URLSearchParams();
    if (registration) {
      params.set("registration", "1");
      params.set("username", username);
    }
    window.location.assign(
      `${API_BASE_URL}/auth/oauth/${provider}${params.size ? `?${params}` : ""}`,
    );
  },
  refresh: async (): Promise<AuthResponse | null> => {
    const { session } = await restoreSession();
    return session;
  },
  logout: (refreshToken?: string | null) =>
    api.post<{ message: string }>("/auth/logout", refreshToken ? { refreshToken } : {}),
  me: () => api.get<AuthUser>("/auth/me"),
  forgotPassword: (email: string) =>
    api.post<{ message: string }>("/auth/forgot-password", { email }, { auth: false }),
  resetPassword: (token: string, password: string) =>
    api.post<{ message: string }>("/auth/reset-password", { token, password }, { auth: false }),
};
export type { AuthResponse, AuthUser, UserProfile };
