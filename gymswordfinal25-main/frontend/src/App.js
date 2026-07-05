import "@/App.css";
import { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { SiteProvider } from "@/context/SiteContext";

import SEO from "@/components/SEO";
import ChatBot from "@/components/ChatBot";
import CustomCursor from "@/components/CustomCursor";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";

// Direct imports for pages with named sub-exports or special routing
import Account, { AccountOverview, AccountOrders, AccountAddresses, AccountSettings } from "@/pages/Account";
import { ForgotPassword } from "@/pages/PasswordRecovery";

// Lazy loaded pages (default exports only)
const Home = lazy(() => import("@/pages/Home"));
const Shop = lazy(() => import("@/pages/Shop"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const CartPage = lazy(() => import("@/pages/Cart"));
const WishlistPage = lazy(() => import("@/pages/Wishlist"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const CheckoutAddress = lazy(() => import("@/pages/CheckoutAddress"));
const CheckoutPayment = lazy(() => import("@/pages/CheckoutPayment"));
const CheckoutSummary = lazy(() => import("@/pages/CheckoutSummary"));
const Order = lazy(() => import("@/pages/Order"));
const OrderSuccess = lazy(() => import("@/pages/OrderSuccess"));
const MyOrders = lazy(() => import("@/pages/MyOrders"));
const OrderDetails = lazy(() => import("@/pages/OrderDetails"));
const TrackOrder = lazy(() => import("@/pages/TrackOrder"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const AccountWallet = lazy(() => import("@/pages/account/AccountWallet"));
const AccountReferrals = lazy(() => import("@/pages/account/AccountReferrals"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("@/pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("@/pages/admin/AdminOrders"));
const AdminReferrals = lazy(() => import("@/pages/admin/AdminReferrals"));
const AdminCustomers = lazy(() => import("@/pages/admin/AdminCustomers"));
const AdminCoupons = lazy(() => import("@/pages/admin/AdminCoupons"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminSettingsPage = lazy(() => import("@/pages/admin/AdminSettings"));
const AdminContactMessages = lazy(() => import("@/pages/admin/AdminContactMessages"));
const AdminCategories = lazy(() => import("@/pages/admin/AdminCategories"));
const AdminReviews = lazy(() => import("@/pages/admin/AdminReviews"));
const AdminBanners = lazy(() => import("@/pages/admin/AdminBanners"));
const AdminLeads = lazy(() => import("@/pages/admin/AdminLeads"));
const AdminEmailLogs = lazy(() => import("@/pages/admin/AdminEmailLogs"));
const AdminBlog = lazy(() => import("@/pages/admin/AdminBlog"));
const AdminFAQ = lazy(() => import("@/pages/admin/AdminFAQ"));
const AdminReturns = lazy(() => import("@/pages/admin/AdminReturns"));
const AdminFlashSales = lazy(() => import("@/pages/admin/AdminFlashSales"));
const AdminStock = lazy(() => import("@/pages/admin/AdminStock"));
const AdminNewsletter = lazy(() => import("@/pages/admin/AdminNewsletter"));
const AdminExport = lazy(() => import("@/pages/admin/AdminExport"));
const AdminStaff = lazy(() => import("@/pages/admin/AdminStaff"));
const BusinessDashboard = lazy(() => import("@/pages/admin/BusinessDashboard"));
const AdminGuide = lazy(() => import("@/pages/admin/AdminGuide"));
const Contact = lazy(() => import("@/pages/Contact"));
const About = lazy(() => import("@/pages/About"));
const OurStory = lazy(() => import("@/pages/OurStory"));
const FAQPage = lazy(() => import("@/pages/FAQ"));
const ShippingPolicy = lazy(() => import("@/pages/ShippingPolicy"));
const ReturnPolicy = lazy(() => import("@/pages/ReturnPolicy"));
const RefundPolicy = lazy(() => import("@/pages/RefundPolicy"));
const ExchangePolicy = lazy(() => import("@/pages/ExchangePolicy"));
const SizeGuide = lazy(() => import("@/pages/SizeGuide"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogDetail = lazy(() => import("@/pages/BlogDetail"));
const Careers = lazy(() => import("@/pages/Careers"));
const Affiliate = lazy(() => import("@/pages/Affiliate"));
const ReferralProgram = lazy(() => import("@/pages/ReferralProgram"));
const Membership = lazy(() => import("@/pages/Membership"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("@/pages/TermsAndConditions"));
const GiftCards = lazy(() => import("@/pages/GiftCards"));

function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-neutral-500">Loading...</p>
      </div>
    </div>
  );
}

const LS_POPUP_KEY = "gs_popup_dismissed";

function WelcomePopupGate() {
  const { user, ready } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const WelcomePopup = lazy(() => import("@/components/WelcomePopup"));

  useEffect(() => {
    if (!ready) return;
    if (!user && !localStorage.getItem(LS_POPUP_KEY)) {
      const timer = setTimeout(() => setShowPopup(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [user, ready]);

  if (!showPopup) return null;
  return (
    <Suspense fallback={null}>
      <WelcomePopup onClose={() => setShowPopup(false)} />
    </Suspense>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/shop" element={<Layout><Shop /></Layout>} />
        <Route path="/shop/:category" element={<Layout><Shop /></Layout>} />
        <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
        <Route path="/cart" element={<Layout><CartPage /></Layout>} />
        <Route path="/wishlist" element={<Layout><WishlistPage /></Layout>} />
        <Route path="/checkout" element={<ProtectedRoute><Layout><Checkout /></Layout></ProtectedRoute>} />
        <Route path="/checkout/address" element={<ProtectedRoute><Layout><CheckoutAddress /></Layout></ProtectedRoute>} />
        <Route path="/checkout/payment" element={<ProtectedRoute><Layout><CheckoutPayment /></Layout></ProtectedRoute>} />
        <Route path="/checkout/summary" element={<ProtectedRoute><Layout><CheckoutSummary /></Layout></ProtectedRoute>} />
        <Route path="/order-success" element={<ProtectedRoute><Layout><OrderSuccess /></Layout></ProtectedRoute>} />
        <Route path="/my-orders" element={<ProtectedRoute><Layout><MyOrders /></Layout></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><Layout><OrderDetails /></Layout></ProtectedRoute>} />
        <Route path="/order/:id" element={<ProtectedRoute><Layout><Order /></Layout></ProtectedRoute>} />
        <Route path="/track" element={<Layout><TrackOrder /></Layout>} />
        <Route path="/track-order/:id" element={<Layout><TrackOrder /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/our-story" element={<Layout><OurStory /></Layout>} />
        <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
        <Route path="/shipping-policy" element={<Layout><ShippingPolicy /></Layout>} />
        <Route path="/return-policy" element={<Layout><ReturnPolicy /></Layout>} />
        <Route path="/refund-policy" element={<Layout><RefundPolicy /></Layout>} />
        <Route path="/exchange-policy" element={<Layout><ExchangePolicy /></Layout>} />
        <Route path="/size-guide" element={<Layout><SizeGuide /></Layout>} />
        <Route path="/blog" element={<Layout><Blog /></Layout>} />
        <Route path="/blog/:slug" element={<Layout><BlogDetail /></Layout>} />
        <Route path="/careers" element={<Layout><Careers /></Layout>} />
        <Route path="/affiliate" element={<Layout><Affiliate /></Layout>} />
        <Route path="/referral-program" element={<Layout><ReferralProgram /></Layout>} />
        <Route path="/membership" element={<Layout><Membership /></Layout>} />
        <Route path="/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />
        <Route path="/terms-and-conditions" element={<Layout><TermsAndConditions /></Layout>} />
        <Route path="/gift-cards" element={<Layout><GiftCards /></Layout>} />

        <Route path="/account" element={<ProtectedRoute><Layout><Account /></Layout></ProtectedRoute>}>
          <Route index element={<AccountOverview />} />
          <Route path="orders" element={<AccountOrders />} />
          <Route path="addresses" element={<AccountAddresses />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="settings" element={<AccountSettings />} />
          <Route path="referrals" element={<AccountReferrals />} />
          <Route path="wallet" element={<AccountWallet />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="business-dashboard" element={<BusinessDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="stock" element={<AdminStock />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="referrals" element={<AdminReferrals />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="messages" element={<AdminContactMessages />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="leads" element={<AdminLeads />} />
          <Route path="email-logs" element={<AdminEmailLogs />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="faqs" element={<AdminFAQ />} />
          <Route path="returns" element={<AdminReturns />} />
          <Route path="flash-sales" element={<AdminFlashSales />} />
          <Route path="newsletter" element={<AdminNewsletter />} />
          <Route path="export" element={<AdminExport />} />
          <Route path="staff" element={<AdminStaff />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="guide" element={<AdminGuide />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <SiteProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <BrowserRouter>
              <SEO />
              <WelcomePopupGate />
              <Toaster position="top-center" theme="light" />
              <ChatBot />
              <CustomCursor />
              <AppRoutes />
            </BrowserRouter>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </SiteProvider>
  );
}

export default App;
