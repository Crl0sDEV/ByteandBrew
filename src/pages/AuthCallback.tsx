import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      // Get the session after OAuth redirect
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        toast.error("Authentication failed");
        navigate("/auth");
        return;
      }

      try {
        // Check if profile exists
        const { data: existingProfile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        // If profile doesn't exist, create one
        if (!existingProfile) {
          const { error: upsertError } = await supabase
            .from("profiles")
            .upsert({
              id: session.user.id,
              email: session.user.email,
              role: "customer", // Default role
              full_name: session.user.user_metadata?.full_name || 'anonymous',
              created_at: new Date().toISOString()
            });

          if (upsertError) throw upsertError;
        }

        // Get the final profile (either existing or newly created)
        const { data: finalProfile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        // Redirect based on role
        navigate(finalProfile?.role === "admin" ? "/admin" : "/customer");
        
      } catch (error) {
        console.error("Authentication error:", error);
        toast.error("Failed to complete authentication");
        navigate("/auth");
      }
    };

    handleAuth();
  }, [navigate]);

  return <div className="flex items-center justify-center h-screen">Loading...</div>;
}