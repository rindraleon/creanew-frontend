import { Outlet } from "react-router-dom";
import {
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  Layers,
  LayoutDashboard,
  Mail,
  MessageCircle,
  Sofa,
  Store,
  Tags,
  User,
  Users,
  Wallet,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import DashboardShell, { type ShellNavItem } from "../shared/DashboardShell";
import { usePendingSellers } from "../../features/dashboard/hooks/useAdmin";

const navItems: ShellNavItem[] = [
  { to: "/admin", icon: LayoutDashboard, label: "Tableau de bord", end: true },
  { to: "/admin/vendeurs", icon: Store, label: "Vendeurs" },
  { to: "/admin/produits", icon: Sofa, label: "Produits" },
  { to: "/admin/collections", icon: Layers, label: "Collections" },
  { to: "/admin/commandes", icon: ClipboardList, label: "Commandes" },
  { to: "/admin/paiements", icon: Wallet, label: "Paiements" },
  { to: "/admin/contact", icon: Mail, label: "Messages contact" },
  { to: "/admin/messages", icon: MessageCircle, label: "Messagerie" },
  { to: "/admin/clients", icon: Users, label: "Clients" },
  { to: "/admin/categories", icon: Tags, label: "Catégories" },
  { to: "/admin/contenus", icon: Settings, label: "Contenus site" },
  { to: "/admin/statistiques", icon: BarChart3, label: "Statistiques" },
  { to: "/admin/journal", icon: ClipboardCheck, label: "Journal d'audit" },
];

const menuItems: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/", label: "Voir la boutique", icon: Store },
  { to: "/espace-client/profil", label: "Mon profil", icon: User },
];

export default function AdminLayout() {
  const { data: pending } = usePendingSellers();
  const pendingCount = pending?.length ?? 0;

  const items = navItems.map((item) =>
    item.to === "/admin/vendeurs" ? { ...item, badge: pendingCount } : item,
  );

  return (
    <DashboardShell
      title="Administration"
      brandInitial="C"
      brandName="CreaNew"
      brandTagline="Canapés d'Angle"
      items={items}
      menuItems={menuItems}
      notificationsTo="/espace-client/notifications"
    >
      <Outlet />
    </DashboardShell>
  );
}
