import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import AuthPanel, { type AuthIntent } from "../components/AuthPanel";
import AuthLayout from "../components/AuthLayout";
import type { AuthUser } from "../../../shared/types/api";

interface LocationState {
  from?: string;
}

function destination(user: AuthUser, intent: AuthIntent, requested?: string): string {
  if (requested && requested.startsWith("/") && !requested.startsWith("//")) return requested;
  if (user.role === "admin") return "/admin";
  if (user.role === "seller" && user.sellerStatus === "approved") return "/vendeur";
  if (intent === "seller" && user.role === "customer") return "/devenir-vendeur";
  return "/espace-client";
}

export default function Login({ initialMode = "login" }: { initialMode?: "login" | "register" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const from = (location.state as LocationState | null)?.from;
  const { user, isBooting } = useAuth();
  const oauth = params.get("oauth");
  const notice =
    oauth === "cancelled"
      ? "Connexion sociale annulée."
      : oauth === "error"
        ? "Connexion sociale impossible. Réessayez ou utilisez votre méthode habituelle."
        : oauth === "success" && !isBooting && !user
          ? "Session sociale indisponible. Vérifiez les cookies et réessayez."
          : "";

  const intent: AuthIntent = params.get("vendeur") === "1" ? "seller" : "customer";

  if (!isBooting && user) return <Navigate to={destination(user, intent, from)} replace />;
  return (
    <AuthLayout>
      <AuthPanel
        initialMode={initialMode}
        notice={notice}
        onSuccess={(next, chosen) =>
          void navigate(destination(next, chosen, from), { replace: true })
        }
      />
    </AuthLayout>
  );
}
