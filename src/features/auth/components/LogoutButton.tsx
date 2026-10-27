import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";

interface LogoutButtonProps {
  /** Libellé du bouton ; à omettre pour un bouton icône seule. */
  label?: string;
  /** Rendu compact (barre de navigation mobile). */
  compact?: boolean;
  className?: string;
  /** Page atteinte après la déconnexion. */
  redirectTo?: string;
  /** Appelé une fois la déconnexion effective (fermer un menu, par exemple). */
  onLoggedOut?: () => void;
}

/**
 * Déconnexion avec confirmation explicite.
 *
 * Exigence du cahier des charges : aucune déconnexion ne doit être déclenchée
 * par un simple clic. Le dialogue rappelle ce qui va se passer, puis la
 * déconnexion effective :
 *   1. appel de `POST /auth/logout` (révocation du refresh token) ;
 *   2. suppression des jetons en mémoire ;
 *   3. remise à zéro de l'utilisateur et vidage du cache React Query ;
 *   4. redirection vers la page publique ;
 *   5. `replace: true` — le bouton « retour » du navigateur ne peut donc pas
 *      ramener l'utilisateur sur une page privée.
 *
 * Aucune donnée sensible n'est conservée côté client : les jetons vivent en
 * mémoire et le refresh token est un cookie `httpOnly` que le serveur efface.
 */
export default function LogoutButton({
  label = "Se déconnecter",
  compact = false,
  className = "",
  redirectTo = "/",
  onLoggedOut,
}: LogoutButtonProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);

  const confirm = async (): Promise<void> => {
    setPending(true);
    try {
      await logout();
    } finally {
      setPending(false);
      setOpen(false);
      onLoggedOut?.();
      // `replace` empêche le retour arrière vers l'espace privé.
      navigate(redirectTo, { replace: true });
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          compact
            ? `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-body-sm font-medium text-red-600 transition-colors hover:bg-red-50 ${className}`
            : `flex items-center gap-2 rounded-lg px-3 py-2 text-body-sm font-medium text-red-600 transition-colors hover:bg-red-50 ${className}`
        }
      >
        <LogOut size={compact ? 18 : 17} />
        {label}
      </button>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => void confirm()}
        title="Se déconnecter"
        message="Êtes-vous sûr de vouloir vous déconnecter ? Votre session sera fermée sur cet appareil et vous devrez vous reconnecter pour accéder à votre espace."
        confirmLabel={pending ? "Déconnexion…" : "Se déconnecter"}
      />
    </>
  );
}
