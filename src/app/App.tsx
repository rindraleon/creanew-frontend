import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "../shared/context/ToastContext";
import PageLoader from "../components/ui/PageLoader";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import ScrollToTop from "../layouts/shared/ScrollToTop";
import PublicLayout from "../layouts/public/PublicLayout";
import { RequireAuth, RequireAdmin, RequireSeller } from "../features/auth/components/RequireAuth";
import ClientLayout from "../layouts/client/ClientLayout";
import SellerLayout from "../layouts/seller/SellerLayout";
import AdminLayout from "../layouts/admin/AdminLayout";

import Home from "../features/content/pages/Home";
import Shop from "../features/products/pages/Shop";
import ProductDetail from "../features/products/pages/ProductDetail";
import Collections from "../features/content/pages/Collections";
import About from "../features/content/pages/About";
import Blog from "../features/content/pages/Blog";
import BlogPost from "../features/content/pages/BlogPost";
import Contact from "../features/content/pages/Contact";
import DeliveryReturns from "../features/content/pages/DeliveryReturns";
import Terms from "../features/content/pages/Terms";
import Privacy from "../features/content/pages/Privacy";
import CartPage from "../features/cart/pages/CartPage";
import Checkout from "../features/orders/pages/Checkout";
import OrderSuccess from "../features/orders/pages/OrderSuccess";
import Login from "../features/auth/pages/Login";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import ResetPassword from "../features/auth/pages/ResetPassword";
import Wishlist from "../features/account/pages/Wishlist";
import BecomeSeller from "../features/sellers/pages/BecomeSeller";
import NotFound from "./NotFound";

import ClientDashboard from "../features/dashboard/pages/ClientDashboard";
import ClientOrders from "../features/orders/pages/ClientOrders";
import ClientOrderDetail from "../features/orders/pages/ClientOrderDetail";
import ClientNotifications from "../features/notifications/pages/ClientNotifications";
import ClientProfile from "../features/account/pages/ClientProfile";
import ClientAddresses from "../features/account/pages/ClientAddresses";

const SellerDashboard = lazy(() => import("../features/sellers/pages/SellerDashboard"));
const SellerProducts = lazy(() => import("../features/sellers/pages/SellerProducts"));
const SellerProductForm = lazy(() => import("../features/sellers/pages/SellerProductForm"));
const SellerOrders = lazy(() => import("../features/orders/pages/SellerOrders"));
const SellerOrderDetail = lazy(() => import("../features/orders/pages/SellerOrderDetail"));
const SellerSales = lazy(() => import("../features/sellers/pages/SellerSales"));
const SellerPayments = lazy(() => import("../features/payments/pages/SellerPayments"));
const SellerProfile = lazy(() => import("../features/sellers/pages/SellerProfile"));

const AdminDashboard = lazy(() => import("../features/dashboard/pages/AdminDashboard"));
const AdminProducts = lazy(() => import("../features/dashboard/pages/AdminProducts"));
const AdminOrders = lazy(() => import("../features/orders/pages/AdminOrders"));
const AdminOrderDetail = lazy(() => import("../features/orders/pages/AdminOrderDetail"));
const AdminCustomers = lazy(() => import("../features/dashboard/pages/AdminCustomers"));
const AdminSellers = lazy(() => import("../features/sellers/pages/AdminSellers"));
const AdminPayments = lazy(() => import("../features/payments/pages/AdminPayments"));
const AdminCategories = lazy(() => import("../features/categories/pages/AdminCategories"));
const AdminAnalytics = lazy(() => import("../features/dashboard/pages/AdminAnalytics"));
const AdminAuditLogs = lazy(() => import("../features/dashboard/pages/AdminAuditLogs"));

import SpaceBoundary from "./SpaceBoundary";

/** Écran de transition pendant le chargement d'un espace privé. */
function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <PageLoader />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ToastProvider>
        <ScrollToTop />
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Pages publiques */}
          <Route element={<SpaceBoundary space="Boutique"><PublicLayout /></SpaceBoundary>}>
            <Route path="/" element={<Home />} />
            <Route path="/boutique" element={<Shop />} />
            <Route path="/boutique/:slug" element={<ProductDetail />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/livraison-retours" element={<DeliveryReturns />} />
            <Route path="/conditions-generales" element={<Terms />} />
            <Route path="/confidentialite" element={<Privacy />} />
            <Route path="/panier" element={<CartPage />} />
            <Route path="/favoris" element={<Wishlist />} />
            <Route path="/connexion" element={<Login />} />
            <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
            <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />

            <Route
              path="/devenir-vendeur"
              element={
                <RequireAuth>
                  <BecomeSeller />
                </RequireAuth>
              }
            />
            <Route
              path="/commande"
              element={
                <RequireAuth>
                  <Checkout />
                </RequireAuth>
              }
            />
            <Route
              path="/commande/succes/:id"
              element={
                <RequireAuth>
                  <OrderSuccess />
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Espace client */}
          <Route
            path="/espace-client"
            element={
              <RequireAuth>
                <SpaceBoundary space="Espace client"><ClientLayout /></SpaceBoundary>
              </RequireAuth>
            }
          >
            <Route index element={<ClientDashboard />} />
            <Route path="commandes" element={<ClientOrders />} />
            <Route path="commandes/:id" element={<ClientOrderDetail />} />
            <Route path="notifications" element={<ClientNotifications />} />
            <Route path="profil" element={<ClientProfile />} />
            <Route path="adresses" element={<ClientAddresses />} />
          </Route>

          {/* Espace vendeur */}
          <Route
            path="/vendeur"
            element={
              <RequireAuth>
                <RequireSeller>
                  <SpaceBoundary space="Espace vendeur"><SellerLayout /></SpaceBoundary>
                </RequireSeller>
              </RequireAuth>
            }
          >
            <Route index element={<SellerDashboard />} />
            <Route path="produits" element={<SellerProducts />} />
            <Route path="produits/nouveau" element={<SellerProductForm />} />
            <Route path="produits/:id" element={<SellerProductForm />} />
            <Route path="commandes" element={<SellerOrders />} />
            <Route path="commandes/:id" element={<SellerOrderDetail />} />
            <Route path="ventes" element={<SellerSales />} />
            <Route path="paiements" element={<SellerPayments />} />
            <Route path="profil" element={<SellerProfile />} />
          </Route>

          {/* Espace administrateur */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <SpaceBoundary space="Administration"><AdminLayout /></SpaceBoundary>
              </RequireAdmin>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="produits" element={<AdminProducts />} />
            <Route path="commandes" element={<AdminOrders />} />
            <Route path="commandes/:id" element={<AdminOrderDetail />} />
            <Route path="clients" element={<AdminCustomers />} />
            <Route path="vendeurs" element={<AdminSellers />} />
            <Route path="paiements" element={<AdminPayments />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="statistiques" element={<AdminAnalytics />} />
            <Route path="journal" element={<AdminAuditLogs />} />
          </Route>
        </Routes>
        </Suspense>
      </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
