import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLoading(false);

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!error && data) setRole(data.role);
      setLoading(false);
    };

    getUserRole();
  }, []);

  return { role, loading };
}
