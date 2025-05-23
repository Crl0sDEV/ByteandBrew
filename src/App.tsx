import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabaseClient";
import AuthPage from "@/pages/AuthPage";
import AdminDashboard from "@/pages/AdminDashboard";
import CustomerDashboard from "@/pages/CustomerDashboard";
import PublicPage from "@/pages/ProductMenu";
import HomePage from "@/pages/HomePage";
import ContactPage from "@/pages/ContactPage";
import AboutPage from "@/pages/AboutPage"; // Add this import
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardRedirect from "@/pages/DashboardRedirect";
import AccountSettings from "@/pages/AccountSettings";
import AccountSettingsCustomer from "./pages/AccountSettingsCustomer";
import AuthCallback from "@/pages/AuthCallback";
import { Toaster } from "sonner";

function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <BrowserRouter>
        <Toaster richColors position="top-center" />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<PublicPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRole="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/account-settings" 
            element={
              <ProtectedRoute>
                <AccountSettings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/account-settings-customer" 
            element={
              <ProtectedRoute>
                <AccountSettingsCustomer />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </SessionContextProvider>
  );
}

export default App;