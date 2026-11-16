import { Outlet } from "react-router-dom";
import {
  Bell,
  Heart,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Package,
  Store,
  User,
  Warehouse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import DashboardShell, { type ShellNavItem } from "../shared/DashboardShell";
import { useAuth } from "../../../context/AuthProvider";
import { useUnreadMessages } from "../../../hooks/useConversations";

const baseItems: ShellNavItem[] = [
  { to: "/espace-client", icon: LayoutDashboard, label: "Aperçu", end: true },
  { to: "/espace-client/commandes", icon: Package, label: "Mes commandes" },
  { to: "/espace-client/notifications", icon: Bell, label: "Notifications" },
  { to: "/espace-client/messages", icon: MessageCircle, label: "Messagerie" },
  { to: "/favoris", icon: Heart, label: "Mes favoris" },
  { to: "/espace-client/adresses", icon: MapPin, label: "Mes adresses" },
  { to: "/espace-client/profil", icon: User, label: "Mon profil" },
];

const menuItems: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/espace-client/profil", label: "Mon profil", icon: User },
  { to: "/espace-client/adresses", label: "Mes adresses", icon: MapPin },
];

const breadcrumbs = [{ label: "Accueil", to: "/" }, { label: "Espace client" }];

export default function ClientLayout() {
  const { user, isAdmin, isSeller, isApprovedSeller } = useAuth();
  const unreadMessages = useUnreadMessages();

  if (!user) return null;

  const items: ShellNavItem[] = [
    ...baseItems.map((item) =>
      item.to === "/espace-client/messages"
        ? { ...item, badge: unreadMessages > 0 ? unreadMessages : undefined }
        : item,
    ),
  ];
  if (!isSeller) {
    items.push({ to: "/devenir-vendeur", icon: Store, label: "Devenir vendeur" });
  }
  if (isSeller) {
    items.push({
      to: isApprovedSeller ? "/vendeur" : "/devenir-vendeur",
      icon: Store,
      label: "Espace vendeur",
    });
  }
  if (isAdmin) {
    items.push({ to: "/admin", icon: Warehouse, label: "Espace admin" });
  }

  return (
    <DashboardShell
      variant="light"
      title="Espace client"
      brandInitial={user.username?.charAt(0)?.toUpperCase() ?? "C"}
      brandName={user.fullName}
      brandTagline={user.email}
      items={items}
      menuItems={menuItems}
      notificationsTo="/espace-client/notifications"
      breadcrumbs={breadcrumbs}
    >
      <Outlet />
    </DashboardShell>
  );
}
