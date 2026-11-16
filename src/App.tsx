import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import PageLoader from "./components/ui/PageLoader";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import ScrollToTop from "./components/layout/shared/ScrollToTop";
import PublicLayout from "./components/layout/public/PublicLayout";
import { RequireAuth, RequireAdmin, RequireSeller } from "./components/RequireAuth";
import ClientLayout from "./components/layout/client/ClientLayout";
import SellerLayout from "./components/layout/seller/SellerLayout";
import AdminLayout from "./components/layout/admin/AdminLayout";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import DeliveryReturns from "./pages/DeliveryReturns";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Wishlist from "./pages/Wishlist";
import BecomeSeller from "./pages/BecomeSeller";
import NotFound from "./pages/NotFound";

import ClientDashboard from "./pages/ClientDashboard";
import ClientOrders from "./pages/ClientOrders";
import ClientOrderDetail from "./pages/ClientOrderDetail";
import ClientNotifications from "./pages/ClientNotifications";
import ClientProfile from "./pages/ClientProfile";
import ClientAddresses from "./pages/ClientAddresses";

const SellerDashboard = lazy(() => import("./pages/SellerDashboard"));
const SellerProducts = lazy(() => import("./pages/SellerProducts"));
const SellerProductForm = lazy(() => import("./pages/SellerProductForm"));
const SellerOrders = lazy(() => import("./pages/SellerOrders"));
const SellerOrderDetail = lazy(() => import("./pages/SellerOrderDetail"));
const SellerSales = lazy(() => import("./pages/SellerSales"));
const SellerPayments = lazy(() => import("./pages/SellerPayments"));
const SellerProfile = lazy(() => import("./pages/SellerProfile"));

const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminOrderDetail = lazy(() => import("./pages/AdminOrderDetail"));
const AdminCustomers = lazy(() => import("./pages/AdminCustomers"));
const AdminSellers = lazy(() => import("./pages/AdminSellers"));
const AdminPayments = lazy(() => import("./pages/AdminPayments"));
const AdminCategories = lazy(() => import("./pages/AdminCategories"));
const AdminCollections = lazy(() => import("./pages/AdminCollections"));
const AdminContact = lazy(() => import("./pages/AdminContact"));
const AdminSiteContent = lazy(() => import("./pages/AdminSiteContent"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminAuditLogs = lazy(() => import("./pages/AdminAuditLogs"));

const MessagesPage = lazy(() => import("./pages/MessagesPage"));

import SpaceBoundary from "./components/SpaceBoundary";

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
              {/* Authentification autonome : ni barre de navigation, ni footer, ni fil d’Ariane. */}
              <Route path="/connexion" element={<Login />} />
              <Route path="/inscription" element={<Login initialMode="register" />} />
              <Route path="/installation" element={<Navigate to="/connexion" replace />} />
              <Route path="/verifier-email" element={<Navigate to="/connexion" replace />} />
              <Route path="/renvoyer-verification" element={<Navigate to="/connexion" replace />} />
              <Route
                element={
                  <SpaceBoundary space="Boutique">
                    <PublicLayout />
                  </SpaceBoundary>
                }
              >
                <Route path="/" element={<Home />} />
                <Route path="/boutique" element={<Shop />} />
                <Route path="/boutique/:slug" element={<ProductDetail />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/collections/:slug" element={<CollectionDetail />} />
                <Route path="/a-propos" element={<About />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/livraison-retours" element={<DeliveryReturns />} />
                <Route path="/conditions-generales" element={<Terms />} />
                <Route path="/confidentialite" element={<Privacy />} />
                <Route path="/panier" element={<CartPage />} />
                <Route path="/favoris" element={<Wishlist />} />
                <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
                <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
                <Route
                  path="/messages"
                  element={
                    <RequireAuth>
                      <MessagesPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/messages/:id"
                  element={
                    <RequireAuth>
                      <MessagesPage />
                    </RequireAuth>
                  }
                />

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

              <Route
                path="/espace-client"
                element={
                  <RequireAuth>
                    <SpaceBoundary space="Espace client">
                      <ClientLayout />
                    </SpaceBoundary>
                  </RequireAuth>
                }
              >
                <Route index element={<ClientDashboard />} />
                <Route path="commandes" element={<ClientOrders />} />
                <Route path="commandes/:id" element={<ClientOrderDetail />} />
                <Route path="notifications" element={<ClientNotifications />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="profil" element={<ClientProfile />} />
                <Route path="adresses" element={<ClientAddresses />} />
              </Route>

              <Route
                path="/vendeur"
                element={
                  <RequireAuth>
                    <RequireSeller>
                      <SpaceBoundary space="Espace vendeur">
                        <SellerLayout />
                      </SpaceBoundary>
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
                <Route path="messages" element={<MessagesPage />} />
                <Route path="profil" element={<SellerProfile />} />
              </Route>

              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <SpaceBoundary space="Administration">
                      <AdminLayout />
                    </SpaceBoundary>
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
                <Route path="collections" element={<AdminCollections />} />
                <Route path="contact" element={<AdminContact />} />
                <Route path="contenus" element={<AdminSiteContent />} />
                <Route path="statistiques" element={<AdminAnalytics />} />
                <Route path="journal" element={<AdminAuditLogs />} />
                <Route path="messages" element={<MessagesPage />} />
              </Route>
            </Routes>
          </Suspense>
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
