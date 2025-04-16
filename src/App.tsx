import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabaseClient";

import AuthPage from "@/pages/AuthPage";
import AdminDashboard from "@/pages/AdminDashboard";
import CustomerDashboard from "@/pages/CustomerDashboard";
import PublicPage from "@/pages/ProductMenu"; // Import the new component
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardRedirect from "@/pages/DashboardRedirect";
import AccountSettings from "@/pages/AccountSettings";
import { Toaster } from "sonner";

function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <BrowserRouter>
        <Toaster richColors position="top-right" />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicPage />} /> {/* Main storefront */}
          <Route path="/menu" element={<PublicPage />} /> {/* Alternative path */}
          <Route path="/auth" element={<AuthPage />} /> {/* Moved auth to /auth */}

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
        </Routes>
      </BrowserRouter>
    </SessionContextProvider>
  );
}

export default App;