#!/usr/bin/env python3
"""Codage de la reorganisation du frontend.

Etape 1 : deplacement des fichiers (git mv, historique conserve).
Etape 2 : reecriture de tous les imports relatifs.
"""
import os
import re
import shutil
import subprocess
import sys

SRC = "/home/user/mobilier-shop/frontend/src"

# ancien (relatif a src/) -> nouveau (relatif a src/)
MOVES = {
    # ---- app ---------------------------------------------------------- #
    "App.tsx": "app/App.tsx",
    "main.tsx": "app/main.tsx",
    "pages/public/NotFound.tsx": "app/NotFound.tsx",
    # ---- layouts : un dossier par espace ------------------------------ #
    "components/layout/PublicLayout.tsx": "layouts/public/PublicLayout.tsx",
    "components/layout/Navbar.tsx": "layouts/public/Navbar.tsx",
    "components/layout/Footer.tsx": "layouts/public/Footer.tsx",
    "components/layout/MobileMenu.tsx": "layouts/public/MobileMenu.tsx",
    "components/layout/SearchOverlay.tsx": "layouts/public/SearchOverlay.tsx",
    "components/layout/SearchOverlay.test.tsx": "layouts/public/SearchOverlay.test.tsx",
    "components/layout/ClientLayout.tsx": "layouts/client/ClientLayout.tsx",
    "components/layout/SellerLayout.tsx": "layouts/seller/SellerLayout.tsx",
    "components/layout/AdminLayout.tsx": "layouts/admin/AdminLayout.tsx",
    "components/layout/DashboardShell.tsx": "layouts/shared/DashboardShell.tsx",
    "components/layout/ScrollToTop.tsx": "layouts/shared/ScrollToTop.tsx",
    # ---- feature : auth ------------------------------------------------ #
    "lib/api/auth.api.ts": "features/auth/api/auth.api.ts",
    "lib/auth/AuthProvider.tsx": "features/auth/context/AuthProvider.tsx",
    "components/layout/RequireAuth.tsx": "features/auth/components/RequireAuth.tsx",
    "components/layout/AccessDenied.tsx": "features/auth/components/AccessDenied.tsx",
    "components/ui/LogoutButton.tsx": "features/auth/components/LogoutButton.tsx",
    "hooks/useAccount.ts": "features/auth/hooks/useAccount.ts",
    "pages/public/Login.tsx": "features/auth/pages/Login.tsx",
    "pages/public/ForgotPassword.tsx": "features/auth/pages/ForgotPassword.tsx",
    "pages/public/ResetPassword.tsx": "features/auth/pages/ResetPassword.tsx",
    "schemas/auth.ts": "features/auth/schemas/auth.ts",
    "schemas/auth.test.ts": "features/auth/schemas/auth.test.ts",
    # ---- feature : products -------------------------------------------- #
    "lib/api/products.api.ts": "features/products/api/products.api.ts",
    "components/product/ProductCard.tsx": "features/products/components/ProductCard.tsx",
    "components/shop/FilterPanel.tsx": "features/products/components/FilterPanel.tsx",
    "hooks/useCatalog.ts": "features/products/hooks/useCatalog.ts",
    "pages/public/Shop.tsx": "features/products/pages/Shop.tsx",
    "pages/public/ProductDetail.tsx": "features/products/pages/ProductDetail.tsx",
    "schemas/product.ts": "features/products/schemas/product.ts",
    # ---- feature : categories ------------------------------------------ #
    "lib/api/categories.api.ts": "features/categories/api/categories.api.ts",
    "pages/admin/AdminCategories.tsx": "features/categories/pages/AdminCategories.tsx",
    # ---- feature : cart ------------------------------------------------ #
    "lib/api/carts.api.ts": "features/cart/api/carts.api.ts",
    "components/layout/CartDrawer.tsx": "features/cart/components/CartDrawer.tsx",
    "components/ui/QuantitySelector.tsx": "features/cart/components/QuantitySelector.tsx",
    "context/CartDrawerContext.tsx": "features/cart/context/CartDrawerContext.tsx",
    "hooks/useCart.ts": "features/cart/hooks/useCart.ts",
    "pages/public/CartPage.tsx": "features/cart/pages/CartPage.tsx",
    # ---- feature : orders ---------------------------------------------- #
    "lib/api/orders.api.ts": "features/orders/api/orders.api.ts",
    "lib/api/orders.api.test.ts": "features/orders/api/orders.api.test.ts",
    "hooks/useOrders.ts": "features/orders/hooks/useOrders.ts",
    "pages/public/Checkout.tsx": "features/orders/pages/Checkout.tsx",
    "pages/public/Checkout.test.tsx": "features/orders/pages/Checkout.test.tsx",
    "pages/public/OrderSuccess.tsx": "features/orders/pages/OrderSuccess.tsx",
    "pages/client/ClientOrders.tsx": "features/orders/pages/ClientOrders.tsx",
    "pages/client/ClientOrderDetail.tsx": "features/orders/pages/ClientOrderDetail.tsx",
    "pages/admin/AdminOrders.tsx": "features/orders/pages/AdminOrders.tsx",
    "pages/admin/AdminOrderDetail.tsx": "features/orders/pages/AdminOrderDetail.tsx",
    "pages/seller/SellerOrders.tsx": "features/orders/pages/SellerOrders.tsx",
    "pages/seller/SellerOrderDetail.tsx": "features/orders/pages/SellerOrderDetail.tsx",
    "schemas/address.ts": "features/orders/schemas/address.ts",
    # ---- feature : payments -------------------------------------------- #
    "lib/api/payments.api.ts": "features/payments/api/payments.api.ts",
    "hooks/usePayments.ts": "features/payments/hooks/usePayments.ts",
    "pages/admin/AdminPayments.tsx": "features/payments/pages/AdminPayments.tsx",
    "pages/seller/SellerPayments.tsx": "features/payments/pages/SellerPayments.tsx",
    "schemas/payment.ts": "features/payments/schemas/payment.ts",
    "schemas/payment.test.ts": "features/payments/schemas/payment.test.ts",
    # ---- feature : sellers --------------------------------------------- #
    "lib/api/sellers.api.ts": "features/sellers/api/sellers.api.ts",
    "lib/api/seller.api.ts": "features/sellers/api/seller.api.ts",
    "hooks/useSeller.ts": "features/sellers/hooks/useSeller.ts",
    "pages/public/BecomeSeller.tsx": "features/sellers/pages/BecomeSeller.tsx",
    "pages/seller/SellerDashboard.tsx": "features/sellers/pages/SellerDashboard.tsx",
    "pages/seller/SellerProducts.tsx": "features/sellers/pages/SellerProducts.tsx",
    "pages/seller/SellerProductForm.tsx": "features/sellers/pages/SellerProductForm.tsx",
    "pages/seller/SellerProfile.tsx": "features/sellers/pages/SellerProfile.tsx",
    "pages/seller/SellerSales.tsx": "features/sellers/pages/SellerSales.tsx",
    "pages/admin/AdminSellers.tsx": "features/sellers/pages/AdminSellers.tsx",
    "schemas/seller.ts": "features/sellers/schemas/seller.ts",
    # ---- feature : notifications --------------------------------------- #
    "lib/api/notifications.api.ts": "features/notifications/api/notifications.api.ts",
    "components/notifications/NotificationsBell.tsx": "features/notifications/components/NotificationsBell.tsx",
    "components/notifications/NotificationItem.tsx": "features/notifications/components/NotificationItem.tsx",
    "components/notifications/NotificationIcon.tsx": "features/notifications/components/NotificationIcon.tsx",
    "hooks/useNotifications.ts": "features/notifications/hooks/useNotifications.ts",
    "pages/client/ClientNotifications.tsx": "features/notifications/pages/ClientNotifications.tsx",
    # ---- feature : dashboard ------------------------------------------- #
    "lib/api/admin.api.ts": "features/dashboard/api/admin.api.ts",
    "hooks/useAdmin.ts": "features/dashboard/hooks/useAdmin.ts",
    "pages/admin/AdminDashboard.tsx": "features/dashboard/pages/AdminDashboard.tsx",
    "pages/admin/AdminAnalytics.tsx": "features/dashboard/pages/AdminAnalytics.tsx",
    "pages/admin/AdminCustomers.tsx": "features/dashboard/pages/AdminCustomers.tsx",
    "pages/admin/AdminProducts.tsx": "features/dashboard/pages/AdminProducts.tsx",
    "pages/admin/AdminAuditLogs.tsx": "features/dashboard/pages/AdminAuditLogs.tsx",
    "pages/client/ClientDashboard.tsx": "features/dashboard/pages/ClientDashboard.tsx",
    # ---- feature : account --------------------------------------------- #
    "lib/api/users.api.ts": "features/account/api/users.api.ts",
    "lib/api/wishlist.api.ts": "features/account/api/wishlist.api.ts",
    "hooks/useWishlist.ts": "features/account/hooks/useWishlist.ts",
    "pages/client/ClientProfile.tsx": "features/account/pages/ClientProfile.tsx",
    "pages/client/ClientAddresses.tsx": "features/account/pages/ClientAddresses.tsx",
    "pages/public/Wishlist.tsx": "features/account/pages/Wishlist.tsx",
    # ---- feature : content (editorial + vitrine) ----------------------- #
    "components/home/Hero.tsx": "features/content/components/Hero.tsx",
    "components/home/FeatureBar.tsx": "features/content/components/FeatureBar.tsx",
    "components/home/PromoBanner.tsx": "features/content/components/PromoBanner.tsx",
    "components/home/Testimonials.tsx": "features/content/components/Testimonials.tsx",
    "components/home/WhySection.tsx": "features/content/components/WhySection.tsx",
    "components/home/BlogTeaser.tsx": "features/content/components/BlogTeaser.tsx",
    "components/home/ProductSection.tsx": "features/content/components/ProductSection.tsx",
    "components/home/CategorySection.tsx": "features/content/components/CategorySection.tsx",
    "data/blog.ts": "features/content/data/blog.ts",
    "data/collections.ts": "features/content/data/collections.ts",
    "pages/public/Home.tsx": "features/content/pages/Home.tsx",
    "pages/public/About.tsx": "features/content/pages/About.tsx",
    "pages/public/Collections.tsx": "features/content/pages/Collections.tsx",
    "pages/public/Blog.tsx": "features/content/pages/Blog.tsx",
    "pages/public/BlogPost.tsx": "features/content/pages/BlogPost.tsx",
    "pages/public/Contact.tsx": "features/content/pages/Contact.tsx",
    "pages/public/DeliveryReturns.tsx": "features/content/pages/DeliveryReturns.tsx",
    "pages/public/Terms.tsx": "features/content/pages/Terms.tsx",
    "pages/public/Privacy.tsx": "features/content/pages/Privacy.tsx",
    "components/ui/StaticContentPage.tsx": "features/content/components/StaticContentPage.tsx",
    # ---- shared -------------------------------------------------------- #
    "lib/api/client.ts": "shared/api/client.ts",
    "lib/api/client.test.ts": "shared/api/client.test.ts",
    "lib/api/files.api.ts": "shared/api/files.api.ts",
    "context/ToastContext.tsx": "shared/context/ToastContext.tsx",
    "hooks/useFocusTrap.ts": "shared/hooks/useFocusTrap.ts",
    "lib/query/keys.ts": "shared/query/keys.ts",
    "lib/query/queryClient.ts": "shared/query/queryClient.ts",
    "types/api.ts": "shared/types/api.ts",
    "utils/constants.ts": "shared/utils/constants.ts",
    "utils/errors.ts": "shared/utils/errors.ts",
    "utils/format.ts": "shared/utils/format.ts",
    "utils/format.test.ts": "shared/utils/format.test.ts",
    "utils/navigation.ts": "shared/utils/navigation.ts",
    "utils/product.ts": "shared/utils/product.ts",
    "utils/product.test.ts": "shared/utils/product.test.ts",
    "utils/responsiveImage.ts": "shared/utils/responsiveImage.ts",
    "utils/responsiveImage.test.ts": "shared/utils/responsiveImage.test.ts",
    "utils/reviews.ts": "shared/utils/reviews.ts",
    "hooks/useSeo.ts": "shared/seo/useSeo.ts",
}

# Fichiers supprimes (types obsoletes, dupliques et faux face au contrat API).
DELETE = [
    "types/index.ts",
]

# Nouveaux fichiers crees a la main apres le codemod.
NEW_FILES = [
    "app/providers.tsx",
    "app/SpaceBoundary.tsx",
    "app/NotFound.tsx",
]

IMPORT_RE = re.compile(
    r"""(?P<prefix>\b(?:import|export|from)\s*|\bimport\s*\(\s*|\brequire\s*\(\s*)"""
    r"""(?P<quote>["'])(?P<spec>[^"']+)(?P=quote)"""
)


def run(cmd):
    return subprocess.run(cmd, shell=True, cwd=SRC, capture_output=True, text=True)


def resolve(from_rel, spec):
    """Resout un specifier relatif en chemin absolu virtuel (sans extension)."""
    base = os.path.dirname(from_rel)
    joined = os.path.normpath(os.path.join(base, spec))
    return joined.replace(os.sep, "/")


def do_moves():
    pending = {}
    already = 0
    for old, new in MOVES.items():
        src, dst = os.path.join(SRC, old), os.path.join(SRC, new)
        if os.path.exists(dst) and not os.path.exists(src):
            already += 1  # deplacement deja effectue lors d'une execution anterieure
            continue
        if not os.path.exists(src):
            print(f"FICHIER MANQUANT : {old}")
            sys.exit(1)
        pending[old] = new

    # Les destinations sont creees au passage.
    for new in pending.values():
        os.makedirs(os.path.dirname(os.path.join(SRC, new)), exist_ok=True)

    for old, new in pending.items():
        r = run(f'git mv "{old}" "{new}"')
        if r.returncode != 0:
            # Fichier cree hors git (ajouts de cette session) : deplacement simple.
            r = run(f'mv "{old}" "{new}"')
        if r.returncode != 0:
            print(f"deplacement echoue pour {old}: {r.stderr}")
            sys.exit(1)
    print(f"{len(pending)} fichiers deplaces ({already} deja en place).")


def rewrite_imports():
    """Reecrit chaque specifier relatif en suivant la table ancien -> nouveau.

    Pour un fichier hote H important S :
      1. S est resolu en un ancien chemin (avec les extensions candidates) ;
      2. cet ancien chemin est cherche dans MOVES pour obtenir la destination ;
      3. le specifier est recalcule depuis le repertoire de H.
    """
    changed = 0
    unresolved = []
    new_to_old = {v: k for k, v in MOVES.items()}

    for root, _dirs, files in os.walk(SRC):
        for name in files:
            if not name.endswith((".ts", ".tsx")):
                continue
            path = os.path.join(root, name)
            rel = os.path.relpath(path, SRC).replace(os.sep, "/")
            # Le fichier a peut-etre ete deplace : ses imports relatifs ont ete
            # ecrits depuis son ANCIEN emplacement. On resout donc depuis la.
            origin = new_to_old.get(rel, rel)
            base = os.path.dirname(origin)

            with open(path, encoding="utf-8") as fh:
                src = fh.read()

            def repl(match):
                spec = match.group("spec")
                if not spec.startswith("."):
                    return match.group(0)
                target = os.path.normpath(os.path.join(base, spec)).replace(os.sep, "/")
                candidates = [
                    target,
                    target + ".ts",
                    target + ".tsx",
                    target + "/index.ts",
                    target + "/index.tsx",
                ]
                old = next((c for c in candidates if c in MOVES), None)
                if old is None:
                    unresolved.append((rel, spec))
                    return match.group(0)
                new = MOVES[old]
                new_spec = os.path.relpath(new, base).replace(os.sep, "/")
                if not new_spec.startswith("."):
                    new_spec = "./" + new_spec
                return match.group("prefix") + match.group("quote") + new_spec + match.group("quote")

            new_src = IMPORT_RE.sub(repl, src)
            if new_src != src:
                with open(path, "w", encoding="utf-8") as fh:
                    fh.write(new_src)
                changed += 1

    print(f"{changed} fichiers reecrits.")
    if unresolved:
        print("SPECIFIEURS NON RESOLUS (a verifier) :")
        for rel, spec in sorted(set(unresolved)):
            print(f"  {rel}  ->  {spec}")
    return len(set(unresolved))


if __name__ == "__main__":
    for dead in DELETE:
        p = os.path.join(SRC, dead)
        if os.path.exists(p):
            run(f'git rm -q "{dead}"')
            print(f"supprime : {dead}")
    n = rewrite_imports()
    sys.exit(1 if n else 0)
