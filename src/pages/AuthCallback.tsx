import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Check user role and redirect accordingly
        supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data?.role === "admin") {
              navigate("/admin");
            } else {
              navigate("/customer");
            }
          });
      } else {
        navigate("/auth");
        toast.error("Authentication failed");
      }
    });
  }, [navigate]);

  return <div className="flex items-center justify-center h-screen">Loading...</div>;
}