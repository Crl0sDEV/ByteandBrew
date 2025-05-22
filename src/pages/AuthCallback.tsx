import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        toast.error("Authentication failed");
        navigate("/auth");
        return;
      }

      try {
        
        const { data: existingProfile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        
        if (!existingProfile) {
          const { error: upsertError } = await supabase
            .from("profiles")
            .upsert({
              id: session.user.id,
              email: session.user.email,
              role: "customer", 
              full_name: session.user.user_metadata?.full_name || 'anonymous',
              created_at: new Date().toISOString()
            });

          if (upsertError) throw upsertError;
        }

        
        const { data: finalProfile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        
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