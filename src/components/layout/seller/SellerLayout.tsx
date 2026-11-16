import { Outlet } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  MessageCircle,
  Sofa,
  Store,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import DashboardShell, { type ShellNavItem } from "../shared/DashboardShell";
import { useAuth } from "../../../context/AuthProvider";
import { useUnreadMessages } from "../../../hooks/useConversations";

const navItems: ShellNavItem[] = [
  { to: "/vendeur", icon: LayoutDashboard, label: "Tableau de bord", end: true },
  { to: "/vendeur/produits", icon: Sofa, label: "Mes produits" },
  { to: "/vendeur/commandes", icon: ClipboardList, label: "Commandes" },
  { to: "/vendeur/messages", icon: MessageCircle, label: "Messagerie" },
  { to: "/vendeur/ventes", icon: BarChart3, label: "Ventes & stats" },
  { to: "/vendeur/paiements", icon: Wallet, label: "Paiements" },
  { to: "/vendeur/profil", icon: Store, label: "Ma boutique" },
];

const menuItems: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/vendeur/profil", label: "Ma boutique", icon: Store },
  { to: "/", label: "Voir la boutique", icon: ArrowLeft },
];

export default function SellerLayout() {
  const { user } = useAuth();
  const unreadMessages = useUnreadMessages();
  const items: ShellNavItem[] = navItems.map((item) =>
    item.to === "/vendeur/messages"
      ? { ...item, badge: unreadMessages > 0 ? unreadMessages : undefined }
      : item,
  );

  return (
    <DashboardShell
      title="Espace vendeur"
      brandInitial="V"
      brandName="Espace vendeur"
      brandTagline={user?.email}
      items={items}
      menuItems={menuItems}
      notificationsTo="/espace-client/notifications"
    >
      <Outlet />
    </DashboardShell>
  );
}
