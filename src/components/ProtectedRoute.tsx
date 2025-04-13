import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { JSX, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export function ProtectedRoute({
  children,
  allowedRole,
}: {
  children: JSX.Element;
  allowedRole?: "admin" | "customer";
}) {
  const { role, loading } = useUserRole();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        setIsAuthenticated(false);
        toast.error("Session expired, please login again");
        return;
      }
      
      setIsAuthenticated(true);
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null || loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}