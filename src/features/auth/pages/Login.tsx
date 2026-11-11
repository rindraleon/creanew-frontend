import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import Demo from "@/components/ui/demo";
import type { AuthUser } from "../../../shared/types/api";

interface LocationState {
  from?: string;
}

function destination(user: AuthUser, requested?: string): string {
  // Les URLs externes ne sont jamais acceptées comme destination.
  if (requested && requested.startsWith("/") && !requested.startsWith("//")) return requested;
  if (user.role === "admin") return "/admin";
  if (user.role === "seller" && user.sellerStatus === "approved") return "/vendeur";
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

  if (!isBooting && user) return <Navigate to={destination(user, from)} replace />;
  return (
    <Demo
      initialMode={initialMode}
      initialNotice={notice}
      onSuccess={(next) => void navigate(destination(next, from), { replace: true })}
    />
  );
}
